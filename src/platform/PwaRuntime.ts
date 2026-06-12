import { optionalRuntimeWorkAllowed, pauseOptionalWork } from "../game/RuntimeLoadGovernor";
const QUERY = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
let installed = false;
let retryTimer = 0;
let registerStarted = false;
let registerDone = false;

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
  const root = document.documentElement;
  let sceneReady = root.classList.contains("ks-scene-ready");
  let userActivated = root.classList.contains("ks-user-activated");
  const queueRetry = (delayMs: number): void => {
    if (retryTimer || registerDone) return;
    retryTimer = window.setTimeout(() => {
      retryTimer = 0;
      tryRegister();
    }, delayMs);
  };
  const tryRegister = (): void => {
    if (!sceneReady || !userActivated || registerStarted || registerDone) return;
    scheduleIdle(() => {
      if (registerDone) return;
      if (!optionalRuntimeWorkAllowed("pwa", { allowDuringBoot: false })) {
        pauseOptionalWork("pwa-deferred", 5200);
        queueRetry(runtimeLockdownActive() ? 16000 : 7200);
        return;
      }
      registerStarted = true;
      navigator.serviceWorker
        .register(`${base}sw.js`, { scope: base })
        .then((registration) => {
          registerDone = true;
          window.dispatchEvent(
            new CustomEvent("kingdom-seed:pwa-ready", {
              detail: { scope: registration.scope, at: Date.now() },
            }),
          );
        })
        .catch((error) => {
          registerStarted = false;
          console.warn("Deferred PWA registration skipped:", error);
          queueRetry(18000);
        });
    }, runtimeLockdownActive() ? 22000 : 12000);
  };
  window.addEventListener("kingdom-seed:user-activated", () => {
    userActivated = true;
    tryRegister();
  }, { once: true });
  window.addEventListener("kingdom-seed:scene-ready", () => {
    sceneReady = true;
    root.classList.add("ks-scene-ready");
    tryRegister();
  }, { once: true });

  // v2.35.6: PWA 런타임 자체가 유휴 시간에 동적 로드될 수 있으므로,
  // 이미 지나간 scene-ready/user-activated 상태를 클래스에서 복구해 한 번 더 시도한다.
  tryRegister();
}
