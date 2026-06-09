type BrowserFlags = {
  isKakaoTalk: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isDesktop: boolean;
};

let allowExit = false;
let exitModal: HTMLDivElement | undefined;
let startGate: HTMLDivElement | undefined;
let activated = false;

function flags(): BrowserFlags {
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return {
    isKakaoTalk: /KAKAOTALK/i.test(ua),
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isMobile,
    isDesktop: !isMobile,
  };
}

function safeShow(el: HTMLElement): void {
  el.classList.remove('hidden');
}

function safeHide(el: HTMLElement): void {
  el.classList.add('hidden');
}

async function requestFullscreenAndLandscape(): Promise<void> {
  const info = flags();
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
    console.warn('Fullscreen request was blocked by the browser:', error);
  }

  // PC는 이미 가로 화면이 기본이므로 회전/방향 고정을 시도하지 않는다.
  if (!info.isMobile) return;

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
  await requestFullscreenAndLandscape();
  window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated'));
  startGate?.classList.add('start-gate-out');
  window.setTimeout(() => startGate?.remove(), 180);
}

function createStartGate(): void {
  startGate = document.createElement('div');
  startGate.id = 'start-gate';
  startGate.className = 'shell-overlay shell-start-gate';
  startGate.innerHTML = `
    <div class="shell-start-card" role="button" aria-label="게임 시작">
      <div class="shell-title-mark">KINGDOM SEED</div>
      <div class="shell-title-sword"></div>
      <h1>전투 시작</h1>
      <p>화면을 터치하면 바로 전장으로 진입합니다.</p>
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
    <div class="shell-panel">
      <div class="shell-kicker">EXIT</div>
      <h2>게임을 종료할까요?</h2>
      <p>진행 중인 웨이브는 저장되지 않을 수 있습니다.</p>
      <div class="shell-row">
        <button id="exit-stay-btn" class="shell-secondary">계속하기</button>
        <button id="exit-confirm-btn" class="shell-danger">종료</button>
      </div>
    </div>
  `;
  document.body.appendChild(exitModal);

  exitModal.querySelector<HTMLButtonElement>('#exit-stay-btn')?.addEventListener('click', () => {
    safeHide(exitModal!);
    history.pushState({ kingdomSeedGuard: true }, '', window.location.href);
    void requestFullscreenAndLandscape();
  });

  exitModal.querySelector<HTMLButtonElement>('#exit-confirm-btn')?.addEventListener('click', () => {
    allowExit = true;
    safeHide(exitModal!);
    history.back();
    setTimeout(() => {
      window.close();
      if (!document.hidden) window.location.href = 'about:blank';
    }, 80);
  });
}

function installBackGuard(): void {
  try {
    history.replaceState({ kingdomSeedBase: true }, '', window.location.href);
    history.pushState({ kingdomSeedGuard: true }, '', window.location.href);
  } catch (error) {
    console.warn('History guard unavailable:', error);
  }

  window.addEventListener('popstate', () => {
    if (allowExit || !exitModal) return;
    safeShow(exitModal);
    try {
      history.pushState({ kingdomSeedGuard: true }, '', window.location.href);
    } catch {
      // Restrictive in-app browsers may reject history operations.
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (allowExit) return;
    event.preventDefault();
    event.returnValue = 'true';
  });
}

function installImmersiveMode(): void {
  const tryRestore = (): void => {
    if (!activated) return;
    void requestFullscreenAndLandscape();
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) window.setTimeout(tryRestore, 180);
  });
  document.addEventListener('fullscreenchange', () => window.setTimeout(tryRestore, 80));
  window.addEventListener('focus', () => window.setTimeout(tryRestore, 120));
  window.addEventListener('pointerdown', () => window.setTimeout(tryRestore, 40));
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
