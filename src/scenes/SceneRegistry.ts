import type Phaser from "phaser";

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

const pendingInstalls = new Map<RegisteredSceneKey, Promise<void>>();

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
    if (idle) idle(task, { timeout: 1800 });
    else window.setTimeout(task, 1);
  }, Math.max(0, delayMs));
}

export function warmRegisteredScenes(
  scene: Phaser.Scene,
  keys: RegisteredSceneKey[],
  delayMs = 900,
): void {
  scheduleIdle(() => {
    void keys.reduce<Promise<void>>(
      (chain, key) =>
        chain.then(async () => {
          if (!scene.scene.isActive(scene.scene.key)) return;
          await ensureSceneRegistered(scene, key);
        }),
      Promise.resolve(),
    );
  }, delayMs);
}

export function warmMenuFlowScenes(scene: Phaser.Scene, delayMs = 900): void {
  warmRegisteredScenes(
    scene,
    ["MainMenuScene", "WorldMapScene", "GameScene"],
    delayMs,
  );
}
