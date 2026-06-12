import './style.css';
import { installWebShell } from './platform/WebShell';

const query = new URLSearchParams(window.location.search);
const root = document.documentElement;
let enginePromise: Promise<typeof import('./runtime/GameBootstrap')> | undefined;
let engineStarted = false;
let lastStatus = '';

function setGateText(text: string): void {
  if (lastStatus === text) return;
  lastStatus = text;
  const note = document.querySelector<HTMLElement>('#start-gate .shell-loading-text');
  if (note) note.textContent = text;
}

function dispatchBootstrapError(reason: string, error: unknown): void {
  window.dispatchEvent(
    new ErrorEvent('error', {
      message: `Kingdom Seed bootstrap failed: ${reason}`,
      error,
    }),
  );
}

function loadEngineChunk(reason: string): Promise<typeof import('./runtime/GameBootstrap')> {
  if (!enginePromise) {
    root.classList.add('ks-engine-chunk-loading');
    setGateText(reason === 'user-activated' ? '엔진 코드 불러오는 중...' : '엔진을 조용히 준비하는 중...');
    enginePromise = import('./runtime/GameBootstrap')
      .then((module) => {
        root.classList.add('ks-engine-chunk-ready');
        root.classList.remove('ks-engine-chunk-loading');
        setGateText('엔진 준비 완료, 화면 여는 중...');
        return module;
      })
      .catch((error) => {
        root.classList.remove('ks-engine-chunk-loading');
        dispatchBootstrapError('dynamic-import', error);
        throw error;
      });
  }
  return enginePromise;
}

function startEngine(reason: string): void {
  if (engineStarted) return;
  engineStarted = true;
  root.classList.add('ks-engine-start-requested');
  void loadEngineChunk(reason)
    .then((module) => {
      setGateText('게임 화면 준비 중...');
      module.bootstrapKingdomSeedGame(reason);
    })
    .catch((error) => {
      engineStarted = false;
      setGateText('시작 실패: 화면을 다시 탭하세요');
      dispatchBootstrapError('start-engine', error);
    });
}

function scheduleAfterFirstPaint(task: () => void, delayMs: number): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => window.setTimeout(task, delayMs));
  });
}

function scheduleIdle(task: () => void, delayMs: number): void {
  window.setTimeout(() => {
    const idle = (
      window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (idle) idle(task, { timeout: 1400 });
    else window.setTimeout(task, 1);
  }, Math.max(0, delayMs));
}

function shouldWaitForTap(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const connection = nav.connection;
  return (
    query.has('tapboot') ||
    query.has('coldboot') ||
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g'
  );
}

installWebShell();
root.classList.add('ks-html-shell-ready');
setGateText('초기 화면 준비 완료');

window.addEventListener('kingdom-seed:user-activated', () => {
  root.classList.add('ks-user-activated');
  setGateText('탭 확인, 게임 화면 여는 중...');
  startEngine('user-activated');
});

window.addEventListener('kingdom-seed:engine-status', (event) => {
  const detail = (event as CustomEvent<{ stage?: string; tier?: string }>).detail;
  if (detail?.stage === 'phaser-configuring') setGateText('렌더러 설정 중...');
  if (detail?.stage === 'phaser-creating') setGateText(`렌더러 시작 중${detail.tier ? ` · ${detail.tier}` : ''}...`);
  if (detail?.stage === 'phaser-created') setGateText('로그인 화면 불러오는 중...');
});

// v2.35.5: 첫 페인트를 막지 않기 위해 Phaser는 정적 import하지 않는다.
// 기본은 정적 HTML 게이트를 먼저 그린 뒤 유휴 시간에 엔진 청크를 조용히 가져와
// 사용자가 탭했을 때 이미 로그인 씬이 준비되어 있도록 한다.
if (shouldWaitForTap()) {
  setGateText('데이터 절약 모드: 탭하면 엔진을 불러옵니다');
} else {
  scheduleAfterFirstPaint(() => {
    void loadEngineChunk('idle-preload');
    scheduleIdle(() => startEngine('idle-preboot'), 180);
  }, 120);
}

if (query.has('autostart')) {
  scheduleAfterFirstPaint(() => startEngine('autostart'), 20);
}
