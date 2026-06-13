import Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import type { EnemyConfig, TowerKind } from "./types";

/**
 * v2.36.22 Reference Progression Fusion
 *
 * This module keeps the user-provided no-text reference art evolving with the
 * game systems.  It never bakes labels into images; it draws lightweight Phaser
 * ornaments around already-loaded reference thumbnails/actors so progression,
 * threat and readiness are visible even when heavy art is deferred.
 */
export type ReferenceProgressionCategory = "tower" | "enemy" | "hero" | "skill";
export type ReferenceProgressionTier = "base" | "veteran" | "elite" | "ascended" | "mythic";

export type ReferenceProgressionOrnamentOptions = {
  width: number;
  height: number;
  category: ReferenceProgressionCategory;
  tier?: ReferenceProgressionTier;
  accent?: number;
  pips?: number;
  locked?: boolean;
  selected?: boolean;
  x?: number;
  y?: number;
  depth?: number;
  alpha?: number;
  essential?: boolean;
  noMotion?: boolean;
};

const QUERY = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function referenceProgressionFusionEnabled(): boolean {
  if (
    QUERY.has("norefprogression") ||
    QUERY.has("noprogressionart") ||
    QUERY.has("legacyrefprogression") ||
    QUERY.has("legacyreferenceart") ||
    QUERY.has("toydebug") ||
    readStorage("ksNoReferenceProgression") === "1"
  ) {
    return false;
  }
  return true;
}

export function referenceProgressionEssentialMode(): boolean {
  if (
    QUERY.has("essentialprogression") ||
    QUERY.has("safeprogression") ||
    QUERY.has("fallbackprogression") ||
    readStorage("ksEmergencyFallback") === "1" ||
    readStorage("ksSafeGfx") === "1" ||
    readStorage("ksSupremeDesignMode") === "essential"
  ) {
    return true;
  }
  const caps = getMobileRuntimeCaps();
  return caps.runtimeLockdown || caps.saveData || caps.networkClass === "slow";
}

function tierAccent(tier: ReferenceProgressionTier, fallback: number): number {
  if (tier === "mythic") return 0xffd66b;
  if (tier === "ascended") return 0x7cc7ff;
  if (tier === "elite") return 0xb88cff;
  if (tier === "veteran") return 0x8cffd2;
  return fallback;
}

function categoryFallback(category: ReferenceProgressionCategory): number {
  if (category === "enemy") return 0xff6a4d;
  if (category === "hero") return 0x7cc7ff;
  if (category === "skill") return 0x8cffd2;
  return 0xf7d36b;
}

export function progressionTierFromVariantState(
  state: string | undefined,
  pips = 0,
  selected = false,
  locked = false,
): ReferenceProgressionTier {
  if (locked || state === "locked") return "base";
  if (state === "boss") return "mythic";
  if (state === "elite") return "elite";
  if (state === "selected" || selected) return pips >= 4 ? "ascended" : "veteran";
  if (state === "upgrade") return pips >= 4 ? "ascended" : pips >= 2 ? "veteran" : "base";
  if (state === "spell") return pips >= 3 ? "elite" : "veteran";
  if (pips >= 5) return "mythic";
  if (pips >= 4) return "ascended";
  if (pips >= 3) return "elite";
  if (pips >= 2) return "veteran";
  return "base";
}

export function towerResearchLevelForKind(
  upgrades: Partial<Record<string, number>> | undefined,
  kind: TowerKind,
): number {
  if (!upgrades) return 0;
  if (kind === "archer") return Math.max(0, Math.round(upgrades.archerDamage ?? 0));
  if (kind === "mage") return Math.max(0, Math.round(upgrades.mageDamage ?? 0));
  if (kind === "barracks") return Math.max(0, Math.round(upgrades.barracksHp ?? 0));
  if (kind === "artillery") return Math.max(0, Math.round(upgrades.artillerySplash ?? 0));
  return 0;
}

export function towerProgressionTier(
  level: number,
  mastery?: string,
  researchLevel = 0,
): ReferenceProgressionTier {
  if (mastery) return "mythic";
  if (level >= 3 && researchLevel >= 2) return "ascended";
  if (level >= 3) return "elite";
  if (level >= 2 || researchLevel >= 2) return "veteran";
  return "base";
}

export function enemyProgressionTier(config: Pick<EnemyConfig, "threat" | "flying" | "scale">): ReferenceProgressionTier {
  if (config.threat === "boss") return "mythic";
  if (config.threat === "tank" || config.threat === "support" || config.flying) return "elite";
  if ((config.scale ?? 1) >= 1.2) return "veteran";
  return "base";
}

export function heroProgressionTier(selected = false, index = 0): ReferenceProgressionTier {
  if (selected) return "ascended";
  return index <= 0 ? "veteran" : "base";
}

export function skillProgressionTier(ready = true, pips = 1): ReferenceProgressionTier {
  if (!ready) return "base";
  if (pips >= 3) return "elite";
  return "veteran";
}

function drawChevron(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number, alpha: number): void {
  g.lineStyle(Math.max(2, size * 0.18), color, alpha);
  g.beginPath();
  g.moveTo(x - size * 0.38, y + size * 0.12);
  g.lineTo(x, y - size * 0.28);
  g.lineTo(x + size * 0.38, y + size * 0.12);
  g.strokePath();
}

export function createReferenceProgressionOrnament(
  scene: Phaser.Scene,
  options: ReferenceProgressionOrnamentOptions,
): Phaser.GameObjects.Container {
  const root = scene.add.container(options.x ?? 0, options.y ?? 0).setAlpha(options.alpha ?? 1);
  if (options.depth !== undefined) root.setDepth(options.depth);
  if (!referenceProgressionFusionEnabled()) return root;

  const essential = options.essential ?? referenceProgressionEssentialMode();
  const w = options.width;
  const h = options.height;
  const pips = Phaser.Math.Clamp(Math.round(options.pips ?? 0), 0, 5);
  const tier = options.tier ?? progressionTierFromVariantState(undefined, pips, options.selected, options.locked);
  const accent = tierAccent(tier, options.accent ?? categoryFallback(options.category));
  const dim = options.locked ? 0.38 : 1;
  const g = scene.add.graphics();

  // No-text corner language: the silhouette carries status without labels.
  const corner = Math.max(8, Math.min(w, h) * 0.16);
  const lineAlpha = (essential ? 0.3 : 0.58) * dim;
  g.lineStyle(essential ? 2 : 3, accent, lineAlpha);
  g.beginPath();
  g.moveTo(-w / 2 + 4, -h / 2 + corner);
  g.lineTo(-w / 2 + 4, -h / 2 + 4);
  g.lineTo(-w / 2 + corner, -h / 2 + 4);
  g.moveTo(w / 2 - corner, -h / 2 + 4);
  g.lineTo(w / 2 - 4, -h / 2 + 4);
  g.lineTo(w / 2 - 4, -h / 2 + corner);
  g.moveTo(-w / 2 + 4, h / 2 - corner);
  g.lineTo(-w / 2 + 4, h / 2 - 4);
  g.lineTo(-w / 2 + corner, h / 2 - 4);
  g.moveTo(w / 2 - corner, h / 2 - 4);
  g.lineTo(w / 2 - 4, h / 2 - 4);
  g.lineTo(w / 2 - 4, h / 2 - corner);
  g.strokePath();

  if (!essential) {
    g.fillStyle(accent, (tier === "mythic" ? 0.2 : 0.1) * dim);
    g.fillTriangle(-w * 0.32, -h * 0.46, w * 0.32, -h * 0.46, 0, -h * 0.33);
    g.lineStyle(1, 0xffffff, 0.16 * dim).strokeEllipse(0, h * 0.42, w * 0.58, h * 0.08);
  }

  // Tier crown/chevrons without words.
  const chevrons = tier === "mythic" ? 3 : tier === "ascended" ? 2 : tier === "elite" ? 2 : tier === "veteran" ? 1 : 0;
  for (let i = 0; i < chevrons; i += 1) {
    drawChevron(g, (i - (chevrons - 1) / 2) * 11, -h / 2 + 11, 9, accent, (essential ? 0.42 : 0.72) * dim);
  }

  // Bottom pips mirror actual progression but remain text-free.
  const spacing = 8;
  const start = -((pips - 1) * spacing) / 2;
  for (let i = 0; i < pips; i += 1) {
    g.fillStyle(i < pips ? accent : 0xffffff, (essential ? 0.58 : 0.92) * dim);
    g.fillCircle(start + i * spacing, h / 2 - 8, 2.6);
    g.lineStyle(1, 0x07101d, 0.7 * dim).strokeCircle(start + i * spacing, h / 2 - 8, 2.8);
  }

  if (options.locked) {
    g.lineStyle(2, 0x9aa6b8, 0.32);
    g.beginPath();
    g.moveTo(-w * 0.18, h * 0.02);
    g.lineTo(w * 0.18, -h * 0.18);
    g.moveTo(-w * 0.18, -h * 0.18);
    g.lineTo(w * 0.18, h * 0.02);
    g.strokePath();
  }

  root.add(g);

  if (!essential && !options.noMotion && (tier === "mythic" || options.selected)) {
    scene.tweens.add({
      targets: root,
      alpha: { from: 0.78, to: 1 },
      duration: tier === "mythic" ? 820 : 1080,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  return root;
}

export function addReferenceProgressionOrnament(
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  options: ReferenceProgressionOrnamentOptions,
): Phaser.GameObjects.Container {
  const ornament = createReferenceProgressionOrnament(scene, options);
  parent.add(ornament);
  return ornament;
}

export function createReferenceActorProgressionHalo(
  scene: Phaser.Scene,
  category: ReferenceProgressionCategory,
  options: Omit<ReferenceProgressionOrnamentOptions, "category">,
): Phaser.GameObjects.Container {
  const root = createReferenceProgressionOrnament(scene, {
    ...options,
    category,
    x: 0,
    y: 0,
    noMotion: true,
    alpha: options.alpha ?? 0.86,
  });
  root.setName(`ks-ref-progression-${category}`);
  return root;
}

export function referenceProgressionDebugSummary(): string {
  if (!referenceProgressionFusionEnabled()) return "REFPROG:off";
  return referenceProgressionEssentialMode() ? "REFPROG:essential" : "REFPROG:fused";
}
