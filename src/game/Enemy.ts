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
  private hpBack: Phaser.GameObjects.Rectangle;
  private blockedMs = 0;
  private slowUntil = 0;
  private slowFactor = 1;
  private poisonTimer?: Phaser.Time.TimerEvent;
  private aura?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, config: EnemyConfig, private readonly path: PathPoint[]) {
    super(scene, path[0].x, path[0].y);
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;

    const scale = config.scale ?? 1;
    const shadow = scene.add.ellipse(0, config.flying ? 18 : 14, 28 * scale, 9 * scale, 0x000000, config.flying ? 0.14 : 0.28);
    this.bodyCircle = scene.add.circle(0, 0, (config.flying ? 10 : 12) * scale, config.color, 1).setStrokeStyle(2, config.accentColor ?? 0x000000, 0.65);
    this.hpBack = scene.add.rectangle(0, -20 * scale, 28 * scale, 5, 0x2c1010, 1).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(0, -20 * scale, 28 * scale, 5, 0x1ee65b, 1).setOrigin(0.5);

    const face = scene.add.circle(-4 * scale, -3 * scale, 2.2 * scale, 0x101010, 1);
    const face2 = scene.add.circle(4 * scale, -3 * scale, 2.2 * scale, 0x101010, 1);
    const badge = this.makeBadge(config, scale);

    if (config.threat === 'support') {
      this.aura = scene.add.circle(0, 0, 18 * scale, 0x5fe0cf, 0.1).setStrokeStyle(1, 0x5fe0cf, 0.45);
      this.add([this.aura]);
    }

    this.add([shadow, this.bodyCircle, face, face2, badge, this.hpBack, this.hpBar]);
    scene.add.existing(this);
    this.setDepth(config.flying ? 18 : 12);
  }

  update(deltaMs: number): void {
    if (this.dead || this.reachedGoal) return;

    if (this.aura) this.aura.rotation += deltaMs / 450;
    if (this.config.flying) this.y += Math.sin(this.scene.time.now / 150) * 0.18;

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
    this.scaleX = Math.cos(angle) < -0.05 ? -Math.abs(this.scaleX) : Math.abs(this.scaleX);
  }

  blockFor(ms: number): void {
    if (!this.dead && !this.config.flying) this.blockedMs = Math.max(this.blockedMs, ms);
  }

  receiveSlow(factor: number, durationMs: number): void {
    if (this.dead) return;
    this.slowFactor = Phaser.Math.Clamp(factor, 0.15, 1);
    this.slowUntil = Math.max(this.slowUntil, this.scene.time.now + durationMs);
    this.bodyCircle.setStrokeStyle(3, 0x7cc7ff, 0.9);
    this.scene.time.delayedCall(durationMs, () => {
      if (this.active && this.scene.time.now >= this.slowUntil) {
        this.bodyCircle.setStrokeStyle(2, this.config.accentColor ?? 0x000000, 0.65);
      }
    });
  }

  receivePoison(totalDamage: number, durationMs = 3000): void {
    if (this.dead) return;
    this.poisonTimer?.remove(false);
    const ticks = 6;
    let tickCount = 0;
    this.bodyCircle.setStrokeStyle(3, 0x71ff70, 1);
    this.poisonTimer = this.scene.time.addEvent({
      delay: durationMs / ticks,
      repeat: ticks - 1,
      callback: () => {
        tickCount += 1;
        this.receiveDamage(totalDamage / ticks, 'true');
        if (tickCount >= ticks && this.active) this.bodyCircle.setStrokeStyle(2, this.config.accentColor ?? 0x000000, 0.65);
      }
    });
  }

  receiveDamage(amount: number, damageType: 'physical' | 'magic' | 'true' = 'physical'): void {
    if (this.dead) return;
    let finalDamage = amount;
    if (damageType === 'physical') finalDamage *= 1 - this.config.armor;
    if (damageType === 'magic') finalDamage *= 1 - this.config.magicResist;
    this.hp = Math.max(0, this.hp - finalDamage);

    const barWidth = 28 * (this.config.scale ?? 1);
    this.hpBar.width = Math.max(1, barWidth * (this.hp / this.maxHp));
    if (this.hp / this.maxHp < 0.36) this.hpBar.fillColor = 0xff6058;
    else if (this.hp / this.maxHp < 0.68) this.hpBar.fillColor = 0xffd36b;

    this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.22, duration: 55, yoyo: true });
    if (this.hp <= 0) {
      this.dead = true;
      this.poisonTimer?.remove(false);
      this.spawnDeathPop();
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.4,
        duration: 180,
        onComplete: () => this.destroy()
      });
    }
  }

  private makeBadge(config: EnemyConfig, scale: number): Phaser.GameObjects.GameObject {
    if (config.flying) {
      const wing = this.scene.add.triangle(0, 1 * scale, -17 * scale, -6 * scale, 0, 0, 17 * scale, -6 * scale, config.accentColor ?? 0xffffff, 0.55);
      return wing;
    }
    if (config.kind === 'shield') {
      return this.scene.add.rectangle(0, 5 * scale, 16 * scale, 13 * scale, 0xd8e0ef, 0.85).setStrokeStyle(1, 0x39424d);
    }
    if (config.kind === 'shaman') {
      return this.scene.add.star(0, 8 * scale, 5, 4 * scale, 9 * scale, 0x99fff2, 0.8);
    }
    if (config.kind === 'ogre') {
      return this.scene.add.rectangle(0, 7 * scale, 20 * scale, 6 * scale, 0x2d1710, 0.8);
    }
    return this.scene.add.circle(0, 8 * scale, 3 * scale, config.accentColor ?? 0xffffff, 0.7);
  }

  private spawnDeathPop(): void {
    const pop = this.scene.add.circle(this.x, this.y, 12 * (this.config.scale ?? 1), 0xfff1c2, 0.25).setDepth(35);
    this.scene.tweens.add({ targets: pop, scale: 2.0, alpha: 0, duration: 220, onComplete: () => pop.destroy() });
  }
}
