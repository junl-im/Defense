type BrowserFlags = {
  isKakaoTalk: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
};

let allowExit = false;
let exitModal: HTMLDivElement | undefined;
let startGate: HTMLDivElement | undefined;
let activated = false;
let guardArmed = false;
let suppressExitGuardUntil = 0;
let lastGuardAt = 0;
const GUARD_STATE_KEY = 'kingdomSeedBackGuard';
const GUARD_SESSION = Math.random().toString(36).slice(2);

function flags(): BrowserFlags {
  const ua = navigator.userAgent || '';
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const smallScreen = Math.min(window.screen.width, window.screen.height) <= 820;
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isMobile = mobileUA || (coarsePointer && smallScreen);
  const isPortrait = window.innerHeight > window.innerWidth;

  return {
    isKakaoTalk: /KAKAOTALK/i.test(ua),
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isMobile,
    isDesktop: !isMobile,
    isPortrait,
  };
}

function ensureShellStyles(): void {
  if (document.getElementById('kingdom-shell-v46-style')) return;
  const style = document.createElement('style');
  style.id = 'kingdom-shell-v46-style';
  style.textContent = `
    #game { width: 100vw; height: 100dvh; min-height: 100dvh; }
    .shell-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); background: radial-gradient(circle at 50% 24%, rgba(101,165,255,.28), rgba(6,14,31,.86) 58%, rgba(3,7,16,.94)); color: white; box-sizing: border-box; }
    .shell-overlay.hidden { display: none !important; }
    .shell-start-gate { cursor: pointer; }
    .shell-start-card, .shell-panel { width: min(520px, 92vw); border: 2px solid rgba(255,218,123,.88); border-radius: 28px; padding: 26px 24px; text-align: center; background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(220,235,255,.92)); color: #244a86; box-shadow: 0 30px 90px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.9); }
    .shell-title-mark { font-size: 34px; line-height: 1; font-weight: 1000; letter-spacing: .04em; color: #2d5bab; text-shadow: 0 2px 0 #fff, 0 5px 16px rgba(37,82,168,.28); }
    .shell-title-sword { width: 72%; height: 3px; margin: 14px auto 0; background: linear-gradient(90deg, transparent, #e7b94e, transparent); }
    .shell-start-card h1, .shell-panel h2 { margin: 14px 0 7px; font-size: 28px; color: #193e7d; }
    .shell-start-card p, .shell-panel p { margin: 0; font-weight: 800; color: #5e789f; }
    .shell-tap-rune { display: inline-flex; margin-top: 20px; width: 82px; height: 82px; align-items: center; justify-content: center; border-radius: 999px; color: #fff; font-weight: 1000; background: linear-gradient(180deg, #5fa1ff, #255ab5); border: 3px solid #ffd979; box-shadow: 0 12px 34px rgba(27,82,180,.34), inset 0 1px 0 rgba(255,255,255,.46); animation: ksTapPulseV46 1.25s ease-in-out infinite; }
    .shell-row { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
    .shell-row button { appearance: none; border: 0; border-radius: 16px; padding: 13px 24px; color: #fff; font-weight: 1000; font-size: 16px; }
    .shell-secondary { background: linear-gradient(180deg, #5d94e6, #2658b5); }
    .shell-danger { background: linear-gradient(180deg, #ff8d86, #b43142); }
    .start-gate-out { opacity: 0; transform: scale(1.03); transition: opacity 160ms ease, transform 160ms ease; }
    @keyframes ksTapPulseV46 { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.07); filter: brightness(1.12); } }
  `;
  document.head.appendChild(style);
}

function safeShow(el: HTMLElement): void {
  el.classList.remove('hidden');
}

function safeHide(el: HTMLElement): void {
  el.classList.add('hidden');
}

function emitEmergencySave(reason: string): void {
  window.dispatchEvent(new CustomEvent('kingdom-seed:emergency-save', { detail: { reason, at: Date.now() } }));
}

async function requestFullscreenAndLandscape(): Promise<void> {
  const info = flags();
  if (!info.isMobile) return;

  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };

  try {
    if (!document.fullscreenElement) {
      const anyRoot = root as HTMLElement & {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      };
      if (anyRoot.requestFullscreen) await anyRoot.requestFullscreen();
      else if (anyRoot.webkitRequestFullscreen) await anyRoot.webkitRequestFullscreen();
      else if (anyRoot.msRequestFullscreen) await anyRoot.msRequestFullscreen();
    }
  } catch (error) {
    console.warn('Mobile fullscreen request was blocked by the browser:', error);
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: 'landscape') => Promise<void> };
    if (orientation?.lock) await orientation.lock('landscape');
  } catch (error) {
    console.warn('Landscape lock was blocked or unsupported:', error);
  }
}

function updateOrientationClass(): void {
  const info = flags();
  const landscape = window.innerWidth >= window.innerHeight;
  const needsPortraitRotation = info.isMobile && !landscape;

  document.documentElement.classList.toggle('is-landscape', landscape);
  document.documentElement.classList.toggle('is-portrait', !landscape);
  document.documentElement.classList.toggle('is-kakao-webview', info.isKakaoTalk);
  document.documentElement.classList.toggle('is-mobile-webview', info.isMobile);
  document.documentElement.classList.toggle('is-desktop', info.isDesktop);
  document.documentElement.classList.toggle('needs-portrait-rotation', needsPortraitRotation);
}

async function activateGameShell(): Promise<void> {
  if (activated) return;
  activated = true;
  suppressExitGuardUntil = Date.now() + 900;
  armBackGuard(true);
  await requestFullscreenAndLandscape();
  window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated'));
  startGate?.classList.add('start-gate-out');
  window.setTimeout(() => startGate?.remove(), 180);
}

function createStartGate(): void {
  const info = flags();
  if (info.isDesktop) {
    activated = true;
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated')), 0);
    return;
  }

  startGate = document.createElement('div');
  startGate.id = 'start-gate';
  startGate.className = 'shell-overlay shell-start-gate';
  startGate.innerHTML = `
    <div class="shell-start-card" role="button" aria-label="게임 시작">
      <div class="shell-title-mark">KINGDOM SEED</div>
      <div class="shell-title-sword"></div>
      <h1>전투 시작</h1>
      <p>탭하면 가로 전장으로 바로 진입합니다.</p>
      <div class="shell-tap-rune">TAP</div>
    </div>
  `;
  document.body.appendChild(startGate);

  const start = (): void => void activateGameShell();
  startGate.addEventListener('pointerdown', start, { once: true });
  startGate.addEventListener('touchstart', start, { once: true, passive: true });
  startGate.addEventListener('click', start, { once: true });
  document.addEventListener('pointerdown', () => { if (!activated && startGate?.isConnected) start(); }, { once: true, passive: true });
}

function createExitModal(): void {
  exitModal = document.createElement('div');
  exitModal.id = 'exit-modal';
  exitModal.className = 'shell-overlay hidden';
  exitModal.innerHTML = `
    <div class="shell-panel shell-exit-panel">
      <div class="shell-kicker">EXIT</div>
      <h2>게임을 종료할까요?</h2>
      <p>진행 중인 전투는 보호 저장을 시도합니다.</p>
      <div class="shell-row">
        <button id="exit-stay-btn" class="shell-secondary">계속하기</button>
        <button id="exit-confirm-btn" class="shell-danger">종료</button>
      </div>
    </div>
  `;
  document.body.appendChild(exitModal);

  exitModal.querySelector<HTMLButtonElement>('#exit-stay-btn')?.addEventListener('click', () => {
    safeHide(exitModal!);
    suppressExitGuardUntil = Date.now() + 700;
    armBackGuard(true);
    void requestFullscreenAndLandscape();
  });

  exitModal.querySelector<HTMLButtonElement>('#exit-confirm-btn')?.addEventListener('click', () => {
    allowExit = true;
    safeHide(exitModal!);
    emitEmergencySave('exit-confirm');
    try { history.back(); } catch { /* ignore */ }
    setTimeout(() => {
      window.close();
      if (!document.hidden) window.location.href = 'about:blank';
    }, 120);
  });
}

function armBackGuard(force = false): void {
  const info = flags();
  if (!info.isMobile) return;

  const now = Date.now();
  if (!force && guardArmed && now - lastGuardAt < 1200) return;
  lastGuardAt = now;
  guardArmed = true;
  suppressExitGuardUntil = now + 450;

  try {
    const baseState = { ...(history.state || {}), kingdomSeedBase: true, guardSession: GUARD_SESSION };
    history.replaceState(baseState, '', window.location.href);
    history.pushState({ [GUARD_STATE_KEY]: 1, guardSession: GUARD_SESSION }, '', window.location.href);
  } catch (error) {
    console.warn('History guard unavailable:', error);
  }
}

function showExitGuard(reason: string): void {
  if (allowExit || !exitModal || !flags().isMobile) return;
  if (!activated) return;
  if (Date.now() < suppressExitGuardUntil) {
    armBackGuard(true);
    return;
  }
  emitEmergencySave(reason);
  safeShow(exitModal);
  suppressExitGuardUntil = Date.now() + 600;
  armBackGuard(true);
  if ('vibrate' in navigator) {
    try { navigator.vibrate?.(24); } catch { /* ignore */ }
  }
}

function installBackGuard(): void {
  window.addEventListener('popstate', (event) => {
    if (allowExit || !flags().isMobile) return;
    const state = event.state as Record<string, unknown> | null;
    if (state?.[GUARD_STATE_KEY]) return;
    showExitGuard('popstate');
  });

  window.addEventListener('pagehide', () => {
    if (!allowExit) emitEmergencySave('pagehide');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !allowExit) emitEmergencySave('visibility-hidden');
    if (!document.hidden && activated && flags().isMobile) {
      suppressExitGuardUntil = Date.now() + 800;
      armBackGuard(true);
    }
  });
}

function installImmersiveMode(): void {
  const tryRestore = (): void => {
    if (!activated || !flags().isMobile) return;
    void requestFullscreenAndLandscape();
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) window.setTimeout(tryRestore, 180);
  });
  document.addEventListener('fullscreenchange', () => { if (flags().isMobile) window.setTimeout(tryRestore, 80); });
  window.addEventListener('focus', () => { if (flags().isMobile) window.setTimeout(tryRestore, 120); });
}

export function installWebShell(): void {
  ensureShellStyles();
  updateOrientationClass();
  window.addEventListener('resize', updateOrientationClass);
  window.addEventListener('orientationchange', () => setTimeout(updateOrientationClass, 120));
  document.addEventListener('fullscreenchange', updateOrientationClass);

  createStartGate();
  createExitModal();
  installBackGuard();
  installImmersiveMode();
}

export function requestGameFullscreen(): Promise<void> {
  activated = true;
  suppressExitGuardUntil = Date.now() + 900;
  armBackGuard(true);
  return requestFullscreenAndLandscape();
}
