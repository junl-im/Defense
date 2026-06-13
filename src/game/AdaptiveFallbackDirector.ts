import Phaser from "phaser";
import { setRuntimeQualityTier } from "./QualityManager";

export type AdaptiveFallbackProfile = {
  enabled: boolean;
  emergency: boolean;
  safeGraphics: boolean;
  highContrast: boolean;
  readable: boolean;
  reduceMotion: boolean;
  tinyViewport: boolean;
  lowDevice: boolean;
  weakNetwork: boolean;
  offline: boolean;
  label: string;
};

type AdaptivePanelState = {
  root: Phaser.GameObjects.Container;
  panel: Phaser.GameObjects.Container;
  status: Phaser.GameObjects.Text;
  emergencyMat?: Phaser.GameObjects.Graphics;
};

const WIRED_SCENES = new WeakSet<Phaser.Scene>();
const PANEL_STATES = new WeakMap<Phaser.Scene, AdaptivePanelState>();
const EMERGENCY_KEY = "ksEmergencyFallback";
const SAFE_GFX_KEY = "ksSafeGfx";
const READABLE_KEY = "ksReadableUi";
const CONTRAST_KEY = "ksContrastUi";
const REDUCE_MOTION_KEY = "ksReduceMotion";

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures in restrictive mobile webviews
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures in restrictive mobile webviews
  }
}

function hasDocumentClass(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(name);
}

function isMobileHint(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const coarse = Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  const small = Math.min(window.screen.width || 9999, window.screen.height || 9999) <= 900;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (coarse && small);
}

function viewportInfo(): { shortSide: number; longSide: number } {
  if (typeof window === "undefined") return { shortSide: 540, longSide: 960 };
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return { shortSide: Math.min(width, height), longSide: Math.max(width, height) };
}

function deviceHints(): { lowDevice: boolean; weakNetwork: boolean; offline: boolean } {
  if (typeof navigator === "undefined") return { lowDevice: false, weakNetwork: false, offline: false };
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
    onLine?: boolean;
  };
  const memory = Number(nav.deviceMemory ?? 8);
  const cores = Number(nav.hardwareConcurrency ?? 8);
  const effectiveType = String(nav.connection?.effectiveType ?? "");
  const weakNetwork = Boolean(nav.connection?.saveData) || effectiveType === "slow-2g" || effectiveType === "2g";
  const offline = nav.onLine === false;
  return {
    lowDevice: memory <= 4 || cores <= 4 || weakNetwork || offline,
    weakNetwork,
    offline,
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-contrast: more)").matches);
}

export function getAdaptiveFallbackProfile(): AdaptiveFallbackProfile {
  const qs = query();
  const disabled = qs.has("nofallbacksuite") || qs.has("legacyfallback") || qs.has("toydebug");
  const forced = qs.has("fallbacksuite") || qs.has("adaptivefallback") || qs.has("emergencyui");
  const emergencySaved = readStorage(EMERGENCY_KEY) === "1";
  const safeGfxSaved = readStorage(SAFE_GFX_KEY) === "1";
  const readableSaved = readStorage(READABLE_KEY);
  const contrastSaved = readStorage(CONTRAST_KEY) === "1";
  const reduceSaved = readStorage(REDUCE_MOTION_KEY) === "1";
  const mobile = isMobileHint();
  const { shortSide, longSide } = viewportInfo();
  const tinyViewport = shortSide <= 390 || longSide <= 740;
  const smallViewport = shortSide <= 430 || longSide <= 820;
  const hints = deviceHints();
  const lockdown = hasDocumentClass("ks-runtime-lockdown") || hasDocumentClass("ks-engine-lockdown");
  const watch = hasDocumentClass("ks-runtime-watch") || hasDocumentClass("ks-engine-safe");
  const emergency = !disabled && (forced || emergencySaved || lockdown || qs.has("fallbackui") || qs.has("safemodeui"));
  const readable = !disabled && (emergency || forced || mobile || smallViewport || readableSaved === "large" || readableSaved === "huge");
  const highContrast = !disabled && (emergency || contrastSaved || prefersHighContrast() || qs.has("highcontrast") || qs.has("contrastui"));
  const safeGraphics = !disabled && (emergency || safeGfxSaved || hints.lowDevice || watch || qs.has("safegfx") || qs.has("fallbackgfx"));
  const reduceMotion = !disabled && (emergency || reduceSaved || prefersReducedMotion() || hints.lowDevice || qs.has("reducemotion") || qs.has("battery"));
  const enabled = !disabled && (forced || emergency || readable || highContrast || safeGraphics || reduceMotion || hints.offline || tinyViewport);
  return {
    enabled,
    emergency,
    safeGraphics,
    highContrast,
    readable,
    reduceMotion,
    tinyViewport,
    lowDevice: hints.lowDevice,
    weakNetwork: hints.weakNetwork,
    offline: hints.offline,
    label: emergency
      ? "emergency-fallback"
      : safeGraphics
        ? "safe-graphics-fallback"
        : highContrast
          ? "high-contrast-fallback"
          : readable
            ? "readability-fallback"
            : "standard",
  };
}

export function applyAdaptiveFallbackRootClasses(profile = getAdaptiveFallbackProfile()): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ks-adaptive-fallback", profile.enabled);
  root.classList.toggle("ks-adaptive-emergency", profile.emergency);
  root.classList.toggle("ks-adaptive-readable", profile.readable);
  root.classList.toggle("ks-adaptive-contrast", profile.highContrast);
  root.classList.toggle("ks-adaptive-safe-gfx", profile.safeGraphics);
  root.classList.toggle("ks-adaptive-reduce-motion", profile.reduceMotion);
  root.classList.toggle("ks-adaptive-tiny", profile.tinyViewport);
  root.classList.toggle("ks-adaptive-low-device", profile.lowDevice);
  root.classList.toggle("ks-adaptive-weak-network", profile.weakNetwork);
  root.classList.toggle("ks-adaptive-offline", profile.offline);
  root.style.setProperty("--ks-adaptive-fallback-alpha", profile.highContrast ? "1" : profile.emergency ? ".92" : ".78");
}

export function enableEmergencyFallback(reason = "manual"): AdaptiveFallbackProfile {
  writeStorage(EMERGENCY_KEY, "1");
  writeStorage(READABLE_KEY, "huge");
  writeStorage(CONTRAST_KEY, "1");
  writeStorage(SAFE_GFX_KEY, "1");
  writeStorage(REDUCE_MOTION_KEY, "1");
  setRuntimeQualityTier("low");
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { reason, mode: "emergency", at: Date.now() } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:graphic-fallback-refresh", { detail: { reason, safe: true, at: Date.now() } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:memory-pressure", { detail: { reason: `adaptive-${reason}`, at: Date.now() } }));
  }
  return profile;
}

export function toggleSafeGraphicsFallback(): boolean {
  const enabled = readStorage(SAFE_GFX_KEY) !== "1";
  if (enabled) writeStorage(SAFE_GFX_KEY, "1");
  else removeStorage(SAFE_GFX_KEY);
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:graphic-fallback-refresh", { detail: { safe: enabled, at: Date.now() } }));
  }
  return enabled;
}

export function toggleReadableSizeFallback(): "normal" | "large" | "huge" {
  const current = readStorage(READABLE_KEY);
  const next: "normal" | "large" | "huge" = current === "large" ? "huge" : current === "huge" ? "normal" : "large";
  if (next === "normal") removeStorage(READABLE_KEY);
  else writeStorage(READABLE_KEY, next);
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { mode: next, at: Date.now() } }));
  }
  return next;
}

export function toggleContrastFallback(): boolean {
  const enabled = readStorage(CONTRAST_KEY) !== "1";
  if (enabled) writeStorage(CONTRAST_KEY, "1");
  else removeStorage(CONTRAST_KEY);
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { contrast: enabled, at: Date.now() } }));
  }
  return enabled;
}

export function clearAdaptiveFallbackOverrides(): AdaptiveFallbackProfile {
  removeStorage(EMERGENCY_KEY);
  removeStorage(SAFE_GFX_KEY);
  removeStorage(READABLE_KEY);
  removeStorage(CONTRAST_KEY);
  removeStorage(REDUCE_MOTION_KEY);
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { mode: "normal", at: Date.now() } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:graphic-fallback-refresh", { detail: { safe: false, at: Date.now() } }));
  }
  return profile;
}

export function installAdaptiveFallbackDirector(scene: Phaser.Scene): void {
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  if (WIRED_SCENES.has(scene)) return;
  WIRED_SCENES.add(scene);

  const refresh = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const next = getAdaptiveFallbackProfile();
    applyAdaptiveFallbackRootClasses(next);
    updateAdaptivePanel(scene, next);
    if (next.emergency || next.safeGraphics || next.highContrast) ensureEmergencyMat(scene, next);
    else removeEmergencyMat(scene);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("kingdom-seed:runtime-health", refresh);
    window.addEventListener("kingdom-seed:readability-refresh", refresh);
    window.addEventListener("kingdom-seed:graphic-fallback-refresh", refresh);
    window.addEventListener("kingdom-seed:viewport-changed", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("online", refresh);
  }

  scene.time.delayedCall(0, refresh);
  scene.time.delayedCall(260, refresh);
  scene.time.delayedCall(900, refresh);

  const qs = query();
  if (!qs.has("nofallbackpanel") && (profile.enabled || qs.has("fallbackpanel"))) installAdaptivePanel(scene, profile);

  const cleanup = (): void => {
    if (typeof window === "undefined") return;
    window.removeEventListener("kingdom-seed:runtime-health", refresh);
    window.removeEventListener("kingdom-seed:readability-refresh", refresh);
    window.removeEventListener("kingdom-seed:graphic-fallback-refresh", refresh);
    window.removeEventListener("kingdom-seed:viewport-changed", refresh);
    window.removeEventListener("offline", refresh);
    window.removeEventListener("online", refresh);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}

function installAdaptivePanel(scene: Phaser.Scene, profile: AdaptiveFallbackProfile): void {
  if (PANEL_STATES.has(scene)) return;
  const depth = scene.scene.key === "GameScene" ? 1600 : 1200;
  const chipX = scene.scene.key === "GameScene" ? 908 : 886;
  const chipY = scene.scene.key === "GameScene" ? 132 : 88;
  const root = scene.add.container(chipX, chipY).setDepth(depth).setName("ks-adaptive-fallback-panel");
  const chip = scene.add.graphics();
  chip.fillStyle(profile.emergency ? 0x9b2c2c : 0x06101d, 0.88).fillRoundedRect(-48, -20, 96, 40, 14);
  chip.lineStyle(2, profile.highContrast ? 0xfff0a8 : 0x86d8ff, 0.78).strokeRoundedRect(-48, -20, 96, 40, 14);
  const label = scene.add
    .text(0, -1, "보기", {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#fff3bf",
      stroke: "#020611",
      strokeThickness: 4,
    })
    .setOrigin(0.5);
  const zone = scene.add.zone(0, 0, 112, 52).setInteractive({ useHandCursor: true });
  root.add([chip, label, zone]);

  const panel = scene.add.container(-160, 46).setVisible(false).setName("ks-adaptive-fallback-menu");
  const bg = scene.add.graphics();
  bg.fillStyle(0x020611, 0.94).fillRoundedRect(0, 0, 220, 228, 18);
  bg.lineStyle(2, 0xffdf8a, 0.72).strokeRoundedRect(0, 0, 220, 228, 18);
  bg.fillStyle(0x0c213a, 0.82).fillRoundedRect(10, 10, 200, 34, 12);
  const title = scene.add
    .text(110, 27, "화면 대안", {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "17px",
      fontStyle: "900",
      color: "#fff4be",
      stroke: "#020611",
      strokeThickness: 4,
    })
    .setOrigin(0.5);
  const status = scene.add
    .text(110, 210, statusText(profile), {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "800",
      color: "#a8cfff",
      stroke: "#020611",
      strokeThickness: 3,
      align: "center",
    })
    .setOrigin(0.5);
  panel.add([bg, title, status]);

  addPanelButton(scene, panel, 22, 56, 176, 36, "큰 UI", () => {
    toggleReadableSizeFallback();
    refreshPanel(scene);
  });
  addPanelButton(scene, panel, 22, 98, 176, 36, "고대비", () => {
    toggleContrastFallback();
    refreshPanel(scene);
  });
  addPanelButton(scene, panel, 22, 140, 176, 36, "저사양", () => {
    toggleSafeGraphicsFallback();
    refreshPanel(scene);
  });
  addPanelButton(scene, panel, 22, 182, 82, 30, "비상", () => {
    enableEmergencyFallback("panel");
    refreshPanel(scene);
  }, true);
  addPanelButton(scene, panel, 116, 182, 82, 30, "기본", () => {
    clearAdaptiveFallbackOverrides();
    refreshPanel(scene);
  });

  root.add(panel);
  zone.on("pointerdown", () => {
    panel.setVisible(!panel.visible);
  });

  PANEL_STATES.set(scene, { root, panel, status });
}

function addPanelButton(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  onClick: () => void,
  danger = false,
): void {
  const button = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(danger ? 0x6e1f2c : 0x12365b, 0.94).fillRoundedRect(0, 0, width, height, 12);
  bg.lineStyle(1, danger ? 0xffa3a3 : 0x88d8ff, 0.54).strokeRoundedRect(0, 0, width, height, 12);
  const label = scene.add
    .text(width / 2, height / 2, text, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: height >= 34 ? "15px" : "13px",
      fontStyle: "900",
      color: danger ? "#ffe4de" : "#f4fbff",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  const zone = scene.add.zone(width / 2, height / 2, Math.max(width, 72), Math.max(height, 44)).setInteractive({ useHandCursor: true });
  zone.on("pointerdown", onClick);
  button.add([bg, label, zone]);
  panel.add(button);
}

function refreshPanel(scene: Phaser.Scene): void {
  const profile = getAdaptiveFallbackProfile();
  applyAdaptiveFallbackRootClasses(profile);
  updateAdaptivePanel(scene, profile);
  if (profile.emergency || profile.safeGraphics || profile.highContrast) ensureEmergencyMat(scene, profile);
  else removeEmergencyMat(scene);
}

function updateAdaptivePanel(scene: Phaser.Scene, profile: AdaptiveFallbackProfile): void {
  const state = PANEL_STATES.get(scene);
  if (!state) return;
  state.status.setText(statusText(profile));
  const chip = state.root.list[0];
  if (chip instanceof Phaser.GameObjects.Graphics) {
    chip.clear();
    chip.fillStyle(profile.emergency ? 0x9b2c2c : profile.safeGraphics ? 0x102c3d : 0x06101d, 0.9).fillRoundedRect(-48, -20, 96, 40, 14);
    chip.lineStyle(2, profile.highContrast ? 0xfff0a8 : 0x86d8ff, 0.82).strokeRoundedRect(-48, -20, 96, 40, 14);
  }
}

function statusText(profile: AdaptiveFallbackProfile): string {
  if (profile.emergency) return "비상 대안 적용";
  if (profile.offline) return "오프라인 보호";
  if (profile.safeGraphics && profile.highContrast) return "저사양+고대비";
  if (profile.safeGraphics) return "저사양 그래픽";
  if (profile.highContrast) return "고대비 UI";
  if (profile.readable) return "가독성 보강";
  return "표준";
}

function ensureEmergencyMat(scene: Phaser.Scene, profile: AdaptiveFallbackProfile): void {
  const state = PANEL_STATES.get(scene);
  if (!state) return;
  if (state.emergencyMat && state.emergencyMat.active) return;
  const depth = scene.scene.key === "GameScene" ? 68.92 : 4.55;
  const g = scene.add.graphics().setDepth(depth).setName("ks-adaptive-emergency-mat");
  const alpha = profile.highContrast ? 0.34 : profile.emergency ? 0.28 : 0.2;
  g.fillStyle(0x020611, alpha).fillRect(0, 0, 960, 82);
  g.fillStyle(0x020611, Math.min(0.42, alpha + 0.08)).fillRect(0, 462, 960, 78);
  g.fillGradientStyle(0x020611, 0x020611, 0x020611, 0x020611, alpha * 0.7, 0, 0, alpha * 0.7).fillRect(0, 72, 960, 390);
  g.lineStyle(profile.highContrast ? 2 : 1, profile.emergency ? 0xff9f75 : 0xffdf8a, profile.highContrast ? 0.34 : 0.2).strokeRoundedRect(12, 10, 936, 520, 20);
  state.emergencyMat = g;
}

function removeEmergencyMat(scene: Phaser.Scene): void {
  const state = PANEL_STATES.get(scene);
  if (!state?.emergencyMat) return;
  state.emergencyMat.destroy();
  state.emergencyMat = undefined;
}
