import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { getRenderProfile, makeGameFpsConfig } from "../game/QualityManager";
import { installMobileRuntimeEngine } from "../game/MobileRuntimeEngine";
import { installRuntimeFrameGovernor } from "../game/RuntimeFrameGovernor";
import { installCompatibilityGuard } from "./CompatibilityGuard";
import { installRuntimeLoadGovernor, markUserCriticalInput } from "../game/RuntimeLoadGovernor";
import { markLaunchMilestone } from "./LaunchDiagnostics";

declare global {
  interface Window {
    __KINGDOM_SEED_GAME__?: Phaser.Game;
    __KINGDOM_SEED_BOOT_ERROR__?: unknown;
  }
}

let gameInstance: Phaser.Game | undefined;
let installedWindowHooks = false;

function dispatchEngineStatus(stage: string, detail: Record<string, unknown> = {}): void {
  markLaunchMilestone(`engine-status:${stage}`, detail);
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:engine-status", {
      detail: { stage, at: Date.now(), ...detail },
    }),
  );
}

function scheduleIdle(task: () => void, delayMs: number): void {
  window.setTimeout(() => {
    const idle = (
      window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      }
    ).requestIdleCallback;
    if (idle) idle(task, { timeout: 2400 });
    else window.setTimeout(task, 1);
  }, Math.max(0, delayMs));
}

function installDeferredRuntimeComplements(game: Phaser.Game): void {
  // v2.35.6: Phaser 생성 직전/직후의 critical path에서 오디오, PWA, DOM 장식 코드를 분리한다.
  // 기능은 유지하되 로그인 첫 화면을 여는 동안 불필요한 모듈 평가를 뒤로 미룬다.
  scheduleIdle(() => {
    void import("../game/PremiumMicroInteractions")
      .then(({ installGlobalPremiumDomFeedback }) => installGlobalPremiumDomFeedback())
      .catch((error) => console.warn("Premium DOM feedback install skipped:", error));
  }, 520);

  scheduleIdle(() => {
    void import("../game/AudioManager")
      .then(({ installGlobalAudioUnlock, unlockAudio }) => {
        installGlobalAudioUnlock(game);
        if (document.documentElement.classList.contains("ks-user-activated")) {
          const scene = game.scene.getScenes(true)[0];
          if (scene) unlockAudio(scene);
        }
      })
      .catch((error) => console.warn("Global audio unlock install skipped:", error));
  }, 260);

  const installPwaWhenSettled = (): void => {
    scheduleIdle(() => {
      void import("../platform/PwaRuntime")
        .then(({ installDeferredPwaRuntime }) => installDeferredPwaRuntime())
        .catch((error) => console.warn("Deferred PWA runtime install skipped:", error));
    }, 1600);
  };

  if (document.documentElement.classList.contains("ks-scene-ready")) installPwaWhenSettled();
  else window.addEventListener("kingdom-seed:scene-ready", installPwaWhenSettled, { once: true });
}

function installWindowScaleHooks(game: Phaser.Game): void {
  if (installedWindowHooks) return;
  installedWindowHooks = true;

  let pendingScaleRefresh = 0;
  const refreshScale = (): void => {
    // 모바일 브라우저 주소창/회전 이벤트는 짧은 시간에 여러 번 몰려온다.
    // 한 프레임 안에서 ScaleManager가 반복 계산하지 않도록 합친다.
    if (pendingScaleRefresh) return;
    pendingScaleRefresh = window.setTimeout(() => {
      pendingScaleRefresh = 0;
      try {
        game.scale.refresh();
      } catch (error) {
        console.warn("Scale refresh skipped:", error);
      }
    }, 80);
  };

  window.addEventListener("kingdom-seed:viewport-changed", refreshScale);
  window.addEventListener("orientationchange", () =>
    [0, 180, 420].forEach((delay) => window.setTimeout(refreshScale, delay)),
  );
  window.addEventListener("resize", refreshScale);

  window.addEventListener("kingdom-seed:quality-changed", () => {
    // Phaser 해상도는 부팅 시점에 고정된다. 렌더 티어 변경은 깨끗한 재시작이 가장 안전하다.
    const url = new URL(window.location.href);
    url.searchParams.set("q", String(Date.now()));
    window.location.replace(url.toString());
  });
}

export function bootstrapKingdomSeedGame(reason = "deferred-entry"): Phaser.Game {
  if (gameInstance) {
    markLaunchMilestone("phaser-reused", { reason });
    return gameInstance;
  }

  dispatchEngineStatus("phaser-configuring", { reason });

  installRuntimeLoadGovernor();
  const compatibility = installCompatibilityGuard();

  // v2.35.5: 유저 탭으로 엔진 로드가 시작된 경우 RuntimeLoadGovernor가
  // 이미 지나간 user-activated 이벤트를 놓칠 수 있으므로, 초기 몇 초는 선택 작업을 멈춰 둔다.
  if (document.documentElement.classList.contains("ks-user-activated")) {
    markUserCriticalInput("deferred-engine-after-activation", 3600);
  }

  const profile = getRenderProfile();
  let parent = document.getElementById("game");
  if (!parent) {
    parent = document.createElement("div");
    parent.id = "game";
    document.body.appendChild(parent);
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: compatibility.forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
    parent: "game",
    backgroundColor: "#101820",
    fps: makeGameFpsConfig(),
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540,
      fullscreenTarget: "game",
    },
    input: {
      activePointers: profile.tier === "low" ? 2 : 3,
    },
    audio: {
      disableWebAudio: !compatibility.webAudioAvailable,
    },
    render: {
      pixelArt: false,
      antialias: profile.tier !== "low",
      roundPixels: profile.tier === "low",
      powerPreference: profile.tier === "low" ? "low-power" : "high-performance",
      antialiasGL: profile.tier !== "low" && compatibility.webglAvailable,
      desynchronized: profile.tier === "low",
      batchSize: profile.tier === "low" ? 1024 : 4096,
      maxTextures: profile.tier === "low" ? 8 : 16,
      mipmapRegeneration: false,
    },
    scene: [BootScene],
  };

  dispatchEngineStatus("phaser-creating", {
    tier: profile.tier,
    renderer: compatibility.forceCanvas ? "canvas" : "auto",
    warnings: compatibility.warnings,
  });
  try {
    markLaunchMilestone("phaser-new-game", { reason, renderer: compatibility.forceCanvas ? "canvas" : "auto", tier: profile.tier });
    gameInstance = new Phaser.Game(config);
    window.__KINGDOM_SEED_GAME__ = gameInstance;
  } catch (error) {
    markLaunchMilestone("phaser-create-failed", { reason, error });
    window.__KINGDOM_SEED_BOOT_ERROR__ = error;
    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "Kingdom Seed Phaser game creation failed",
        error,
      }),
    );
    throw error;
  }
  installMobileRuntimeEngine(gameInstance);
  installRuntimeFrameGovernor(gameInstance);
  installWindowScaleHooks(gameInstance);
  installDeferredRuntimeComplements(gameInstance);
  markLaunchMilestone("runtime-complements-scheduled", { reason });
  dispatchEngineStatus("phaser-created", { tier: profile.tier });
  return gameInstance;
}
