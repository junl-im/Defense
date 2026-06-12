const QUERY = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
let installed = false;

function canRegisterServiceWorker(): boolean {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  if (QUERY.has("nosw")) return false;
  if (location.protocol !== "https:" && location.hostname !== "localhost") return false;
  return true;
}

function runtimeLockdownActive(): boolean {
  try {
    return window.localStorage.getItem("ksRuntimeLockdown") === "1" || document.documentElement.classList.contains("ks-runtime-lockdown");
  } catch {
    return document.documentElement.classList.contains("ks-runtime-lockdown");
  }
}

function scheduleIdle(task: () => void, delayMs: number): void {
  const run = (): void => {
    const idle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };
    if (idle.requestIdleCallback) idle.requestIdleCallback(task, { timeout: 2500 });
    else window.setTimeout(task, 650);
  };
  window.setTimeout(run, delayMs);
}

export function installDeferredPwaRuntime(): void {
  if (installed || !canRegisterServiceWorker()) return;
  installed = true;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "/");
  let sceneReady = false;
  let userActivated = false;
  const tryRegister = (): void => {
    if (!sceneReady || !userActivated) return;
    scheduleIdle(() => {
      navigator.serviceWorker
        .register(`${base}sw.js`, { scope: base })
        .then((registration) => {
          window.dispatchEvent(
            new CustomEvent("kingdom-seed:pwa-ready", {
              detail: { scope: registration.scope, at: Date.now() },
            }),
          );
        })
        .catch((error) => console.warn("Deferred PWA registration skipped:", error));
    }, runtimeLockdownActive() ? 18000 : 9200);
  };
  window.addEventListener("kingdom-seed:user-activated", () => {
    userActivated = true;
    tryRegister();
  }, { once: true });
  window.addEventListener("kingdom-seed:scene-ready", () => {
    sceneReady = true;
    tryRegister();
  }, { once: true });
}
