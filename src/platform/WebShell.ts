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
let lastGuardAt = 0;
const GUARD_STATE_KEY = 'kingdomSeedBackGuard';

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

  // PC에서는 전체화면/회전을 전혀 개입하지 않는다.
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
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'landscape') => Promise<void>;
    };
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

  startGate.addEventListener('pointerdown', () => void activateGameShell(), { once: true });
  startGate.addEventListener('click', () => void activateGameShell(), { once: true });
}

function createExitModal(): void {
  exitModal = document.createElement('div');
  exitModal.id = 'exit-modal';
  exitModal.className = 'shell-overlay hidden';
  exitModal.innerHTML = `
    <div class="shell-panel shell-exit-panel">
      <div class="shell-kicker">EXIT</div>
      <h2>게임을 종료할까요?</h2>
      <p>진행 중인 전투는 저장되지 않을 수 있습니다.</p>
      <div class="shell-row">
        <button id="exit-stay-btn" class="shell-secondary">계속하기</button>
        <button id="exit-confirm-btn" class="shell-danger">종료</button>
      </div>
    </div>
  `;
  document.body.appendChild(exitModal);

  exitModal.querySelector<HTMLButtonElement>('#exit-stay-btn')?.addEventListener('click', () => {
    safeHide(exitModal!);
    armBackGuard(true);
    void requestFullscreenAndLandscape();
  });

  exitModal.querySelector<HTMLButtonElement>('#exit-confirm-btn')?.addEventListener('click', () => {
    allowExit = true;
    safeHide(exitModal!);
    emitEmergencySave('exit-confirm');
    try {
      history.go(-2);
    } catch {
      history.back();
    }
    setTimeout(() => {
      window.close();
      if (!document.hidden) window.location.href = 'about:blank';
    }, 120);
  });
}

function armBackGuard(force = false): void {
  const now = Date.now();
  if (!force && guardArmed && now - lastGuardAt < 700) return;
  lastGuardAt = now;
  guardArmed = true;

  try {
    const baseState = { ...(history.state || {}), kingdomSeedBase: true };
    history.replaceState(baseState, '', window.location.href);
    history.pushState({ [GUARD_STATE_KEY]: 1 }, '', window.location.href);
    // 카카오톡/일부 Android 인앱 브라우저는 한 번의 history push를 소비하고 바로 닫히는 경우가 있어
    // 모바일에서는 여분의 가드 상태를 한 장 더 쌓는다.
    if (flags().isMobile) history.pushState({ [GUARD_STATE_KEY]: 2 }, '', window.location.href);
  } catch (error) {
    console.warn('History guard unavailable:', error);
  }
}

function showExitGuard(reason: string): void {
  if (allowExit || !exitModal) return;
  emitEmergencySave(reason);
  safeShow(exitModal);
  armBackGuard(true);
  if ('vibrate' in navigator) {
    try { navigator.vibrate?.(24); } catch { /* ignore */ }
  }
}

function installBackGuard(): void {
  armBackGuard(true);

  window.addEventListener('popstate', () => {
    showExitGuard('popstate');
  });

  window.addEventListener('hashchange', () => {
    if (allowExit) return;
    showExitGuard('hashchange');
  });

  window.addEventListener('pagehide', () => {
    if (!allowExit) emitEmergencySave('pagehide');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !allowExit) emitEmergencySave('visibility-hidden');
    if (!document.hidden && flags().isMobile) armBackGuard(true);
  });

  window.addEventListener('beforeunload', (event) => {
    if (allowExit) return;
    emitEmergencySave('beforeunload');
    event.preventDefault();
    event.returnValue = 'true';
  });

  window.addEventListener('pointerdown', () => {
    if (flags().isMobile) window.setTimeout(() => armBackGuard(false), 40);
  }, { passive: true });
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
  window.addEventListener('pointerdown', () => { if (flags().isMobile) window.setTimeout(tryRestore, 40); }, { passive: true });
}

export function installWebShell(): void {
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
  return requestFullscreenAndLandscape();
}
