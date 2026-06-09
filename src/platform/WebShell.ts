type BrowserFlags = {
  isKakaoTalk: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
};

let allowExit = false;
let exitModal: HTMLDivElement | undefined;
let kakaoBanner: HTMLDivElement | undefined;

function flags(): BrowserFlags {
  const ua = navigator.userAgent || '';
  return {
    isKakaoTalk: /KAKAOTALK/i.test(ua),
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(ua),
  };
}

function safeShow(el: HTMLElement): void {
  el.classList.remove('hidden');
}

function safeHide(el: HTMLElement): void {
  el.classList.add('hidden');
}

function currentHttpsUrl(): string {
  const url = new URL(window.location.href);
  url.hash = '';
  return url.toString();
}

function chromeIntentUrl(): string {
  const withoutScheme = currentHttpsUrl().replace(/^https?:\/\//, '');
  return `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
}

async function requestFullscreenAndLandscape(): Promise<void> {
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
    console.warn('Fullscreen request was blocked:', error);
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
  const landscape = window.innerWidth >= window.innerHeight;
  document.documentElement.classList.toggle('is-landscape', landscape);
  document.documentElement.classList.toggle('is-portrait', !landscape);
}

function createStartGate(): void {
  const gate = document.createElement('div');
  gate.id = 'start-gate';
  gate.className = 'shell-overlay';
  gate.innerHTML = `
    <div class="shell-panel shell-panel-wide">
      <div class="shell-kicker">KINGDOM SEED</div>
      <h1>가로 전체화면으로 시작</h1>
      <p>모바일에서는 첫 터치 후 전체화면/가로 고정/사운드가 활성화됩니다. 지원하지 않는 브라우저에서는 게임 화면을 강제로 가로 배치합니다.</p>
      <button id="start-fullscreen-btn" class="shell-primary">전체화면으로 플레이</button>
      <button id="start-window-btn" class="shell-secondary">창 모드로 계속</button>
      <small>권장: Chrome / Safari / Samsung Internet. 카카오톡 인앱 브라우저에서는 외부 브라우저 열기를 권장합니다.</small>
    </div>
  `;
  document.body.appendChild(gate);

  const start = gate.querySelector<HTMLButtonElement>('#start-fullscreen-btn');
  const windowed = gate.querySelector<HTMLButtonElement>('#start-window-btn');
  start?.addEventListener('click', async () => {
    await requestFullscreenAndLandscape();
    window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated'));
    gate.remove();
  });
  windowed?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('kingdom-seed:user-activated'));
    gate.remove();
  });
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
  });

  exitModal.querySelector<HTMLButtonElement>('#exit-confirm-btn')?.addEventListener('click', () => {
    allowExit = true;
    safeHide(exitModal!);
    history.back();
    setTimeout(() => {
      window.close();
      if (!document.hidden) {
        window.location.href = 'about:blank';
      }
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
    if (allowExit) return;
    if (!exitModal) return;
    safeShow(exitModal);
    try {
      history.pushState({ kingdomSeedGuard: true }, '', window.location.href);
    } catch {
      // Ignore history failures inside restrictive in-app browsers.
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (allowExit) return;
    event.preventDefault();
    event.returnValue = 'true';
  });
}

function createKakaoBanner(): void {
  const info = flags();
  if (!info.isKakaoTalk) return;

  kakaoBanner = document.createElement('div');
  kakaoBanner.id = 'kakao-browser-banner';
  kakaoBanner.className = 'kakao-banner';
  kakaoBanner.innerHTML = `
    <div>
      <strong>카카오톡 브라우저 감지</strong>
      <span>전체화면/가로고정/사운드가 제한될 수 있어요.</span>
    </div>
    <button id="open-external-btn">외부 브라우저</button>
    <button id="copy-link-btn">링크복사</button>
    <button id="hide-kakao-btn">×</button>
  `;
  document.body.appendChild(kakaoBanner);

  kakaoBanner.querySelector<HTMLButtonElement>('#open-external-btn')?.addEventListener('click', () => {
    if (info.isAndroid) {
      window.location.href = chromeIntentUrl();
      return;
    }
    void navigator.clipboard?.writeText(currentHttpsUrl()).catch(() => undefined);
    alert('iOS 카카오톡에서는 우측 상단 메뉴 또는 공유 버튼에서 Safari로 열어주세요. 링크는 클립보드에 복사했습니다.');
  });

  kakaoBanner.querySelector<HTMLButtonElement>('#copy-link-btn')?.addEventListener('click', () => {
    void navigator.clipboard?.writeText(currentHttpsUrl()).then(() => alert('링크를 복사했습니다.'));
  });

  kakaoBanner.querySelector<HTMLButtonElement>('#hide-kakao-btn')?.addEventListener('click', () => {
    kakaoBanner?.remove();
  });
}

export function installWebShell(): void {
  updateOrientationClass();
  window.addEventListener('resize', updateOrientationClass);
  window.addEventListener('orientationchange', () => setTimeout(updateOrientationClass, 120));
  document.addEventListener('fullscreenchange', updateOrientationClass);

  createStartGate();
  createExitModal();
  createKakaoBanner();
  installBackGuard();
}

export function requestGameFullscreen(): Promise<void> {
  return requestFullscreenAndLandscape();
}
