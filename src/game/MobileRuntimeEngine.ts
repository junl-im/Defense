import Phaser from "phaser";
import { setRuntimeQualityTier } from "./QualityManager";

export type RuntimeNetworkClass = "offline" | "slow" | "metered" | "normal";

export type MobileRuntimeCaps = {
  isMobile: boolean;
  isLowMemory: boolean;
  isLowCore: boolean;
  networkClass: RuntimeNetworkClass;
  saveData: boolean;
  bootQuietMs: number;
  artParallelDownloads: number;
  maxProgressiveAssets: number;
  allowPremiumMenuArt: boolean;
  allowBattleArt: boolean;
  allowScenePrewarm: boolean;
  uiScale: number;
  fxBudgetScale: number;
  texturePurgeOnBattle: boolean;
  runtimeLockdown: boolean;
  label: string;
};

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
};

const FORCE_PREMIUM_PARAMS = ["fullart", "galleryart", "richart", "ultraart"];
const FORCE_SAFE_PARAMS = ["lite", "fast", "battery", "safe", "lagfix"];
let cachedCaps: MobileRuntimeCaps | undefined;
let installed = false;
let lastMemoryPressureAt = 0;

function params(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures
  }
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function hasAnyParam(keys: string[]): boolean {
  const query = params();
  return keys.some((key) => query.has(key));
}

function connectionInfo(): ConnectionLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: ConnectionLike }).connection;
}

function classifyNetwork(): RuntimeNetworkClass {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  const net = connectionInfo();
  if (net?.saveData) return "metered";
  const type = String(net?.effectiveType ?? "").toLowerCase();
  if (type.includes("2g") || type === "slow-2g") return "slow";
  if (type.includes("3g")) return "slow";
  const downlink = Number(net?.downlink ?? 10);
  if (downlink > 0 && downlink < 1.5) return "slow";
  return "normal";
}

export function detectMobileRuntime(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const coarse = Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  const smallScreen = Math.min(window.screen.width || 9999, window.screen.height || 9999) <= 920;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (coarse && smallScreen);
}

export function getMobileRuntimeCaps(): MobileRuntimeCaps {
  if (cachedCaps) return cachedCaps;
  const query = params();
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  });
  const memory = Number(nav?.deviceMemory ?? 4);
  const cores = Number(nav?.hardwareConcurrency ?? 4);
  const isMobile = detectMobileRuntime();
  const networkClass = classifyNetwork();
  const saveData = Boolean(connectionInfo()?.saveData);
  if (query.has("resetperf") || query.has("clearlockdown")) removeStorage("ksRuntimeLockdown");
  const runtimeLockdown = readStorage("ksRuntimeLockdown") === "1";
  const forcedPremium = hasAnyParam(FORCE_PREMIUM_PARAMS) || readStorage("ksFullArt") === "1";
  const forcedSafe = runtimeLockdown || hasAnyParam(FORCE_SAFE_PARAMS) || readStorage("ksFastStart") === "1";
  const isLowMemory = memory <= 4;
  const isLowCore = cores <= 4;
  const constrained = runtimeLockdown || forcedSafe || isMobile || isLowMemory || isLowCore || networkClass !== "normal" || saveData;
  const premiumUnlocked = forcedPremium && !forcedSafe && networkClass === "normal" && !saveData;
  const ultra = query.has("ultraart") && premiumUnlocked && !isLowMemory && !isLowCore;

  cachedCaps = {
    isMobile,
    isLowMemory,
    isLowCore,
    networkClass,
    saveData,
    bootQuietMs: runtimeLockdown ? 14000 : constrained ? 9000 : 3600,
    artParallelDownloads: constrained ? 1 : ultra ? 3 : 2,
    maxProgressiveAssets: runtimeLockdown ? 0 : constrained ? 0 : ultra ? 18 : premiumUnlocked ? 8 : 2,
    allowPremiumMenuArt: premiumUnlocked && !constrained,
    allowBattleArt: ultra && !isMobile,
    allowScenePrewarm: ultra && !isMobile,
    uiScale: runtimeLockdown ? 1.36 : isMobile ? 1.30 : constrained ? 1.12 : 1,
    fxBudgetScale: runtimeLockdown ? 0.32 : constrained ? 0.50 : 1,
    texturePurgeOnBattle: runtimeLockdown || constrained || isMobile,
    runtimeLockdown,
    label: runtimeLockdown ? "LOCKDOWN_MOBILE_ENGINE" : constrained ? "SAFE_MOBILE_ENGINE" : premiumUnlocked ? "PREMIUM_ART_ENGINE" : "BALANCED_ENGINE",
  };
  return cachedCaps;
}

export function resetMobileRuntimeCapsForTests(): void {
  cachedCaps = undefined;
}

export function dispatchRuntimeCaps(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:runtime-caps", {
      detail: getMobileRuntimeCaps(),
    }),
  );
}

function applyRuntimeClasses(): void {
  if (typeof document === "undefined") return;
  const caps = getMobileRuntimeCaps();
  const root = document.documentElement;
  root.classList.toggle("ks-engine-safe", caps.label === "SAFE_MOBILE_ENGINE" || caps.label === "LOCKDOWN_MOBILE_ENGINE");
  root.classList.toggle("ks-engine-lockdown", caps.label === "LOCKDOWN_MOBILE_ENGINE");
  root.classList.toggle("ks-engine-premium", caps.label === "PREMIUM_ART_ENGINE");
  root.classList.toggle("ks-engine-balanced", caps.label === "BALANCED_ENGINE");
  root.classList.toggle("ks-network-slow", caps.networkClass === "slow" || caps.networkClass === "metered" || caps.networkClass === "offline");
  root.style.setProperty("--ks-runtime-ui-scale", String(caps.uiScale));
}

function requestMemoryPressure(reason: string): void {
  const now = Date.now();
  if (now - lastMemoryPressureAt < 2400) return;
  lastMemoryPressureAt = now;
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:memory-pressure", {
      detail: { reason, at: now, caps: getMobileRuntimeCaps() },
    }),
  );
}

export function installMobileRuntimeEngine(game: Phaser.Game): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  applyRuntimeClasses();
  dispatchRuntimeCaps();

  const caps = getMobileRuntimeCaps();
  if (caps.label === "SAFE_MOBILE_ENGINE" || caps.label === "LOCKDOWN_MOBILE_ENGINE") setRuntimeQualityTier("low");

  const loop = game.loop as Phaser.Core.TimeStep & {
    sleep?: () => void;
    wake?: () => void;
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      requestMemoryPressure("visibility-hidden");
      try {
        loop.sleep?.();
      } catch {
        // Some Phaser runtimes do not expose sleep on the typed loop object.
      }
      return;
    }
    try {
      loop.wake?.();
    } catch {
      // ignore wake failures in restrictive webviews
    }
    window.setTimeout(dispatchRuntimeCaps, 120);
  });

  window.addEventListener("pagehide", () => requestMemoryPressure("pagehide"));
  window.addEventListener("blur", () => requestMemoryPressure("window-blur"));
  window.addEventListener("online", dispatchRuntimeCaps);
  window.addEventListener("kingdom-seed:runtime-lockdown", () => {
    cachedCaps = undefined;
    applyRuntimeClasses();
    dispatchRuntimeCaps();
  });
  window.addEventListener("offline", () => {
    cachedCaps = undefined;
    applyRuntimeClasses();
    dispatchRuntimeCaps();
  });

  window.setTimeout(() => {
    applyRuntimeClasses();
    dispatchRuntimeCaps();
  }, caps.bootQuietMs);
}
