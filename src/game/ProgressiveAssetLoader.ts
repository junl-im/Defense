import Phaser from "phaser";
import { safeDelayedCall } from "./SceneSafety";
import { allowProgressiveArtBundle, isLowDeviceProfile } from "./PerformanceMode";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import {
  noteOptionalWorkBlocked,
  optionalRuntimeWorkAllowed,
  progressiveAssetBudgetFor,
  reserveProgressiveAssets,
} from "./RuntimeLoadGovernor";

export type ProgressiveArtBundle = "login" | "lobby" | "world" | "battle";
type AssetDef = { key: string; path: string };

type SceneWithProgressiveQueue = Phaser.Scene & {
  __kingdomSeedProgressiveQueue?: Promise<void>;
};

const query = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

// v2.33: keep the bootstrap bundle lean.  Earlier builds embedded hundreds of
// optional v2.25~v2.27 art manifest entries in this module.  Even when runtime
// governors blocked downloads, phones still paid the JS parse/memory cost at
// startup.  The default runtime now exposes only a compact, high-value catalog;
// gallery-scale art is intentionally reserved for a future out-of-band manifest
// loader so the game remains responsive on weak networks.
const COMPACT_CORE_BUNDLES: Record<ProgressiveArtBundle, AssetDef[]> = {
  login: [
    { key: "v225-login-masterpiece-bg", path: "assets/ui/v2_25/login_masterpiece_bg_v2_25.png" },
    { key: "v225-login-premium-card-frame", path: "assets/ui/v2_25/login_premium_card_frame_v2_25.png" },
  ],
  lobby: [
    { key: "v225-lobby-masterpiece-bg", path: "assets/ui/v2_25/lobby_masterpiece_bg_v2_25.png" },
    { key: "v225-lobby-command-banner", path: "assets/ui/v2_25/lobby_command_banner_v2_25.png" },
    { key: "v226-lobby-bg-atelier", path: "assets/ui/v2_26/lobby_atelier_bg_v2_26.png" },
    { key: "v227-lobby-grand-hall-bg", path: "assets/ui/v2_27/lobby_grand_hall_bg_v2_27.png" },
  ],
  world: [
    { key: "v225-world-masterpiece-bg", path: "assets/ui/v2_25/world_masterpiece_bg_v2_25.png" },
    { key: "v225-world-preview-frame", path: "assets/ui/v2_25/world_preview_frame_v2_25.png" },
    { key: "v226-world-bg-atlas", path: "assets/ui/v2_26/world_atlas_bg_v2_26.png" },
    { key: "v227-world-story-atlas-bg", path: "assets/ui/v2_27/world_story_atlas_bg_v2_27.png" },
  ],
  battle: [
    { key: "v225-battle-top-hud-frame", path: "assets/ui/v2_25/battle_top_hud_frame_v2_25.png" },
    { key: "v225-battle-bottom-skill-dock", path: "assets/ui/v2_25/battle_bottom_skill_dock_v2_25.png" },
  ],
};

const DEFAULT_PROGRESSIVE_CORE_CAP: Record<ProgressiveArtBundle, number> = {
  login: 0,
  lobby: 1,
  world: 1,
  battle: 0,
};

let cachedWebpSupport: boolean | undefined;
let globalProgressiveQueue: Promise<void> = Promise.resolve();
let globalArtBackoffUntil = 0;
const progressiveModuleStartedAt = Date.now();

function runtimeLockdownActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("ksRuntimeLockdown") === "1" || document.documentElement.classList.contains("ks-runtime-lockdown");
  } catch {
    return document.documentElement.classList.contains("ks-runtime-lockdown");
  }
}

function unsafeArtOverrideEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return query.has("ultraart") || window.localStorage.getItem("ksUnsafeArt") === "1";
  } catch {
    return query.has("ultraart");
  }
}

function supportsWebp(): boolean {
  if (cachedWebpSupport !== undefined) return cachedWebpSupport;
  try {
    const canvas = document.createElement("canvas");
    cachedWebpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    cachedWebpSupport = false;
  }
  return cachedWebpSupport;
}

function fullArtEnabled(): boolean {
  if (query.has("fullart") || query.has("galleryart")) return true;
  try {
    return window.localStorage.getItem("ksFullArt") === "1";
  } catch {
    return false;
  }
}

function assetUrl(path: string): string {
  const optimized = supportsWebp() ? path.replace(/\.png$/i, ".webp") : path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${optimized}`;
}

function sceneIsLive(scene: Phaser.Scene): boolean {
  return scene.scene.isActive(scene.scene.key);
}

function compactDefinitions(bundle: ProgressiveArtBundle, includeGallery: boolean): AssetDef[] {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return [];
  const requestedCap = includeGallery && unsafeArtOverrideEnabled()
    ? COMPACT_CORE_BUNDLES[bundle].length
    : DEFAULT_PROGRESSIVE_CORE_CAP[bundle];
  const budgetCap = progressiveAssetBudgetFor(bundle, requestedCap);
  if (budgetCap <= 0) return [];
  const lowCap = Math.max(0, Math.ceil(budgetCap * 0.5));
  return COMPACT_CORE_BUNDLES[bundle].slice(0, isLowDeviceProfile() ? lowCap : budgetCap);
}

type IdleDeadlineLike = { didTimeout?: boolean; timeRemaining?: () => number };

function scheduleIdleTask(task: () => void, timeout = 1800, attempts = 0): void {
  if (typeof window === "undefined") {
    task();
    return;
  }
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: (deadline?: IdleDeadlineLike) => void, options?: { timeout: number }) => number;
  };
  const run = (deadline?: IdleDeadlineLike): void => {
    const littleTimeLeft = typeof deadline?.timeRemaining === "function" && deadline.timeRemaining() < 6 && !deadline.didTimeout;
    if (littleTimeLeft && attempts < 2) {
      window.setTimeout(() => scheduleIdleTask(task, timeout, attempts + 1), 420);
      return;
    }
    task();
  };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(run, { timeout });
    return;
  }
  window.setTimeout(() => run({ didTimeout: true }), Math.min(timeout, 700));
}

function enqueueProgressiveLoad(scene: Phaser.Scene, task: () => Promise<void>): void {
  const scoped = scene as SceneWithProgressiveQueue;
  const runScoped = (): Promise<void> => {
    scoped.__kingdomSeedProgressiveQueue = (scoped.__kingdomSeedProgressiveQueue ?? Promise.resolve())
      .then(task)
      .catch((error) => console.warn("Progressive art load skipped:", error));
    return scoped.__kingdomSeedProgressiveQueue;
  };
  globalProgressiveQueue = globalProgressiveQueue
    .then(runScoped)
    .catch((error) => console.warn("Global progressive art queue skipped:", error));
}

function markBackoff(reason: string, waitMs: number): void {
  globalArtBackoffUntil = Math.max(globalArtBackoffUntil, Date.now() + waitMs);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:progressive-art-backoff", { detail: { reason, waitMs, at: Date.now() } }));
  }
}

function loadMissingAssets(scene: Phaser.Scene, assets: AssetDef[], bundle: ProgressiveArtBundle): Promise<void> {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return Promise.resolve();
  const allowedWorkKind = bundle === "battle" ? "battle-art" : "art";
  if (!optionalRuntimeWorkAllowed(allowedWorkKind, { scene })) {
    noteOptionalWorkBlocked(allowedWorkKind, "load-missing-assets");
    return Promise.resolve();
  }
  if (Date.now() < globalArtBackoffUntil && !unsafeArtOverrideEnabled()) {
    noteOptionalWorkBlocked(allowedWorkKind, "backoff");
    return Promise.resolve();
  }
  const missingAssets = assets.filter((asset) => !scene.textures.exists(asset.key));
  const reservedKeys = reserveProgressiveAssets(missingAssets.map((asset) => asset.key));
  const toLoad = missingAssets.filter((asset) => reservedKeys.includes(asset.key));
  if (toLoad.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    const loader = scene.load as Phaser.Loader.LoaderPlugin & {
      maxParallelDownloads?: number;
      isLoading?: () => boolean;
    };
    const caps = getMobileRuntimeCaps();
    const quietBootWindow = Date.now() - progressiveModuleStartedAt < caps.bootQuietMs;
    if (loader.isLoading?.()) {
      markBackoff("loader-busy", quietBootWindow ? 5200 : 3400);
      resolve();
      return;
    }
    loader.maxParallelDownloads = Math.max(1, Math.min(1, caps.artParallelDownloads));
    let resolved = false;
    let timeoutId = 0;
    const cleanup = (): void => {
      loader.off("complete", done);
      loader.off("loaderror", failSoft);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
    const finish = (): void => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };
    const done = (): void => finish();
    const failSoft = (): void => {
      markBackoff("load-error", quietBootWindow ? 16000 : 11000);
      finish();
    };
    loader.once("complete", done);
    loader.once("loaderror", failSoft);
    timeoutId = window.setTimeout(failSoft, quietBootWindow ? 2600 : 4200);
    toLoad.forEach((asset) => loader.image(asset.key, assetUrl(asset.path)));
    if (!loader.isLoading?.()) loader.start();
  });
}

export function loadProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  onComplete: () => void,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return;
  const workKind = bundle === "battle" ? "battle-art" : "art";
  if (!optionalRuntimeWorkAllowed(workKind, { scene })) {
    noteOptionalWorkBlocked(workKind, "bundle-start");
    return;
  }
  if (!allowProgressiveArtBundle(bundle)) return;
  const caps = getMobileRuntimeCaps();
  const delayMs = Math.max(options.delayMs ?? 0, isLowDeviceProfile() ? caps.bootQuietMs : 2200);
  safeDelayedCall(scene, delayMs, () => {
    if (!sceneIsLive(scene)) return;
    const includeGallery = options.includeGallery ?? (fullArtEnabled() && getMobileRuntimeCaps().label === "PREMIUM_ART_ENGINE");
    const defs = compactDefinitions(bundle, includeGallery);
    if (defs.length === 0) return;
    const missing = defs.filter((asset) => !scene.textures.exists(asset.key));
    if (missing.length === 0) {
      safeDelayedCall(scene, 0, onComplete);
      return;
    }

    scheduleIdleTask(() => {
      if (!sceneIsLive(scene)) return;
      enqueueProgressiveLoad(scene, async () => {
        if (!sceneIsLive(scene)) return;
        if (!optionalRuntimeWorkAllowed(workKind, { scene })) {
          noteOptionalWorkBlocked(workKind, "idle-run");
          return;
        }
        await loadMissingAssets(scene, missing, bundle);
        if (sceneIsLive(scene)) onComplete();
      });
    }, isLowDeviceProfile() ? 3200 : 2200);
  });
}

export function warmProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  loadProgressiveArtBundle(scene, bundle, () => undefined, options);
}
