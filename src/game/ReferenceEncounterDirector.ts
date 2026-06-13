import Phaser from "phaser";
import { ENEMIES } from "./balance";
import type { EnemyKind, WaveSpawn } from "./types";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { resolveReferenceEvolutionEnemyThumb } from "./ReferenceAssetEvolution";
import { createReferenceArtSlot, referenceStateForEnemyThreat } from "./ReferenceVariantSystem";
import { enemyProgressionTier, referenceProgressionEssentialMode } from "./ReferenceProgressionFusion";

/**
 * v2.36.23 Reference Encounter Director
 *
 * Connects the no-text reference pipeline to moment-to-moment encounter surfaces:
 * wave intel portraits, boss cut-ins and lightweight threat summaries.  It does
 * not load assets by itself.  It only uses already-loaded thumbnail tiers and
 * falls back to the existing crest/spritesheet UI when they are unavailable.
 */
export type ReferenceEncounterPortraitOptions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  count?: number;
  inCombat?: boolean;
  depth?: number;
  alpha?: number;
  imageScale?: number;
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

export function referenceEncounterDirectorEnabled(): boolean {
  if (
    QUERY.has("norefencounter") ||
    QUERY.has("noencounterart") ||
    QUERY.has("legacyencounterart") ||
    QUERY.has("legacyreferenceart") ||
    QUERY.has("toydebug") ||
    readStorage("ksNoReferenceEncounter") === "1"
  ) {
    return false;
  }
  return true;
}

export function referenceEncounterEssentialMode(): boolean {
  if (
    QUERY.has("essentialencounter") ||
    QUERY.has("safeencounter") ||
    QUERY.has("fallbackencounter") ||
    referenceProgressionEssentialMode() ||
    readStorage("ksEmergencyFallback") === "1" ||
    readStorage("ksSafeGfx") === "1"
  ) {
    return true;
  }
  const caps = getMobileRuntimeCaps();
  return caps.runtimeLockdown || caps.saveData || caps.networkClass === "slow";
}

function pipsForWaveGroup(group: Pick<WaveSpawn, "count" | "kind">): number {
  const cfg = ENEMIES[group.kind];
  if (cfg?.threat === "boss") return 5;
  if (cfg?.threat === "tank" || cfg?.threat === "support" || cfg?.flying) return Math.min(4, Math.max(2, Math.ceil(group.count / 4)));
  return Math.min(3, Math.max(1, Math.ceil(group.count / 8)));
}

export function createReferenceEncounterPortrait(
  scene: Phaser.Scene,
  kind: EnemyKind | string,
  options: ReferenceEncounterPortraitOptions,
): Phaser.GameObjects.Container | undefined {
  if (!referenceEncounterDirectorEnabled()) return undefined;
  const cfg = ENEMIES[kind as EnemyKind];
  if (!cfg) return undefined;
  const textureKey = resolveReferenceEvolutionEnemyThumb(scene, kind);
  if (!textureKey || !scene.textures.exists(textureKey)) return undefined;

  const essential = referenceEncounterEssentialMode();
  const state = referenceStateForEnemyThreat(cfg.threat);
  const pips = pipsForWaveGroup({ kind: cfg.kind, count: options.count ?? 1 });
  const slot = createReferenceArtSlot(scene, {
    x: options.x,
    y: options.y,
    width: options.width ?? (cfg.threat === "boss" ? 54 : 40),
    height: options.height ?? (cfg.threat === "boss" ? 54 : 40),
    textureKey,
    category: "enemy",
    state,
    accent: cfg.accentColor ?? cfg.color,
    selected: options.inCombat && cfg.threat !== "swarm",
    pips,
    depth: options.depth,
    alpha: options.alpha ?? 1,
    imageScale: options.imageScale ?? (cfg.threat === "boss" ? 1.08 : 1),
    noMotion: options.noMotion ?? essential,
  });
  slot.setName(`ks-ref-encounter-${kind}`);
  return slot;
}

export function createReferenceBossCutinPortrait(
  scene: Phaser.Scene,
  kind: EnemyKind,
  x: number,
  y: number,
): Phaser.GameObjects.Container | undefined {
  const cfg = ENEMIES[kind];
  if (!cfg) return undefined;
  const slot = createReferenceEncounterPortrait(scene, kind, {
    x,
    y,
    width: 150,
    height: 150,
    count: cfg.threat === "boss" ? 5 : 3,
    inCombat: true,
    imageScale: cfg.threat === "boss" ? 1.36 : 1.12,
    noMotion: true,
  });
  if (!slot) return undefined;

  const accent = cfg.accentColor ?? cfg.color;
  const ring = scene.add.circle(0, 0, 88, accent, 0.08).setStrokeStyle(3, accent, 0.4);
  const under = scene.add.ellipse(0, 72, 130, 24, 0x000000, 0.28);
  slot.addAt(under, 0);
  slot.addAt(ring, 1);
  return slot;
}

export function summarizeReferenceEncounterWave(groups: WaveSpawn[] | undefined): string {
  if (!referenceEncounterDirectorEnabled()) return "REF-ENCOUNTER:off";
  if (!groups || groups.length === 0) return "REF-ENCOUNTER:clear";
  const boss = groups.some((group) => ENEMIES[group.kind]?.threat === "boss");
  const air = groups.some((group) => ENEMIES[group.kind]?.flying);
  const support = groups.some((group) => ENEMIES[group.kind]?.threat === "support");
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  const tier = boss ? "boss" : air ? "air" : support ? "support" : total >= 30 ? "swarm" : "standard";
  return `REF-ENCOUNTER:${tier}:${total}`;
}

export function addReferenceEncounterReadySheen(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  accent = 0x7cc7ff,
): void {
  if (!referenceEncounterDirectorEnabled() || referenceEncounterEssentialMode()) return;
  scene.tweens.add({
    targets: target,
    alpha: { from: 0.82, to: 1 },
    duration: 520,
    yoyo: true,
    repeat: 1,
    ease: "Sine.easeInOut",
  });
  const spatial = target as unknown as { x?: number; y?: number; depth?: number };
  const x = typeof spatial.x === "number" ? spatial.x : 0;
  const y = typeof spatial.y === "number" ? spatial.y : 0;
  const ring = scene.add.circle(x, y, 24, accent, 0).setStrokeStyle(2, accent, 0.52);
  ring.setDepth(typeof spatial.depth === "number" ? spatial.depth : 90);
  scene.tweens.add({
    targets: ring,
    scale: 1.45,
    alpha: 0,
    duration: 420,
    ease: "Cubic.easeOut",
    onComplete: () => ring.destroy(),
  });
}

export function referenceEncounterDebugSummary(scene: Phaser.Scene, groups?: WaveSpawn[]): string {
  const loaded = groups?.filter((group) => resolveReferenceEvolutionEnemyThumb(scene, group.kind)).length ?? 0;
  const total = groups?.length ?? 0;
  const mode = referenceEncounterEssentialMode() ? "essential" : "live";
  return `REF23:${mode}:${loaded}/${total}`;
}
