import type Phaser from "phaser";
import {
  getRuntimeLoadState,
  noteOptionalWorkBlocked,
  optionalRuntimeWorkAllowed,
  pauseOptionalWork,
} from "../game/RuntimeLoadGovernor";

export type RegisteredSceneKey =
  | "MenuScene"
  | "MainMenuScene"
  | "WorldMapScene"
  | "LabScene"
  | "GameScene"
  | "CodexScene"
  | "MetaScene"
  | "HeroHallScene"
  | "MissionBoardScene"
  | "ArtifactForgeScene";

type SceneCtor = new (...args: never[]) => Phaser.Scene;

type WarmSceneOptions = {
  /**
   * 첫 화면/첫 탭 안정화를 위해 기본 프리워밍은 매우 보수적으로 동작한다.
   * 필요한 경우 ?prewarm=full 또는 ?warmgame으로 전투 씬까지 예열할 수 있다.
   */
  allowHeavyScenes?: boolean;
  reason?: string;
};

const SCENE_LOADERS: Record<RegisteredSceneKey, () => Promise<SceneCtor>> = {
  MenuScene: () => import("./MenuScene").then((m) => m.MenuScene as SceneCtor),
  MainMenuScene: () =>
    import("./MainMenuScene").then((m) => m.MainMenuScene as SceneCtor),
  WorldMapScene: () =>
    import("./WorldMapScene").then((m) => m.WorldMapScene as SceneCtor),
  LabScene: () => import("./LabScene").then((m) => m.LabScene as SceneCtor),
  GameScene: () => import("./GameScene").then((m) => m.GameScene as SceneCtor),
  CodexScene: () =>
    import("./CodexScene").then((m) => m.CodexScene as SceneCtor),
  MetaScene: () => import("./MetaScene").then((m) => m.MetaScene as SceneCtor),
  HeroHallScene: () =>
    import("./HeroHallScene").then((m) => m.HeroHallScene as SceneCtor),
  MissionBoardScene: () =>
    import("./MissionBoardScene").then((m) => m.MissionBoardScene as SceneCtor),
  ArtifactForgeScene: () =>
    import("./ArtifactForgeScene").then((m) => m.ArtifactForgeScene as SceneCtor),
};

const HEAVY_SCENE_KEYS = new Set<RegisteredSceneKey>([
  "GameScene",
  "ArtifactForgeScene",
  "LabScene",
]);
const pendingInstalls = new Map<RegisteredSceneKey, Promise<void>>();
let lastWarmScheduleAt = 0;

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function explicitFullPrewarmRequested(): boolean {
  const params = query();
  return (
    params.get("prewarm") === "full" ||
    params.has("warmgame") ||
    params.has("ultraart") ||
    readStorage("ksScenePrewarm") === "full"
  );
}

function prewarmDisabled(): boolean {
  const params = query();
  return (
    params.has("noprewarm") ||
    params.has("coldboot") ||
    params.has("tapboot") ||
    readStorage("ksDisablePrewarm") === "1"
  );
}

function hasScene(scene: Phaser.Scene, key: string): boolean {
  try {
    return Boolean(scene.scene.get(key));
  } catch {
    return false;
  }
}

export async function ensureSceneRegistered(
  scene: Phaser.Scene,
  key: RegisteredSceneKey,
): Promise<void> {
  if (hasScene(scene, key)) return;

  const existing = pendingInstalls.get(key);
  if (existing) {
    await existing;
    return;
  }

  const install = SCENE_LOADERS[key]().then((SceneClass) => {
    if (!hasScene(scene, key)) scene.scene.add(key, SceneClass, false);
  });
  pendingInstalls.set(key, install);
  try {
    await install;
  } finally {
    pendingInstalls.delete(key);
  }
}

export async function startRegisteredScene(
  scene: Phaser.Scene,
  key: RegisteredSceneKey,
  data?: object,
): Promise<void> {
  await ensureSceneRegistered(scene, key);
  if (!scene.scene.isActive(scene.scene.key)) return;
  scene.scene.start(key, data);
}

function scheduleIdle(task: () => void, delayMs: number): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    const idle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout?: number }) => number;
      }
    ).requestIdleCallback;
    if (idle) idle(task, { timeout: 2400 });
    else window.setTimeout(task, 1);
  }, Math.max(0, delayMs));
}

function filterWarmKeys(
  keys: RegisteredSceneKey[],
  options: WarmSceneOptions,
): RegisteredSceneKey[] {
  const allowHeavy = Boolean(options.allowHeavyScenes || explicitFullPrewarmRequested());
  const seen = new Set<RegisteredSceneKey>();
  return keys.filter((key) => {
    if (seen.has(key)) return false;
    seen.add(key);
    if (HEAVY_SCENE_KEYS.has(key) && !allowHeavy) return false;
    return true;
  });
}

export function warmRegisteredScenes(
  scene: Phaser.Scene,
  keys: RegisteredSceneKey[],
  delayMs = 1800,
  options: WarmSceneOptions = {},
): void {
  if (typeof window === "undefined") return;
  if (prewarmDisabled()) return;

  const warmKeys = filterWarmKeys(keys, options);
  if (warmKeys.length === 0) return;

  const now = Date.now();
  // BootScene과 MenuScene이 거의 동시에 같은 프리워밍을 요청하던 구조를 합친다.
  // 저사양 모바일에서 첫 화면 직후 import 폭주가 나는 것을 막기 위한 안전장치다.
  if (now - lastWarmScheduleAt < 1200) return;
  lastWarmScheduleAt = now;

  scheduleIdle(() => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    if (!optionalRuntimeWorkAllowed("prewarm", { scene, allowDuringBoot: false })) {
      noteOptionalWorkBlocked("prewarm", options.reason ?? "scene-warm-blocked");
      pauseOptionalWork("prewarm-deferred", 4200);
      return;
    }

    void warmKeys.reduce<Promise<void>>(
      (chain, key) =>
        chain.then(async () => {
          if (!scene.scene.isActive(scene.scene.key)) return;
          if (!optionalRuntimeWorkAllowed("prewarm", { scene, allowDuringBoot: false })) return;
          await ensureSceneRegistered(scene, key);
          // 연속 dynamic import가 메인 스레드를 독점하지 않도록 씬 하나마다 한 박자 쉰다.
          await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
        }),
      Promise.resolve(),
    );
  }, Math.max(delayMs, getRuntimeLoadState().blockedCount > 0 ? 3200 : delayMs));
}

export function warmMenuFlowScenes(scene: Phaser.Scene, delayMs = 2200): void {
  warmRegisteredScenes(
    scene,
    ["MainMenuScene", "WorldMapScene", "GameScene"],
    delayMs,
    { reason: "menu-flow" },
  );
}
