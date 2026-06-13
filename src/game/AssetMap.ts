import Phaser from "phaser";
import type { EnemyKind, TowerKind } from "./types";
import { allowPreviewBattlefieldArt, useIconMockBattleArt } from "./BattleArtMode";
import {
  resolveReferenceEnemyTextureKey,
  resolveReferenceHeroTextureKey,
  resolveReferenceTowerTextureKey,
} from "./ReferenceAssetPack";
import { getSelectedHero } from "./HeroLoadout";

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
  // v2.36.0: isolated icon 목업은 기본 전투에서 쓰지 않는다.
  // `?casualart`, `?iconmock`, `?stickerart`는 DALL-E 아이콘 검수용이다.
  return useIconMockBattleArt();
}

export function queueCasualBattleArt(scene: Phaser.Scene): boolean {
  // v2.36.0: 기본 전투에서는 목업 아이콘을 아예 로드하지 않는다.
  // 전장 배경 미리보기는 `?fullart`, `?ultraart`, `?galleryart`에서만 허용한다.
  const shouldLoadIconMocks = useIconMockBattleArt();
  const shouldLoadBattlefieldPreview = allowPreviewBattlefieldArt();
  if (!shouldLoadIconMocks && !shouldLoadBattlefieldPreview) return false;

  const assetsToLoad = CASUAL_BATTLE_ART_ASSETS.filter((asset) => {
    if (shouldLoadIconMocks) return true;
    return asset.key === CASUAL_ART_KEYS.battlefieldOcean;
  });

  const loader = scene.load as Phaser.Loader.LoaderPlugin & {
    isLoading?: () => boolean;
  };

  const emitReady = () => {
    scene.events.emit("kingdom-seed:casual-art-ready", {
      loaded: assetsToLoad.filter((asset) => textureExists(scene, asset.key)).length,
      total: assetsToLoad.length,
    });
  };

  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
      queueCasualBattleArt(scene);
      emitReady();
    });
    return false;
  }

  let queued = false;
  for (const asset of assetsToLoad) {
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

  if (queued) {
    scene.load.once(Phaser.Loader.Events.COMPLETE, emitReady);
    scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (_file: unknown) => {
      // 에셋 교체 중 파일이 비어 있거나 경로가 잘못되어도 전투 진입은 막지 않는다.
      // 기존 스프라이트/도형 폴백이 계속 동작하고, ?artmapdebug로 로드 개수를 확인할 수 있다.
      emitReady();
    });
    scene.load.start();
  } else {
    emitReady();
  }
  return queued;
}

export function resolveBattlefieldBackgroundKey(
  scene: Phaser.Scene,
  stageId: string,
): string | undefined {
  const stageKey = `battle-bg-${stageId}`;
  if (preferCasualArt() || allowPreviewBattlefieldArt()) {
    return firstExistingTexture(scene, [CASUAL_ART_KEYS.battlefieldOcean, stageKey]);
  }
  return firstExistingTexture(scene, [stageKey]);
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
  const referenceKey = resolveReferenceTowerTextureKey(scene, kind, mastery);
  if (referenceKey) return referenceKey;
  const premiumKey = firstExistingTexture(scene, [masteryKey, levelKey, baseKey]);
  if (premiumKey) return premiumKey;
  return useIconMockBattleArt()
    ? firstExistingTexture(scene, TOWER_FALLBACK_BY_KIND[kind])
    : undefined;
}

export function resolveEnemyTextureKey(
  scene: Phaser.Scene,
  kind: EnemyKind | string,
): string | undefined {
  const family = ENEMY_FAMILY_BY_KIND[kind];
  const familyArtKey = family ? `v1-enemy-art-${family}` : undefined;
  // 주의: enemy-${kind}는 대부분 spritesheet이므로 여기서 반환하지 않는다.
  // Enemy.ts의 기존 애니메이션 fallback이 spritesheet를 처리한다.
  const referenceKey = resolveReferenceEnemyTextureKey(scene, kind);
  if (referenceKey) return referenceKey;
  const premiumKey = firstExistingTexture(scene, [familyArtKey]);
  if (premiumKey) return premiumKey;
  return useIconMockBattleArt()
    ? firstExistingTexture(scene, [CASUAL_ART_KEYS.fishSlime])
    : undefined;
}

export function resolveHeroTextureKey(scene: Phaser.Scene): string | undefined {
  const referenceKey = resolveReferenceHeroTextureKey(scene, getSelectedHero().id);
  if (referenceKey) return referenceKey;
  const premiumKey = firstExistingTexture(scene, [
    "v1-hero-art-knight",
    "hero-knight",
  ]);
  if (premiumKey) return premiumKey;
  return useIconMockBattleArt()
    ? firstExistingTexture(scene, [CASUAL_ART_KEYS.heroSeedKnight])
    : undefined;
}

export function resolveProjectileTextureKey(
  scene: Phaser.Scene,
  style: string,
): string | undefined {
  const premiumKey = firstExistingTexture(scene, [`projectile-${style}`]);
  if (premiumKey) return premiumKey;
  return useIconMockBattleArt()
    ? firstExistingTexture(scene, [CASUAL_ART_KEYS.projectileSeed])
    : undefined;
}
