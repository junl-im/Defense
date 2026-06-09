import Phaser from 'phaser';
import type { EnemyConfig, PathPoint } from './types';

export class Enemy extends Phaser.GameObjects.Container {
  readonly config: EnemyConfig;
  hp: number;
  maxHp: number;
  pathIndex = 0;
  reachedGoal = false;
  dead = false;

  private bodyCircle: Phaser.GameObjects.Arc;
  private hpBar: Phaser.GameObjects.Rectangle;
  private blockedMs = 0;
  private slowUntil = 0;
  private slowFactor = 1;
  private poisonTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, config: EnemyConfig, private readonly path: PathPoint[]) {
    super(scene, path[0].x, path[0].y);
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;

    const color = config.flying ? 0xd672ff : config.kind === 'brute' ? 0xb5651d : config.kind === 'wolf' ? 0xd6d6d6 : 0x7dd957;
    const shadow = scene.add.ellipse(0, 12, 24, 8, 0x000000, config.flying ? 0.16 : 0.25);
    this.bodyCircle = scene.add.circle(0, 0, config.flying ? 10 : 12, color, 1);
    this.hpBar = scene.add.rectangle(0, -18, 24, 4, 0x1ee65b, 1).setOrigin(0.5);
    this.add([shadow, this.bodyCircle, this.hpBar]);
    scene.add.existing(this);
  }

  update(deltaMs: number): void {
    if (this.dead || this.reachedGoal) return;

    this.blockedMs = Math.max(0, this.blockedMs - deltaMs);
    if (this.blockedMs > 0) return;

    const target = this.path[this.pathIndex + 1];
    if (!target) {
      this.reachedGoal = true;
      return;
    }

    const speedModifier = this.scene.time.now < this.slowUntil ? this.slowFactor : 1;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const step = (this.config.speed * speedModifier * deltaMs) / 1000;
    if (dist <= step) {
      this.setPosition(target.x, target.y);
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length - 1) this.reachedGoal = true;
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;
  }

  blockFor(ms: number): void {
    if (!this.dead && !this.config.flying) this.blockedMs = Math.max(this.blockedMs, ms);
  }

  receiveSlow(factor: number, durationMs: number): void {
    if (this.dead) return;
    this.slowFactor = Phaser.Math.Clamp(factor, 0.15, 1);
    this.slowUntil = Math.max(this.slowUntil, this.scene.time.now + durationMs);
    this.bodyCircle.setStrokeStyle(2, 0x7cc7ff, 0.9);
    this.scene.time.delayedCall(durationMs, () => {
      if (this.active && this.scene.time.now >= this.slowUntil) this.bodyCircle.setStrokeStyle();
    });
  }

  receivePoison(totalDamage: number, durationMs = 3000): void {
    if (this.dead) return;
    this.poisonTimer?.remove(false);
    const ticks = 6;
    let tickCount = 0;
    this.bodyCircle.setStrokeStyle(2, 0x71ff70, 1);
    this.poisonTimer = this.scene.time.addEvent({
      delay: durationMs / ticks,
      repeat: ticks - 1,
      callback: () => {
        tickCount += 1;
        this.receiveDamage(totalDamage / ticks, 'true');
        if (tickCount >= ticks && this.active) this.bodyCircle.setStrokeStyle();
      }
    });
  }

  receiveDamage(amount: number, damageType: 'physical' | 'magic' | 'true' = 'physical'): void {
    if (this.dead) return;
    let finalDamage = amount;
    if (damageType === 'physical') finalDamage *= 1 - this.config.armor;
    if (damageType === 'magic') finalDamage *= 1 - this.config.magicResist;
    this.hp = Math.max(0, this.hp - finalDamage);
    this.hpBar.width = Math.max(1, 24 * (this.hp / this.maxHp));
    this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.25, duration: 55, yoyo: true });
    if (this.hp <= 0) {
      this.dead = true;
      this.poisonTimer?.remove(false);
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.4,
        duration: 180,
        onComplete: () => this.destroy()
      });
    }
  }
}
