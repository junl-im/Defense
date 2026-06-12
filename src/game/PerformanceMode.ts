import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";

const params = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

function runtimeLockdownActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('ksRuntimeLockdown') === '1' || document.documentElement.classList.contains('ks-runtime-lockdown');
  } catch {
    return document.documentElement.classList.contains('ks-runtime-lockdown');
  }
}

function readLocalFlag(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function mobileRuntimeHint(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const coarse = Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  const smallScreen = Math.min(window.screen.width || 9999, window.screen.height || 9999) <= 900;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (coarse && smallScreen);
}

function lowDeviceHint(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const memory = Number(nav.deviceMemory ?? 8);
  const cores = Number(nav.hardwareConcurrency ?? 8);
  const net = nav.connection;
  const slowNet = Boolean(net?.saveData) || /(^|-)2g$/.test(String(net?.effectiveType ?? ""));
  return runtimeLockdownActive() || memory <= 4 || cores <= 4 || slowNet || mobileRuntimeHint();
}

function artOverrideEnabled(): boolean {
  return params.has("fullart") || params.has("galleryart") || params.has("richart") || params.has("ultraart") || readLocalFlag("ksFullArt") === "1";
}

function unsafeArtOverrideEnabled(): boolean {
  return params.has("ultraart") || readLocalFlag("ksUnsafeArt") === "1";
}

export type ArtBundleKind = "login" | "lobby" | "world" | "battle";

export function preferFastStartMode(): boolean {
  if (params.has("fullpreload")) return false;
  if (runtimeLockdownActive()) return true;
  if (
    params.has("lite") ||
    params.has("fast") ||
    readLocalFlag("ksFastStart") === "1"
  )
    return true;
  // v2.31: fast boot remains the default even for art preview flags.
  // Heavy art is streamed after the scene is responsive; only ?fullpreload disables this.
  return true;
}

export function useCumulativeArtLayers(): boolean {
  const caps = getMobileRuntimeCaps();
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return false;
  return artOverrideEnabled() && (!lowDeviceHint() || unsafeArtOverrideEnabled()) && caps.maxProgressiveAssets > 0;
}

export function isLowDeviceProfile(): boolean {
  return lowDeviceHint();
}

export function isMobileRuntime(): boolean {
  return mobileRuntimeHint();
}

export function preferReducedMotion(): boolean {
  const caps = getMobileRuntimeCaps();
  return runtimeLockdownActive() || caps.label === "SAFE_MOBILE_ENGINE" || caps.label === "LOCKDOWN_MOBILE_ENGINE" || lowDeviceHint() || params.has("battery") || params.has("lite") || readLocalFlag("ksReduceMotion") === "1";
}

export function allowPremiumStaticArt(bundle: ArtBundleKind): boolean {
  const caps = getMobileRuntimeCaps();
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return false;
  if (bundle === "battle") return caps.allowBattleArt && unsafeArtOverrideEnabled();
  if (artOverrideEnabled()) return caps.allowPremiumMenuArt || unsafeArtOverrideEnabled();
  return caps.allowPremiumMenuArt && !lowDeviceHint();
}

export function allowProgressiveArtBundle(bundle: ArtBundleKind): boolean {
  const caps = getMobileRuntimeCaps();
  if (caps.maxProgressiveAssets <= 0) return false;
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return false;
  if (bundle === "battle") return caps.allowBattleArt && unsafeArtOverrideEnabled();
  if (artOverrideEnabled()) return caps.allowPremiumMenuArt || unsafeArtOverrideEnabled();
  if (lowDeviceHint()) return false;
  return false;
}

export function allowArtPrewarm(): boolean {
  const caps = getMobileRuntimeCaps();
  return !runtimeLockdownActive() && caps.allowScenePrewarm && unsafeArtOverrideEnabled() && !lowDeviceHint();
}

export function mobileUiScale(): number {
  return getMobileRuntimeCaps().uiScale;
}
