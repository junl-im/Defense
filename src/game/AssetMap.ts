import Phaser from "phaser";
import type { EnemyKind, TowerKind } from "./types";

/**
 * v2.35.8 Casual Art Asset Map
 *
 * 목적:
 * - 코드 곳곳에 흩어진 임시 에셋 키를 중앙에서 관리한다.
 * - DALL-E나 외부 아트 파이프라인으로 교체할 때 파일 경로만 맞추면 된다.
 * - 기본 부팅에는 얹지 않고, 전투 씬 진입 후 조용히 로드해서 첫 시작 속도를 지킨다.
 */
export const CASUAL_ART_KEYS = {
  battlefieldOcean: "art-v30-ocean-masterpiece",
  fishSilhouetteSheet: "art-v30-fish-silhouette-sheet",
  fishSlime: "art-v30-fish-slime",
  towerFishingRod: "ui-kit-fishing-rod",
  towerBase: "sprite-tower-base-cute",
  heroSeedKnight: "ui-kit-hero-seed-knight",
  projectileSeed: "ui-kit-projectile-seed",
} as const;

export type CasualArtAssetKind = "image" | "spritesheet";

export type CasualArtAsset = {
  key: string;
  path: string;
  kind: CasualArtAssetKind;
  frameWidth?: number;
  frameHeight?: number;
  /**
   * true인 에셋도 BootScene에서 강제 로드하지 않는다.
   * GameScene/WorldMapScene에서 요청될 때만 로드한다.
   */
  combatCore?: boolean;
};

export const CASUAL_BATTLE_ART_ASSETS: CasualArtAsset[] = [
  {
    key: CASUAL_ART_KEYS.battlefieldOcean,
    path: "assets/art/v30_ocean_masterpiece.png",
    kind: "image",
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.fishSilhouetteSheet,
    path: "assets/art/v30_fish_silhouette_sheet.png",
    kind: "spritesheet",
    frameWidth: 64,
    frameHeight: 64,
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.fishSlime,
    path: "assets/art/v30_fish_slime_icon.png",
    kind: "image",
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.towerFishingRod,
    path: "assets/ui-kit/icons/fishing_rod.png",
    kind: "image",
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.towerBase,
    path: "assets/sprites/tower_base.png",
    kind: "image",
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.heroSeedKnight,
    path: "assets/ui-kit/icons/hero_seed_knight.png",
    kind: "image",
    combatCore: true,
  },
  {
    key: CASUAL_ART_KEYS.projectileSeed,
    path: "assets/ui-kit/icons/projectile_seed.png",
    kind: "image",
    combatCore: true,
  },
];

const TOWER_FALLBACK_BY_KIND: Record<TowerKind, string[]> = {
  archer: [CASUAL_ART_KEYS.towerFishingRod, CASUAL_ART_KEYS.towerBase],
  mage: [CASUAL_ART_KEYS.towerBase, CASUAL_ART_KEYS.towerFishingRod],
  barracks: [CASUAL_ART_KEYS.towerBase],
  artillery: [CASUAL_ART_KEYS.towerBase],
};

const ENEMY_FAMILY_BY_KIND: Partial<Record<EnemyKind | string, string>> = {
  goblin: "goblin",
  raider: "goblin",
  spider: "goblin",
  brute: "orc",
  orc: "orc",
  shield: "orc",
  shaman: "orc",
  ogre: "orc",
  troll: "orc",
  golem: "boar",
  abomination: "boar",
  titan: "boar",
  wolf: "wolf",
  hellhound: "wolf",
  nightmare: "wolf",
  bat: "bat",
  wasp: "bat",
  gargoyle: "bat",
  wyvern: "dragon",
  phoenix: "dragon",
  dragon: "dragon",
  skeleton: "skeleton",
  zombie: "skeleton",
  specter: "skeleton",
  cultist: "rogue",
  assassin: "rogue",
  warlock: "rogue",
  necromancer: "rogue",
  voidling: "rogue",
  voidPriest: "rogue",
  demonlord: "dragon",
  fireImp: "dragon",
  obsidianKnight: "skeleton",
};

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function firstExistingTexture(
  scene: Phaser.Scene,
  keys: Array<string | undefined>,
): string | undefined {
  return keys.find((key) => key && textureExists(scene, key));
}

export function preferCasualArt(): boolean {
  const qs = query();
  // 기본값은 안정적인 기존 에셋 우선이다. 검수/디자인 모드에서만 새 캐주얼 맵을 전면에 세운다.
  return (
    qs.has("casualart") ||
    qs.has("galleryart") ||
    qs.has("fullart") ||
    qs.has("ultraart")
  );
}

export function queueCasualBattleArt(scene: Phaser.Scene): boolean {
  const loader = scene.load as Phaser.Loader.LoaderPlugin & {
    isLoading?: () => boolean;
  };

  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => queueCasualBattleArt(scene));
    return false;
  }

  let queued = false;
  for (const asset of CASUAL_BATTLE_ART_ASSETS) {
    if (textureExists(scene, asset.key)) continue;
    if (asset.kind === "spritesheet") {
      scene.load.spritesheet(asset.key, asset.path, {
        frameWidth: asset.frameWidth ?? 64,
        frameHeight: asset.frameHeight ?? 64,
      });
    } else {
      scene.load.image(asset.key, asset.path);
    }
    queued = true;
  }

  if (queued) scene.load.start();
  return queued;
}

export function resolveBattlefieldBackgroundKey(
  scene: Phaser.Scene,
  stageId: string,
): string | undefined {
  const stageKey = `battle-bg-${stageId}`;
  if (preferCasualArt()) {
    return firstExistingTexture(scene, [CASUAL_ART_KEYS.battlefieldOcean, stageKey]);
  }
  return firstExistingTexture(scene, [stageKey, CASUAL_ART_KEYS.battlefieldOcean]);
}

export function resolveTowerTextureKey(
  scene: Phaser.Scene,
  kind: TowerKind,
  level: number,
  mastery?: string,
): string | undefined {
  const masteryKey = mastery ? `tower-${kind}-${mastery}` : undefined;
  const levelKey = `tower-${kind}-lv${level}`;
  const baseKey = `tower-${kind}`;
  return firstExistingTexture(scene, [
    masteryKey,
    levelKey,
    baseKey,
    ...TOWER_FALLBACK_BY_KIND[kind],
  ]);
}

export function resolveEnemyTextureKey(
  scene: Phaser.Scene,
  kind: EnemyKind | string,
): string | undefined {
  const family = ENEMY_FAMILY_BY_KIND[kind];
  const familyArtKey = family ? `v1-enemy-art-${family}` : undefined;
  // 주의: enemy-${kind}는 대부분 spritesheet이므로 여기서 반환하지 않는다.
  // Enemy.ts의 기존 애니메이션 fallback이 spritesheet를 처리한다.
  return firstExistingTexture(scene, [familyArtKey, CASUAL_ART_KEYS.fishSlime]);
}

export function resolveHeroTextureKey(scene: Phaser.Scene): string | undefined {
  return firstExistingTexture(scene, [
    "v1-hero-art-knight",
    "hero-knight",
    CASUAL_ART_KEYS.heroSeedKnight,
  ]);
}

export function resolveProjectileTextureKey(
  scene: Phaser.Scene,
  style: string,
): string | undefined {
  return firstExistingTexture(scene, [
    `projectile-${style}`,
    CASUAL_ART_KEYS.projectileSeed,
  ]);
}
