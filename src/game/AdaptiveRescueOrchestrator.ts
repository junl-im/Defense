import Phaser from "phaser";
import { setRuntimeQualityTier } from "./QualityManager";
import { pauseOptionalWork } from "./RuntimeLoadGovernor";

export type AdaptiveRescueLevel = "off" | "watch" | "safe" | "emergency";

export type AdaptiveRescueSnapshot = {
  enabled: boolean;
  level: AdaptiveRescueLevel;
  reason: string;
  averageFps: number;
  worstDelayMs: number;
  tinyViewport: boolean;
  crampedViewport: boolean;
  offline: boolean;
  weakNetwork: boolean;
  reducedMotion: boolean;
  updatedAt: number;
};

type SceneRescueState = {
  root: Phaser.GameObjects.Container;
  badge: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  detail: Phaser.GameObjects.Text;
  expanded: boolean;
};

const WIRED_SCENES = new WeakSet<Phaser.Scene>();
const SCENE_STATES = new WeakMap<Phaser.Scene, SceneRescueState>();
const STORAGE_AUTO_KEY = "ksAdaptiveAutoRescue";
const STORAGE_LAST_REASON_KEY = "ksAdaptiveAutoRescueReason";
const STORAGE_LAST_AT_KEY = "ksAdaptiveAutoRescueAt";
const STORAGE_EMERGENCY_KEY = "ksEmergencyFallback";
const STORAGE_SAFE_GFX_KEY = "ksSafeGfx";
const STORAGE_READABLE_KEY = "ksReadableUi";
const STORAGE_CONTRAST_KEY = "ksContrastUi";
const STORAGE_REDUCE_MOTION_KEY = "ksReduceMotion";

let globalSnapshot: AdaptiveRescueSnapshot = {
  enabled: false,
  level: "off",
  reason: "boot",
  averageFps: 60,
  worstDelayMs: 0,
  tinyViewport: false,
  crampedViewport: false,
  offline: false,
  weakNetwork: false,
  reducedMotion: false,
  updatedAt: Date.now(),
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function disabled(): boolean {
  const qs = query();
  return qs.has("noautorescue") || qs.has("legacyrescue") || qs.has("nofallbacksuite") || qs.has("toydebug");
}

function forced(): boolean {
  const qs = query();
  return qs.has("autorescue") || qs.has("rescueui") || qs.has("fallbacksuite") || qs.has("adaptivefallback");
}

function debugPanel(): boolean {
  const qs = query();
  return qs.has("rescuepanel") || qs.has("rescueui") || qs.has("fallbackpanel") || qs.has("autorescuedebug");
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
    // Storage can be blocked in some mobile webviews. Runtime classes/events still apply.
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function hasClass(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(name);
}

function networkHints(): { offline: boolean; weakNetwork: boolean } {
  if (typeof navigator === "undefined") return { offline: false, weakNetwork: false };
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    onLine?: boolean;
  };
  const effectiveType = nav.connection?.effectiveType ?? "";
  return {
    offline: nav.onLine === false,
    weakNetwork: Boolean(nav.connection?.saveData) || effectiveType === "slow-2g" || effectiveType === "2g",
  };
}

function viewportHints(): { tinyViewport: boolean; crampedViewport: boolean } {
  if (typeof window === "undefined") return { tinyViewport: false, crampedViewport: false };
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  return {
    tinyViewport: shortSide <= 375 || longSide <= 700,
    crampedViewport: shortSide <= 430 || longSide <= 780,
  };
}

function motionHint(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function computeInitialSnapshot(): AdaptiveRescueSnapshot {
  const net = networkHints();
  const viewport = viewportHints();
  const saved = readStorage(STORAGE_AUTO_KEY) === "1";
  const emergencySaved = readStorage(STORAGE_EMERGENCY_KEY) === "1";
  const runtimeLockdown = hasClass("ks-runtime-lockdown") || hasClass("ks-engine-lockdown");
  const runtimeWatch = hasClass("ks-runtime-watch") || hasClass("ks-engine-safe");
  const isForced = forced();
  const shouldEnable = !disabled() && (isForced || saved || emergencySaved || runtimeLockdown || runtimeWatch || net.offline || viewport.tinyViewport);
  const level: AdaptiveRescueLevel = emergencySaved || runtimeLockdown ? "emergency" : saved || runtimeWatch || net.offline || viewport.tinyViewport ? "safe" : shouldEnable ? "watch" : "off";
  return {
    enabled: shouldEnable,
    level,
    reason: readStorage(STORAGE_LAST_REASON_KEY) ?? (level === "off" ? "standard" : "boot-hints"),
    averageFps: 60,
    worstDelayMs: 0,
    tinyViewport: viewport.tinyViewport,
    crampedViewport: viewport.crampedViewport,
    offline: net.offline,
    weakNetwork: net.weakNetwork,
    reducedMotion: motionHint(),
    updatedAt: Date.now(),
  };
}

function rank(level: AdaptiveRescueLevel): number {
  if (level === "emergency") return 3;
  if (level === "safe") return 2;
  if (level === "watch") return 1;
  return 0;
}

function publishSnapshot(snapshot: AdaptiveRescueSnapshot): void {
  globalSnapshot = snapshot;
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.toggle("ks-auto-rescue", snapshot.enabled && snapshot.level !== "off");
    root.classList.toggle("ks-auto-rescue-watch", snapshot.level === "watch");
    root.classList.toggle("ks-auto-rescue-safe", snapshot.level === "safe");
    root.classList.toggle("ks-auto-rescue-emergency", snapshot.level === "emergency");
    root.classList.toggle("ks-auto-rescue-tiny", snapshot.tinyViewport);
    root.classList.toggle("ks-auto-rescue-offline", snapshot.offline);
    root.style.setProperty("--ks-auto-rescue-alpha", snapshot.level === "emergency" ? ".96" : snapshot.level === "safe" ? ".84" : ".68");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:auto-rescue", { detail: snapshot }));
  }
}

export function getAdaptiveRescueSnapshot(): AdaptiveRescueSnapshot {
  return globalSnapshot;
}

export function applyAdaptiveAutoRescue(level: Exclude<AdaptiveRescueLevel, "off">, reason: string, metrics: Partial<AdaptiveRescueSnapshot> = {}): AdaptiveRescueSnapshot {
  if (disabled()) return globalSnapshot;
  const currentLevel = globalSnapshot.level;
  const nextLevel = rank(level) > rank(currentLevel) ? level : currentLevel === "off" ? level : currentLevel;
  const now = Date.now();
  writeStorage(STORAGE_AUTO_KEY, "1");
  writeStorage(STORAGE_LAST_REASON_KEY, reason);
  writeStorage(STORAGE_LAST_AT_KEY, String(now));
  writeStorage(STORAGE_SAFE_GFX_KEY, "1");
  writeStorage(STORAGE_REDUCE_MOTION_KEY, "1");
  if (nextLevel === "safe") {
    if (readStorage(STORAGE_READABLE_KEY) !== "huge") writeStorage(STORAGE_READABLE_KEY, "large");
  }
  if (nextLevel === "emergency") {
    writeStorage(STORAGE_EMERGENCY_KEY, "1");
    writeStorage(STORAGE_READABLE_KEY, "huge");
    writeStorage(STORAGE_CONTRAST_KEY, "1");
  }
  setRuntimeQualityTier("low");
  pauseOptionalWork(`auto-rescue:${reason}`, nextLevel === "emergency" ? 30000 : 16000);
  const net = networkHints();
  const viewport = viewportHints();
  const snapshot: AdaptiveRescueSnapshot = {
    ...globalSnapshot,
    ...metrics,
    enabled: true,
    level: nextLevel,
    reason,
    tinyViewport: viewport.tinyViewport,
    crampedViewport: viewport.crampedViewport,
    offline: net.offline,
    weakNetwork: net.weakNetwork,
    reducedMotion: true,
    updatedAt: now,
  };
  publishSnapshot(snapshot);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { reason, mode: nextLevel, at: now } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:graphic-fallback-refresh", { detail: { reason, safe: true, at: now } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:memory-pressure", { detail: { reason: `auto-rescue-${reason}`, at: now } }));
  }
  return snapshot;
}

export function clearAdaptiveAutoRescue(): AdaptiveRescueSnapshot {
  removeStorage(STORAGE_AUTO_KEY);
  removeStorage(STORAGE_LAST_REASON_KEY);
  removeStorage(STORAGE_LAST_AT_KEY);
  const snapshot = computeInitialSnapshot();
  publishSnapshot(snapshot);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { reason: "auto-rescue-clear", at: Date.now() } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:graphic-fallback-refresh", { detail: { reason: "auto-rescue-clear", at: Date.now() } }));
  }
  return snapshot;
}

export function installAdaptiveRescueOrchestrator(scene: Phaser.Scene): void {
  if (WIRED_SCENES.has(scene) || disabled()) return;
  WIRED_SCENES.add(scene);

  publishSnapshot(computeInitialSnapshot());
  if (globalSnapshot.enabled || debugPanel()) ensureRescueChip(scene, globalSnapshot);

  let lastSampleAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  let sampleCount = 0;
  let lowFpsCount = 0;
  let hitchCount = 0;
  let worstDelayMs = 0;
  let fpsTotal = 0;
  let lastAppliedAt = 0;

  const applyIfNeeded = (level: Exclude<AdaptiveRescueLevel, "off">, reason: string, fps: number, delayMs: number): void => {
    const now = Date.now();
    if (now - lastAppliedAt < 9000 && rank(level) <= rank(globalSnapshot.level)) return;
    lastAppliedAt = now;
    applyAdaptiveAutoRescue(level, reason, {
      averageFps: Math.round(fps),
      worstDelayMs: Math.round(delayMs),
    });
    updateRescueChip(scene, globalSnapshot);
  };

  const sample = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const delayMs = Math.max(0, now - lastSampleAt);
    lastSampleAt = now;
    const loop = scene.game.loop as unknown as { actualFps?: number };
    const fps = Number.isFinite(loop.actualFps) && Number(loop.actualFps) > 0 ? Number(loop.actualFps) : 1000 / Math.max(16, delayMs / 2);
    sampleCount += 1;
    fpsTotal += fps;
    worstDelayMs = Math.max(worstDelayMs, delayMs);
    if (fps < 24) lowFpsCount += 1;
    if (delayMs > 1500) hitchCount += 1;

    const net = networkHints();
    const viewport = viewportHints();
    const runtimeLockdown = hasClass("ks-runtime-lockdown") || hasClass("ks-engine-lockdown");
    const runtimeWatch = hasClass("ks-runtime-watch") || hasClass("ks-engine-safe");
    const avgFps = fpsTotal / Math.max(1, sampleCount);

    let next: AdaptiveRescueSnapshot = {
      ...globalSnapshot,
      enabled: globalSnapshot.enabled || runtimeWatch || runtimeLockdown || net.offline || viewport.tinyViewport || forced(),
      level: globalSnapshot.level === "off" && (runtimeWatch || net.offline || viewport.tinyViewport || forced()) ? "watch" : globalSnapshot.level,
      reason: globalSnapshot.reason,
      averageFps: Math.round(avgFps),
      worstDelayMs: Math.round(worstDelayMs),
      tinyViewport: viewport.tinyViewport,
      crampedViewport: viewport.crampedViewport,
      offline: net.offline,
      weakNetwork: net.weakNetwork,
      reducedMotion: motionHint() || readStorage(STORAGE_REDUCE_MOTION_KEY) === "1",
      updatedAt: Date.now(),
    };
    publishSnapshot(next);
    updateRescueChip(scene, next);

    if (runtimeLockdown || hitchCount >= 2 || lowFpsCount >= 4 || avgFps < 18) {
      applyIfNeeded("emergency", runtimeLockdown ? "runtime-lockdown" : "sustained-frame-risk", avgFps, worstDelayMs);
    } else if (runtimeWatch || hitchCount >= 1 || lowFpsCount >= 2 || avgFps < 26 || net.offline || viewport.tinyViewport) {
      applyIfNeeded("safe", net.offline ? "offline-safe" : viewport.tinyViewport ? "tiny-viewport-safe" : "frame-watch-safe", avgFps, worstDelayMs);
    }

    if (sampleCount >= 5) {
      sampleCount = 0;
      lowFpsCount = 0;
      hitchCount = 0;
      worstDelayMs = 0;
      fpsTotal = 0;
    }
  };

  const runtimeHealth = (event: Event): void => {
    const detail = (event as CustomEvent<{ tier?: string; averageFps?: number; worstFrameMs?: number; reason?: string }>).detail;
    if (detail?.tier === "lockdown") {
      applyIfNeeded("emergency", detail.reason ?? "runtime-lockdown", detail.averageFps ?? 18, detail.worstFrameMs ?? 900);
    } else if (detail?.tier === "watch") {
      applyIfNeeded("safe", detail.reason ?? "runtime-watch", detail.averageFps ?? 26, detail.worstFrameMs ?? 420);
    }
  };

  const memoryPressure = (): void => applyIfNeeded("safe", "memory-pressure", globalSnapshot.averageFps, Math.max(globalSnapshot.worstDelayMs, 420));
  const offline = (): void => applyIfNeeded("safe", "offline", globalSnapshot.averageFps, globalSnapshot.worstDelayMs);
  const viewportChanged = (): void => {
    const viewport = viewportHints();
    if (viewport.tinyViewport) applyIfNeeded("safe", "tiny-viewport", globalSnapshot.averageFps, globalSnapshot.worstDelayMs);
    else publishSnapshot({ ...globalSnapshot, ...viewport, updatedAt: Date.now() });
    updateRescueChip(scene, globalSnapshot);
  };

  const event = scene.time.addEvent({ delay: 1100, loop: true, callback: sample });
  scene.time.delayedCall(240, sample);
  scene.time.delayedCall(1800, sample);

  if (typeof window !== "undefined") {
    window.addEventListener("kingdom-seed:runtime-health", runtimeHealth);
    window.addEventListener("kingdom-seed:memory-pressure", memoryPressure);
    window.addEventListener("kingdom-seed:optional-work-blocked", memoryPressure);
    window.addEventListener("offline", offline);
    window.addEventListener("kingdom-seed:viewport-changed", viewportChanged);
  }

  const cleanup = (): void => {
    event.remove(false);
    if (typeof window === "undefined") return;
    window.removeEventListener("kingdom-seed:runtime-health", runtimeHealth);
    window.removeEventListener("kingdom-seed:memory-pressure", memoryPressure);
    window.removeEventListener("kingdom-seed:optional-work-blocked", memoryPressure);
    window.removeEventListener("offline", offline);
    window.removeEventListener("kingdom-seed:viewport-changed", viewportChanged);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}

function ensureRescueChip(scene: Phaser.Scene, snapshot: AdaptiveRescueSnapshot): void {
  if (SCENE_STATES.has(scene) || query().has("norescuechip")) return;
  const isBattle = scene.scene.key === "GameScene";
  const x = isBattle ? 70 : 76;
  const y = isBattle ? 132 : 88;
  const root = scene.add.container(x, y).setDepth(isBattle ? 1590 : 1190).setName("ks-auto-rescue-chip");
  const badge = scene.add.graphics();
  const label = scene.add
    .text(0, -4, "AUTO", {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "1000",
      color: "#fff0b8",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  const detail = scene.add
    .text(0, 15, statusLabel(snapshot), {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "10px",
      fontStyle: "900",
      color: "#b7d7ff",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  const zone = scene.add.zone(0, 3, 112, 54).setInteractive({ useHandCursor: true });
  root.add([badge, label, detail, zone]);
  const state: SceneRescueState = { root, badge, label, detail, expanded: false };
  SCENE_STATES.set(scene, state);
  zone.on("pointerdown", () => {
    state.expanded = !state.expanded;
    updateRescueChip(scene, globalSnapshot);
  });
  updateRescueChip(scene, snapshot);
}

function updateRescueChip(scene: Phaser.Scene, snapshot: AdaptiveRescueSnapshot): void {
  const state = SCENE_STATES.get(scene);
  if (!state) {
    if ((snapshot.enabled && snapshot.level !== "off") || debugPanel()) ensureRescueChip(scene, snapshot);
    return;
  }
  const visible = debugPanel() || (snapshot.enabled && snapshot.level !== "off");
  state.root.setVisible(visible);
  if (!visible) return;
  const width = state.expanded ? 168 : 96;
  const height = state.expanded ? 80 : 42;
  const color = snapshot.level === "emergency" ? 0x6e1f2c : snapshot.level === "safe" ? 0x0f3048 : 0x06101d;
  const rim = snapshot.level === "emergency" ? 0xffa377 : snapshot.level === "safe" ? 0x8de6ff : 0xffdf8a;
  state.badge.clear();
  state.badge.fillStyle(0x000000, 0.22).fillRoundedRect(-width / 2 + 4, -height / 2 + 5, width, height, 14);
  state.badge.fillStyle(color, 0.91).fillRoundedRect(-width / 2, -height / 2, width, height, 14);
  state.badge.lineStyle(2, rim, snapshot.level === "emergency" ? 0.9 : 0.64).strokeRoundedRect(-width / 2, -height / 2, width, height, 14);
  state.label.setText(snapshot.level === "emergency" ? "AUTO SAFE" : snapshot.level === "safe" ? "AUTO" : "WATCH");
  state.detail.setText(state.expanded ? `${statusLabel(snapshot)}\n${Math.round(snapshot.averageFps)}fps · ${snapshot.reason}` : statusLabel(snapshot));
  state.detail.setY(state.expanded ? 18 : 15);
}

function statusLabel(snapshot: AdaptiveRescueSnapshot): string {
  if (snapshot.level === "emergency") return "비상 보호";
  if (snapshot.offline) return "오프라인";
  if (snapshot.tinyViewport) return "작은 화면";
  if (snapshot.level === "safe") return "저사양 보호";
  if (snapshot.level === "watch") return "감시 중";
  return "표준";
}
