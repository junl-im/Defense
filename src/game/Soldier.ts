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
  private sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  private animatedSprite = false;
  private spriteBaseKey: 'soldier' | 'mercenary' = 'soldier';
  private currentMotion: 'idle' | 'move' | 'attack' = 'idle';
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
    this.spriteBaseKey = isMercenary ? 'mercenary' : 'soldier';
    const shadow = scene.add.ellipse(0, 12, 22, 8, 0x000000, 0.22);
    const artKey = isMercenary ? 'v1-hero-art-druid' : 'v1-hero-art-paladin';
    if (scene.textures.exists(artKey)) {
      this.sprite = scene.add.image(0, -7, artKey);
      const targetHeight = isMercenary ? 50 : 52;
      this.sprite.setDisplaySize(this.sprite.width * (targetHeight / Math.max(1, this.sprite.height)), targetHeight);
    } else if (scene.textures.exists(spriteKey)) {
      this.sprite = scene.add.sprite(0, -3, spriteKey, 0).setScale(isMercenary ? 1.0 : 0.97);
      this.animatedSprite = true;
      this.playMotion('idle');
    }
    this.bodyCircle = scene.add.circle(0, 0, 9, options.color ?? 0x4fa3ff, this.sprite ? 0 : 1);
    const sword = scene.add.rectangle(9, 0, 10, 3, 0xffffff, this.sprite ? 0 : 1);
    const visuals: Phaser.GameObjects.GameObject[] = [shadow, this.bodyCircle, sword];
    if (this.sprite) visuals.push(this.sprite);
    this.add(visuals);
    scene.add.existing(this);
    this.setDepth(isMercenary ? 25 : 24);
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
      this.facePoint(this.target.x);
      this.target.blockFor(this.blockMs);
      if (this.attackCooldownMs <= 0) {
        this.swingAt(this.target);
        this.attackCooldownMs = 700;
      }
      return;
    }

    const d = Phaser.Math.Distance.Between(this.x, this.y, this.rallyX, this.rallyY);
    if (d > 3) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.rallyX, this.rallyY);
      const speed = 90;
      this.x += Math.cos(angle) * speed * deltaMs / 1000;
      this.y += Math.sin(angle) * speed * deltaMs / 1000;
      this.facePoint(this.rallyX);
      this.playMotion('move');
    } else {
      this.playMotion('idle');
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

  private swingAt(target: Enemy): void {
    this.playAttackAnimation();
    target.receiveDamage(this.damage, 'physical');
    spawnMuzzleFlash(this.scene, this.x + (target.x >= this.x ? 7 : -7), this.y, 0xffffff);
    spawnHitSpark(this.scene, target.x, target.y, 0xdbe7ff);
    playSfx(this.scene, 'sfx_hit');
    const dir = target.x >= this.x ? 1 : -1;
    if (this.sprite) {
      this.sprite.x = dir * 3;
      this.scene.tweens.add({ targets: this.sprite, x: 0, duration: 105, ease: 'Back.easeOut' });
    }
    this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.25, duration: 70, yoyo: true });
  }

  private playAttackAnimation(): void {
    this.currentMotion = 'attack';
    if (!this.sprite) return;
    if (!this.animatedSprite) {
      this.scene.tweens.add({ targets: this.sprite, scaleX: this.sprite.scaleX * 1.08, scaleY: this.sprite.scaleY * 1.08, duration: 90, yoyo: true, ease: 'Back.easeOut' });
      this.scene.time.delayedCall(170, () => { this.currentMotion = 'idle'; });
      return;
    }
    (this.sprite as Phaser.GameObjects.Sprite).play(`${this.spriteBaseKey}-attack`, true);
    (this.sprite as Phaser.GameObjects.Sprite).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.currentMotion = 'idle';
      this.playMotion('idle');
    });
  }

  private playMotion(motion: 'idle' | 'move'): void {
    if (!this.sprite || this.currentMotion === 'attack') return;
    if (this.currentMotion === motion) return;
    this.currentMotion = motion;
    if (!this.animatedSprite) return;
    (this.sprite as Phaser.GameObjects.Sprite).play(`${this.spriteBaseKey}-${motion}`, true);
  }

  private facePoint(x: number): void {
    if (!this.sprite) return;
    if (Math.abs(x - this.x) < 2) return;
    this.sprite.setFlipX(x < this.x);
  }
}
