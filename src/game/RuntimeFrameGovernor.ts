import type Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { setRuntimeQualityTier } from "./QualityManager";

export type RuntimeFrameHealth = {
  tier: "stable" | "watch" | "lockdown";
  averageFps: number;
  worstFrameMs: number;
  stallCount: number;
  lockdown: boolean;
  reason: string;
  updatedAt: number;
};

const LOCKDOWN_KEY = "ksRuntimeLockdown";
const RESET_PARAMS = ["resetperf", "resetPerformance", "clearlockdown"];
let installed = false;
let health: RuntimeFrameHealth = {
  tier: "stable",
  averageFps: 60,
  worstFrameMs: 0,
  stallCount: 0,
  lockdown: false,
  reason: "boot",
  updatedAt: Date.now(),
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures in restricted webviews
  }
}

function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures in restricted webviews
  }
}

function resetRequested(): boolean {
  const params = query();
  return RESET_PARAMS.some((key) => params.has(key));
}

export function isRuntimeLockdownActive(): boolean {
  if (typeof window === "undefined") return false;
  if (resetRequested()) return false;
  return storageGet(LOCKDOWN_KEY) === "1" || document.documentElement.classList.contains("ks-runtime-lockdown") || document.documentElement.classList.contains("ks-engine-lockdown");
}

export function clearRuntimeLockdown(): void {
  if (typeof window === "undefined") return;
  storageRemove(LOCKDOWN_KEY);
  document.documentElement.classList.remove("ks-runtime-lockdown", "ks-runtime-watch");
  health = { ...health, tier: "stable", lockdown: false, reason: "manual-clear", updatedAt: Date.now() };
  window.dispatchEvent(new CustomEvent("kingdom-seed:runtime-health", { detail: health }));
}

export function getRuntimeFrameHealth(): RuntimeFrameHealth {
  return health;
}

function setRootHealthClass(next: RuntimeFrameHealth): void {
  document.documentElement.classList.toggle("ks-runtime-watch", next.tier === "watch");
  document.documentElement.classList.toggle("ks-runtime-lockdown", next.lockdown);
}

function dispatchHealth(next: RuntimeFrameHealth): void {
  health = next;
  setRootHealthClass(next);
  window.dispatchEvent(new CustomEvent("kingdom-seed:runtime-health", { detail: next }));
}

function requestRuntimeMemoryPressure(reason: string): void {
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:memory-pressure", {
      detail: { reason, at: Date.now(), health },
    }),
  );
}

function enterLockdown(reason: string, averageFps: number, worstFrameMs: number, stallCount: number): void {
  storageSet(LOCKDOWN_KEY, "1");
  setRuntimeQualityTier("low");
  dispatchHealth({
    tier: "lockdown",
    averageFps,
    worstFrameMs,
    stallCount,
    lockdown: true,
    reason,
    updatedAt: Date.now(),
  });
  requestRuntimeMemoryPressure(reason);
  window.dispatchEvent(new CustomEvent("kingdom-seed:runtime-lockdown", { detail: health }));
}

export function installRuntimeFrameGovernor(_game: Phaser.Game): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  if (resetRequested()) clearRuntimeLockdown();

  const caps = getMobileRuntimeCaps();
  const root = document.documentElement;
  const savedLockdown = storageGet(LOCKDOWN_KEY) === "1";
  if (savedLockdown) {
    setRuntimeQualityTier("low");
    dispatchHealth({
      tier: "lockdown",
      averageFps: 30,
      worstFrameMs: 0,
      stallCount: 0,
      lockdown: true,
      reason: "saved-lockdown",
      updatedAt: Date.now(),
    });
  }

  // Desktop/high quality preview does not need a watchdog unless explicitly requested.
  if (!caps.isMobile && !caps.isLowCore && !caps.isLowMemory && !query().has("watchfps")) return;

  let last = performance.now();
  let windowStart = last;
  let frames = 0;
  let worst = 0;
  let stalls = 0;
  let lastPressureAt = 0;
  const bootStartedAt = last;

  const tick = (now: number): void => {
    const delta = Math.max(0, now - last);
    last = now;
    frames += 1;
    worst = Math.max(worst, delta);

    const earlyBoot = now - bootStartedAt < Math.max(3600, caps.bootQuietMs);
    const stallMs = earlyBoot ? 780 : 420;
    if (delta > stallMs) stalls += 1;
    if (delta > 1600 && !isRuntimeLockdownActive()) {
      enterLockdown("long-frame-stall", Math.round(1000 / Math.max(1, delta)), Math.round(delta), stalls + 1);
    }

    if (now - windowStart >= 3200) {
      const elapsed = now - windowStart;
      const averageFps = Math.round((frames * 1000) / Math.max(1, elapsed));
      const shouldWatch = averageFps < 28 || worst > 440 || stalls >= 2;
      const shouldLockdown = savedLockdown || averageFps < 20 || worst > 900 || stalls >= 3;
      if (shouldLockdown && !isRuntimeLockdownActive()) {
        enterLockdown("frame-stall-governor", averageFps, Math.round(worst), stalls);
      } else {
        const next: RuntimeFrameHealth = {
          tier: isRuntimeLockdownActive() ? "lockdown" : shouldWatch ? "watch" : "stable",
          averageFps,
          worstFrameMs: Math.round(worst),
          stallCount: stalls,
          lockdown: isRuntimeLockdownActive(),
          reason: shouldWatch ? "frame-watch" : "stable",
          updatedAt: Date.now(),
        };
        dispatchHealth(next);
        if (shouldWatch && now - lastPressureAt > 9000) {
          lastPressureAt = now;
          requestRuntimeMemoryPressure("frame-watch");
        }
      }
      windowStart = now;
      frames = 0;
      worst = 0;
      stalls = 0;
    }

    if (!document.hidden) window.requestAnimationFrame(tick);
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    last = performance.now();
    window.requestAnimationFrame(tick);
  });

  root.classList.toggle("ks-runtime-lockdown", savedLockdown);
  window.requestAnimationFrame(tick);
}
