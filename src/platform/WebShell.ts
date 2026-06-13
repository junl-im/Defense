import { KINGDOM_SEED_BUILD_NAME } from "../runtime/Version";
import { markLaunchMilestone } from "../runtime/LaunchDiagnostics";
type BrowserFlags = {
  isKakaoTalk: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
};

type KingdomSeedBackNavigator = {
  currentSceneKey?: () => string | undefined;
  isHome?: () => boolean;
  goHome?: (reason: string) => boolean | Promise<boolean>;
};

declare global {
  interface Window {
    __KINGDOM_SEED_BACK_NAVIGATOR__?: KingdomSeedBackNavigator;
  }
}

let allowExit = false;
let exitModal: HTMLDivElement | undefined;
let startGate: HTMLDivElement | undefined;
let bootErrorOverlay: HTMLDivElement | undefined;
let bootWatchdogTimer: number | undefined;
let activated = false;
let sceneReady = false;
let guardArmed = false;
let shellInstalled = false;
let suppressExitGuardUntil = 0;
let lastGuardAt = 0;
let lastPointerAt = 0;
let lastSceneReadyAt = 0;
let currentShellSceneKey = "Shell";
let backHomeToast: HTMLDivElement | undefined;
let exitModalShownAt = 0;
let lastBackCommandAt = 0;
const HOME_SCENE_KEYS = new Set(["MenuScene", "MainMenuScene"]);
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


function safeReadStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    markLaunchMilestone("storage-read-blocked", { key, error });
    document.documentElement.classList.add("ks-storage-read-blocked");
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSafeModeUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("quality", "low");
  url.searchParams.set("compat", "1");
  url.searchParams.set("tapboot", "1");
  url.searchParams.set("noprewarm", "1");
  url.searchParams.set("safe", "1");
  url.searchParams.set("fallbacksuite", "1");
  url.searchParams.set("autorescue", "1");
  url.searchParams.set("safegfx", "1");
  url.searchParams.set("largeui", "1");
  url.searchParams.set("contrastui", "1");
  url.searchParams.set("reducemotion", "1");
  url.searchParams.set("q", String(Date.now()));
  return url.toString();
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
    .shell-boot-error .shell-safe-retry { background: linear-gradient(180deg, #b9f7d0, #40b56f); color: #071f11; }
    .shell-row { display: flex; gap: 12px; justify-content: center; margin-top: 14px; }
    .shell-row button { appearance: none; border: 0; border-radius: 16px; padding: 13px 24px; color: #fff; font-weight: 1000; font-size: 16px; }
    .shell-secondary { background: linear-gradient(180deg, #5d94e6, #2658b5); }
    .shell-danger { background: linear-gradient(180deg, #ff8d86, #b43142); }
    .shell-back-toast { position: fixed; left: 50%; top: max(12px, env(safe-area-inset-top)); transform: translateX(-50%); z-index: 10070; min-width: 190px; max-width: min(420px, 86vw); padding: 11px 16px; border-radius: 999px; border: 1px solid rgba(255,218,123,.74); background: linear-gradient(180deg, rgba(16,35,64,.96), rgba(5,10,20,.96)); color: #fff0b8; text-align: center; font-weight: 1000; font-size: 14px; letter-spacing: .01em; box-shadow: 0 16px 42px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.16); pointer-events: none; }
    .shell-back-toast.hidden { display: none !important; }
    @keyframes ksTapPulseV48 { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.07); filter: brightness(1.12); } }
  `;
  document.head.appendChild(style);
}


function syncAdaptiveFallbackShellClasses(info: BrowserFlags): void {
  const query = new URLSearchParams(window.location.search);
  const disabled = query.has("nofallbacksuite") || query.has("legacyfallback") || query.has("toydebug");
  const autoRescue = !disabled && (query.has("autorescue") || query.has("rescueui") || safeReadStorage("ksAdaptiveAutoRescue") === "1");
  const emergency = !disabled && (query.has("emergencyui") || query.has("fallbacksuite") || safeReadStorage("ksEmergencyFallback") === "1");
  const safeGfx = !disabled && (autoRescue || emergency || query.has("safegfx") || query.has("fallbackgfx") || safeReadStorage("ksSafeGfx") === "1");
  const readable = !disabled && (autoRescue || emergency || query.has("largeui") || query.has("hugeui") || query.has("fallbackui") || safeReadStorage("ksReadableUi") !== null || info.isMobile);
  const contrast = !disabled && (emergency || query.has("contrastui") || query.has("highcontrast") || safeReadStorage("ksContrastUi") === "1");
  const reduceMotion = !disabled && (autoRescue || emergency || query.has("reducemotion") || query.has("battery") || safeReadStorage("ksReduceMotion") === "1");
  const root = document.documentElement;
  root.classList.toggle("ks-adaptive-fallback", readable || contrast || safeGfx || reduceMotion || emergency || autoRescue);
  root.classList.toggle("ks-auto-rescue", autoRescue);
  root.classList.toggle("ks-adaptive-emergency", emergency);
  root.classList.toggle("ks-adaptive-readable", readable);
  root.classList.toggle("ks-adaptive-contrast", contrast);
  root.classList.toggle("ks-adaptive-safe-gfx", safeGfx);
  root.classList.toggle("ks-adaptive-reduce-motion", reduceMotion);
  root.style.setProperty("--ks-adaptive-fallback-alpha", contrast || emergency ? ".94" : ".78");
}


function syncSupremeDesignShellClasses(info: BrowserFlags): void {
  const query = new URLSearchParams(window.location.search);
  const disabled = query.has("nodesignsystem") || query.has("nosupremedesign") || query.has("legacydesign") || query.has("plainui") || query.has("toydebug");
  const savedDesign = safeReadStorage("ksSupremeDesign");
  const savedEmergency = safeReadStorage("ksEmergencyFallback") === "1";
  const safeDesign = !disabled && (savedEmergency || query.has("safedesign") || query.has("essentialdesign") || safeReadStorage("ksSafeGfx") === "1");
  const accessibleDesign = !disabled && (query.has("accessibledesign") || query.has("readabledesign") || query.has("contrastdesign") || safeReadStorage("ksContrastUi") === "1" || savedDesign === "accessible");
  const supremeDesign = !disabled && (query.has("supremedesign") || query.has("prestigedesign") || query.has("premiumdesign") || savedDesign === "supreme" || (!safeDesign && !accessibleDesign));
  const root = document.documentElement;
  root.classList.toggle("ks-supreme-design", !disabled);
  root.classList.toggle("ks-supreme-design-rich", supremeDesign);
  root.classList.toggle("ks-supreme-design-essential", safeDesign || savedDesign === "essential");
  root.classList.toggle("ks-supreme-design-accessible", accessibleDesign);
  root.classList.toggle("ks-supreme-design-safe", safeDesign);
  root.classList.toggle("ks-supreme-design-contrast", accessibleDesign || query.has("highcontrast") || query.has("contrastui"));
  root.style.setProperty("--ks-supreme-design-alpha", accessibleDesign ? "1.12" : safeDesign ? ".82" : "1");
  root.style.setProperty("--ks-supreme-design-density", safeDesign ? ".68" : accessibleDesign ? ".90" : "1");
  root.classList.toggle("ks-supreme-design-mobile", info.isMobile);
}

function syncDefenseUiFocusShellClasses(info: BrowserFlags): void {
  const query = new URLSearchParams(window.location.search);
  const disabled = query.has("nouifocus") || query.has("nodeclutter") || query.has("legacyclutter") || query.has("toydebug");
  const saved = safeReadStorage("ksDefenseUiFocus");
  const forcedClean = query.has("cleanui") || query.has("defenseui") || query.has("uireset") || query.has("declutterui");
  const forcedFocus = query.has("focusui") || query.has("battlefocus") || query.has("onehandui");
  const forcedEssential = query.has("essentialui") || query.has("simpleui") || query.has("minimalui") || query.has("lowclutter");
  const legacy = disabled || query.has("maximalui") || query.has("fullhud") || saved === "legacy";
  const root = document.documentElement;
  const enabled = !legacy && (info.isMobile || forcedClean || forcedFocus || forcedEssential || saved === "focus" || saved === "essential" || saved === "clean");
  const autoMobileFocus = enabled && info.isMobile && !forcedClean && !forcedFocus && !forcedEssential && !saved;
  root.classList.toggle("ks-defense-ui-focus", enabled);
  root.classList.toggle("ks-defense-ui-clean", enabled && !autoMobileFocus && !forcedFocus && !forcedEssential && saved !== "focus" && saved !== "essential");
  root.classList.toggle("ks-defense-ui-focus-mode", enabled && (autoMobileFocus || forcedFocus || saved === "focus"));
  root.classList.toggle("ks-defense-ui-essential", enabled && (forcedEssential || saved === "essential"));
  root.classList.toggle("ks-defense-ui-legacy", !enabled);
  root.style.setProperty("--ks-defense-ui-decor-alpha", forcedEssential || saved === "essential" ? ".42" : forcedFocus || saved === "focus" ? ".58" : ".70");
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
    safeReadStorage("ksViewportFit") ??
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

function syncReadabilityShellClasses(info: BrowserFlags): void {
  const query = new URLSearchParams(window.location.search);
  const disabled = query.has("tinyui") || query.has("compactui") || query.has("legacyreadability") || query.has("toydebug");
  const savedReadable = safeReadStorage("ksReadableUi");
  const savedContrast = safeReadStorage("ksContrastUi");
  const viewport = window.visualViewport;
  const shortSide = Math.min(viewport?.width ?? window.innerWidth, viewport?.height ?? window.innerHeight);
  const forcedLarge = query.has("largeui") || query.has("hugeui") || query.has("clarityui") || savedReadable === "large" || savedReadable === "huge";
  const highContrast = query.has("contrastui") || query.has("highcontrast") || query.has("fallbackui") || savedContrast === "1";
  const root = document.documentElement;
  const shellReadable = !disabled && (info.isMobile || forcedLarge || shortSide <= 430);
  root.classList.toggle("ks-shell-readable", shellReadable);
  root.classList.toggle("ks-shell-large-ui", shellReadable && (forcedLarge || shortSide <= 390));
  root.classList.toggle("ks-shell-huge-ui", !disabled && (query.has("hugeui") || savedReadable === "huge"));
  root.classList.toggle("ks-shell-contrast-ui", !disabled && highContrast);
  root.style.setProperty("--ks-shell-readable-scale", shellReadable ? (query.has("hugeui") || savedReadable === "huge" ? "1.28" : forcedLarge ? "1.18" : "1.10") : "1");
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
  markLaunchMilestone("shell-overlay-fade-remove", { id: el.id || el.className });
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

function isExitModalVisible(): boolean {
  return Boolean(exitModal?.isConnected && !exitModal.classList.contains("hidden"));
}

function backNavigator(): KingdomSeedBackNavigator | undefined {
  return window.__KINGDOM_SEED_BACK_NAVIGATOR__;
}

function currentGameSceneKey(): string {
  try {
    return backNavigator()?.currentSceneKey?.() ?? currentShellSceneKey;
  } catch {
    return currentShellSceneKey;
  }
}

function isGameHomeScene(): boolean {
  try {
    const navigatorHome = backNavigator()?.isHome?.();
    if (typeof navigatorHome === "boolean") return navigatorHome;
  } catch {
    // Fall back to the last shell scene-ready signal.
  }
  return HOME_SCENE_KEYS.has(currentShellSceneKey) || currentShellSceneKey === "Shell";
}

function showBackHomeToast(message = "첫 화면으로 돌아갑니다"): void {
  if (!backHomeToast) {
    backHomeToast = document.createElement("div");
    backHomeToast.id = "back-home-toast";
    backHomeToast.className = "shell-back-toast hidden";
    document.body.appendChild(backHomeToast);
  }
  backHomeToast.textContent = message;
  safeShow(backHomeToast);
  window.setTimeout(() => safeHide(backHomeToast!), 1500);
}

function performBrowserExit(reason: string): void {
  allowExit = true;
  if (exitModal) safeHide(exitModal);
  exitModalShownAt = 0;
  emitEmergencySave(reason);
  try {
    history.back();
  } catch {
    // Browser history may be unavailable in a locked webview.
  }
  window.setTimeout(() => {
    try {
      window.close();
    } catch {
      // ignore
    }
    if (!document.hidden) window.location.href = "about:blank";
  }, 160);
}

function requestGameHome(reason: string): boolean {
  if (!activated) return false;
  if (isGameHomeScene()) return false;
  emitEmergencySave(reason);
  markLaunchMilestone("mobile-back-home-requested", { reason, scene: currentGameSceneKey() });
  document.documentElement.classList.add("ks-back-home-requested");
  if (exitModal) safeHide(exitModal);
  exitModalShownAt = 0;
  suppressExitGuardUntil = Date.now() + 1200;
  window.setTimeout(() => armBackGuard(true), 80);
  showBackHomeToast("첫 화면으로 이동");
  const nav = backNavigator();
  if (!nav?.goHome) return false;
  try {
    const handled = nav.goHome(reason);
    if (handled instanceof Promise) {
      void handled.catch((error) => {
        console.warn("Back-to-home navigation failed:", error);
        window.dispatchEvent(new CustomEvent("kingdom-seed:back-home-request", { detail: { reason, at: Date.now() } }));
      });
      return true;
    }
    if (handled) return true;
  } catch (error) {
    console.warn("Back-to-home navigator failed:", error);
  }
  window.dispatchEvent(new CustomEvent("kingdom-seed:back-home-request", { detail: { reason, at: Date.now() } }));
  return false;
}

function handleMobileBackCommand(reason: string): void {
  if (allowExit || !flags().isMobile) return;
  const now = Date.now();
  if (now - lastBackCommandAt < 240) {
    // Some Android WebViews emit duplicate popstate events for one gesture.
    // Never let an echo count as the second exit-confirm back press.
    window.setTimeout(() => armBackGuard(true), 40);
    return;
  }
  lastBackCommandAt = now;
  if (isExitModalVisible()) {
    if (now - exitModalShownAt < 420) {
      window.setTimeout(() => armBackGuard(true), 40);
      return;
    }
    performBrowserExit(`${reason}:second-back`);
    return;
  }
  if (!activated) {
    showExitGuard(reason);
    return;
  }
  if (requestGameHome(reason)) return;
  showExitGuard(reason);
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


function updateGateNote(text: string): void {
  const note = startGate?.querySelector<HTMLElement>(".shell-loading-text");
  if (note) note.textContent = text;
}

function showBootError(reason: string, error: unknown): void {
  const message = formatBootError(error);
  markLaunchMilestone("boot-error-visible", { reason, message });
  console.error("[Kingdom Seed boot error]", reason, error);
  if (!bootErrorOverlay) {
    bootErrorOverlay = document.createElement("div");
    bootErrorOverlay.className = "shell-boot-error";
    document.body.appendChild(bootErrorOverlay);
  }
  const safeReason = escapeHtml(reason);
  const safeMessage = escapeHtml(message.slice(0, 220));
  bootErrorOverlay.innerHTML = `
    <div>시작 화면 초기화 중 문제가 감지됐어요.</div>
    <div style="margin-top:4px;opacity:.82;font-size:10px;word-break:break-word;">${safeReason}: ${safeMessage}</div>
    <button type="button" class="shell-safe-retry">안전 모드로 다시 시도</button>
    <button type="button" class="shell-plain-retry">그냥 새로고침</button>`;
  bootErrorOverlay
    .querySelector(".shell-safe-retry")
    ?.addEventListener("click", () => window.location.replace(buildSafeModeUrl()), { once: true });
  bootErrorOverlay
    .querySelector(".shell-plain-retry")
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
  syncReadabilityShellClasses(info);
  syncAdaptiveFallbackShellClasses(info);
  syncSupremeDesignShellClasses(info);
  syncDefenseUiFocusShellClasses(info);

  root.classList.toggle(
    "ks-hit-debug",
    new URLSearchParams(window.location.search).has("hit") ||
      safeReadStorage("ksHitDebug") === "1",
  );

  // v2.35: do not dispatch a native resize from inside the resize handler.
  // Some mobile browsers can echo it back and create a resize storm.  Send only
  // our custom viewport event, coalesced more aggressively in safe mode.
  const resizeBursts = document.documentElement.classList.contains("ks-engine-safe") ? [0, 260] : [0, 120, 360];
  resizeBursts.forEach((delay) => {
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("kingdom-seed:viewport-changed", {
          detail: { landscape, mobile: info.isMobile, at: Date.now(), source: "web-shell" },
        }),
      );
    }, delay);
  });
}

function markSceneReady(event?: Event): void {
  const detail = (event as CustomEvent<{ scene?: string }> | undefined)?.detail;
  if (detail?.scene) currentShellSceneKey = detail.scene;
  markLaunchMilestone("web-shell-scene-ready", { activated, scene: currentShellSceneKey });
  sceneReady = true;
  document.documentElement.classList.add("ks-scene-ready");
  if (bootWatchdogTimer !== undefined) {
    window.clearTimeout(bootWatchdogTimer);
    bootWatchdogTimer = undefined;
  }
  lastSceneReadyAt = Date.now();
  if (startGate) {
    const note = startGate.querySelector<HTMLElement>(".shell-loading-text");
    if (note) note.textContent = activated ? "로그인 화면 진입 중..." : "준비 완료: 탭하면 바로 입장합니다";
  }
  if (activated) {
    fadeRemove(startGate);
  } else {
    // v2.35.7: 엔진은 이미 준비됐지만 모바일 탭이 아직 없는 상태일 수 있다.
    // 사용자가 같은 시작 게이트를 다시 누르면 즉시 제거되도록 한 번 더 안전 리스너를 건다.
    startGate?.addEventListener("pointerdown", () => fadeRemove(startGate), { once: true });
    startGate?.addEventListener("click", () => fadeRemove(startGate), { once: true });
  }
  suppressExitGuardUntil = Date.now() + 2800;
}

async function activateGameShell(): Promise<void> {
  if (activated) return;
  markLaunchMilestone("web-shell-activated");
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  document.documentElement.classList.add("ks-user-activated");
  if (startGate) {
    const note = startGate.querySelector<HTMLElement>(".shell-loading-text");
    if (note) note.textContent = "탭 확인, 엔진 상태 확인 중...";
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
  window.setTimeout(() => {
    if (!sceneReady) {
      const note = startGate?.querySelector<HTMLElement>(".shell-loading-text");
      if (note) note.textContent = "엔진 준비 중... 잠시 후 자동으로 열립니다";
      return;
    }
    fadeRemove(startGate);
  }, 900);
}

function createStartGate(): void {
  const info = flags();
  markLaunchMilestone("start-gate-create", { mobile: info.isMobile, desktop: info.isDesktop });
  if (info.isDesktop) {
    activated = true;
    window.setTimeout(
      () =>
        window.dispatchEvent(new CustomEvent("kingdom-seed:user-activated")),
      0,
    );
    return;
  }
  const existingGate = document.getElementById("start-gate") as HTMLDivElement | null;
  startGate = existingGate ?? document.createElement("div");
  startGate.id = "start-gate";
  startGate.className = "shell-overlay shell-start-gate";
  if (!startGate.innerHTML.trim()) {
    startGate.innerHTML = `
      <div class="shell-start-card" role="button" aria-label="게임 시작">
        <div class="shell-title-mark">KINGDOM SEED</div>
        <div class="shell-title-sword"></div>
        <h1>탭해서 시작</h1>
        <p>사운드와 화면을 준비하고 바로 진입합니다.</p>
        <div class="shell-tap-rune">TAP</div>
        <div class="shell-loading-text">${KINGDOM_SEED_BUILD_NAME} 실행 안정화</div>
      </div>`;
  } else {
    const note = startGate.querySelector<HTMLElement>(".shell-loading-text");
    if (note) note.textContent = `${KINGDOM_SEED_BUILD_NAME} 실행 안정화`;
  }
  if (!existingGate) document.body.appendChild(startGate);
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
    if (note) note.textContent = "로딩이 느립니다. 화면을 한 번 더 탭하거나 안전 모드로 재시도할 수 있어요";
    markLaunchMilestone("start-gate-watchdog-soft-timeout", { activated, sceneReady });
  }, 4200);
  window.setTimeout(() => {
    if (sceneReady) return;
    markLaunchMilestone("start-gate-watchdog-hard-timeout", { activated, sceneReady });
    if (activated) showBootError("scene-ready-timeout", "로그인 씬 준비 신호가 늦어지고 있습니다.");
  }, 12000);
}

function createExitModal(): void {
  exitModal = document.createElement("div");
  exitModal.id = "exit-modal";
  exitModal.className = "shell-overlay hidden";
  exitModal.innerHTML = `
    <div class="shell-panel shell-exit-panel">
      <div class="shell-kicker">EXIT GUARD</div>
      <h2>게임을 종료할까요?</h2>
      <p>뒤로가기는 게임 안에서 첫 화면으로 이동합니다. 첫 화면에서 한 번 더 누르면 종료됩니다.</p>
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
      exitModalShownAt = 0;
      suppressExitGuardUntil = Date.now() + 1200;
      window.setTimeout(() => armBackGuard(true), 80);
      window.setTimeout(() => void requestFullscreenAndLandscape(), 640);
    });
  exitModal
    .querySelector<HTMLButtonElement>("#exit-confirm-btn")
    ?.addEventListener("click", () => performBrowserExit("exit-confirm"));
}

function armBackGuard(force = false): void {
  const info = flags();
  if (!info.isMobile || allowExit) return;
  const now = Date.now();
  const currentState = history.state as Record<string, unknown> | null;
  if (currentState?.[GUARD_STATE_KEY] && currentState.guardSession === GUARD_SESSION) return;
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
  if (allowExit || !exitModal || !flags().isMobile) return;
  if (document.visibilityState !== "visible") return;
  if (exitModal.isConnected && !exitModal.classList.contains("hidden")) return;
  const immediateBack = reason.includes("popstate") || reason.includes("back");
  if (!activated && !immediateBack) return;
  if (
    !immediateBack &&
    (now < suppressExitGuardUntil ||
      now - lastPointerAt < 900 ||
      now - lastSceneReadyAt < 2600 ||
      now - lastGuardAt < 1300)
  ) {
    window.setTimeout(() => armBackGuard(true), 60);
    return;
  }
  emitEmergencySave(reason);
  exitModalShownAt = now;
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
    const state = event.state as Record<string, unknown> | null;
    if (state?.[GUARD_STATE_KEY]) return;
    armBackGuard(true);
    window.setTimeout(() => armBackGuard(true), 80);
    handleMobileBackCommand("popstate");
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
  if (shellInstalled) {
    markLaunchMilestone("web-shell-install-skipped");
    return;
  }
  shellInstalled = true;
  markLaunchMilestone("web-shell-installing");
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
  window.addEventListener("kingdom-seed:navigation-error", (event) => {
    const detail = (event as CustomEvent<{ key?: string; message?: string }>).detail;
    showBootError(`scene:${detail?.key ?? "unknown"}`, detail?.message ?? "scene transition failed");
  });
  window.addEventListener("kingdom-seed:compat-report", (event) => {
    const detail = (event as CustomEvent<{ forceCanvas?: boolean; warnings?: string[] }>).detail;
    if (detail?.forceCanvas) updateGateNote(`${KINGDOM_SEED_BUILD_NAME} · 캔버스 호환 모드`);
    else if ((detail?.warnings?.length ?? 0) > 0) updateGateNote(`${KINGDOM_SEED_BUILD_NAME} · 호환성 점검 완료`);
  });
  createStartGate();
  createExitModal();
  installBackGuard();
  if (flags().isMobile) window.setTimeout(() => armBackGuard(true), 160);
  installImmersiveMode();
  markLaunchMilestone("web-shell-installed-complete");
}

export function requestGameFullscreen(): Promise<void> {
  markLaunchMilestone("fullscreen-requested");
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  window.setTimeout(() => armBackGuard(true), 900);
  return requestFullscreenAndLandscape();
}
