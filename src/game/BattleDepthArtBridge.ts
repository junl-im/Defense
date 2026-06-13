import Phaser from "phaser";
import type { StageConfig } from "./types";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { safeDelayedCall } from "./SceneSafety";
import { battleDepthPolishProfile, prefersRestored25DBattle } from "./BattleDepthPolish";

/**
 * v2.36.5 2.5D 전투 아트 복구 브리지
 *
 * v2.35.x의 빠른 시작 패치 이후 BootScene은 로그인 최소 에셋만 올리도록 바뀌었다.
 * 덕분에 첫 화면은 빨라졌지만, 전투 진입 시 기존 2.5D 배경/깊이 오버레이가
 * 기본 선택 우선순위에서 사실상 빠져 코드맵처럼 보이는 문제가 생겼다.
 *
 * 이 브리지는 첫 부팅에는 관여하지 않고, GameScene이 이미 열린 뒤에만
 * 현재 스테이지 1장 + 깊이 오버레이를 점진적으로 올린다.
 */

type DeferredArtAsset = {
  key: string;
  path: string;
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

const DEPTH_OVERLAY_KEY = "battle-depth-overlay-v41";
const DEPTH_OVERLAY_PATH = "assets/maps/battle_depth_overlay_v41.png";

const CORE_COMBAT_UI_ASSETS: DeferredArtAsset[] = [
  { key: "v1-combat-top-hud", path: "assets/ui/v2_15/combat_top_hud_v2_15.png" },
  { key: "v1-combat-bottom-dock", path: "assets/ui/v2_15/combat_bottom_dock_v2_15.png" },
  { key: "v1-build-spot", path: "assets/ui/v2_15/build_spot_v2_15.png" },
  { key: "v1-tower-build-menu", path: "assets/ui/v2_15/tower_build_menu_v2_15.png" },
  { key: "v1-tower-build-card", path: "assets/ui/v2_15/tower_build_card_v2_15.png" },
  { key: "v1-tower-command-panel", path: "assets/ui/v2_15/tower_command_panel_v2_15.png" },
  { key: "v1-target-reticle", path: "assets/ui/v2_3/target_reticle_v2_3.png" },
  { key: "v1-button-blue", path: "assets/ui/v2_15/button_blue_v2_15.png" },
  { key: "v1-button-gold", path: "assets/ui/v2_15/button_gold_v2_15.png" },
  { key: "v1-button-red", path: "assets/ui/v2_15/button_red_v2_15.png" },
];

const ENEMY_FAMILY_ASSETS: DeferredArtAsset[] = [
  { key: "v1-enemy-art-goblin", path: "assets/units/v2_1/enemy_goblin_v2_1.png" },
  { key: "v1-enemy-art-orc", path: "assets/units/v2_1/enemy_orc_v2_1.png" },
  { key: "v1-enemy-art-wolf", path: "assets/units/v2_1/enemy_wolf_v2_1.png" },
  { key: "v1-enemy-art-skeleton", path: "assets/units/v2_1/enemy_skeleton_v2_1.png" },
  { key: "v1-enemy-art-rogue", path: "assets/units/v2_1/enemy_rogue_v2_1.png" },
  { key: "v1-enemy-art-boar", path: "assets/units/v2_1/enemy_boar_v2_1.png" },
  { key: "v1-enemy-art-bat", path: "assets/units/v2_1/enemy_bat_v2_1.png" },
  { key: "v1-enemy-art-dragon", path: "assets/units/v2_1/enemy_dragon_v2_1.png" },
];

const HERO_CORE_ASSETS: DeferredArtAsset[] = [
  { key: "v1-hero-art-knight", path: "assets/units/v2_4/hero_knight_v2_4.png" },
  { key: "v1-hero-art-paladin", path: "assets/units/v2_1/hero_paladin_v2_1.png" },
  { key: "v1-hero-art-druid", path: "assets/units/v2_1/hero_druid_v2_1.png" },
];

const TOWER_KINDS = ["archer", "mage", "barracks", "artillery"] as const;
const TOWER_LEVELS = [1, 2, 3] as const;

function stageNumber(stage: StageConfig): string {
  const fromId = /stage_(\d+)/.exec(stage.id)?.[1];
  const numeric = Number(fromId ?? stage.number ?? 1);
  return String(Math.max(1, Math.min(12, numeric))).padStart(3, "0");
}

function stageBackgroundKey(stage: StageConfig): string {
  return `battle-bg-stage_${stageNumber(stage)}`;
}

function supportsWebp(): boolean {
  if (QUERY.has("png") || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function stageBackgroundPath(stage: StageConfig): string {
  const n = stageNumber(stage);
  const ext = supportsWebp() ? "webp" : "png";
  return `assets/maps/v2_15/battle_stage_${n}_v2_15.${ext}`;
}

function towerCoreAssets(): DeferredArtAsset[] {
  const assets: DeferredArtAsset[] = [];
  TOWER_KINDS.forEach((kind) => {
    assets.push({ key: `tower-${kind}`, path: `assets/towers/v2_1/tower_${kind}.png` });
    TOWER_LEVELS.forEach((level) => {
      assets.push({ key: `tower-${kind}-lv${level}`, path: `assets/towers/v2_1/tower_${kind}_lv${level}.png` });
    });
  });
  return assets;
}

function shouldUseDepthArt(): boolean {
  return prefersRestored25DBattle();
}

function explicitActorArtOverride(): boolean {
  return QUERY.has("combatart") || QUERY.has("restore25d") || QUERY.has("fullart") || QUERY.has("ultraart");
}

function shouldLoadActorArt(): boolean {
  if (QUERY.has("maponly25d")) return false;
  const caps = getMobileRuntimeCaps();
  // 런타임 락다운에서는 맵 1장+오버레이까지만 복구한다.
  if (caps.runtimeLockdown || caps.label === "LOCKDOWN_MOBILE_ENGINE") return false;
  // 명시적 검수/복구 플래그는 유지하되, 실제 로드는 아래의 전투 유휴 게이트를 통과해야 한다.
  if (explicitActorArtOverride()) return caps.networkClass === "normal" && !caps.saveData;
  // 기본 모바일/저전력/느린 네트워크에서는 배경 2.5D만 살리고 actor 묶음 스트리밍은 생략한다.
  if (caps.label === "SAFE_MOBILE_ENGINE" || caps.isMobile || caps.isLowMemory || caps.isLowCore) return false;
  return caps.networkClass === "normal" && !caps.saveData;
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

function emitActorStreamState(scene: Phaser.Scene, state: string, detail: Record<string, unknown> = {}): void {
  scene.events.emit("kingdom-seed:actor-art-stream-state", {
    state,
    at: Date.now(),
    ...detail,
  });
}

function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function queueImages(
  scene: Phaser.Scene,
  assets: DeferredArtAsset[],
  onComplete: (failedKeys: string[]) => void,
): void {
  const missing = assets.filter((asset) => !textureExists(scene, asset.key));
  if (missing.length === 0) {
    onComplete([]);
    return;
  }

  const loader = scene.load as Phaser.Loader.LoaderPlugin & { isLoading?: () => boolean };
  if (typeof loader.isLoading === "function" && loader.isLoading()) {
    safeDelayedCall(scene, 180, () => queueImages(scene, assets, onComplete), {
      canRun: () => scene.scene.isActive(scene.scene.key),
    });
    return;
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

  // 파일 하나가 실패해도 즉시 완료 처리하지 않는다. COMPLETE까지 기다려야 나머지 정상 에셋이 반영된다.
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, recordError);
  scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
  missing.forEach((asset) => scene.load.image(asset.key, asset.path));
  scene.load.start();
}

function addOrUpdateImage(
  scene: Phaser.Scene,
  name: string,
  key: string,
  depth: number,
  alpha: number,
  duration: number,
): Phaser.GameObjects.Image | undefined {
  if (!textureExists(scene, key)) return undefined;
  const existing = scene.children.getByName(name) as Phaser.GameObjects.Image | null;
  if (existing?.active) {
    existing.setTexture(key).setDisplaySize(960, 540).setDepth(depth).setAlpha(alpha);
    return existing;
  }
  const image = scene.add
    .image(480, 270, key)
    .setName(name)
    .setDisplaySize(960, 540)
    .setDepth(depth)
    .setAlpha(0);
  scene.tweens.add({
    targets: image,
    alpha,
    duration,
    ease: "Sine.easeOut",
  });
  return image;
}

function applyStageDepthLayers(
  scene: Phaser.Scene,
  stage: StageConfig,
  failedKeys: string[] = [],
): void {
  if (!scene.scene.isActive(scene.scene.key)) return;
  const bgKey = stageBackgroundKey(stage);
  const polish = battleDepthPolishProfile();
  // 코드로 그린 임시 지형 위에 2.5D 배경을 얹되, 경로/타워/몬스터는 계속 위에 남긴다.
  addOrUpdateImage(scene, "ks-25d-stage-background", bgKey, 3.18, polish.backgroundAlpha, polish.fadeMs);
  addOrUpdateImage(scene, "ks-25d-depth-overlay", DEPTH_OVERLAY_KEY, 3.62, polish.depthOverlayAlpha, polish.fadeMs + 100);
  scene.events.emit("kingdom-seed:core-combat-art-ready", {
    stageId: stage.id,
    background: textureExists(scene, bgKey),
    depth: textureExists(scene, DEPTH_OVERLAY_KEY),
    failedKeys,
    polish,
  });
}

function applyActorArtReady(scene: Phaser.Scene): void {
  if (!scene.scene.isActive(scene.scene.key)) return;
  scene.events.emit("kingdom-seed:core-combat-actor-art-ready");
}

export function installBattleDepthArtBridge(scene: Phaser.Scene, stage: StageConfig): void {
  if (!shouldUseDepthArt()) return;

  const stageAssets: DeferredArtAsset[] = [
    { key: stageBackgroundKey(stage), path: stageBackgroundPath(stage) },
    { key: DEPTH_OVERLAY_KEY, path: DEPTH_OVERLAY_PATH },
  ];

  // 전투 씬이 그려진 뒤 아주 짧게 숨을 돌리고 2.5D 맵만 먼저 복구한다.
  safeDelayedCall(scene, QUERY.has("instant25d") ? 80 : 520, () => {
    queueImages(scene, stageAssets, (failedKeys) => applyStageDepthLayers(scene, stage, failedKeys));
  }, { canRun: () => scene.scene.isActive(scene.scene.key) });

  if (!shouldLoadActorArt()) return;

  const actorAssets = [
    ...CORE_COMBAT_UI_ASSETS,
    ...HERO_CORE_ASSETS,
    ...ENEMY_FAMILY_ASSETS,
    ...towerCoreAssets(),
  ];

  let actorLoadStarted = false;
  let idleRetryArmed = false;
  const startActorLoadWhenSafe = (attempt = 0): void => {
    if (actorLoadStarted || !scene.scene.isActive(scene.scene.key)) return;
    if (!battleActionQuiet(scene)) {
      emitActorStreamState(scene, "deferred-during-wave", { attempt });
      if (attempt <= 10) {
        if (!idleRetryArmed) {
          idleRetryArmed = true;
          scene.events.once("kingdom-seed:battle-idle-safe", () => {
            idleRetryArmed = false;
            startActorLoadWhenSafe(attempt + 1);
          });
        }
        safeDelayedCall(scene, QUERY.has("instant25d") ? 520 : 1200, () => startActorLoadWhenSafe(attempt + 1), {
          canRun: () => scene.scene.isActive(scene.scene.key),
        });
      }
      return;
    }

    actorLoadStarted = true;
    emitActorStreamState(scene, "loading", { total: actorAssets.length });
    queueImages(scene, actorAssets, (failedKeys) => {
      emitActorStreamState(scene, "ready", { failedKeys });
      applyActorArtReady(scene);
    });
  };

  // 타워/몬스터/영웅 아트는 웨이브가 돌지 않는 안전 구간에서만 올린다.
  // 사용자가 곧바로 전투 시작을 눌렀다면 다음 휴식 구간까지 미뤄 프레임 드롭과 네트워크 경합을 막는다.
  safeDelayedCall(scene, QUERY.has("instant25d") ? 260 : 1150, () => startActorLoadWhenSafe(), {
    canRun: () => scene.scene.isActive(scene.scene.key),
  });
}

export function battleDepthArtDebugSummary(scene: Phaser.Scene, stage: StageConfig): string {
  const bgKey = stageBackgroundKey(stage);
  return [
    `25D:${textureExists(scene, bgKey) ? "bg" : "no-bg"}`,
    textureExists(scene, DEPTH_OVERLAY_KEY) ? "depth" : "no-depth",
  ].join("/");
}
