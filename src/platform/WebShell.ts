type BrowserFlags = {
  isKakaoTalk: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
};

let allowExit = false;
let exitModal: HTMLDivElement | undefined;
let startGate: HTMLDivElement | undefined;
let bootErrorOverlay: HTMLDivElement | undefined;
let bootWatchdogTimer: number | undefined;
let activated = false;
let sceneReady = false;
let guardArmed = false;
let suppressExitGuardUntil = 0;
let lastGuardAt = 0;
let lastPointerAt = 0;
let lastSceneReadyAt = 0;
const GUARD_STATE_KEY = "kingdomSeedBackGuard";
const GUARD_SESSION = Math.random().toString(36).slice(2);

function flags(): BrowserFlags {
  const ua = navigator.userAgent || "";
  const coarsePointer =
    window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const smallScreen =
    Math.min(window.screen.width, window.screen.height) <= 820;
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isMobile = mobileUA || (coarsePointer && smallScreen);
  const isPortrait = window.innerHeight > window.innerWidth;

  return {
    isKakaoTalk: /KAKAOTALK/i.test(ua),
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isMobile,
    isDesktop: !isMobile,
    isPortrait,
  };
}

function ensureShellStyles(): void {
  if (document.getElementById("kingdom-shell-v211-style")) return;
  const style = document.createElement("style");
  style.id = "kingdom-shell-v211-style";
  style.textContent = `
    #game { width: 100vw; height: 100dvh; min-height: 100dvh; }
    .shell-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left)); background: radial-gradient(circle at 50% 22%, rgba(83,169,255,.38), rgba(8,18,43,.88) 58%, rgba(2,5,12,.96)); color: white; box-sizing: border-box; transition: opacity 180ms ease, transform 180ms ease; }
    .shell-overlay.hidden { display: none !important; }
    .shell-overlay.fading { opacity: 0; transform: scale(1.02); pointer-events: none; }
    .shell-start-gate { cursor: pointer; }
    .shell-start-card, .shell-panel { width: min(420px, 90vw); border: 2px solid rgba(255,218,123,.92); border-radius: 22px; padding: 22px 18px; text-align: center; background: radial-gradient(circle at 50% 0%, rgba(120,215,255,.20), transparent 44%), linear-gradient(180deg, rgba(33,52,84,.98), rgba(8,17,38,.98)); color: #f7fbff; box-shadow: 0 24px 70px rgba(0,0,0,.48), 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.22); }
    .shell-title-mark { font-size: 24px; line-height: 1; font-weight: 1000; letter-spacing: .04em; color: #fff0b8; text-shadow: 0 2px 0 rgba(0,0,0,.45), 0 0 18px rgba(255,220,126,.22); }
    .shell-title-sword { width: 68%; height: 2px; margin: 10px auto 0; background: linear-gradient(90deg, transparent, #e7b94e, transparent); }
    .shell-start-card h1, .shell-panel h2 { margin: 10px 0 5px; font-size: 21px; color: #eaf6ff; }
    .shell-start-card p, .shell-panel p { margin: 0; font-weight: 800; font-size: 13px; color: #bcd7ff; }
    .shell-tap-rune { display: inline-flex; margin-top: 12px; width: 70px; height: 70px; align-items: center; justify-content: center; border-radius: 999px; color: #fff; font-weight: 1000; background: linear-gradient(180deg, #5fa1ff, #255ab5); border: 3px solid #ffd979; box-shadow: 0 12px 34px rgba(27,82,180,.34), inset 0 1px 0 rgba(255,255,255,.46); animation: ksTapPulseV48 1.25s ease-in-out infinite; }
    .shell-loading-text { margin-top: 10px; color: #fff0b8; font-weight: 1000; font-size: 10px; }
    .shell-boot-error { position: fixed; left: 50%; bottom: max(12px, env(safe-area-inset-bottom)); transform: translateX(-50%); z-index: 10020; width: min(520px, 92vw); padding: 12px 14px; border-radius: 16px; border: 1px solid rgba(255,130,105,.82); background: linear-gradient(180deg, rgba(43,17,20,.96), rgba(13,7,11,.98)); color: #ffe8dc; font-weight: 900; font-size: 12px; line-height: 1.35; box-shadow: 0 16px 42px rgba(0,0,0,.44); }
    .shell-boot-error button { margin-top: 8px; width: 100%; border: 0; border-radius: 12px; padding: 9px 12px; color: #261008; background: linear-gradient(180deg, #ffe09a, #f4a83b); font-weight: 1000; }
    .shell-row { display: flex; gap: 12px; justify-content: center; margin-top: 14px; }
    .shell-row button { appearance: none; border: 0; border-radius: 16px; padding: 13px 24px; color: #fff; font-weight: 1000; font-size: 16px; }
    .shell-secondary { background: linear-gradient(180deg, #5d94e6, #2658b5); }
    .shell-danger { background: linear-gradient(180deg, #ff8d86, #b43142); }
    @keyframes ksTapPulseV48 { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.07); filter: brightness(1.12); } }
  `;
  document.head.appendChild(style);
}

function syncViewportCssVars(): void {
  const viewport = window.visualViewport;
  const width = Math.max(1, Math.round(viewport?.width ?? window.innerWidth));
  const height = Math.max(
    1,
    Math.round(viewport?.height ?? window.innerHeight),
  );
  const landscape = width >= height;
  const surfaceWidth = landscape ? width : height;
  const surfaceHeight = landscape ? height : width;
  const targetAspect = 16 / 9;
  const surfaceAspect = surfaceWidth / Math.max(1, surfaceHeight);
  const viewportFit =
    new URLSearchParams(window.location.search).get("fit") ??
    localStorage.getItem("ksViewportFit") ??
    "auto";
  const compactShell =
    new URLSearchParams(window.location.search).get("shell") !== "large";
  const portraitFill = !landscape && viewportFit !== "contain";
  let gameWidth = surfaceWidth;
  let gameHeight = surfaceHeight;

  if (portraitFill) {
    // v2.2: on portrait phones, use the whole rotated visual viewport.
    // Phaser still maps pointers correctly, and this avoids the tiny 16:9 strip problem
    // on browsers where orientation lock/fullscreen is blocked.
    gameWidth = surfaceWidth;
    gameHeight = surfaceHeight;
  } else if (surfaceAspect > targetAspect) {
    gameHeight = surfaceHeight;
    gameWidth = Math.round(gameHeight * targetAspect);
  } else {
    gameWidth = surfaceWidth;
    gameHeight = Math.round(gameWidth / targetAspect);
  }

  const root = document.documentElement;
  root.style.setProperty("--ks-vw-px", `${width}px`);
  root.style.setProperty("--ks-vh-px", `${height}px`);
  root.style.setProperty("--ks-game-w-px", `${Math.max(1, gameWidth)}px`);
  root.style.setProperty("--ks-game-h-px", `${Math.max(1, gameHeight)}px`);
  root.style.setProperty("--ks-game-scale", "1");
  root.style.setProperty("--ks-shell-card-scale", compactShell ? "0.86" : "1");
  root.classList.toggle("ks-portrait-fill", portraitFill);
  root.classList.toggle("ks-compact-shell", compactShell);
}

function safeShow(el: HTMLElement): void {
  el.classList.remove("hidden");
  el.classList.remove("fading");
}
function safeHide(el: HTMLElement): void {
  el.classList.add("hidden");
}

function fadeRemove(el: HTMLElement | undefined): void {
  if (!el || !el.isConnected) return;
  el.classList.add("fading");
  window.setTimeout(() => el.remove(), 190);
}

function emitEmergencySave(reason: string): void {
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:emergency-save", {
      detail: { reason, at: Date.now() },
    }),
  );
}

function formatBootError(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function showBootError(reason: string, error: unknown): void {
  const message = formatBootError(error);
  console.error("[Kingdom Seed boot error]", reason, error);
  if (!bootErrorOverlay) {
    bootErrorOverlay = document.createElement("div");
    bootErrorOverlay.className = "shell-boot-error";
    document.body.appendChild(bootErrorOverlay);
  }
  bootErrorOverlay.innerHTML = `
    <div>시작 화면 초기화 중 문제가 감지됐어요.</div>
    <div style="margin-top:4px;opacity:.82;font-size:10px;word-break:break-word;">${reason}: ${message.slice(0, 180)}</div>
    <button type="button">다시 불러오기</button>`;
  bootErrorOverlay
    .querySelector("button")
    ?.addEventListener("click", () => window.location.reload(), { once: true });
}

async function requestFullscreenAndLandscape(): Promise<void> {
  const info = flags();
  if (!info.isMobile) return;
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };
  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.webkitRequestFullscreen)
        await root.webkitRequestFullscreen();
      else if (root.msRequestFullscreen) await root.msRequestFullscreen();
    }
  } catch (error) {
    console.warn("Mobile fullscreen request was blocked:", error);
  }
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "landscape") => Promise<void>;
    };
    if (orientation?.lock) await orientation.lock("landscape");
  } catch (error) {
    console.warn("Landscape lock was blocked or unsupported:", error);
  }
}

function updateOrientationClass(): void {
  syncViewportCssVars();
  const info = flags();
  const landscape = window.innerWidth >= window.innerHeight;
  const root = document.documentElement;
  root.classList.toggle("is-landscape", landscape);
  root.classList.toggle("is-portrait", !landscape);
  root.classList.toggle("is-kakao-webview", info.isKakaoTalk);
  root.classList.toggle("is-mobile-webview", info.isMobile);
  root.classList.toggle("is-desktop", info.isDesktop);
  root.classList.toggle("needs-portrait-rotation", info.isMobile && !landscape);
  root.classList.toggle(
    "ks-hit-debug",
    new URLSearchParams(window.location.search).has("hit") ||
      localStorage.getItem("ksHitDebug") === "1",
  );

  // v2.2: several mobile browsers report viewport dimensions in stages while
  // address bars collapse/expand. Send a short burst of resize notifications so
  // Phaser recalculates after the CSS-rotated container has reached its final size.
  const resizeBursts = document.documentElement.classList.contains("ks-engine-safe") ? [0, 220] : [0, 60, 180, 360];
  resizeBursts.forEach((delay) => {
    window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(
        new CustomEvent("kingdom-seed:viewport-changed", {
          detail: { landscape, mobile: info.isMobile, at: Date.now() },
        }),
      );
    }, delay);
  });
}

function markSceneReady(): void {
  sceneReady = true;
  if (bootWatchdogTimer !== undefined) {
    window.clearTimeout(bootWatchdogTimer);
    bootWatchdogTimer = undefined;
  }
  lastSceneReadyAt = Date.now();
  if (activated) fadeRemove(startGate);
  suppressExitGuardUntil = Date.now() + 2800;
}

async function activateGameShell(): Promise<void> {
  if (activated) return;
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  if (startGate) {
    const note = startGate.querySelector<HTMLElement>(".shell-loading-text");
    if (note) note.textContent = "엔진 안전 모드로 바로 여는 중...";
  }
  window.dispatchEvent(new CustomEvent("kingdom-seed:user-activated"));
  // v2.5: do not block the first scene behind fullscreen/orientation promises.
  // Some mobile webviews hold these calls for hundreds of ms; start loading immediately
  // and let the shell settle in the background.
  window.setTimeout(() => void requestFullscreenAndLandscape(), 640);
  window.setTimeout(() => armBackGuard(true), 520);
  window.setTimeout(() => {
    if (sceneReady) fadeRemove(startGate);
  }, 80);
  window.setTimeout(() => fadeRemove(startGate), 900);
}

function createStartGate(): void {
  const info = flags();
  if (info.isDesktop) {
    activated = true;
    window.setTimeout(
      () =>
        window.dispatchEvent(new CustomEvent("kingdom-seed:user-activated")),
      0,
    );
    return;
  }
  startGate = document.createElement("div");
  startGate.id = "start-gate";
  startGate.className = "shell-overlay shell-start-gate";
  startGate.innerHTML = `
    <div class="shell-start-card" role="button" aria-label="게임 시작">
      <div class="shell-title-mark">KINGDOM SEED</div>
      <div class="shell-title-sword"></div>
      <h1>탭해서 시작</h1>
      <p>사운드와 화면을 준비하고 바로 진입합니다.</p>
      <div class="shell-tap-rune">TAP</div>
      <div class="shell-loading-text">v2.31 모바일 엔진 안전 모드</div>
    </div>`;
  document.body.appendChild(startGate);
  const start = (): void => void activateGameShell();
  startGate.addEventListener("pointerdown", start, { once: true });
  startGate.addEventListener("touchstart", start, {
    once: true,
    passive: true,
  });
  startGate.addEventListener("click", start, { once: true });
  bootWatchdogTimer = window.setTimeout(() => {
    if (sceneReady) return;
    const note = startGate?.querySelector<HTMLElement>(".shell-loading-text");
    if (note) note.textContent = "로딩이 멈춘 경우 화면을 한 번 더 탭하세요";
  }, 4200);
}

function createExitModal(): void {
  exitModal = document.createElement("div");
  exitModal.id = "exit-modal";
  exitModal.className = "shell-overlay hidden";
  exitModal.innerHTML = `
    <div class="shell-panel shell-exit-panel">
      <div class="shell-kicker">EXIT</div>
      <h2>게임을 종료할까요?</h2>
      <p>진행 중인 전투는 보호 저장을 시도합니다.</p>
      <div class="shell-row">
        <button id="exit-stay-btn" class="shell-secondary">계속하기</button>
        <button id="exit-confirm-btn" class="shell-danger">종료</button>
      </div>
    </div>`;
  document.body.appendChild(exitModal);
  exitModal
    .querySelector<HTMLButtonElement>("#exit-stay-btn")
    ?.addEventListener("click", () => {
      safeHide(exitModal!);
      suppressExitGuardUntil = Date.now() + 1200;
      window.setTimeout(() => armBackGuard(true), 80);
      window.setTimeout(() => void requestFullscreenAndLandscape(), 640);
    });
  exitModal
    .querySelector<HTMLButtonElement>("#exit-confirm-btn")
    ?.addEventListener("click", () => {
      allowExit = true;
      safeHide(exitModal!);
      emitEmergencySave("exit-confirm");
      try {
        history.back();
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        window.close();
        if (!document.hidden) window.location.href = "about:blank";
      }, 120);
    });
}

function armBackGuard(force = false): void {
  const info = flags();
  if (!info.isMobile || allowExit) return;
  const now = Date.now();
  if (!force && guardArmed && now - lastGuardAt < 1800) return;
  guardArmed = true;
  lastGuardAt = now;
  try {
    const baseState = {
      ...(history.state || {}),
      kingdomSeedBase: true,
      guardSession: GUARD_SESSION,
    };
    history.replaceState(baseState, "", window.location.href);
    history.pushState(
      { [GUARD_STATE_KEY]: 1, guardSession: GUARD_SESSION, armedAt: now },
      "",
      window.location.href,
    );
  } catch (error) {
    console.warn("History guard unavailable:", error);
  }
}

function showExitGuard(reason: string): void {
  const now = Date.now();
  if (allowExit || !exitModal || !flags().isMobile || !activated) return;
  if (document.visibilityState !== "visible") return;
  if (exitModal.isConnected && !exitModal.classList.contains("hidden")) return;
  if (
    now < suppressExitGuardUntil ||
    now - lastPointerAt < 900 ||
    now - lastSceneReadyAt < 2600 ||
    now - lastGuardAt < 1300
  ) {
    window.setTimeout(() => armBackGuard(true), 60);
    return;
  }
  emitEmergencySave(reason);
  safeShow(exitModal);
  suppressExitGuardUntil = now + 1400;
  window.setTimeout(() => armBackGuard(true), 80);
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate?.(24);
    } catch {
      /* ignore */
    }
  }
}

function installBackGuard(): void {
  const markPointer = (): void => {
    lastPointerAt = Date.now();
  };
  document.addEventListener("pointerdown", markPointer, { passive: true });
  document.addEventListener("touchstart", markPointer, { passive: true });

  window.addEventListener("popstate", (event) => {
    if (allowExit || !flags().isMobile) return;
    const now = Date.now();
    const state = event.state as Record<string, unknown> | null;
    if (state?.[GUARD_STATE_KEY]) return;
    if (
      !activated ||
      now < suppressExitGuardUntil ||
      now - lastPointerAt < 900 ||
      now - lastSceneReadyAt < 2600
    ) {
      window.setTimeout(() => armBackGuard(true), 80);
      return;
    }
    showExitGuard("popstate");
  });

  window.addEventListener("pagehide", () => {
    if (!allowExit) emitEmergencySave("pagehide");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !allowExit) emitEmergencySave("visibility-hidden");
    if (!document.hidden && activated && flags().isMobile) {
      suppressExitGuardUntil = Date.now() + 1600;
      window.setTimeout(() => armBackGuard(true), 240);
    }
  });
}

function installImmersiveMode(): void {
  const tryRestore = (): void => {
    if (!activated || !flags().isMobile) return;
    window.setTimeout(() => void requestFullscreenAndLandscape(), 640);
  };
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) window.setTimeout(tryRestore, 220);
  });
  document.addEventListener("fullscreenchange", () => {
    if (flags().isMobile) window.setTimeout(tryRestore, 140);
  });
  window.addEventListener("focus", () => {
    if (flags().isMobile) window.setTimeout(tryRestore, 180);
  });
}

export function installWebShell(): void {
  ensureShellStyles();
  updateOrientationClass();
  window.addEventListener("resize", updateOrientationClass);
  window.visualViewport?.addEventListener("resize", updateOrientationClass);
  window.visualViewport?.addEventListener("scroll", updateOrientationClass);
  window.addEventListener("orientationchange", () =>
    setTimeout(updateOrientationClass, 120),
  );
  document.addEventListener("fullscreenchange", updateOrientationClass);
  window.addEventListener("kingdom-seed:scene-ready", markSceneReady);
  window.addEventListener("error", (event) =>
    showBootError("runtime", event.error ?? event.message),
  );
  window.addEventListener("unhandledrejection", (event) =>
    showBootError("promise", event.reason),
  );
  createStartGate();
  createExitModal();
  installBackGuard();
  installImmersiveMode();
}

export function requestGameFullscreen(): Promise<void> {
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  window.setTimeout(() => armBackGuard(true), 900);
  return requestFullscreenAndLandscape();
}
