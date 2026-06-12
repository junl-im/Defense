import Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";

const OPTIONAL_TEXTURE_PREFIXES = [
  "v216-",
  "v217-",
  "v218-",
  "v219-",
  "v220-",
  "v221-",
  "v222-",
  "v224-",
  "v225-",
  "v226-",
  "v227-",
  "v228-",
  "v229-",
  "v230-",
  "v231-",
  "v232-",
  "v233-",
  "v234-",
] as const;

const OPTIONAL_TEXTURE_PATTERNS = [
  /^v2-cute-/,
  /^v2[0-9]{2}-/,
  /^ui-world-map-bg-v2[789]$/,
  /^ui-panel-premium-v43$/,
  /^ui-modal-frame-v43$/,
  /^ui-fx-/,
] as const;

let lastPurgeAt = 0;

function shouldPurgeKey(key: string): boolean {
  return OPTIONAL_TEXTURE_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
    OPTIONAL_TEXTURE_PATTERNS.some((pattern) => pattern.test(key));
}

export function purgeOptionalArtTextures(
  scene: Phaser.Scene,
  reason = "runtime-budget",
  options: { force?: boolean; limit?: number; olderFirst?: boolean } = {},
): number {
  const caps = getMobileRuntimeCaps();
  if (!options.force && !caps.texturePurgeOnBattle) return 0;
  const now = Date.now();
  if (!options.force && now - lastPurgeAt < 4200) return 0;
  lastPurgeAt = now;

  const manager = scene.textures;
  const keys = manager.getTextureKeys()
    .filter((key) => shouldPurgeKey(key) && manager.exists(key))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, options.limit ?? 220);

  let removed = 0;
  keys.forEach((key) => {
    try {
      manager.remove(key);
      removed += 1;
    } catch (error) {
      console.warn("Optional art texture purge skipped:", key, error);
    }
  });

  if (removed > 0) {
    window.dispatchEvent(
      new CustomEvent("kingdom-seed:texture-purged", {
        detail: { reason, removed, at: now },
      }),
    );
  }
  return removed;
}

export function installSceneTexturePressureHandler(scene: Phaser.Scene): void {
  const handler = (): void => {
    purgeOptionalArtTextures(scene, "memory-pressure", { limit: 140, olderFirst: true });
  };
  window.addEventListener("kingdom-seed:memory-pressure", handler);
  const cleanup = (): void => {
    window.removeEventListener("kingdom-seed:memory-pressure", handler);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    purgeOptionalArtTextures(scene, "scene-shutdown", { limit: 80 });
    cleanup();
  });
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}
