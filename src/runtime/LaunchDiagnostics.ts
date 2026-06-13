import { KINGDOM_SEED_BUILD_NAME } from "./Version";

export type LaunchMilestone = {
  name: string;
  at: number;
  sinceStartMs: number;
  detail?: Record<string, unknown>;
};

export type LaunchDiagnosticsSnapshot = {
  build: string;
  startedAt: number;
  now: number;
  elapsedMs: number;
  milestoneCount: number;
  lastMilestone?: LaunchMilestone;
  milestones: LaunchMilestone[];
  documentState: {
    readyState: DocumentReadyState;
    hidden: boolean;
    visibilityState: DocumentVisibilityState;
  };
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  classes: string[];
};

declare global {
  interface Window {
    __KINGDOM_SEED_DIAGNOSTICS__?: LaunchDiagnosticsSnapshot;
    __KINGDOM_SEED_GET_DIAGNOSTICS__?: () => LaunchDiagnosticsSnapshot;
  }
}

const MAX_MILESTONES = 90;
const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
const milestones: LaunchMilestone[] = [];
let installed = false;

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function sanitizeDetail(detail?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!detail) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (value instanceof Error) {
      safe[key] = `${value.name}: ${value.message}`;
    } else if (typeof value === "function") {
      safe[key] = "[function]";
    } else if (typeof value === "object" && value !== null) {
      try {
        safe[key] = JSON.parse(JSON.stringify(value));
      } catch {
        safe[key] = String(value);
      }
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

export function getLaunchDiagnosticsSnapshot(): LaunchDiagnosticsSnapshot {
  const now = nowMs();
  return {
    build: KINGDOM_SEED_BUILD_NAME,
    startedAt,
    now,
    elapsedMs: Math.max(0, Math.round(now - startedAt)),
    milestoneCount: milestones.length,
    lastMilestone: milestones[milestones.length - 1],
    milestones: [...milestones],
    documentState: {
      readyState: document.readyState,
      hidden: document.hidden,
      visibilityState: document.visibilityState,
    },
    viewport: {
      width: Math.round(window.visualViewport?.width ?? window.innerWidth),
      height: Math.round(window.visualViewport?.height ?? window.innerHeight),
      devicePixelRatio: window.devicePixelRatio || 1,
    },
    classes: Array.from(document.documentElement.classList),
  };
}

export function markLaunchMilestone(name: string, detail?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const at = nowMs();
  const milestone: LaunchMilestone = {
    name,
    at,
    sinceStartMs: Math.max(0, Math.round(at - startedAt)),
    detail: sanitizeDetail(detail),
  };
  milestones.push(milestone);
  if (milestones.length > MAX_MILESTONES) milestones.shift();

  const snapshot = getLaunchDiagnosticsSnapshot();
  window.__KINGDOM_SEED_DIAGNOSTICS__ = snapshot;
  window.dispatchEvent(
    new CustomEvent("kingdom-seed:launch-diagnostic", {
      detail: milestone,
    }),
  );
}

export function installLaunchDiagnostics(): void {
  if (installed || typeof window === "undefined" || typeof document === "undefined") return;
  installed = true;
  window.__KINGDOM_SEED_GET_DIAGNOSTICS__ = getLaunchDiagnosticsSnapshot;

  markLaunchMilestone("diagnostics-installed", {
    build: KINGDOM_SEED_BUILD_NAME,
    readyState: document.readyState,
  });

  window.addEventListener("kingdom-seed:engine-status", (event) => {
    const detail = (event as CustomEvent<Record<string, unknown>>).detail ?? {};
    markLaunchMilestone(`engine:${String(detail.stage ?? "unknown")}`, detail);
  });
  window.addEventListener("kingdom-seed:compat-report", (event) => {
    const detail = (event as CustomEvent<{ forceCanvas?: boolean; warnings?: string[] }>).detail;
    markLaunchMilestone("compat-report", {
      forceCanvas: detail?.forceCanvas ?? false,
      warnings: detail?.warnings ?? [],
    });
  });
  window.addEventListener("kingdom-seed:scene-ready", () => markLaunchMilestone("scene-ready"));
  window.addEventListener("kingdom-seed:user-activated", () => markLaunchMilestone("user-activated"));
  window.addEventListener("kingdom-seed:navigation-error", (event) => {
    const detail = (event as CustomEvent<Record<string, unknown>>).detail ?? {};
    markLaunchMilestone("navigation-error", detail);
  });
  window.addEventListener("error", (event) => {
    markLaunchMilestone("window-error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error instanceof Error ? `${event.error.name}: ${event.error.message}` : undefined,
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    markLaunchMilestone("unhandled-rejection", {
      reason: event.reason instanceof Error ? `${event.reason.name}: ${event.reason.message}` : String(event.reason),
    });
  });
}
