import Phaser from "phaser";
import type { TowerConfig } from "./types";
import { Enemy } from "./Enemy";
import { Soldier } from "./Soldier";
import {
  shakeCamera,
  spawnBuildDust,
  spawnExplosionBurst,
  spawnHitSpark,
  spawnImpactRing,
  spawnMuzzleFlash,
  spawnProjectile,
  spawnTowerSkillCutIn,
  spawnUpgradeBurst,
} from "./Effects";
import { playSfx } from "./AudioManager";
import { getRelicBattleBonuses } from "./MegaSystems";
import { getTowerMastery, type TowerMasteryId } from "./TowerMastery";
import { resolveTowerTextureKey } from "./AssetMap";
import {
  fitIsolatedIcon,
  isCasualArtTextureKey,
  makeStickerBackplate,
} from "./CasualArtDirector";
import { towerDisplayHeight } from "./BattleArtMode";

export type TargetMode = "first" | "strong" | "air" | "near";

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

const TARGET_MODE_LABELS: Record<TargetMode, string> = {
  first: "선두 우선",
  strong: "강적 우선",
  air: "공중 우선",
  near: "근접 우선",
};

export class Tower extends Phaser.GameObjects.Container {
  level = 1;
  cooldownMs = 0;
  soldiers: Soldier[] = [];
  rangeCircle: Phaser.GameObjects.Arc;
  targetMode: TargetMode;
  mastery?: TowerMasteryId;

  private levelText: Phaser.GameObjects.Text;
  private top: Phaser.GameObjects.Arc;
  private roof: Phaser.GameObjects.Shape;
  private sprite?: Phaser.GameObjects.Image;
  private artBackplate?: Phaser.GameObjects.Ellipse;
  private permanentUpgrades: TowerUpgradeSnapshot = { ...DEFAULT_UPGRADES };
  private skillCutInCooldownMs = 0;
  private relicBonuses = getRelicBattleBonuses();
  private overdriveUntil = 0;
  private overdriveAura?: Phaser.GameObjects.Arc;
  private masteryAura?: Phaser.GameObjects.Arc;
  private suppressionUntil = 0;
  private suppressionDamageMultiplier = 1;
  private suppressionFireRateMultiplier = 1;
  private suppressionAura?: Phaser.GameObjects.Arc;
  private suppressionLabel?: Phaser.GameObjects.Text;
  private commandAuraDamageMultiplier = 1;
  private commandAuraFireRateMultiplier = 1;
  private commandAura?: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
  private commandAuraLabel?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly config: TowerConfig,
  ) {
    super(scene, x, y);
    this.targetMode = config.kind === "archer" ? "air" : "first";

    const pad = scene.add.ellipse(0, 18, 58, 18, 0x000000, 0.24);
    const base = scene.add
      .rectangle(0, 8, 46, 28, 0x4a321e, 1)
      .setStrokeStyle(2, 0x140b05);
    const stone = scene.add
      .rectangle(0, 22, 52, 13, 0x6d5b49, 1)
      .setStrokeStyle(1, 0x20140b);
    this.top = scene.add
      .circle(0, -8, 18, config.color, 1)
      .setStrokeStyle(3, 0xffffff, 0.2);
    this.roof = this.makeRoof(scene, config);
    const label = scene.add
      .text(0, -8, this.symbolFor(config.kind), {
        fontSize: "18px",
        color: "#101820",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.levelText = scene.add
      .text(0, 23, "Ⅰ", {
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const spriteKey = this.resolveTowerTextureKey();
    if (scene.textures.exists(spriteKey)) {
      if (isCasualArtTextureKey(spriteKey)) {
        this.artBackplate = makeStickerBackplate(scene, 0, -12, 68, 82, {
          fill: 0xfff8e8,
          stroke: 0x5a3b22,
          alpha: 0.78,
          strokeAlpha: 0.22,
        });
      }
      this.sprite = scene.add.image(0, 0, spriteKey);
      this.applyTowerArtSize();
      base.setAlpha(0);
      stone.setAlpha(0);
      this.top.setAlpha(0);
      this.roof.setAlpha(0);
      label.setAlpha(0);
    }
    this.rangeCircle = scene.add
      .circle(0, 0, this.currentRange, 0xffffff, 0.055)
      .setStrokeStyle(1, 0xffffff, 0.26)
      .setVisible(false);
    const visuals: Phaser.GameObjects.GameObject[] = [
      this.rangeCircle,
      pad,
      stone,
      base,
      this.roof,
      this.top,
      label,
    ];
    if (this.artBackplate) visuals.push(this.artBackplate);
    if (this.sprite) visuals.push(this.sprite);
    visuals.push(this.levelText);
    this.add(visuals);
    scene.add.existing(this);

    this.setDepth(22);
    // v2.5: tighter mobile hit area. Selection should match the visible tower base,
    // not the whole attack range/ornament silhouette. External GameScene halos use the same footprint.
    this.setSize(42, 62);
    // v2.14: selection footprint follows the visible tower body only.
    // The attack range, glow, shadow and mastery aura must not become touch area.
    this.setInteractive(
      new Phaser.Geom.Ellipse(0, -16, 34, 56),
      Phaser.Geom.Ellipse.Contains,
    );
    this.playPlacementBounce();
  }

  applyPermanentUpgrades(
    upgrades: Partial<TowerUpgradeSnapshot> | undefined,
  ): void {
    this.permanentUpgrades = {
      ...DEFAULT_UPGRADES,
      ...(upgrades ?? {}),
    };
    this.rangeCircle.setRadius(this.currentRange);
    if (this.config.kind === "barracks" && this.soldiers.length > 0) {
      const opts = this.soldierOptions();
      this.soldiers.forEach((soldier) =>
        soldier.setStats(
          opts.damage ?? 7,
          opts.maxHp ?? 70,
          opts.blockMs ?? 250,
        ),
      );
    }
  }

  get isOverdriven(): boolean {
    return this.scene.time.now < this.overdriveUntil;
  }

  get overdriveRemainingSec(): number {
    return Math.max(
      0,
      Math.ceil((this.overdriveUntil - this.scene.time.now) / 1000),
    );
  }

  get isSuppressed(): boolean {
    return this.scene.time.now < this.suppressionUntil;
  }

  applySuppression(
    durationMs = 1800,
    damageMultiplier = 0.9,
    fireRateMultiplier = 1.12,
    color = 0xff5b4f,
    label = "압박",
  ): void {
    this.suppressionUntil = Math.max(
      this.suppressionUntil,
      this.scene.time.now + durationMs,
    );
    this.suppressionDamageMultiplier = Math.min(
      this.suppressionDamageMultiplier,
      damageMultiplier,
    );
    this.suppressionFireRateMultiplier = Math.max(
      this.suppressionFireRateMultiplier,
      fireRateMultiplier,
    );

    if (!this.suppressionAura || !this.suppressionAura.active) {
      this.suppressionAura = this.scene.add
        .circle(this.x, this.y, 50, color, 0.08)
        .setStrokeStyle(2, color, 0.48)
        .setDepth(23);
      this.scene.tweens.add({
        targets: this.suppressionAura,
        scale: 1.18,
        alpha: 0.02,
        duration: 520,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    this.suppressionAura
      .setFillStyle(color, 0.08)
      .setStrokeStyle(2, color, 0.48);
    this.suppressionLabel?.destroy();
    this.suppressionLabel = this.scene.add
      .text(this.x, this.y - 68, label, {
        fontSize: "12px",
        color: "#ffe8b8",
        fontStyle: "bold",
        stroke: "#2a0e0e",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(72);
    this.scene.tweens.add({
      targets: this.suppressionLabel,
      y: this.y - 82,
      alpha: 0,
      duration: Math.min(900, Math.max(420, durationMs * 0.32)),
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.suppressionLabel?.destroy();
        this.suppressionLabel = undefined;
      },
    });

    this.scene.tweens.add({
      targets: [this.sprite, this.top, this.roof].filter(Boolean),
      tint: color,
      duration: 80,
      yoyo: true,
      onComplete: () => this.sprite?.clearTint(),
    });
  }

  get currentRange(): number {
    let range =
      this.config.range + (this.level - 1) * 18 + (this.isOverdriven ? 10 : 0);
    if (this.mastery === "archer_longbow") range += 22;
    if (this.mastery === "mage_arcane") range += 16;
    if (this.mastery === "artillery_shock") range += 10;
    return range;
  }

  get currentDamage(): number {
    let multiplier = 1 + (this.level - 1) * 0.42;
    if (this.config.kind === "archer") {
      multiplier += this.permanentUpgrades.archerDamage * 0.08;
      multiplier *= this.relicBonuses.archerDamageMultiplier;
    }
    if (this.config.kind === "mage") {
      multiplier += this.permanentUpgrades.mageDamage * 0.1;
      multiplier *= this.relicBonuses.mageDamageMultiplier;
    }
    if (this.mastery === "archer_sniper") multiplier *= 1.28;
    if (this.mastery === "archer_longbow") multiplier *= 1.08;
    if (this.mastery === "mage_arcane") multiplier *= 1.2;
    if (this.mastery === "mage_hex") multiplier *= 1.06;
    if (this.mastery === "barracks_assault") multiplier *= 1.18;
    if (this.mastery === "artillery_mortar") multiplier *= 1.14;
    if (this.isOverdriven) multiplier *= 1.16;
    if (this.isSuppressed) multiplier *= this.suppressionDamageMultiplier;
    multiplier *= this.commandAuraDamageMultiplier;
    return Math.round(this.config.damage * multiplier);
  }

  get currentFireRateMs(): number {
    const relicRate =
      this.config.kind === "archer"
        ? this.relicBonuses.archerFireRateMultiplier
        : 1;
    const overdriveRate = this.isOverdriven ? 0.58 : 1;
    const masteryRate =
      this.mastery === "archer_longbow"
        ? 0.72
        : this.mastery === "mage_hex"
          ? 0.88
          : 1;
    const suppressionRate = this.isSuppressed
      ? this.suppressionFireRateMultiplier
      : 1;
    return Math.max(
      170,
      Math.round(
        this.config.fireRateMs *
          (1 - (this.level - 1) * 0.1) *
          relicRate *
          overdriveRate *
          masteryRate *
          suppressionRate *
          this.commandAuraFireRateMultiplier,
      ),
    );
  }

  get currentSplashRadius(): number | undefined {
    if (!this.config.splashRadius) return undefined;
    return (
      this.config.splashRadius +
      (this.level - 1) * 8 +
      this.permanentUpgrades.artillerySplash * 6 +
      this.relicBonuses.artillerySplashBonus +
      (this.mastery === "artillery_mortar" ? 24 : 0) +
      (this.mastery === "artillery_shock" ? 12 : 0) +
      (this.isOverdriven ? 8 : 0)
    );
  }

  get upgradeCost(): number | null {
    if (this.level >= 3) return null;
    return Math.round(this.config.cost * (this.level === 1 ? 0.85 : 1.35));
  }

  get investedGold(): number {
    let total = this.config.cost;
    if (this.level >= 2) total += Math.round(this.config.cost * 0.85);
    if (this.level >= 3) total += Math.round(this.config.cost * 1.35);
    return total;
  }

  get sellValue(): number {
    return Math.max(1, Math.round(this.investedGold * 0.68));
  }

  get masteryLabel(): string {
    return getTowerMastery(this.mastery)?.label ?? "전문화 미선택";
  }

  get masteryCost(): number {
    return Math.round(this.config.cost * 1.85 + this.level * 42);
  }

  canChooseMastery(): boolean {
    return this.level >= 3 && !this.mastery;
  }

  chooseMastery(id: TowerMasteryId): boolean {
    const mastery = getTowerMastery(id);
    if (
      !mastery ||
      mastery.kind !== this.config.kind ||
      !this.canChooseMastery()
    )
      return false;
    this.mastery = id;
    this.rangeCircle.setRadius(this.currentRange);
    this.updateSpriteForLevel();
    this.levelText.setText(mastery.shortLabel);
    this.levelText.setFontSize(11);
    this.levelText.setColor("#fff4c2");
    if (!this.masteryAura || !this.masteryAura.active) {
      this.masteryAura = this.scene.add
        .circle(this.x, this.y, 52, mastery.color, 0.08)
        .setStrokeStyle(2, mastery.color, 0.55)
        .setDepth(20);
      this.scene.tweens.add({
        targets: this.masteryAura,
        scale: 1.18,
        alpha: 0.02,
        duration: 900,
        yoyo: true,
        repeat: -1,
      });
    }
    spawnUpgradeBurst(this.scene, this.x, this.y - 10, mastery.color);
    spawnImpactRing(
      this.scene,
      this.x,
      this.y - 10,
      58,
      mastery.color,
      0.2,
      520,
    );
    spawnTowerSkillCutIn(
      this.scene,
      this.config.kind,
      mastery.label,
      mastery.description,
      mastery.color,
    );
    if (this.config.kind === "barracks") this.reinforceSoldiers();
    return true;
  }

  targetModeLabel(): string {
    if (this.config.kind === "barracks") return "집결지 전술";
    return TARGET_MODE_LABELS[this.targetMode];
  }

  setTargetMode(mode: TargetMode): void {
    if (this.config.kind === "barracks") return;
    this.targetMode = mode;
  }

  cycleTargetMode(): TargetMode {
    if (this.config.kind === "barracks") return this.targetMode;
    const order: TargetMode[] = this.config.canHitFlying
      ? ["first", "strong", "air", "near"]
      : ["first", "strong", "near"];
    const index = order.indexOf(this.targetMode);
    this.targetMode = order[(index + 1) % order.length];
    return this.targetMode;
  }

  setCommandAura(
    damageMultiplier = 1,
    fireRateMultiplier = 1,
    label = "",
    color = 0x8fffd8,
  ): void {
    this.commandAuraDamageMultiplier = damageMultiplier;
    this.commandAuraFireRateMultiplier = fireRateMultiplier;
    const active =
      Math.abs(damageMultiplier - 1) > 0.001 ||
      Math.abs(fireRateMultiplier - 1) > 0.001;
    if (!active) {
      this.commandAura?.destroy();
      this.commandAuraLabel?.destroy();
      this.commandAura = undefined;
      this.commandAuraLabel = undefined;
      return;
    }
    if (!this.commandAura || !this.commandAura.active) {
      this.commandAura = this.scene.textures.exists("v2-command-aura")
        ? this.scene.add
            .image(this.x, this.y + 2, "v2-command-aura")
            .setDisplaySize(72, 72)
            .setDepth(20)
            .setAlpha(0.52)
            .setBlendMode(Phaser.BlendModes.ADD)
        : this.scene.add
            .circle(this.x, this.y, 42, color, 0.06)
            .setStrokeStyle(2, color, 0.38)
            .setDepth(20);
      this.scene.tweens.add({
        targets: this.commandAura,
        angle: 360,
        duration: 5200,
        repeat: -1,
        ease: "Linear",
      });
    }
    this.commandAura.setPosition(this.x, this.y + 2);
    this.commandAuraLabel?.destroy();
    if (label) {
      this.commandAuraLabel = this.scene.add
        .text(this.x, this.y + 44, label, {
          fontSize: "9px",
          color: "#eafff2",
          fontStyle: "bold",
          stroke: "#06382f",
          strokeThickness: 2,
          fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        })
        .setOrigin(0.5)
        .setDepth(72)
        .setAlpha(0.92);
    }
  }

  activateOverdrive(durationMs = 12000): void {
    this.overdriveUntil = Math.max(
      this.overdriveUntil,
      this.scene.time.now + durationMs,
    );
    this.rangeCircle.setRadius(this.currentRange);
    if (!this.overdriveAura || !this.overdriveAura.active) {
      this.overdriveAura = this.scene.add
        .circle(this.x, this.y, 44, this.config.color, 0.08)
        .setStrokeStyle(2, this.config.color, 0.42)
        .setDepth(21);
      this.scene.tweens.add({
        targets: this.overdriveAura,
        scale: 1.22,
        alpha: 0.02,
        duration: 650,
        yoyo: true,
        repeat: -1,
      });
    }
    this.scene.tweens.add({
      targets: [this.sprite, this.top, this.roof].filter(Boolean),
      scale: 1.16,
      duration: 90,
      yoyo: true,
    });
  }

  reinforceSoldiers(): void {
    if (this.config.kind !== "barracks") return;
    this.soldiers.forEach((soldier) => soldier.destroy());
    this.soldiers = [];
    this.spawnSoldiers();
    const opts = this.soldierOptions();
    this.soldiers.forEach((soldier) =>
      soldier.setStats(opts.damage ?? 7, opts.maxHp ?? 70, opts.blockMs ?? 250),
    );
  }

  demolish(): void {
    this.soldiers.forEach((soldier) => soldier.destroy());
    this.soldiers = [];
    this.overdriveAura?.destroy();
    this.commandAura?.destroy();
    this.commandAuraLabel?.destroy();
    this.masteryAura?.destroy();
    this.suppressionAura?.destroy();
    this.suppressionLabel?.destroy();
    this.destroy();
  }

  update(deltaMs: number, enemies: Enemy[]): void {
    this.cooldownMs = Math.max(0, this.cooldownMs - deltaMs);
    this.skillCutInCooldownMs = Math.max(
      0,
      this.skillCutInCooldownMs - deltaMs,
    );
    this.rangeCircle.setRadius(this.currentRange);
    if (this.overdriveAura?.active) {
      this.overdriveAura.setPosition(this.x, this.y);
      if (!this.isOverdriven) {
        this.overdriveAura.destroy();
        this.overdriveAura = undefined;
      }
    }
    if (this.suppressionAura?.active) {
      this.suppressionAura.setPosition(this.x, this.y);
      if (!this.isSuppressed) {
        this.suppressionAura.destroy();
        this.suppressionAura = undefined;
        this.suppressionDamageMultiplier = 1;
        this.suppressionFireRateMultiplier = 1;
      }
    }
    if (this.masteryAura?.active) this.masteryAura.setPosition(this.x, this.y);
    if (this.commandAura?.active)
      this.commandAura.setPosition(this.x, this.y + 2);
    if (this.commandAuraLabel?.active)
      this.commandAuraLabel.setPosition(this.x, this.y + 44);

    if (this.config.kind === "barracks") {
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
    if (this.config.kind !== "barracks" || this.soldiers.length > 0) return;
    const rallyX = this.x + 40;
    const rallyY = this.y;
    const soldierCount = this.mastery === "barracks_assault" ? 4 : 3;
    for (let i = 0; i < soldierCount; i++) {
      this.soldiers.push(
        new Soldier(
          this.scene,
          this.x + i * 8 - 8,
          this.y + 26,
          rallyX,
          rallyY + i * 18 - 18,
          this.soldierOptions(),
        ),
      );
    }
  }

  setRallyPoint(x: number, y: number): void {
    this.soldiers.forEach((soldier, idx) =>
      soldier.setRally(x, y + idx * 18 - 18),
    );
    const flag = this.scene.add
      .triangle(x, y - 20, 0, 0, 0, 24, 22, 8, 0xffe0a3, 0.9)
      .setDepth(40);
    const pole = this.scene.add
      .rectangle(x - 2, y - 7, 4, 32, 0x3a2c1a, 1)
      .setDepth(39);
    this.scene.time.delayedCall(1000, () => {
      flag.destroy();
      pole.destroy();
    });
  }

  upgrade(): void {
    if (this.level >= 3) return;
    this.level += 1;
    this.rangeCircle.setRadius(this.currentRange);
    this.levelText.setText(this.level === 2 ? "Ⅱ" : "Ⅲ");
    this.top.setRadius(this.level === 2 ? 20 : 22);
    this.updateSpriteForLevel();
    this.scene.tweens.add({
      targets: [this.top, this.roof, this.sprite].filter(Boolean),
      scale: 1.18,
      duration: 100,
      yoyo: true,
    });
    playSfx(this.scene, "sfx_upgrade");
    spawnUpgradeBurst(this.scene, this.x, this.y - 10, this.config.color);
    spawnImpactRing(
      this.scene,
      this.x,
      this.y - 10,
      34,
      this.config.color,
      0.18,
      360,
    );
    if (this.level >= 3) this.showSkillCutIn(true);

    if (this.config.kind === "barracks") {
      if (this.soldiers.length === 0) this.spawnSoldiers();
      const opts = this.soldierOptions();
      this.soldiers.forEach((soldier) =>
        soldier.setStats(
          opts.damage ?? 7,
          opts.maxHp ?? 70,
          opts.blockMs ?? 250,
        ),
      );
    }
  }

  private soldierOptions() {
    const overdriveMultiplier = this.isOverdriven ? 1.18 : 1;
    const masteryDamage =
      this.mastery === "barracks_assault"
        ? 1.34
        : this.mastery === "barracks_paladin"
          ? 1.08
          : 1;
    const damage = Math.round(
      this.config.damage *
        (1 + (this.level - 1) * 0.5) *
        this.relicBonuses.barracksDamageMultiplier *
        overdriveMultiplier *
        masteryDamage *
        this.commandAuraDamageMultiplier,
    );
    const masteryHp =
      this.mastery === "barracks_paladin"
        ? 70
        : this.mastery === "barracks_assault"
          ? 20
          : 0;
    const maxHp =
      70 +
      (this.level - 1) * 35 +
      this.permanentUpgrades.barracksHp * 20 +
      this.relicBonuses.barracksHpBonus +
      masteryHp +
      (this.isOverdriven ? 18 : 0);
    const blockMs =
      this.mastery === "barracks_paladin"
        ? 620
        : this.level >= 3
          ? 420
          : 250 + (this.level - 1) * 55;
    return {
      damage,
      maxHp,
      blockMs,
      color: this.level >= 3 ? 0x7cc7ff : 0x4fa3ff,
    };
  }

  private findTarget(enemies: Enemy[]): Enemy | undefined {
    const candidates = enemies.filter((enemy) => {
      if (enemy.dead || enemy.reachedGoal) return false;
      if (enemy.config.flying && !this.config.canHitFlying) return false;
      return (
        Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <=
        this.currentRange
      );
    });

    if (this.targetMode === "strong") {
      candidates.sort((a, b) => b.hp - a.hp || b.pathIndex - a.pathIndex);
    } else if (this.targetMode === "air") {
      candidates.sort(
        (a, b) =>
          Number(b.config.flying) - Number(a.config.flying) ||
          b.pathIndex - a.pathIndex,
      );
    } else if (this.targetMode === "near") {
      candidates.sort(
        (a, b) =>
          Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) -
          Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y),
      );
    } else {
      candidates.sort((a, b) => b.pathIndex - a.pathIndex);
    }

    return candidates[0];
  }

  private fireAt(target: Enemy, enemies: Enemy[]): void {
    if (this.config.kind === "artillery" && this.currentSplashRadius) {
      this.fireArtillery(target, enemies);
      return;
    }

    const launchX = this.x;
    const launchY = this.y - 18;
    const impactX = target.x;
    const impactY = target.y;
    const isMage = this.config.kind === "mage";
    const style = isMage ? "magic" : "arrow";
    const color = isMage ? 0xb88cff : 0xffe0a3;
    const duration = isMage ? 150 : 95;
    this.playAttackMotion(impactX, impactY);
    spawnMuzzleFlash(this.scene, launchX, launchY, this.config.color);
    playSfx(this.scene, isMage ? "sfx_magic" : "sfx_shoot");

    spawnProjectile(
      this.scene,
      launchX,
      launchY,
      impactX,
      impactY,
      color,
      style,
      duration,
      () => {
        if (!target.active || target.dead) return;
        const damage = this.currentDamage;
        target.receiveDamage(damage, isMage ? "magic" : "physical");
        if (
          this.mastery === "archer_sniper" &&
          (target.config.threat === "boss" || target.config.flying)
        )
          target.receiveDamage(Math.round(damage * 0.42), "true");
        if (this.mastery === "mage_arcane")
          target.receiveDamage(Math.round(damage * 0.24), "true");
        if (this.mastery === "mage_hex") target.receiveSlow(0.42, 3200);
        if (this.mastery === "archer_longbow") {
          const second = enemies.find(
            (enemy) =>
              enemy !== target &&
              enemy.active &&
              !enemy.dead &&
              !enemy.reachedGoal &&
              Phaser.Math.Distance.Between(
                target.x,
                target.y,
                enemy.x,
                enemy.y,
              ) <= 58,
          );
          if (second)
            second.receiveDamage(Math.round(damage * 0.46), "physical");
        }
        if (
          target.config.threat === "boss" &&
          this.relicBonuses.trueDamageBonus > 0
        )
          target.receiveDamage(this.relicBonuses.trueDamageBonus, "true");
        if (this.level >= 3 && this.config.kind === "archer") {
          this.showSkillCutIn();
          target.receivePoison(this.currentDamage * 0.65, 3000);
        }
        if (this.level >= 3 && this.config.kind === "mage") {
          this.showSkillCutIn();
          target.receiveSlow(0.55, 2200);
        }
        spawnImpactRing(
          this.scene,
          impactX,
          impactY,
          isMage ? 20 : 13,
          color,
          isMage ? 0.18 : 0.1,
          210,
        );
      },
    );
  }

  private fireArtillery(target: Enemy, enemies: Enemy[]): void {
    const impactX = target.x;
    const impactY = target.y;
    this.playAttackMotion(impactX, impactY, true);
    spawnMuzzleFlash(this.scene, this.x, this.y - 20, 0xffd36b);
    playSfx(this.scene, "sfx_shoot");
    spawnProjectile(
      this.scene,
      this.x,
      this.y - 20,
      impactX,
      impactY,
      0x2c1a0a,
      "shell",
      170,
      () => {
        const radius = this.currentSplashRadius ?? 50;
        spawnExplosionBurst(
          this.scene,
          impactX,
          impactY,
          Math.max(0.9, radius / 52),
        );
        const impact = this.scene.add
          .circle(impactX, impactY, radius, 0xffb347, 0.2)
          .setDepth(34);
        const ring = this.scene.add
          .circle(impactX, impactY, radius * 0.55, 0xfff1c2, 0.14)
          .setStrokeStyle(2, 0xfff1c2, 0.55)
          .setDepth(35);
        this.scene.tweens.add({
          targets: [impact, ring],
          scale: 1.35,
          alpha: 0,
          duration: 260,
          onComplete: () => {
            impact.destroy();
            ring.destroy();
          },
        });
        spawnHitSpark(this.scene, impactX, impactY, 0xffd36b);
        spawnImpactRing(
          this.scene,
          impactX,
          impactY,
          radius,
          0xffb347,
          0.18,
          340,
        );
        shakeCamera(this.scene, 0.0035, 110);
        playSfx(this.scene, "sfx_explosion");
        enemies.forEach((enemy) => {
          if (
            enemy.active &&
            !enemy.dead &&
            !enemy.config.flying &&
            Phaser.Math.Distance.Between(impactX, impactY, enemy.x, enemy.y) <=
              radius
          ) {
            let artilleryDamage = this.currentDamage;
            if (
              this.mastery === "artillery_mortar" &&
              Phaser.Math.Distance.Between(
                impactX,
                impactY,
                enemy.x,
                enemy.y,
              ) <=
                radius * 0.48
            )
              artilleryDamage = Math.round(artilleryDamage * 1.35);
            enemy.receiveDamage(artilleryDamage, "physical");
            if (
              enemy.config.threat === "boss" &&
              this.relicBonuses.trueDamageBonus > 0
            )
              enemy.receiveDamage(this.relicBonuses.trueDamageBonus, "true");
            if (this.level >= 3) {
              this.showSkillCutIn();
              enemy.receiveSlow(
                this.mastery === "artillery_shock" ? 0.45 : 0.68,
                this.mastery === "artillery_shock" ? 2400 : 1400,
              );
            }
          }
        });
      },
    );
  }

  private showSkillCutIn(force = false): void {
    if (this.level < 3) return;
    if (!force && this.skillCutInCooldownMs > 0) return;
    this.skillCutInCooldownMs = force ? 9000 : 15000;
    const mastery = getTowerMastery(this.mastery);
    spawnTowerSkillCutIn(
      this.scene,
      this.config.kind,
      this.config.label,
      mastery ? mastery.label : this.config.maxSkill,
      mastery ? mastery.color : this.config.color,
    );
  }

  private playPlacementBounce(): void {
    // 배치 직후 띠용~ 하고 튀어나오는 탄성 연출.
    // 컨테이너 스케일 한 번만 사용하므로 모바일에서도 저렴하다.
    spawnBuildDust(this.scene, this.x, this.y + 10);
    this.setAlpha(0);
    this.setScale(0.36);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: 420,
      ease: "Elastic.easeOut",
    });
  }

  private playAttackMotion(
    targetX: number,
    targetY: number,
    heavy = false,
  ): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const recoilX = -dirX * (heavy ? 8 : 5);
    const recoilY = -dirY * (heavy ? 6 : 3.5);
    const intensity = heavy ? 0.13 : 0.085;
    const tint =
      this.config.kind === "mage"
        ? 0xd9b8ff
        : this.config.kind === "artillery"
          ? 0xffd36b
          : 0xfff1c2;

    if (this.sprite) {
      const sx = this.sprite.scaleX;
      const sy = this.sprite.scaleY;
      const stretchX =
        sx *
        (1 + Math.abs(dirX) * intensity - Math.abs(dirY) * intensity * 0.42);
      const stretchY =
        sy *
        (1 + Math.abs(dirY) * intensity - Math.abs(dirX) * intensity * 0.42);
      this.scene.tweens.killTweensOf(this.sprite);
      this.scene.tweens.add({
        targets: this.sprite,
        x: recoilX,
        y: recoilY + (this.config.kind === "artillery" ? -6 : -12),
        scaleX: stretchX,
        scaleY: stretchY,
        duration: heavy ? 96 : 72,
        ease: "Quad.easeOut",
        yoyo: true,
        onComplete: () => {
          if (!this.sprite?.active) return;
          this.sprite.setScale(sx, sy);
          this.sprite.setPosition(
            0,
            this.config.kind === "artillery" ? -6 : -12,
          );
          this.sprite.clearTint();
        },
      });
      this.sprite.setTint(tint);
      this.scene.time.delayedCall(110, () => this.sprite?.clearTint());
      return;
    }

    [this.top, this.roof].forEach((target) => {
      const sx = target.scaleX;
      const sy = target.scaleY;
      const ox = target.x;
      const oy = target.y;
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        x: ox + recoilX,
        y: oy + recoilY,
        scaleX: sx * (1 + Math.abs(dirX) * intensity),
        scaleY: sy * (1 + Math.abs(dirY) * intensity),
        duration: heavy ? 96 : 72,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: () => {
          if (!target.active) return;
          target.setScale(sx, sy);
          target.setPosition(ox, oy);
        },
      });
    });
  }

  private resolveTowerTextureKey(): string {
    // v2.35.8: 타워 에셋 매핑은 AssetMap에서 중앙 관리한다.
    // 우선순위: 전문화 이미지 -> 레벨별 이미지 -> 기존 기본 이미지 -> DALL-E 교체용 캐주얼 아이콘.
    return (
      resolveTowerTextureKey(
        this.scene,
        this.config.kind,
        this.level,
        this.mastery,
      ) ?? `tower-${this.config.kind}`
    );
  }

  refreshArt(): void {
    const nextKey = this.resolveTowerTextureKey();
    if (!this.scene.textures.exists(nextKey)) return;

    if (!this.sprite) {
      this.sprite = this.scene.add.image(0, 0, nextKey);
      const index = this.artBackplate ? this.getIndex(this.artBackplate) + 1 : this.length;
      this.addAt(this.sprite, Math.max(0, index));
    } else {
      this.sprite.setTexture(nextKey);
    }

    const casual = isCasualArtTextureKey(nextKey);
    if (casual && !this.artBackplate) {
      this.artBackplate = makeStickerBackplate(this.scene, 0, -12, 68, 82, {
        fill: 0xfff8e8,
        stroke: 0x5a3b22,
        alpha: 0.78,
        strokeAlpha: 0.22,
      });
      this.addAt(this.artBackplate, Math.max(0, this.length - 1));
    }
    this.artBackplate?.setVisible(casual);
    this.applyTowerArtSize();
  }

  private updateSpriteForLevel(): void {
    this.refreshArt();
  }

  private applyTowerArtSize(): void {
    if (!this.sprite) return;
    // v2.36.0: 모바일 본 게임에서는 타워가 너무 작은 아이콘처럼 보이지 않도록
    // 전투 발자국 기준으로 약 10~18% 키운다. 실제 텍스처 해상도와 무관하게 표시 높이로 맞춘다.
    const targetHeight = towerDisplayHeight(this.config.kind, this.level);
    const textureKey = this.sprite.texture.key;
    if (isCasualArtTextureKey(textureKey)) {
      fitIsolatedIcon(this.sprite, {
        maxWidth: this.config.kind === "barracks" ? 92 : 96,
        maxHeight: targetHeight,
        y: this.config.kind === "artillery" ? -5 : -12,
        minScale: 0.02,
        maxScale: 1.2,
      });
      this.artBackplate?.setPosition(0, this.config.kind === "artillery" ? -8 : -13);
      this.artBackplate?.setSize(88, Math.min(110, targetHeight + 10));
      return;
    }
    const sourceHeight = Math.max(1, this.sprite.height);
    const sourceWidth = Math.max(1, this.sprite.width);
    this.sprite.setDisplaySize(
      sourceWidth * (targetHeight / sourceHeight),
      targetHeight,
    );
    this.sprite.setPosition(0, this.config.kind === "artillery" ? -6 : -12);
    this.artBackplate?.setVisible(false);
  }

  private symbolFor(kind: TowerConfig["kind"]): string {
    if (kind === "archer") return "➶";
    if (kind === "mage") return "✦";
    if (kind === "barracks") return "♜";
    return "●";
  }

  private makeRoof(
    scene: Phaser.Scene,
    config: TowerConfig,
  ): Phaser.GameObjects.Shape {
    if (config.kind === "artillery") {
      return scene.add
        .rectangle(0, -10, 36, 11, 0x25170a, 1)
        .setStrokeStyle(1, 0xffd4a3, 0.25);
    }
    if (config.kind === "barracks") {
      return scene.add
        .triangle(0, -20, -25, 18, 0, -8, 25, 18, 0x2b3b5c, 1)
        .setStrokeStyle(1, 0xffffff, 0.2);
    }
    return scene.add
      .triangle(
        0,
        -23,
        -24,
        18,
        0,
        -9,
        24,
        18,
        config.kind === "mage" ? 0x38205b : 0x315a2f,
        1,
      )
      .setStrokeStyle(1, 0xffffff, 0.2);
  }
}
