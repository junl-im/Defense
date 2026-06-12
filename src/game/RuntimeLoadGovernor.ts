import type Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";

export type OptionalWorkKind = "art" | "prewarm" | "battle-art" | "audio" | "pwa" | "firebase";

export type RuntimeLoadState = {
  bootStartedAt: number;
  optionalPauseUntil: number;
  criticalInputPauseUntil: number;
  lastSceneTransitionAt: number;
  lastUserInputAt: number;
  blockedCount: number;
  reason: string;
};

const state: RuntimeLoadState = {
  bootStartedAt: Date.now(),
  optionalPauseUntil: 0,
  criticalInputPauseUntil: 0,
  lastSceneTransitionAt: 0,
  lastUserInputAt: 0,
  blockedCount: 0,
  reason: "boot",
};

let installed = false;
let sessionProgressiveAssetBudget = 0;
let settleClassTimer = 0;
const RESERVED_ASSET_KEYS = new Set<string>();

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

function unsafeOverride(): boolean {
  const params = query();
  return params.has("ultraart") || readStorage("ksUnsafeArt") === "1";
}

function explicitArtPreview(): boolean {
  const params = query();
  return params.has("fullart") || params.has("galleryart") || params.has("richart") || unsafeOverride();
}

function networkBusy(): boolean {
  const caps = getMobileRuntimeCaps();
  return caps.networkClass === "slow" || caps.networkClass === "metered" || caps.networkClass === "offline" || caps.saveData;
}

function setInputSettleClass(pauseMs: number): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  document.documentElement.classList.add("ks-input-settle");
  if (settleClassTimer) window.clearTimeout(settleClassTimer);
  settleClassTimer = window.setTimeout(() => {
    settleClassTimer = 0;
    document.documentElement.classList.remove("ks-input-settle");
  }, Math.min(Math.max(pauseMs, 700), 4200));
}

export function getRuntimeLoadState(): RuntimeLoadState {
  return { ...state };
}

export function markUserCriticalInput(reason = "user-input", pauseMs = 2200): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  state.lastUserInputAt = now;
  state.criticalInputPauseUntil = Math.max(state.criticalInputPauseUntil, now + pauseMs);
  state.reason = reason;
  setInputSettleClass(pauseMs);
}

export function markSceneTransition(reason = "scene-transition", pauseMs = 2400): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  state.lastSceneTransitionAt = now;
  state.optionalPauseUntil = Math.max(state.optionalPauseUntil, now + pauseMs);
  state.criticalInputPauseUntil = Math.max(state.criticalInputPauseUntil, now + Math.min(pauseMs, 2600));
  state.reason = reason;
  setInputSettleClass(Math.min(pauseMs, 2600));
  window.dispatchEvent(new CustomEvent("kingdom-seed:optional-work-paused", { detail: getRuntimeLoadState() }));
}

export function pauseOptionalWork(reason = "runtime-pause", pauseMs = 4200): void {
  if (typeof window === "undefined") return;
  state.optionalPauseUntil = Math.max(state.optionalPauseUntil, Date.now() + pauseMs);
  state.reason = reason;
  window.dispatchEvent(new CustomEvent("kingdom-seed:optional-work-paused", { detail: getRuntimeLoadState() }));
}

export function optionalRuntimeWorkAllowed(kind: OptionalWorkKind, options: { scene?: Phaser.Scene; allowDuringBoot?: boolean } = {}): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const caps = getMobileRuntimeCaps();
  const now = Date.now();

  if (document.hidden) return false;
  if (options.scene && !options.scene.scene.isActive(options.scene.scene.key)) return false;
  if (now < state.optionalPauseUntil && !unsafeOverride()) return false;
  // v2.34: every tap, scene transition and orientation settle is treated as a
  // critical frame window.  Optional network/GPU work must wait, but already
  // cached click audio may still play because audio unlock feedback should feel instant.
  if (kind !== "audio" && now < state.criticalInputPauseUntil && !unsafeOverride()) return false;
  if (!options.allowDuringBoot && now - state.bootStartedAt < caps.bootQuietMs && !unsafeOverride()) return false;
  if ((caps.runtimeLockdown || caps.label === "LOCKDOWN_MOBILE_ENGINE") && !unsafeOverride()) return false;

  if (kind === "battle-art") return caps.allowBattleArt && unsafeOverride() && !networkBusy();
  if (kind === "prewarm") return caps.allowScenePrewarm && unsafeOverride() && !networkBusy();
  if (kind === "art") {
    if (!explicitArtPreview()) return false;
    if (networkBusy() && !unsafeOverride()) return false;
    return caps.maxProgressiveAssets > 0 && (caps.allowPremiumMenuArt || unsafeOverride());
  }
  if (kind === "audio") {
    if (caps.label === "LOCKDOWN_MOBILE_ENGINE") return false;
    return !networkBusy() || now - state.bootStartedAt > caps.bootQuietMs + 4200;
  }
  if (kind === "pwa" || kind === "firebase") {
    return !networkBusy() && now - state.bootStartedAt > caps.bootQuietMs && now >= state.criticalInputPauseUntil;
  }
  return false;
}

export function progressiveAssetBudgetFor(kind: "login" | "lobby" | "world" | "battle", requested: number): number {
  const caps = getMobileRuntimeCaps();
  if (kind === "battle" && !optionalRuntimeWorkAllowed("battle-art")) return 0;
  if (kind !== "battle" && !optionalRuntimeWorkAllowed("art")) return 0;
  const absoluteSessionCap = unsafeOverride() ? 36 : explicitArtPreview() ? 8 : 0;
  if (absoluteSessionCap <= 0) return 0;
  const remaining = Math.max(0, absoluteSessionCap - sessionProgressiveAssetBudget);
  const runtimeCap = Math.max(0, caps.maxProgressiveAssets);
  return Math.max(0, Math.min(requested, remaining, runtimeCap));
}

export function reserveProgressiveAssets(keys: string[]): string[] {
  const allowed = keys.filter((key) => !RESERVED_ASSET_KEYS.has(key));
  allowed.forEach((key) => RESERVED_ASSET_KEYS.add(key));
  sessionProgressiveAssetBudget += allowed.length;
  return allowed;
}

export function noteOptionalWorkBlocked(kind: OptionalWorkKind, reason = "blocked"): void {
  if (typeof window === "undefined") return;
  state.blockedCount += 1;
  state.reason = `${kind}:${reason}`;
  if (state.blockedCount % 8 === 0) {
    window.dispatchEvent(new CustomEvent("kingdom-seed:optional-work-blocked", { detail: getRuntimeLoadState() }));
  }
}

export function installRuntimeLoadGovernor(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const pauseFromEvent = (reason: string, pauseMs: number): void => pauseOptionalWork(reason, pauseMs);
  const noteInput = (): void => markUserCriticalInput("input-settle", 2100);
  window.addEventListener("pointerdown", noteInput, { passive: true });
  window.addEventListener("touchstart", noteInput, { passive: true });
  window.addEventListener("keydown", () => markUserCriticalInput("keyboard-settle", 1300));
  window.addEventListener("kingdom-seed:user-activated", () => markUserCriticalInput("user-activated", 3600));

  window.addEventListener("kingdom-seed:memory-pressure", () => pauseFromEvent("memory-pressure", 11000));
  window.addEventListener("kingdom-seed:runtime-lockdown", () => pauseFromEvent("runtime-lockdown", 24000));
  window.addEventListener("kingdom-seed:runtime-health", (event) => {
    const detail = (event as CustomEvent<{ tier?: string }>).detail;
    if (detail?.tier === "watch") pauseFromEvent("runtime-watch", 9000);
    if (detail?.tier === "lockdown") pauseFromEvent("runtime-lockdown-health", 24000);
  });
  window.addEventListener("pagehide", () => pauseFromEvent("pagehide", 9000));
  window.addEventListener("pageshow", () => pauseFromEvent("pageshow-settle", 2800));
  window.addEventListener("blur", () => pauseFromEvent("window-blur", 4200));
  window.addEventListener("offline", () => pauseFromEvent("offline", 24000));
  window.addEventListener("online", () => pauseFromEvent("online-settle", 3800));
  window.addEventListener("orientationchange", () => {
    markUserCriticalInput("orientation-settle", 3600);
    pauseFromEvent("orientation-settle", 4200);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseFromEvent("hidden", 14000);
    else pauseFromEvent("visible-settle", 3200);
  });

  window.setTimeout(() => {
    document.documentElement.classList.add("ks-load-governor-ready");
  }, Math.max(1200, getMobileRuntimeCaps().bootQuietMs));
}
