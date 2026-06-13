import Phaser from "phaser";
import type { EnemyKind, TowerKind } from "./types";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { safeDelayedCall } from "./SceneSafety";
import { disableReferenceAssetPack } from "./ReferenceAssetPack";

/**
 * v2.36.20 Reference Asset Evolution Pipeline
 *
 * The v2.36.19 pack contains user-provided, manually cropped no-text actor art.
 * This module adds tiny no-text thumbnail derivatives for UI-heavy surfaces such as
 * codex cards, hero selection, tower build menus and spell buttons.  Full actor
 * art still remains delayed/idle-loaded; these thumbnails are the light preview tier.
 */
export type ReferenceEvolutionCategory = "tower" | "enemy" | "hero" | "skill";

type EvolutionAsset = {
  key: string;
  path: string;
  webp: string;
  category: ReferenceEvolutionCategory;
};

type BattleQuietScene = Phaser.Scene & {
  waveRunning?: boolean;
  ended?: boolean;
  pendingWaveSpawns?: number;
  enemies?: unknown[];
};

const QUERY = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

const BASE = "assets/reference/v2_36_20/thumbs";

export const REFERENCE_EVOLUTION_KEYS = {
  tower: {
    archer: "ks23620-thumb-tower-archer",
    mage: "ks23620-thumb-tower-mage",
    artillery: "ks23620-thumb-tower-artillery",
    frost: "ks23620-thumb-tower-frost",
    holy: "ks23620-thumb-tower-holy",
    poison: "ks23620-thumb-tower-poison",
  },
  enemy: {
    goblin: "ks23620-thumb-enemy-goblin",
    orc: "ks23620-thumb-enemy-orc",
    wolf: "ks23620-thumb-enemy-wolf",
    bomber: "ks23620-thumb-enemy-goblin-bomber",
    skeleton: "ks23620-thumb-enemy-skeleton",
    mage: "ks23620-thumb-enemy-mage",
    demon: "ks23620-thumb-enemy-demon",
    dragon: "ks23620-thumb-enemy-dragon",
  },
  hero: {
    warrior: "ks23620-thumb-hero-warrior",
    princessArcher: "ks23620-thumb-hero-princess-archer",
    iceMage: "ks23620-thumb-hero-ice-mage",
    paladin: "ks23620-thumb-hero-paladin",
    druid: "ks23620-thumb-hero-druid",
  },
  skill: {
    fireball: "ks23620-thumb-skill-fireball",
    icebolt: "ks23620-thumb-skill-icebolt",
    lightning: "ks23620-thumb-skill-lightning",
    heal: "ks23620-thumb-skill-heal",
    slash: "ks23620-thumb-skill-slash",
    timeStop: "ks23620-thumb-skill-time-stop",
  },
} as const;

const EVOLUTION_ASSETS: EvolutionAsset[] = [
  { key: REFERENCE_EVOLUTION_KEYS.tower.archer, category: "tower", path: `${BASE}/tower_archer_thumb.png`, webp: `${BASE}/tower_archer_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.tower.mage, category: "tower", path: `${BASE}/tower_mage_thumb.png`, webp: `${BASE}/tower_mage_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.tower.artillery, category: "tower", path: `${BASE}/tower_artillery_thumb.png`, webp: `${BASE}/tower_artillery_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.tower.frost, category: "tower", path: `${BASE}/tower_frost_thumb.png`, webp: `${BASE}/tower_frost_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.tower.holy, category: "tower", path: `${BASE}/tower_holy_thumb.png`, webp: `${BASE}/tower_holy_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.tower.poison, category: "tower", path: `${BASE}/tower_poison_thumb.png`, webp: `${BASE}/tower_poison_thumb.webp` },

  { key: REFERENCE_EVOLUTION_KEYS.enemy.goblin, category: "enemy", path: `${BASE}/enemy_goblin_thumb.png`, webp: `${BASE}/enemy_goblin_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.orc, category: "enemy", path: `${BASE}/enemy_orc_thumb.png`, webp: `${BASE}/enemy_orc_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.wolf, category: "enemy", path: `${BASE}/enemy_wolf_thumb.png`, webp: `${BASE}/enemy_wolf_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.bomber, category: "enemy", path: `${BASE}/enemy_goblin_bomber_thumb.png`, webp: `${BASE}/enemy_goblin_bomber_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.skeleton, category: "enemy", path: `${BASE}/enemy_skeleton_thumb.png`, webp: `${BASE}/enemy_skeleton_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.mage, category: "enemy", path: `${BASE}/enemy_mage_thumb.png`, webp: `${BASE}/enemy_mage_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.demon, category: "enemy", path: `${BASE}/enemy_demon_thumb.png`, webp: `${BASE}/enemy_demon_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.enemy.dragon, category: "enemy", path: `${BASE}/enemy_dragon_thumb.png`, webp: `${BASE}/enemy_dragon_thumb.webp` },

  { key: REFERENCE_EVOLUTION_KEYS.hero.warrior, category: "hero", path: `${BASE}/hero_warrior_thumb.png`, webp: `${BASE}/hero_warrior_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.hero.princessArcher, category: "hero", path: `${BASE}/hero_princess_archer_thumb.png`, webp: `${BASE}/hero_princess_archer_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.hero.iceMage, category: "hero", path: `${BASE}/hero_ice_mage_thumb.png`, webp: `${BASE}/hero_ice_mage_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.hero.paladin, category: "hero", path: `${BASE}/hero_paladin_thumb.png`, webp: `${BASE}/hero_paladin_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.hero.druid, category: "hero", path: `${BASE}/hero_druid_thumb.png`, webp: `${BASE}/hero_druid_thumb.webp` },

  { key: REFERENCE_EVOLUTION_KEYS.skill.fireball, category: "skill", path: `${BASE}/skill_fireball_thumb.png`, webp: `${BASE}/skill_fireball_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.skill.icebolt, category: "skill", path: `${BASE}/skill_icebolt_thumb.png`, webp: `${BASE}/skill_icebolt_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.skill.lightning, category: "skill", path: `${BASE}/skill_lightning_thumb.png`, webp: `${BASE}/skill_lightning_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.skill.heal, category: "skill", path: `${BASE}/skill_heal_thumb.png`, webp: `${BASE}/skill_heal_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.skill.slash, category: "skill", path: `${BASE}/skill_slash_thumb.png`, webp: `${BASE}/skill_slash_thumb.webp` },
  { key: REFERENCE_EVOLUTION_KEYS.skill.timeStop, category: "skill", path: `${BASE}/skill_time_stop_thumb.png`, webp: `${BASE}/skill_time_stop_thumb.webp` },
];

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function firstExisting(scene: Phaser.Scene, keys: string[]): string | undefined {
  return keys.find((key) => textureExists(scene, key));
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

function forceEvolution(): boolean {
  return (
    QUERY.has("refevolution") ||
    QUERY.has("evolvedref") ||
    QUERY.has("assetpipeline") ||
    QUERY.has("referencepipeline") ||
    QUERY.has("refthumbs") ||
    readStorage("ksReferenceEvolution") === "1"
  );
}

export function disableReferenceEvolution(): boolean {
  return (
    disableReferenceAssetPack() ||
    QUERY.has("norefevolution") ||
    QUERY.has("noevolvedref") ||
    QUERY.has("norefthumbs") ||
    QUERY.has("legacyrefpipeline") ||
    readStorage("ksNoReferenceEvolution") === "1"
  );
}

export function shouldUseReferenceEvolution(): boolean {
  if (disableReferenceEvolution()) return false;
  if (forceEvolution()) return true;
  const caps = getMobileRuntimeCaps();
  if (caps.runtimeLockdown || caps.label === "LOCKDOWN_MOBILE_ENGINE") return false;
  if (caps.saveData || caps.networkClass === "slow") return false;
  return true;
}

function battleQuiet(scene: Phaser.Scene): boolean {
  const runtime = scene as BattleQuietScene;
  const activeEnemies = Array.isArray(runtime.enemies) ? runtime.enemies.length : 0;
  return (
    scene.scene.isActive(scene.scene.key) &&
    runtime.ended !== true &&
    runtime.waveRunning !== true &&
    (runtime.pendingWaveSpawns ?? 0) <= 0 &&
    activeEnemies === 0
  );
}

function queueEvolutionImages(
  scene: Phaser.Scene,
  assets: EvolutionAsset[],
  onComplete: (failedKeys: string[]) => void,
): boolean {
  const missing = assets.filter((asset) => !textureExists(scene, asset.key));
  if (missing.length === 0) {
    onComplete([]);
    return false;
  }

  const loader = scene.load as Phaser.Loader.LoaderPlugin & { isLoading?: () => boolean };
  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    safeDelayedCall(scene, 180, () => queueEvolutionImages(scene, assets, onComplete), {
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

  const webp = supportsWebp();
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, recordError);
  scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
  missing.forEach((asset) => scene.load.image(asset.key, webp ? asset.webp : asset.path));
  scene.load.start();
  return true;
}

export function installReferenceEvolutionPack(
  scene: Phaser.Scene,
  options: {
    phase: "lobby" | "world" | "battle" | "gallery" | "codex";
    delayMs?: number;
    battleIdleOnly?: boolean;
    categories?: ReferenceEvolutionCategory[];
  },
): void {
  const emit = (state: string, detail: Record<string, unknown> = {}): void => {
    scene.events.emit("kingdom-seed:reference-evolution-state", {
      state,
      phase: options.phase,
      at: Date.now(),
      ...detail,
    });
  };

  if (!shouldUseReferenceEvolution()) {
    emit("skipped", { reason: "runtime-policy" });
    return;
  }

  const categories = new Set(options.categories ?? ["tower", "enemy", "hero", "skill"]);
  const assets = EVOLUTION_ASSETS.filter((asset) => categories.has(asset.category));
  let started = false;
  let retryArmed = false;

  const start = (attempt = 0): void => {
    if (started || !scene.scene.isActive(scene.scene.key)) return;
    if (options.battleIdleOnly && !battleQuiet(scene)) {
      emit("deferred-during-wave", { attempt });
      if (!retryArmed) {
        retryArmed = true;
        scene.events.once("kingdom-seed:battle-idle-safe", () => {
          retryArmed = false;
          start(attempt + 1);
        });
      }
      safeDelayedCall(scene, 1050, () => start(attempt + 1), {
        canRun: () => scene.scene.isActive(scene.scene.key),
      });
      return;
    }

    started = true;
    emit("loading", { total: assets.length, webp: supportsWebp() });
    queueEvolutionImages(scene, assets, (failedKeys) => {
      emit("ready", { total: assets.length, failedKeys });
      scene.events.emit("kingdom-seed:reference-evolution-ready", {
        phase: options.phase,
        total: assets.length,
        failedKeys,
      });
    });
  };

  safeDelayedCall(scene, options.delayMs ?? 520, () => start(), {
    canRun: () => scene.scene.isActive(scene.scene.key),
  });
}

export function resolveReferenceEvolutionTowerThumb(
  scene: Phaser.Scene,
  kind: TowerKind,
  mastery?: string,
): string | undefined {
  if (disableReferenceEvolution()) return undefined;
  const keys = REFERENCE_EVOLUTION_KEYS.tower;
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

const ENEMY_EVOLUTION_FAMILY: Partial<Record<EnemyKind | string, string>> = {
  goblin: REFERENCE_EVOLUTION_KEYS.enemy.goblin,
  raider: REFERENCE_EVOLUTION_KEYS.enemy.bomber,
  spider: REFERENCE_EVOLUTION_KEYS.enemy.goblin,
  brute: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  orc: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  shield: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  shaman: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  ogre: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  troll: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  golem: REFERENCE_EVOLUTION_KEYS.enemy.orc,
  abomination: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  titan: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  wolf: REFERENCE_EVOLUTION_KEYS.enemy.wolf,
  hellhound: REFERENCE_EVOLUTION_KEYS.enemy.wolf,
  nightmare: REFERENCE_EVOLUTION_KEYS.enemy.wolf,
  bat: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  wasp: REFERENCE_EVOLUTION_KEYS.enemy.bomber,
  gargoyle: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  wyvern: REFERENCE_EVOLUTION_KEYS.enemy.dragon,
  phoenix: REFERENCE_EVOLUTION_KEYS.enemy.dragon,
  dragon: REFERENCE_EVOLUTION_KEYS.enemy.dragon,
  skeleton: REFERENCE_EVOLUTION_KEYS.enemy.skeleton,
  zombie: REFERENCE_EVOLUTION_KEYS.enemy.skeleton,
  specter: REFERENCE_EVOLUTION_KEYS.enemy.skeleton,
  cultist: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  assassin: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  warlock: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  necromancer: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  voidling: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  voidPriest: REFERENCE_EVOLUTION_KEYS.enemy.mage,
  demonlord: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  fireImp: REFERENCE_EVOLUTION_KEYS.enemy.demon,
  obsidianKnight: REFERENCE_EVOLUTION_KEYS.enemy.skeleton,
};

export function resolveReferenceEvolutionEnemyThumb(
  scene: Phaser.Scene,
  kind: EnemyKind | string,
): string | undefined {
  if (disableReferenceEvolution()) return undefined;
  const key = ENEMY_EVOLUTION_FAMILY[kind] ?? REFERENCE_EVOLUTION_KEYS.enemy.goblin;
  return textureExists(scene, key) ? key : undefined;
}

export function resolveReferenceEvolutionHeroThumb(
  scene: Phaser.Scene,
  selectedHeroId?: string,
): string | undefined {
  if (disableReferenceEvolution()) return undefined;
  const keys = REFERENCE_EVOLUTION_KEYS.hero;
  const byHero =
    selectedHeroId === "aria"
      ? keys.princessArcher
      : selectedHeroId === "nox"
        ? keys.iceMage
        : selectedHeroId === "leon"
          ? keys.warrior
          : keys.paladin;
  return firstExisting(scene, [byHero, keys.warrior, keys.paladin, keys.druid]);
}

export function resolveReferenceEvolutionSkillThumb(
  scene: Phaser.Scene,
  skill: "meteor" | "mercenary" | "hero" | "fireball" | "ice" | "heal" | "slash" | "time",
): string | undefined {
  if (disableReferenceEvolution()) return undefined;
  const keys = REFERENCE_EVOLUTION_KEYS.skill;
  const map: Record<typeof skill, string[]> = {
    meteor: [keys.fireball, keys.lightning],
    mercenary: [keys.heal, keys.slash],
    hero: [keys.slash, keys.lightning],
    fireball: [keys.fireball],
    ice: [keys.icebolt],
    heal: [keys.heal],
    slash: [keys.slash],
    time: [keys.timeStop],
  };
  return firstExisting(scene, map[skill]);
}

export function referenceEvolutionDebugSummary(scene: Phaser.Scene): string {
  const loaded = EVOLUTION_ASSETS.filter((asset) => textureExists(scene, asset.key)).length;
  return `REF20:${loaded}/${EVOLUTION_ASSETS.length}`;
}
