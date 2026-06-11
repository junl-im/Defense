const params = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

function readLocalFlag(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lowDeviceHint(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const memory = Number(nav.deviceMemory ?? 8);
  const cores = Number(nav.hardwareConcurrency ?? 8);
  return memory <= 4 || cores <= 4;
}

export function preferFastStartMode(): boolean {
  if (params.has("fullart") || readLocalFlag("ksFullArt") === "1") return false;
  if (
    params.has("lite") ||
    params.has("fast") ||
    readLocalFlag("ksFastStart") === "1"
  )
    return true;
  // Default to the safe/mobile-friendly path. Full cumulative art remains available with ?fullart.
  return true;
}

export function useCumulativeArtLayers(): boolean {
  return !preferFastStartMode() && !lowDeviceHint();
}

export function isLowDeviceProfile(): boolean {
  return lowDeviceHint();
}
