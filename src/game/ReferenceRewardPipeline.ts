import Phaser from "phaser";
import {
  ARTIFACTS,
  artifactRarityColor,
  type ArtifactId,
  type ArtifactRarity,
} from "./ArtifactForge";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { safeDelayedCall } from "./SceneSafety";
import { createReferenceArtSlot, type ReferenceVariantState } from "./ReferenceVariantSystem";
import {
  installReferenceEvolutionPack,
  resolveReferenceEvolutionEnemyThumb,
  resolveReferenceEvolutionHeroThumb,
  resolveReferenceEvolutionSkillThumb,
  resolveReferenceEvolutionTowerThumb,
} from "./ReferenceAssetEvolution";
import type { TowerKind } from "./types";

/**
 * v2.36.24 Reference Reward Pipeline
 *
 * Reward / forge / mission screens are where players judge whether battle
 * progress matters. This module keeps that loop visually connected to the
 * no-text reference asset pipeline without putting any text inside images and
 * without loading new assets during boot or active waves.
 */
export type ReferenceRewardKind =
  | "dust"
  | "token"
  | "shard"
  | "chestWood"
  | "chestIron"
  | "chestRoyal"
  | "chestMythic"
  | "forge"
  | "equip"
  | "mission"
  | "contract";

export type ReferenceRewardPhase = "lobby" | "world" | "battle-result" | "mission" | "forge" | "meta";

type RewardAsset = {
  key: string;
  kind: ReferenceRewardKind;
  path: string;
  webp: string;
};

const QUERY = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
const BASE = "assets/reference/v2_36_24/reward";

const REWARD_ASSETS: RewardAsset[] = [
  { kind: "dust", key: "ks23624-reward-dust", path: `${BASE}/reward_relic_dust.png`, webp: `${BASE}/reward_relic_dust.webp` },
  { kind: "token", key: "ks23624-reward-token", path: `${BASE}/reward_royal_token.png`, webp: `${BASE}/reward_royal_token.webp` },
  { kind: "shard", key: "ks23624-reward-shard", path: `${BASE}/reward_artifact_shard.png`, webp: `${BASE}/reward_artifact_shard.webp` },
  { kind: "chestWood", key: "ks23624-reward-chest-wood", path: `${BASE}/reward_chest_wood.png`, webp: `${BASE}/reward_chest_wood.webp` },
  { kind: "chestIron", key: "ks23624-reward-chest-iron", path: `${BASE}/reward_chest_iron.png`, webp: `${BASE}/reward_chest_iron.webp` },
  { kind: "chestRoyal", key: "ks23624-reward-chest-royal", path: `${BASE}/reward_chest_royal.png`, webp: `${BASE}/reward_chest_royal.webp` },
  { kind: "chestMythic", key: "ks23624-reward-chest-mythic", path: `${BASE}/reward_chest_mythic.png`, webp: `${BASE}/reward_chest_mythic.webp` },
  { kind: "forge", key: "ks23624-reward-forge", path: `${BASE}/reward_forge.png`, webp: `${BASE}/reward_forge.webp` },
  { kind: "equip", key: "ks23624-reward-equip", path: `${BASE}/reward_equip.png`, webp: `${BASE}/reward_equip.webp` },
  { kind: "mission", key: "ks23624-reward-mission", path: `${BASE}/reward_mission.png`, webp: `${BASE}/reward_mission.webp` },
  { kind: "contract", key: "ks23624-reward-contract", path: `${BASE}/reward_contract.png`, webp: `${BASE}/reward_contract.webp` },
];

const KIND_TO_ASSET = Object.fromEntries(REWARD_ASSETS.map((asset) => [asset.kind, asset])) as Record<ReferenceRewardKind, RewardAsset>;

type LoaderWithState = Phaser.Loader.LoaderPlugin & { isLoading?: () => boolean };

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function supportsWebp(): boolean {
  if (QUERY.has("pngart") || QUERY.has("pngreward") || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export function referenceRewardPipelineDisabled(): boolean {
  return (
    QUERY.has("norewardpipeline") ||
    QUERY.has("norewardart") ||
    QUERY.has("legacyrewardart") ||
    QUERY.has("legacyreferenceart") ||
    QUERY.has("toydebug") ||
    readStorage("ksNoReferenceRewardPipeline") === "1"
  );
}

export function referenceRewardPipelineEnabled(): boolean {
  if (referenceRewardPipelineDisabled()) return false;
  if (
    QUERY.has("rewardpipeline") ||
    QUERY.has("refrewards") ||
    QUERY.has("rewardart") ||
    QUERY.has("lootart") ||
    readStorage("ksReferenceRewardPipeline") === "1"
  ) {
    return true;
  }
  const caps = getMobileRuntimeCaps();
  if (caps.runtimeLockdown || caps.label === "LOCKDOWN_MOBILE_ENGINE") return false;
  if (caps.saveData || caps.networkClass === "slow") return false;
  return true;
}

export function referenceRewardEssentialMode(): boolean {
  if (
    QUERY.has("essentialreward") ||
    QUERY.has("safereward") ||
    QUERY.has("fallbackreward") ||
    readStorage("ksEmergencyFallback") === "1" ||
    readStorage("ksSafeGfx") === "1" ||
    readStorage("ksSupremeDesignMode") === "essential"
  ) {
    return true;
  }
  const caps = getMobileRuntimeCaps();
  return caps.runtimeLockdown || caps.saveData || caps.networkClass === "slow";
}

function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function queueRewardImages(scene: Phaser.Scene, onComplete: (failedKeys: string[]) => void): boolean {
  const missing = REWARD_ASSETS.filter((asset) => !textureExists(scene, asset.key));
  if (missing.length === 0) {
    onComplete([]);
    return false;
  }
  const loader = scene.load as LoaderWithState;
  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    safeDelayedCall(scene, 170, () => queueRewardImages(scene, onComplete), {
      canRun: () => scene.scene.isActive(scene.scene.key),
    });
    return false;
  }

  const failedKeys: string[] = [];
  let finished = false;
  const recordError = (file: unknown): void => {
    const key = typeof file === "object" && file && "key" in file ? String((file as { key?: unknown }).key ?? "") : "";
    if (key && !failedKeys.includes(key)) failedKeys.push(key);
  };
  const finish = (): void => {
    if (finished) return;
    finished = true;
    scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, recordError);
    onComplete(failedKeys);
  };

  const webp = supportsWebp();
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, recordError);
  scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
  missing.forEach((asset) => scene.load.image(asset.key, webp ? asset.webp : asset.path));
  scene.load.start();
  return true;
}

export function installReferenceRewardPipeline(
  scene: Phaser.Scene,
  options: { phase: ReferenceRewardPhase; delayMs?: number; includeEvolution?: boolean } = { phase: "lobby" },
): void {
  const emit = (state: string, detail: Record<string, unknown> = {}): void => {
    scene.events.emit("kingdom-seed:reference-reward-state", {
      state,
      phase: options.phase,
      at: Date.now(),
      ...detail,
    });
  };

  if (!referenceRewardPipelineEnabled()) {
    emit("skipped", { reason: "runtime-policy" });
    return;
  }

  if (options.includeEvolution !== false) {
    const categories = options.phase === "mission" ? ["skill", "hero"] as const : ["tower", "enemy", "hero", "skill"] as const;
    installReferenceEvolutionPack(scene, {
      phase: options.phase === "world" ? "world" : options.phase === "lobby" ? "lobby" : "gallery",
      delayMs: Math.max(200, (options.delayMs ?? 360) + 140),
      categories: [...categories],
      battleIdleOnly: false,
    });
  }

  safeDelayedCall(scene, options.delayMs ?? 320, () => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    emit("loading", { total: REWARD_ASSETS.length, webp: supportsWebp() });
    queueRewardImages(scene, (failedKeys) => {
      emit("ready", { total: REWARD_ASSETS.length, failedKeys });
      scene.events.emit("kingdom-seed:reference-reward-ready", {
        phase: options.phase,
        total: REWARD_ASSETS.length,
        failedKeys,
      });
    });
  }, { canRun: () => scene.scene.isActive(scene.scene.key) });
}

export function resolveReferenceRewardKey(scene: Phaser.Scene, kind: ReferenceRewardKind): string | undefined {
  if (referenceRewardPipelineDisabled()) return undefined;
  const asset = KIND_TO_ASSET[kind];
  return asset && textureExists(scene, asset.key) ? asset.key : undefined;
}

function rewardAccent(kind: ReferenceRewardKind): number {
  if (kind === "token" || kind === "chestRoyal") return 0xf7d36b;
  if (kind === "shard") return 0x8fdcff;
  if (kind === "chestMythic") return 0xff6a4d;
  if (kind === "forge") return 0xb88cff;
  if (kind === "equip") return 0x7cc7ff;
  if (kind === "mission") return 0x8cffd2;
  if (kind === "contract") return 0xffa36b;
  return 0xffd66b;
}

function rewardState(kind: ReferenceRewardKind): ReferenceVariantState {
  if (kind === "chestMythic") return "boss";
  if (kind === "chestRoyal" || kind === "forge") return "elite";
  if (kind === "equip") return "selected";
  if (kind === "shard" || kind === "contract") return "upgrade";
  return "normal";
}

export function chestRewardKind(tier: string | undefined): ReferenceRewardKind {
  const upper = String(tier ?? "").toUpperCase();
  if (upper.includes("MYTHIC")) return "chestMythic";
  if (upper.includes("ROYAL")) return "chestRoyal";
  if (upper.includes("IRON")) return "chestIron";
  return "chestWood";
}

export function createReferenceRewardBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: ReferenceRewardKind,
  size = 58,
  options: { pips?: number; selected?: boolean; locked?: boolean; depth?: number; alpha?: number } = {},
): Phaser.GameObjects.Container {
  const key = resolveReferenceRewardKey(scene, kind);
  return createReferenceArtSlot(scene, {
    x,
    y,
    width: size,
    height: size,
    textureKey: key,
    category: "skill",
    state: rewardState(kind),
    accent: rewardAccent(kind),
    pips: options.pips,
    selected: options.selected,
    locked: options.locked,
    depth: options.depth,
    alpha: options.alpha,
    imageScale: key ? 1.18 : 0.9,
    noMotion: referenceRewardEssentialMode(),
  });
}

type ArtifactVisualSpec = {
  reward: ReferenceRewardKind;
  accent: number;
  pips: number;
  texture?: (scene: Phaser.Scene) => string | undefined;
};

function rarityPips(rarity: ArtifactRarity): number {
  if (rarity === "legendary") return 5;
  if (rarity === "epic") return 4;
  if (rarity === "rare") return 3;
  return 2;
}

function artifactSpec(id: ArtifactId): Omit<ArtifactVisualSpec, "accent" | "pips"> {
  const tower = (kind: TowerKind) => (scene: Phaser.Scene) => resolveReferenceEvolutionTowerThumb(scene, kind);
  switch (id) {
    case "oakLongbow":
      return { reward: "shard", texture: tower("archer") };
    case "arcaneCore":
      return { reward: "forge", texture: tower("mage") };
    case "captainsBanner":
      return { reward: "equip", texture: (scene) => resolveReferenceEvolutionTowerThumb(scene, "barracks") ?? resolveReferenceEvolutionHeroThumb(scene, "leon") };
    case "thunderPowder":
      return { reward: "contract", texture: tower("artillery") };
    case "merchantLedger":
      return { reward: "token" };
    case "sunstoneAmulet":
      return { reward: "dust", texture: (scene) => resolveReferenceEvolutionSkillThumb(scene, "fireball") };
    case "hexedHourglass":
      return { reward: "shard", texture: (scene) => resolveReferenceEvolutionSkillThumb(scene, "time") };
    case "royalBulwark":
      return { reward: "equip", texture: (scene) => resolveReferenceEvolutionHeroThumb(scene, "leon") };
    case "shadowDagger":
      return { reward: "contract", texture: (scene) => resolveReferenceEvolutionSkillThumb(scene, "slash") };
    case "dragonScale":
      return { reward: "chestMythic", texture: (scene) => resolveReferenceEvolutionEnemyThumb(scene, "dragon") };
    case "voidPrism":
      return { reward: "forge", texture: (scene) => resolveReferenceEvolutionSkillThumb(scene, "meteor") ?? resolveReferenceEvolutionSkillThumb(scene, "ice") };
    case "kingsCrown":
      return { reward: "chestRoyal", texture: (scene) => resolveReferenceEvolutionHeroThumb(scene, "leon") };
    default:
      return { reward: "shard" };
  }
}

export function createReferenceArtifactIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  artifactId: string,
  size = 58,
  options: { selected?: boolean; locked?: boolean; level?: number; depth?: number } = {},
): Phaser.GameObjects.Container | undefined {
  if (referenceRewardPipelineDisabled()) return undefined;
  const def = ARTIFACTS.find((item) => item.id === artifactId) ?? ARTIFACTS[0];
  const base = artifactSpec(def.id);
  const pips = Math.max(rarityPips(def.rarity), Math.min(5, options.level ?? 0));
  const textureKey = base.texture?.(scene) ?? resolveReferenceRewardKey(scene, base.reward);
  const state: ReferenceVariantState = options.locked ? "locked" : options.selected ? "selected" : def.rarity === "legendary" ? "boss" : def.rarity === "epic" ? "elite" : "upgrade";
  const root = createReferenceArtSlot(scene, {
    x,
    y,
    width: size,
    height: size,
    textureKey,
    category: textureKey?.includes("enemy") ? "enemy" : textureKey?.includes("hero") ? "hero" : textureKey?.includes("tower") ? "tower" : "skill",
    state,
    accent: artifactRarityColor(def.rarity),
    pips,
    selected: options.selected,
    locked: options.locked,
    depth: options.depth,
    imageScale: textureKey ? 1.04 : 0.92,
    noMotion: referenceRewardEssentialMode(),
  });

  // No-text rarity rivet; actual names/levels remain rendered as live text outside the image.
  root.add(scene.add.circle(size * 0.34, -size * 0.34, Math.max(4, size * 0.11), artifactRarityColor(def.rarity), 1).setStrokeStyle(1, 0xffffff, 0.34));
  return root;
}

export function createRewardContinuityRail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kinds: ReferenceRewardKind[],
  size = 38,
  gap = 42,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  kinds.forEach((kind, index) => {
    root.add(createReferenceRewardBadge(scene, index * gap, 0, kind, size, { pips: index + 1 }));
  });
  return root;
}

export function referenceRewardDebugSummary(scene: Phaser.Scene): string {
  const loaded = REWARD_ASSETS.filter((asset) => textureExists(scene, asset.key)).length;
  return `REF24:${loaded}/${REWARD_ASSETS.length}${referenceRewardEssentialMode() ? ":safe" : ":full"}`;
}
