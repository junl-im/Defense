import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { spawnHitSpark, spawnMuzzleFlash } from './Effects';
import { playSfx } from './AudioManager';

type SoldierOptions = {
  color?: number;
  damage?: number;
  maxHp?: number;
  expiresInMs?: number;
  blockMs?: number;
};

export class Soldier extends Phaser.GameObjects.Container {
  hp: number;
  maxHp: number;
  damage: number;
  attackCooldownMs = 0;
  target?: Enemy;
  bodyCircle: Phaser.GameObjects.Arc;
  private sprite?: Phaser.GameObjects.Sprite;
  expiresAt?: number;
  blockMs: number;

  constructor(scene: Phaser.Scene, x: number, y: number, public rallyX: number, public rallyY: number, options: SoldierOptions = {}) {
    super(scene, x, y);
    this.maxHp = options.maxHp ?? 70;
    this.hp = this.maxHp;
    this.damage = options.damage ?? 7;
    this.blockMs = options.blockMs ?? 250;
    this.expiresAt = options.expiresInMs ? scene.time.now + options.expiresInMs : undefined;

    const isMercenary = (options.color ?? 0x4fa3ff) === 0xa6ffb0;
    const spriteKey = isMercenary ? 'mercenary-green' : 'soldier-blue';
    if (scene.textures.exists(spriteKey)) {
      this.sprite = scene.add.sprite(0, -2, spriteKey, 0).setScale(0.95);
      this.sprite.play(isMercenary ? 'mercenary-idle' : 'soldier-idle');
    }
    this.bodyCircle = scene.add.circle(0, 0, 9, options.color ?? 0x4fa3ff, this.sprite ? 0 : 1);
    const sword = scene.add.rectangle(9, 0, 10, 3, 0xffffff, this.sprite ? 0 : 1);
    const visuals: Phaser.GameObjects.GameObject[] = [this.bodyCircle, sword];
    if (this.sprite) visuals.push(this.sprite);
    this.add(visuals);
    scene.add.existing(this);
  }

  update(deltaMs: number, enemies: Enemy[]): void {
    if (this.expiresAt && this.scene.time.now >= this.expiresAt) {
      this.destroy();
      return;
    }
    if (this.expiresAt && this.expiresAt - this.scene.time.now < 2500) {
      this.alpha = 0.45 + Math.sin(this.scene.time.now / 90) * 0.25;
    }

    this.attackCooldownMs = Math.max(0, this.attackCooldownMs - deltaMs);
    this.target = enemies.find((e) => !e.dead && !e.reachedGoal && !e.config.flying && Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= 30);

    if (this.target) {
      this.target.blockFor(this.blockMs);
      if (this.attackCooldownMs <= 0) {
        this.target.receiveDamage(this.damage, 'physical');
        spawnMuzzleFlash(this.scene, this.x + 7, this.y, 0xffffff);
        spawnHitSpark(this.scene, this.target.x, this.target.y, 0xdbe7ff);
        playSfx(this.scene, 'sfx_hit');
        this.attackCooldownMs = 700;
        this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.25, duration: 70, yoyo: true });
      }
      return;
    }

    const d = Phaser.Math.Distance.Between(this.x, this.y, this.rallyX, this.rallyY);
    if (d > 3) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.rallyX, this.rallyY);
      const speed = 90;
      this.x += Math.cos(angle) * speed * deltaMs / 1000;
      this.y += Math.sin(angle) * speed * deltaMs / 1000;
    }
  }

  setRally(x: number, y: number): void {
    this.rallyX = x;
    this.rallyY = y;
  }

  setStats(damage: number, maxHp: number, blockMs: number): void {
    this.damage = damage;
    this.maxHp = maxHp;
    this.hp = Math.min(this.hp, this.maxHp);
    this.blockMs = blockMs;
  }
}
