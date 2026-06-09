import Phaser from 'phaser';
import type { TowerConfig } from './types';
import { Enemy } from './Enemy';
import { Soldier } from './Soldier';

export type TowerUpgradeSnapshot = {
  archerDamage: number;
  mageDamage: number;
  barracksHp: number;
  artillerySplash: number;
};

const DEFAULT_UPGRADES: TowerUpgradeSnapshot = {
  archerDamage: 0,
  mageDamage: 0,
  barracksHp: 0,
  artillerySplash: 0,
};

export class Tower extends Phaser.GameObjects.Container {
  level = 1;
  cooldownMs = 0;
  soldiers: Soldier[] = [];
  rangeCircle: Phaser.GameObjects.Arc;
  private levelText: Phaser.GameObjects.Text;
  private top: Phaser.GameObjects.Arc;
  private permanentUpgrades: TowerUpgradeSnapshot = { ...DEFAULT_UPGRADES };

  constructor(scene: Phaser.Scene, x: number, y: number, public readonly config: TowerConfig) {
    super(scene, x, y);
    const base = scene.add.rectangle(0, 8, 44, 24, 0x3a2c1a, 1).setStrokeStyle(2, 0x120c07);
    this.top = scene.add.circle(0, -6, 18, config.color, 1).setStrokeStyle(3, 0xffffff, 0.18);
    const label = scene.add.text(0, -8, config.label[0], { fontSize: '18px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = scene.add.text(0, 18, 'Ⅰ', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.rangeCircle = scene.add.circle(0, 0, this.currentRange, 0xffffff, 0.06).setStrokeStyle(1, 0xffffff, 0.24).setVisible(false);
    this.add([this.rangeCircle, base, this.top, label, this.levelText]);
    scene.add.existing(this);

    this.setSize(50, 50);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 28), Phaser.Geom.Circle.Contains);
  }

  applyPermanentUpgrades(upgrades: Partial<TowerUpgradeSnapshot> | undefined): void {
    this.permanentUpgrades = {
      ...DEFAULT_UPGRADES,
      ...(upgrades ?? {}),
    };
    this.rangeCircle.setRadius(this.currentRange);
    if (this.config.kind === 'barracks' && this.soldiers.length > 0) {
      const opts = this.soldierOptions();
      this.soldiers.forEach((soldier) => soldier.setStats(opts.damage ?? 7, opts.maxHp ?? 70, opts.blockMs ?? 250));
    }
  }

  get currentRange(): number {
    return this.config.range + (this.level - 1) * 18;
  }

  get currentDamage(): number {
    let multiplier = 1 + (this.level - 1) * 0.42;
    if (this.config.kind === 'archer') multiplier += this.permanentUpgrades.archerDamage * 0.08;
    if (this.config.kind === 'mage') multiplier += this.permanentUpgrades.mageDamage * 0.1;
    return Math.round(this.config.damage * multiplier);
  }

  get currentFireRateMs(): number {
    return Math.max(260, Math.round(this.config.fireRateMs * (1 - (this.level - 1) * 0.1)));
  }

  get currentSplashRadius(): number | undefined {
    if (!this.config.splashRadius) return undefined;
    return this.config.splashRadius + (this.level - 1) * 8 + this.permanentUpgrades.artillerySplash * 6;
  }

  get upgradeCost(): number | null {
    if (this.level >= 3) return null;
    return Math.round(this.config.cost * (this.level === 1 ? 0.85 : 1.35));
  }

  update(deltaMs: number, enemies: Enemy[]): void {
    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
    if (this.config.kind === 'barracks') {
      this.soldiers = this.soldiers.filter((soldier) => soldier.active);
      this.soldiers.forEach((s) => s.update(deltaMs, enemies));
      return;
    }
    if (this.cooldownMs > 0) return;

    const target = this.findTarget(enemies);
    if (!target) return;
    this.fireAt(target, enemies);
    this.cooldownMs = this.currentFireRateMs;
  }

  spawnSoldiers(): void {
    if (this.config.kind !== 'barracks' || this.soldiers.length > 0) return;
    const rallyX = this.x + 40;
    const rallyY = this.y;
    for (let i = 0; i < 3; i++) {
      this.soldiers.push(new Soldier(this.scene, this.x + i * 8 - 8, this.y + 26, rallyX, rallyY + i * 18 - 18, this.soldierOptions()));
    }
  }

  setRallyPoint(x: number, y: number): void {
    this.soldiers.forEach((soldier, idx) => soldier.setRally(x, y + idx * 18 - 18));
  }

  upgrade(): void {
    if (this.level >= 3) return;
    this.level += 1;
    this.rangeCircle.setRadius(this.currentRange);
    this.levelText.setText(this.level === 2 ? 'Ⅱ' : 'Ⅲ');
    this.scene.tweens.add({ targets: this.top, scale: 1.18, duration: 100, yoyo: true });

    if (this.config.kind === 'barracks') {
      if (this.soldiers.length === 0) this.spawnSoldiers();
      const opts = this.soldierOptions();
      this.soldiers.forEach((soldier) => soldier.setStats(opts.damage ?? 7, opts.maxHp ?? 70, opts.blockMs ?? 250));
    }
  }

  private soldierOptions() {
    const damage = Math.round(this.config.damage * (1 + (this.level - 1) * 0.5));
    const maxHp = 70 + (this.level - 1) * 35 + this.permanentUpgrades.barracksHp * 20;
    const blockMs = this.level >= 3 ? 420 : 250 + (this.level - 1) * 55;
    return { damage, maxHp, blockMs, color: this.level >= 3 ? 0x7cc7ff : 0x4fa3ff };
  }

  private findTarget(enemies: Enemy[]): Enemy | undefined {
    const candidates = enemies.filter((enemy) => {
      if (enemy.dead || enemy.reachedGoal) return false;
      if (enemy.config.flying && !this.config.canHitFlying) return false;
      return Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.currentRange;
    });
    candidates.sort((a, b) => b.pathIndex - a.pathIndex);
    return candidates[0];
  }

  private fireAt(target: Enemy, enemies: Enemy[]): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(this.level >= 3 ? 5 : 3, this.config.color, 0.9);
    graphics.lineBetween(this.x, this.y - 12, target.x, target.y);
    this.scene.time.delayedCall(70, () => graphics.destroy());

    if (this.config.kind === 'artillery' && this.currentSplashRadius) {
      const impact = this.scene.add.circle(target.x, target.y, this.currentSplashRadius, 0xffb347, 0.18).setDepth(10);
      this.scene.tweens.add({ targets: impact, scale: 1.35, alpha: 0, duration: 260, onComplete: () => impact.destroy() });
      enemies.forEach((enemy) => {
        if (!enemy.dead && !enemy.config.flying && Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y) <= this.currentSplashRadius!) {
          enemy.receiveDamage(this.currentDamage, 'physical');
          if (this.level >= 3) enemy.receiveSlow(0.68, 1400);
        }
      });
      return;
    }

    target.receiveDamage(this.currentDamage, this.config.kind === 'mage' ? 'magic' : 'physical');
    if (this.level >= 3 && this.config.kind === 'archer') target.receivePoison(this.currentDamage * 0.65, 3000);
    if (this.level >= 3 && this.config.kind === 'mage') target.receiveSlow(0.55, 2200);
  }
}
