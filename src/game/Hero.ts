import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Hero extends Phaser.GameObjects.Container {
  hp = 220;
  maxHp = 220;
  damage = 22;
  attackCooldownMs = 0;
  skillCooldownMs = 0;
  private destination?: Phaser.Math.Vector2;
  private bodyCircle: Phaser.GameObjects.Arc;
  private skillRing: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const shadow = scene.add.ellipse(0, 14, 30, 10, 0x000000, 0.25);
    this.bodyCircle = scene.add.circle(0, 0, 14, 0xf7d36b, 1).setStrokeStyle(3, 0xffffff, 0.35);
    const helm = scene.add.triangle(0, -7, -8, 0, 8, 0, 0, -14, 0xd2d8e8, 1);
    this.skillRing = scene.add.circle(0, 0, 38, 0xfff0a3, 0.07).setStrokeStyle(1, 0xfff0a3, 0.25).setVisible(false);
    this.add([this.skillRing, shadow, this.bodyCircle, helm]);
    scene.add.existing(this);
    this.setSize(42, 42);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 24), Phaser.Geom.Circle.Contains);
  }

  update(deltaMs: number, enemies: Enemy[]): void {
    this.attackCooldownMs = Math.max(0, this.attackCooldownMs - deltaMs);
    this.skillCooldownMs = Math.max(0, this.skillCooldownMs - deltaMs);

    const target = enemies.find((enemy) => !enemy.dead && !enemy.reachedGoal && !enemy.config.flying && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= 38);
    if (target) {
      target.blockFor(260);
      if (this.attackCooldownMs <= 0) {
        target.receiveDamage(this.damage, 'physical');
        this.attackCooldownMs = 560;
        this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.18, duration: 80, yoyo: true });
      }
      return;
    }

    if (!this.destination) return;
    const d = Phaser.Math.Distance.Between(this.x, this.y, this.destination.x, this.destination.y);
    if (d <= 4) {
      this.destination = undefined;
      return;
    }
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.destination.x, this.destination.y);
    const speed = 155;
    this.x += Math.cos(angle) * speed * deltaMs / 1000;
    this.y += Math.sin(angle) * speed * deltaMs / 1000;
  }

  moveToPoint(x: number, y: number): void {
    this.destination = new Phaser.Math.Vector2(x, y);
    const flag = this.scene.add.circle(x, y, 7, 0xf7d36b, 0.7).setDepth(25);
    this.scene.tweens.add({ targets: flag, scale: 2, alpha: 0, duration: 360, onComplete: () => flag.destroy() });
  }

  castStomp(enemies: Enemy[]): boolean {
    if (this.skillCooldownMs > 0) return false;
    this.skillCooldownMs = 18000;
    this.skillRing.setVisible(true);
    this.scene.tweens.add({ targets: this.skillRing, scale: 1.8, alpha: 0, duration: 360, onComplete: () => {
      this.skillRing.setScale(1).setAlpha(1).setVisible(false);
    }});

    enemies.forEach((enemy) => {
      if (!enemy.dead && !enemy.reachedGoal && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= 78) {
        enemy.receiveDamage(45, 'true');
        enemy.blockFor(1000);
      }
    });
    return true;
  }
}
