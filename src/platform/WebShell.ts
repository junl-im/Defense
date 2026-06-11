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
let sceneReady = false;
let guardArmed = false;
let suppressExitGuardUntil = 0;
let lastGuardAt = 0;
let lastPointerAt = 0;
let lastSceneReadyAt = 0;
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
  if (document.getElementById('kingdom-shell-v49-style')) return;
  const style = document.createElement('style');
  style.id = 'kingdom-shell-v49-style';
  style.textContent = `
    #game { width: 100vw; height: 100dvh; min-height: 100dvh; }
    .shell-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); background: radial-gradient(circle at 50% 24%, rgba(101,165,255,.28), rgba(6,14,31,.86) 58%, rgba(3,7,16,.94)); color: white; box-sizing: border-box; transition: opacity 180ms ease, transform 180ms ease; }
    .shell-overlay.hidden { display: none !important; }
    .shell-overlay.fading { opacity: 0; transform: scale(1.02); pointer-events: none; }
    .shell-start-gate { cursor: pointer; }
    .shell-start-card, .shell-panel { width: min(340px, 84vw); border: 2px solid rgba(255,218,123,.88); border-radius: 22px; padding: 15px 14px; text-align: center; background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(220,235,255,.92)); color: #244a86; box-shadow: 0 30px 90px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.9); }
    .shell-title-mark { font-size: 21px; line-height: 1; font-weight: 1000; letter-spacing: .04em; color: #2d5bab; text-shadow: 0 2px 0 #fff, 0 5px 16px rgba(37,82,168,.28); }
    .shell-title-sword { width: 68%; height: 2px; margin: 10px auto 0; background: linear-gradient(90deg, transparent, #e7b94e, transparent); }
    .shell-start-card h1, .shell-panel h2 { margin: 10px 0 5px; font-size: 18px; color: #193e7d; }
    .shell-start-card p, .shell-panel p { margin: 0; font-weight: 800; font-size: 12px; color: #5e789f; }
    .shell-tap-rune { display: inline-flex; margin-top: 11px; width: 54px; height: 54px; align-items: center; justify-content: center; border-radius: 999px; color: #fff; font-weight: 1000; background: linear-gradient(180deg, #5fa1ff, #255ab5); border: 3px solid #ffd979; box-shadow: 0 12px 34px rgba(27,82,180,.34), inset 0 1px 0 rgba(255,255,255,.46); animation: ksTapPulseV48 1.25s ease-in-out infinite; }
    .shell-loading-text { margin-top: 10px; color: #244a86; font-weight: 1000; font-size: 11px; }
    .shell-row { display: flex; gap: 12px; justify-content: center; margin-top: 14px; }
    .shell-row button { appearance: none; border: 0; border-radius: 16px; padding: 13px 24px; color: #fff; font-weight: 1000; font-size: 16px; }
    .shell-secondary { background: linear-gradient(180deg, #5d94e6, #2658b5); }
    .shell-danger { background: linear-gradient(180deg, #ff8d86, #b43142); }
    @keyframes ksTapPulseV48 { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.07); filter: brightness(1.12); } }
  `;
  document.head.appendChild(style);
}


function syncViewportCssVars(): void {
  const viewport = window.visualViewport;
  const width = Math.max(1, Math.round(viewport?.width ?? window.innerWidth));
  const height = Math.max(1, Math.round(viewport?.height ?? window.innerHeight));
  const landscape = width >= height;
  const surfaceWidth = landscape ? width : height;
  const surfaceHeight = landscape ? height : width;
  const targetAspect = 16 / 9;
  const surfaceAspect = surfaceWidth / Math.max(1, surfaceHeight);
  const viewportFit = new URLSearchParams(window.location.search).get('fit') ?? localStorage.getItem('ksViewportFit') ?? 'auto';
  const compactShell = new URLSearchParams(window.location.search).get('shell') !== 'large';
  const portraitFill = !landscape && viewportFit !== 'contain';
  let gameWidth = surfaceWidth;
  let gameHeight = surfaceHeight;

  if (portraitFill) {
    // v2.2: on portrait phones, use the whole rotated visual viewport.
    // Phaser still maps pointers correctly, and this avoids the tiny 16:9 strip problem
    // on browsers where orientation lock/fullscreen is blocked.
    gameWidth = surfaceWidth;
    gameHeight = surfaceHeight;
  } else if (surfaceAspect > targetAspect) {
    gameHeight = surfaceHeight;
    gameWidth = Math.round(gameHeight * targetAspect);
  } else {
    gameWidth = surfaceWidth;
    gameHeight = Math.round(gameWidth / targetAspect);
  }

  const root = document.documentElement;
  root.style.setProperty('--ks-vw-px', `${width}px`);
  root.style.setProperty('--ks-vh-px', `${height}px`);
  root.style.setProperty('--ks-game-w-px', `${Math.max(1, gameWidth)}px`);
  root.style.setProperty('--ks-game-h-px', `${Math.max(1, gameHeight)}px`);
  root.style.setProperty('--ks-game-scale', '1');
  root.style.setProperty('--ks-shell-card-scale', compactShell ? '0.86' : '1');
  root.classList.toggle('ks-portrait-fill', portraitFill);
  root.classList.toggle('ks-compact-shell', compactShell);
}

function safeShow(el: HTMLElement): void { el.classList.remove('hidden'); el.classList.remove('fading'); }
function safeHide(el: HTMLElement): void { el.classList.add('hidden'); }

function fadeRemove(el: HTMLElement | undefined): void {
  if (!el || !el.isConnected) return;
  el.classList.add('fading');
  window.setTimeout(() => el.remove(), 190);
}

function emitEmergencySave(reason: string): void {
  window.dispatchEvent(new CustomEvent('kingdom-seed:emergency-save', { detail: { reason, at: Date.now() } }));
}

async function requestFullscreenAndLandscape(): Promise<void> {
  const info = flags();
  if (!info.isMobile) return;
  const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void; msRequestFullscreen?: () => Promise<void> | void; };
  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else if (root.msRequestFullscreen) await root.msRequestFullscreen();
    }
  } catch (error) { console.warn('Mobile fullscreen request was blocked:', error); }
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: 'landscape') => Promise<void> };
    if (orientation?.lock) await orientation.lock('landscape');
  } catch (error) { console.warn('Landscape lock was blocked or unsupported:', error); }
}

function updateOrientationClass(): void {
  syncViewportCssVars();
  const info = flags();
  const landscape = window.innerWidth >= window.innerHeight;
  const root = document.documentElement;
  root.classList.toggle('is-landscape', landscape);
  root.classList.toggle('is-portrait', !landscape);
  root.classList.toggle('is-kakao-webview', info.isKakaoTalk);
  root.classList.toggle('is-mobile-webview', info.isMobile);
  root.classList.toggle('is-desktop', info.isDesktop);
  root.classList.toggle('needs-portrait-rotation', info.isMobile && !landscape);
  root.classList.toggle('ks-hit-debug', new URLSearchParams(window.location.search).has('hit') || localStorage.getItem('ksHitDebug') === '1');

  // v2.2: several mobile browsers report viewport dimensions in stages while
  // address bars collapse/expand. Send a short burst of resize notifications so
  // Phaser recalculates after the CSS-rotated container has reached its final size.
  [0, 60, 180, 360].forEach((delay) => {
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new CustomEvent('kingdom-seed:viewport-changed', { detail: { landscape, mobile: info.isMobile, at: Date.now() } }));
    }, delay);
  });
}

function markSceneReady(): void {
  sceneReady = true;
  lastSceneReadyAt = Date.now();
  if (activated) fadeRemove(startGate);
  suppressExitGuardUntil = Date.now() + 2800;
}

async function activateGameShell(): Promise<void> {
  if (activated) return;
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  if (startGate) {
    const note = startGate.querySelector<HTMLElement>('.shell-loading-text');
    if (note) note.textContent = '왕국 기록을 불러오는 중...';
  }
  window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated'));
  // v2.5: do not block the first scene behind fullscreen/orientation promises.
  // Some mobile webviews hold these calls for hundreds of ms; start loading immediately
  // and let the shell settle in the background.
  void requestFullscreenAndLandscape();
  window.setTimeout(() => armBackGuard(true), 520);
  window.setTimeout(() => { if (sceneReady) fadeRemove(startGate); }, 80);
  window.setTimeout(() => fadeRemove(startGate), 1200);
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
      <h1>시작</h1>
      <p>한 번 터치하면 사운드와 전체화면을 준비합니다.</p>
      <div class="shell-tap-rune">TAP</div>
      <div class="shell-loading-text">WebP 경량 리소스로 빠르게 진입 중</div>
    </div>`;
  document.body.appendChild(startGate);
  const start = (): void => void activateGameShell();
  startGate.addEventListener('pointerdown', start, { once: true });
  startGate.addEventListener('touchstart', start, { once: true, passive: true });
  startGate.addEventListener('click', start, { once: true });
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
    </div>`;
  document.body.appendChild(exitModal);
  exitModal.querySelector<HTMLButtonElement>('#exit-stay-btn')?.addEventListener('click', () => {
    safeHide(exitModal!);
    suppressExitGuardUntil = Date.now() + 1200;
    window.setTimeout(() => armBackGuard(true), 80);
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
  if (!info.isMobile || allowExit) return;
  const now = Date.now();
  if (!force && guardArmed && now - lastGuardAt < 1800) return;
  guardArmed = true;
  lastGuardAt = now;
  try {
    const baseState = { ...(history.state || {}), kingdomSeedBase: true, guardSession: GUARD_SESSION };
    history.replaceState(baseState, '', window.location.href);
    history.pushState({ [GUARD_STATE_KEY]: 1, guardSession: GUARD_SESSION, armedAt: now }, '', window.location.href);
  } catch (error) { console.warn('History guard unavailable:', error); }
}

function showExitGuard(reason: string): void {
  const now = Date.now();
  if (allowExit || !exitModal || !flags().isMobile || !activated) return;
  if (document.visibilityState !== 'visible') return;
  if (exitModal.isConnected && !exitModal.classList.contains('hidden')) return;
  if (now < suppressExitGuardUntil || now - lastPointerAt < 900 || now - lastSceneReadyAt < 2600 || now - lastGuardAt < 1300) {
    window.setTimeout(() => armBackGuard(true), 60);
    return;
  }
  emitEmergencySave(reason);
  safeShow(exitModal);
  suppressExitGuardUntil = now + 1400;
  window.setTimeout(() => armBackGuard(true), 80);
  if ('vibrate' in navigator) {
    try { navigator.vibrate?.(24); } catch { /* ignore */ }
  }
}

function installBackGuard(): void {
  const markPointer = (): void => { lastPointerAt = Date.now(); };
  document.addEventListener('pointerdown', markPointer, { passive: true });
  document.addEventListener('touchstart', markPointer, { passive: true });

  window.addEventListener('popstate', (event) => {
    if (allowExit || !flags().isMobile) return;
    const now = Date.now();
    const state = event.state as Record<string, unknown> | null;
    if (state?.[GUARD_STATE_KEY]) return;
    if (!activated || now < suppressExitGuardUntil || now - lastPointerAt < 900 || now - lastSceneReadyAt < 2600) {
      window.setTimeout(() => armBackGuard(true), 80);
      return;
    }
    showExitGuard('popstate');
  });

  window.addEventListener('pagehide', () => { if (!allowExit) emitEmergencySave('pagehide'); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !allowExit) emitEmergencySave('visibility-hidden');
    if (!document.hidden && activated && flags().isMobile) {
      suppressExitGuardUntil = Date.now() + 1600;
      window.setTimeout(() => armBackGuard(true), 240);
    }
  });
}

function installImmersiveMode(): void {
  const tryRestore = (): void => {
    if (!activated || !flags().isMobile) return;
    void requestFullscreenAndLandscape();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) window.setTimeout(tryRestore, 220); });
  document.addEventListener('fullscreenchange', () => { if (flags().isMobile) window.setTimeout(tryRestore, 140); });
  window.addEventListener('focus', () => { if (flags().isMobile) window.setTimeout(tryRestore, 180); });
}

export function installWebShell(): void {
  ensureShellStyles();
  updateOrientationClass();
  window.addEventListener('resize', updateOrientationClass);
  window.visualViewport?.addEventListener('resize', updateOrientationClass);
  window.visualViewport?.addEventListener('scroll', updateOrientationClass);
  window.addEventListener('orientationchange', () => setTimeout(updateOrientationClass, 120));
  document.addEventListener('fullscreenchange', updateOrientationClass);
  window.addEventListener('kingdom-seed:scene-ready', markSceneReady);
  createStartGate();
  createExitModal();
  installBackGuard();
  installImmersiveMode();
}

export function requestGameFullscreen(): Promise<void> {
  activated = true;
  suppressExitGuardUntil = Date.now() + 4200;
  window.setTimeout(() => armBackGuard(true), 900);
  return requestFullscreenAndLandscape();
}
