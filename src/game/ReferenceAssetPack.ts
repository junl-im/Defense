import Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { safeDelayedCall } from "./SceneSafety";
import type { EnemyKind, TowerKind } from "./types";

/**
 * v2.36.19 User Reference Asset Pack
 *
 * The user-provided concept board is a full UI mockup collage, not a runtime atlas.
 * These entries point only to manually cropped, no-text object images:
 * towers, monsters, heroes and spell icons.  They are intentionally small and
 * must be loaded only after the game is already playable.
 */
export type ReferenceAssetCategory = "tower" | "enemy" | "hero" | "skill";

type ReferenceAsset = {
  key: string;
  path: string;
  webp: string;
  category: ReferenceAssetCategory;
};

type BattleSceneRuntime = Phaser.Scene & {
  waveRunning?: boolean;
  ended?: boolean;
  pendingWaveSpawns?: number;
  enemies?: unknown[];
};

const QUERY = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

const BASE = "assets/reference/v2_36_19/no_text";

export const REFERENCE_ASSET_KEYS = {
  tower: {
    archer: "ks23619-tower-archer",
    mage: "ks23619-tower-mage",
    artillery: "ks23619-tower-artillery",
    frost: "ks23619-tower-frost",
    holy: "ks23619-tower-holy",
    poison: "ks23619-tower-poison",
  },
  enemy: {
    goblin: "ks23619-enemy-goblin",
    orc: "ks23619-enemy-orc",
    wolf: "ks23619-enemy-wolf",
    bomber: "ks23619-enemy-bomber",
    skeleton: "ks23619-enemy-skeleton",
    mage: "ks23619-enemy-mage",
    demon: "ks23619-enemy-demon",
    dragon: "ks23619-enemy-dragon",
  },
  hero: {
    warrior: "ks23619-hero-warrior",
    princessArcher: "ks23619-hero-princess-archer",
    iceMage: "ks23619-hero-ice-mage",
    paladin: "ks23619-hero-paladin",
    druid: "ks23619-hero-druid",
  },
  skill: {
    fireball: "ks23619-skill-fireball",
    icebolt: "ks23619-skill-icebolt",
    lightning: "ks23619-skill-lightning",
    heal: "ks23619-skill-heal",
    slash: "ks23619-skill-slash",
    timeStop: "ks23619-skill-time-stop",
  },
} as const;

const REFERENCE_ASSETS: ReferenceAsset[] = [
  { key: REFERENCE_ASSET_KEYS.tower.archer, category: "tower", path: `${BASE}/tower_archer_no_text.png`, webp: `${BASE}/tower_archer_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.tower.mage, category: "tower", path: `${BASE}/tower_mage_no_text.png`, webp: `${BASE}/tower_mage_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.tower.artillery, category: "tower", path: `${BASE}/tower_artillery_no_text.png`, webp: `${BASE}/tower_artillery_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.tower.frost, category: "tower", path: `${BASE}/tower_frost_no_text.png`, webp: `${BASE}/tower_frost_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.tower.holy, category: "tower", path: `${BASE}/tower_holy_no_text.png`, webp: `${BASE}/tower_holy_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.tower.poison, category: "tower", path: `${BASE}/tower_poison_no_text.png`, webp: `${BASE}/tower_poison_no_text.webp` },

  { key: REFERENCE_ASSET_KEYS.enemy.goblin, category: "enemy", path: `${BASE}/enemy_goblin_no_text.png`, webp: `${BASE}/enemy_goblin_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.orc, category: "enemy", path: `${BASE}/enemy_orc_no_text.png`, webp: `${BASE}/enemy_orc_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.wolf, category: "enemy", path: `${BASE}/enemy_wolf_no_text.png`, webp: `${BASE}/enemy_wolf_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.bomber, category: "enemy", path: `${BASE}/enemy_goblin_bomber_no_text.png`, webp: `${BASE}/enemy_goblin_bomber_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.skeleton, category: "enemy", path: `${BASE}/enemy_skeleton_no_text.png`, webp: `${BASE}/enemy_skeleton_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.mage, category: "enemy", path: `${BASE}/enemy_mage_no_text.png`, webp: `${BASE}/enemy_mage_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.demon, category: "enemy", path: `${BASE}/enemy_demon_no_text.png`, webp: `${BASE}/enemy_demon_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.enemy.dragon, category: "enemy", path: `${BASE}/enemy_dragon_no_text.png`, webp: `${BASE}/enemy_dragon_no_text.webp` },

  { key: REFERENCE_ASSET_KEYS.hero.warrior, category: "hero", path: `${BASE}/hero_warrior_no_text.png`, webp: `${BASE}/hero_warrior_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.hero.princessArcher, category: "hero", path: `${BASE}/hero_princess_archer_no_text.png`, webp: `${BASE}/hero_princess_archer_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.hero.iceMage, category: "hero", path: `${BASE}/hero_ice_mage_no_text.png`, webp: `${BASE}/hero_ice_mage_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.hero.paladin, category: "hero", path: `${BASE}/hero_paladin_no_text.png`, webp: `${BASE}/hero_paladin_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.hero.druid, category: "hero", path: `${BASE}/hero_druid_no_text.png`, webp: `${BASE}/hero_druid_no_text.webp` },

  { key: REFERENCE_ASSET_KEYS.skill.fireball, category: "skill", path: `${BASE}/skill_fireball_no_text.png`, webp: `${BASE}/skill_fireball_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.skill.icebolt, category: "skill", path: `${BASE}/skill_icebolt_no_text.png`, webp: `${BASE}/skill_icebolt_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.skill.lightning, category: "skill", path: `${BASE}/skill_lightning_no_text.png`, webp: `${BASE}/skill_lightning_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.skill.heal, category: "skill", path: `${BASE}/skill_heal_no_text.png`, webp: `${BASE}/skill_heal_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.skill.slash, category: "skill", path: `${BASE}/skill_slash_no_text.png`, webp: `${BASE}/skill_slash_no_text.webp` },
  { key: REFERENCE_ASSET_KEYS.skill.timeStop, category: "skill", path: `${BASE}/skill_time_stop_no_text.png`, webp: `${BASE}/skill_time_stop_no_text.webp` },
];

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function supportsWebp(): boolean {
  if (QUERY.has("pngart") || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function forceReferenceArt(): boolean {
  return (
    QUERY.has("refart") ||
    QUERY.has("referenceart") ||
    QUERY.has("userassets") ||
    QUERY.has("conceptassets") ||
    QUERY.has("assetintake") ||
    readStorage("ksReferenceArt") === "1"
  );
}

export function disableReferenceAssetPack(): boolean {
  return (
    QUERY.has("norefart") ||
    QUERY.has("noreferenceart") ||
    QUERY.has("legacyreferenceart") ||
    QUERY.has("legacyactors") ||
    QUERY.has("oldactors") ||
    QUERY.has("textsheet") ||
    QUERY.has("toydebug") ||
    readStorage("ksNoReferenceArt") === "1"
  );
}

export function shouldUseReferenceAssetPack(): boolean {
  if (disableReferenceAssetPack()) return false;
  if (forceReferenceArt()) return true;
  const caps = getMobileRuntimeCaps();
  if (caps.runtimeLockdown || caps.label === "LOCKDOWN_MOBILE_ENGINE") return false;
  if (caps.saveData || caps.networkClass !== "normal") return false;
  return true;
}

function battleActionQuiet(scene: Phaser.Scene): boolean {
  const runtime = scene as BattleSceneRuntime;
  const activeEnemies = Array.isArray(runtime.enemies) ? runtime.enemies.length : 0;
  return (
    scene.scene.isActive(scene.scene.key) &&
    runtime.ended !== true &&
    runtime.waveRunning !== true &&
    (runtime.pendingWaveSpawns ?? 0) <= 0 &&
    activeEnemies === 0
  );
}

function queueImages(
  scene: Phaser.Scene,
  assets: ReferenceAsset[],
  onComplete: (failedKeys: string[]) => void,
): boolean {
  const webp = supportsWebp();
  const missing = assets.filter((asset) => !textureExists(scene, asset.key));
  if (missing.length === 0) {
    onComplete([]);
    return false;
  }

  const loader = scene.load as Phaser.Loader.LoaderPlugin & { isLoading?: () => boolean };
  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    safeDelayedCall(scene, 220, () => queueImages(scene, assets, onComplete), {
      canRun: () => scene.scene.isActive(scene.scene.key),
    });
    return false;
  }

  let finished = false;
  const failedKeys: string[] = [];
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

  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, recordError);
  scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
  missing.forEach((asset) => scene.load.image(asset.key, webp ? asset.webp : asset.path));
  scene.load.start();
  return true;
}

export function installReferenceAssetPack(
  scene: Phaser.Scene,
  options: {
    phase: "lobby" | "world" | "battle" | "gallery";
    delayMs?: number;
    battleIdleOnly?: boolean;
    categories?: ReferenceAssetCategory[];
  },
): void {
  const emit = (state: string, detail: Record<string, unknown> = {}): void => {
    scene.events.emit("kingdom-seed:reference-asset-pack-state", {
      state,
      phase: options.phase,
      at: Date.now(),
      ...detail,
    });
  };

  if (!shouldUseReferenceAssetPack()) {
    emit("skipped", { reason: "runtime-policy" });
    return;
  }

  const categories = new Set(options.categories ?? ["tower", "enemy", "hero", "skill"]);
  const assets = REFERENCE_ASSETS.filter((asset) => categories.has(asset.category));
  let started = false;
  let retryArmed = false;
  const start = (attempt = 0): void => {
    if (started || !scene.scene.isActive(scene.scene.key)) return;
    if (options.battleIdleOnly && !battleActionQuiet(scene)) {
      emit("deferred-during-wave", { attempt });
      if (!retryArmed) {
        retryArmed = true;
        scene.events.once("kingdom-seed:battle-idle-safe", () => {
          retryArmed = false;
          start(attempt + 1);
        });
      }
      safeDelayedCall(scene, 1350, () => start(attempt + 1), {
        canRun: () => scene.scene.isActive(scene.scene.key),
      });
      return;
    }

    started = true;
    emit("loading", { total: assets.length, webp: supportsWebp() });
    queueImages(scene, assets, (failedKeys) => {
      emit("ready", { total: assets.length, failedKeys });
      scene.events.emit("kingdom-seed:reference-asset-pack-ready", {
        phase: options.phase,
        total: assets.length,
        failedKeys,
      });
    });
  };

  safeDelayedCall(scene, options.delayMs ?? 950, () => start(), {
    canRun: () => scene.scene.isActive(scene.scene.key),
  });
}

function firstExisting(scene: Phaser.Scene, keys: string[]): string | undefined {
  return keys.find((key) => textureExists(scene, key));
}

export function resolveReferenceTowerTextureKey(
  scene: Phaser.Scene,
  kind: TowerKind,
  mastery?: string,
): string | undefined {
  if (disableReferenceAssetPack()) return undefined;
  const keys = REFERENCE_ASSET_KEYS.tower;
  if (kind === "archer") return firstExisting(scene, [keys.archer, keys.poison]);
  if (kind === "artillery") return firstExisting(scene, [keys.artillery]);
  if (kind === "barracks") return firstExisting(scene, [keys.holy, keys.archer]);
  if (kind === "mage") {
    const lower = String(mastery ?? "").toLowerCase();
    if (lower.includes("hex") || lower.includes("curse")) return firstExisting(scene, [keys.poison, keys.mage]);
    if (lower.includes("frost") || lower.includes("ice")) return firstExisting(scene, [keys.frost, keys.mage]);
    return firstExisting(scene, [keys.mage, keys.frost]);
  }
  return undefined;
}

const ENEMY_REFERENCE_FAMILY: Partial<Record<EnemyKind | string, string>> = {
  goblin: REFERENCE_ASSET_KEYS.enemy.goblin,
  raider: REFERENCE_ASSET_KEYS.enemy.bomber,
  spider: REFERENCE_ASSET_KEYS.enemy.goblin,
  brute: REFERENCE_ASSET_KEYS.enemy.orc,
  orc: REFERENCE_ASSET_KEYS.enemy.orc,
  shield: REFERENCE_ASSET_KEYS.enemy.orc,
  shaman: REFERENCE_ASSET_KEYS.enemy.mage,
  ogre: REFERENCE_ASSET_KEYS.enemy.orc,
  troll: REFERENCE_ASSET_KEYS.enemy.orc,
  golem: REFERENCE_ASSET_KEYS.enemy.orc,
  abomination: REFERENCE_ASSET_KEYS.enemy.demon,
  titan: REFERENCE_ASSET_KEYS.enemy.demon,
  wolf: REFERENCE_ASSET_KEYS.enemy.wolf,
  hellhound: REFERENCE_ASSET_KEYS.enemy.wolf,
  nightmare: REFERENCE_ASSET_KEYS.enemy.wolf,
  bat: REFERENCE_ASSET_KEYS.enemy.demon,
  wasp: REFERENCE_ASSET_KEYS.enemy.bomber,
  gargoyle: REFERENCE_ASSET_KEYS.enemy.demon,
  wyvern: REFERENCE_ASSET_KEYS.enemy.dragon,
  phoenix: REFERENCE_ASSET_KEYS.enemy.dragon,
  dragon: REFERENCE_ASSET_KEYS.enemy.dragon,
  skeleton: REFERENCE_ASSET_KEYS.enemy.skeleton,
  zombie: REFERENCE_ASSET_KEYS.enemy.skeleton,
  specter: REFERENCE_ASSET_KEYS.enemy.skeleton,
  cultist: REFERENCE_ASSET_KEYS.enemy.mage,
  assassin: REFERENCE_ASSET_KEYS.enemy.mage,
  warlock: REFERENCE_ASSET_KEYS.enemy.mage,
  necromancer: REFERENCE_ASSET_KEYS.enemy.mage,
  voidling: REFERENCE_ASSET_KEYS.enemy.demon,
  voidPriest: REFERENCE_ASSET_KEYS.enemy.mage,
  demonlord: REFERENCE_ASSET_KEYS.enemy.demon,
  fireImp: REFERENCE_ASSET_KEYS.enemy.demon,
  obsidianKnight: REFERENCE_ASSET_KEYS.enemy.skeleton,
};

export function resolveReferenceEnemyTextureKey(
  scene: Phaser.Scene,
  kind: EnemyKind | string,
): string | undefined {
  if (disableReferenceAssetPack()) return undefined;
  const key = ENEMY_REFERENCE_FAMILY[kind] ?? REFERENCE_ASSET_KEYS.enemy.goblin;
  return textureExists(scene, key) ? key : undefined;
}

export function resolveReferenceHeroTextureKey(
  scene: Phaser.Scene,
  selectedHeroId?: string,
): string | undefined {
  if (disableReferenceAssetPack()) return undefined;
  const keys = REFERENCE_ASSET_KEYS.hero;
  const byHero =
    selectedHeroId === "aria"
      ? keys.princessArcher
      : selectedHeroId === "nox"
        ? keys.iceMage
        : keys.warrior;
  return firstExisting(scene, [byHero, keys.warrior, keys.paladin, keys.druid]);
}

export function referencePackDebugSummary(scene: Phaser.Scene): string {
  const loaded = REFERENCE_ASSETS.filter((asset) => textureExists(scene, asset.key)).length;
  return `REF:${loaded}/${REFERENCE_ASSETS.length}`;
}
