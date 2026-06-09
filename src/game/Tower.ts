import Phaser from 'phaser';
import type { TowerConfig } from './types';
import { Enemy } from './Enemy';
import { Soldier } from './Soldier';
import { shakeCamera, spawnHitSpark, spawnImpactRing, spawnMuzzleFlash, spawnProjectile } from './Effects';
import { playSfx } from './AudioManager';

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
  private roof: Phaser.GameObjects.GameObject;
  private sprite?: Phaser.GameObjects.Image;
  private permanentUpgrades: TowerUpgradeSnapshot = { ...DEFAULT_UPGRADES };

  constructor(scene: Phaser.Scene, x: number, y: number, public readonly config: TowerConfig) {
    super(scene, x, y);

    const pad = scene.add.ellipse(0, 18, 58, 18, 0x000000, 0.24);
    const base = scene.add.rectangle(0, 8, 46, 28, 0x4a321e, 1).setStrokeStyle(2, 0x140b05);
    const stone = scene.add.rectangle(0, 22, 52, 13, 0x6d5b49, 1).setStrokeStyle(1, 0x20140b);
    this.top = scene.add.circle(0, -8, 18, config.color, 1).setStrokeStyle(3, 0xffffff, 0.2);
    this.roof = this.makeRoof(scene, config);
    const label = scene.add.text(0, -8, this.symbolFor(config.kind), { fontSize: '18px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = scene.add.text(0, 23, 'Ⅰ', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const spriteKey = this.resolveTowerTextureKey();
    if (scene.textures.exists(spriteKey)) {
      this.sprite = scene.add.image(0, 0, spriteKey).setScale(1.08);
      base.setAlpha(0);
      stone.setAlpha(0);
      this.top.setAlpha(0);
      this.roof.setAlpha(0);
      label.setAlpha(0);
    }
    this.rangeCircle = scene.add.circle(0, 0, this.currentRange, 0xffffff, 0.055).setStrokeStyle(1, 0xffffff, 0.26).setVisible(false);
    const visuals: Phaser.GameObjects.GameObject[] = [this.rangeCircle, pad, stone, base, this.roof, this.top, label];
    if (this.sprite) visuals.push(this.sprite);
    visuals.push(this.levelText);
    this.add(visuals);
    scene.add.existing(this);

    this.setDepth(22);
    this.setSize(58, 58);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 32), Phaser.Geom.Circle.Contains);
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
    const flag = this.scene.add.triangle(x, y - 20, 0, 0, 0, 24, 22, 8, 0xffe0a3, 0.9).setDepth(40);
    const pole = this.scene.add.rectangle(x - 2, y - 7, 4, 32, 0x3a2c1a, 1).setDepth(39);
    this.scene.time.delayedCall(1000, () => { flag.destroy(); pole.destroy(); });
  }

  upgrade(): void {
    if (this.level >= 3) return;
    this.level += 1;
    this.rangeCircle.setRadius(this.currentRange);
    this.levelText.setText(this.level === 2 ? 'Ⅱ' : 'Ⅲ');
    this.top.setRadius(this.level === 2 ? 20 : 22);
    this.updateSpriteForLevel();
    this.scene.tweens.add({ targets: [this.top, this.roof, this.sprite].filter(Boolean), scale: 1.18, duration: 100, yoyo: true });
    playSfx(this.scene, 'sfx_upgrade');
    spawnImpactRing(this.scene, this.x, this.y - 10, 34, this.config.color, 0.18, 360);

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
    if (this.config.kind === 'artillery' && this.currentSplashRadius) {
      this.fireArtillery(target, enemies);
      return;
    }

    const launchX = this.x;
    const launchY = this.y - 18;
    const impactX = target.x;
    const impactY = target.y;
    const isMage = this.config.kind === 'mage';
    const style = isMage ? 'magic' : 'arrow';
    const color = isMage ? 0xb88cff : 0xffe0a3;
    const duration = isMage ? 150 : 95;
    spawnMuzzleFlash(this.scene, launchX, launchY, this.config.color);
    playSfx(this.scene, isMage ? 'sfx_magic' : 'sfx_shoot');

    spawnProjectile(this.scene, launchX, launchY, impactX, impactY, color, style, duration, () => {
      if (!target.active || target.dead) return;
      target.receiveDamage(this.currentDamage, isMage ? 'magic' : 'physical');
      if (this.level >= 3 && this.config.kind === 'archer') target.receivePoison(this.currentDamage * 0.65, 3000);
      if (this.level >= 3 && this.config.kind === 'mage') target.receiveSlow(0.55, 2200);
      spawnImpactRing(this.scene, impactX, impactY, isMage ? 20 : 13, color, isMage ? 0.18 : 0.1, 210);
    });
  }

  private fireArtillery(target: Enemy, enemies: Enemy[]): void {
    const impactX = target.x;
    const impactY = target.y;
    spawnMuzzleFlash(this.scene, this.x, this.y - 20, 0xffd36b);
    playSfx(this.scene, 'sfx_shoot');
    spawnProjectile(this.scene, this.x, this.y - 20, impactX, impactY, 0x2c1a0a, 'shell', 170, () => {
      const radius = this.currentSplashRadius ?? 50;
      const impact = this.scene.add.circle(impactX, impactY, radius, 0xffb347, 0.2).setDepth(34);
      const ring = this.scene.add.circle(impactX, impactY, radius * 0.55, 0xfff1c2, 0.14).setStrokeStyle(2, 0xfff1c2, 0.55).setDepth(35);
      this.scene.tweens.add({ targets: [impact, ring], scale: 1.35, alpha: 0, duration: 260, onComplete: () => { impact.destroy(); ring.destroy(); } });
      spawnHitSpark(this.scene, impactX, impactY, 0xffd36b);
      spawnImpactRing(this.scene, impactX, impactY, radius, 0xffb347, 0.18, 340);
      shakeCamera(this.scene, 0.0035, 110);
      playSfx(this.scene, 'sfx_explosion');
      enemies.forEach((enemy) => {
        if (!enemy.dead && !enemy.config.flying && Phaser.Math.Distance.Between(impactX, impactY, enemy.x, enemy.y) <= radius) {
          enemy.receiveDamage(this.currentDamage, 'physical');
          if (this.level >= 3) enemy.receiveSlow(0.68, 1400);
        }
      });
    });
  }


  private resolveTowerTextureKey(): string {
    const levelKey = `tower-${this.config.kind}-lv${this.level}`;
    if (this.scene.textures.exists(levelKey)) return levelKey;
    return `tower-${this.config.kind}`;
  }

  private updateSpriteForLevel(): void {
    if (!this.sprite) return;
    const nextKey = this.resolveTowerTextureKey();
    if (this.scene.textures.exists(nextKey)) {
      this.sprite.setTexture(nextKey);
      this.sprite.setScale(this.level >= 3 ? 1.18 : this.level === 2 ? 1.13 : 1.08);
    }
  }

  private symbolFor(kind: TowerConfig['kind']): string {
    if (kind === 'archer') return '➶';
    if (kind === 'mage') return '✦';
    if (kind === 'barracks') return '♜';
    return '●';
  }

  private makeRoof(scene: Phaser.Scene, config: TowerConfig): Phaser.GameObjects.GameObject {
    if (config.kind === 'artillery') {
      return scene.add.rectangle(0, -10, 36, 11, 0x25170a, 1).setStrokeStyle(1, 0xffd4a3, 0.25);
    }
    if (config.kind === 'barracks') {
      return scene.add.triangle(0, -20, -25, 18, 0, -8, 25, 18, 0x2b3b5c, 1).setStrokeStyle(1, 0xffffff, 0.2);
    }
    return scene.add.triangle(0, -23, -24, 18, 0, -9, 24, 18, config.kind === 'mage' ? 0x38205b : 0x315a2f, 1).setStrokeStyle(1, 0xffffff, 0.2);
  }
}
