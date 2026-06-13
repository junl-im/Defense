import { KINGDOM_SEED_VERSION } from "./Version";
export type RuntimeCompatibilityReport = {
  version: string;
  userAgent: string;
  isSecureContext: boolean;
  canvas2dAvailable: boolean;
  webglAvailable: boolean;
  webgl2Available: boolean;
  webAudioAvailable: boolean;
  storageAvailable: boolean;
  indexedDbAvailable: boolean;
  touchAvailable: boolean;
  pointerAvailable: boolean;
  passiveEventsAvailable: boolean;
  visualViewportAvailable: boolean;
  serviceWorkerAvailable: boolean;
  forceCanvas: boolean;
  warnings: string[];
};

let cachedReport: RuntimeCompatibilityReport | undefined;
let installed = false;

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function testCanvas2d(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("2d"));
  } catch {
    return false;
  }
}

function testWebgl(kind: "webgl" | "webgl2"): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext(kind, { failIfMajorPerformanceCaveat: false }));
  } catch {
    return false;
  }
}

function testStorage(): boolean {
  try {
    const key = "__kingdom_seed_storage_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function testPassiveEvents(): boolean {
  let supported = false;
  try {
    const options = Object.defineProperty({}, "passive", {
      get() {
        supported = true;
        return false;
      },
    });
    window.addEventListener("ks-passive-probe", () => undefined, options);
    window.removeEventListener("ks-passive-probe", () => undefined, options);
  } catch {
    supported = false;
  }
  return supported;
}

function buildReport(): RuntimeCompatibilityReport {
  const params = query();
  const canvas2dAvailable = testCanvas2d();
  const webgl2Available = testWebgl("webgl2");
  const webglAvailable = webgl2Available || testWebgl("webgl");
  const storageAvailable = testStorage();
  const webAudioAvailable =
    typeof AudioContext !== "undefined" ||
    typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== "undefined";
  const warnings: string[] = [];

  if (!canvas2dAvailable) warnings.push("canvas-2d-unavailable");
  if (!webglAvailable) warnings.push("webgl-unavailable");
  if (!storageAvailable) warnings.push("local-storage-unavailable");
  if (!webAudioAvailable) warnings.push("web-audio-unavailable");
  if (!window.isSecureContext) warnings.push("insecure-context");
  if (!("PointerEvent" in window)) warnings.push("pointer-event-polyfill-mode");
  if (!("visualViewport" in window)) warnings.push("legacy-viewport-mode");

  return {
    version: KINGDOM_SEED_VERSION,
    userAgent: navigator.userAgent || "unknown",
    isSecureContext: window.isSecureContext,
    canvas2dAvailable,
    webglAvailable,
    webgl2Available,
    webAudioAvailable,
    storageAvailable,
    indexedDbAvailable: "indexedDB" in window,
    touchAvailable: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    pointerAvailable: "PointerEvent" in window,
    passiveEventsAvailable: testPassiveEvents(),
    visualViewportAvailable: "visualViewport" in window,
    serviceWorkerAvailable: "serviceWorker" in navigator,
    forceCanvas: params.has("canvas") || params.has("compat") || !webglAvailable,
    warnings,
  };
}

function applyReportClasses(report: RuntimeCompatibilityReport): void {
  const root = document.documentElement;
  root.classList.toggle("ks-compat-canvas", report.forceCanvas);
  root.classList.toggle("ks-compat-webgl", report.webglAvailable && !report.forceCanvas);
  root.classList.toggle("ks-compat-storage-limited", !report.storageAvailable);
  root.classList.toggle("ks-compat-audio-limited", !report.webAudioAvailable);
  root.classList.toggle("ks-compat-legacy-viewport", !report.visualViewportAvailable);
  root.classList.toggle("ks-compat-watch", report.warnings.length > 0);
}

function dispatchReport(report: RuntimeCompatibilityReport): void {
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:compat-report", {
      detail: report,
    }),
  );
}

export function installCompatibilityGuard(): RuntimeCompatibilityReport {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      version: KINGDOM_SEED_VERSION,
      userAgent: "server",
      isSecureContext: true,
      canvas2dAvailable: true,
      webglAvailable: true,
      webgl2Available: false,
      webAudioAvailable: true,
      storageAvailable: true,
      indexedDbAvailable: true,
      touchAvailable: false,
      pointerAvailable: true,
      passiveEventsAvailable: true,
      visualViewportAvailable: true,
      serviceWorkerAvailable: false,
      forceCanvas: false,
      warnings: [],
    };
  }

  cachedReport = buildReport();
  applyReportClasses(cachedReport);
  dispatchReport(cachedReport);

  if (!installed) {
    installed = true;
    window.addEventListener("online", () => dispatchReport(getCompatibilityReport()));
    window.addEventListener("offline", () => dispatchReport(getCompatibilityReport()));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) dispatchReport(getCompatibilityReport());
    });
  }

  return cachedReport;
}

export function getCompatibilityReport(): RuntimeCompatibilityReport {
  if (!cachedReport) return installCompatibilityGuard();
  return cachedReport;
}
