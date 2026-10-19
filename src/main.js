// ============================================================
// main.js — bootstrap: loading screen, game creation, start.
// ============================================================
import { Game } from './core/Game.js';
import { initTooltip } from './ui/Tooltip.js';
import { installHudLayout } from './ui/HudLayout.js';
import { installRoyalLauncher } from './ui/RoyalLauncher.js';

function boot() {
  const splashStartedAt=performance.now();
  initTooltip();
  // Use the illustrated logo, with a readable Korean fallback only when
  // the actual image fails to load. Never let a missing logo block the game.
  const logo=document.getElementById('loading-logo');
  const fallback=document.getElementById('loading-logo-fallback');
  logo?.addEventListener('error',()=>{
    logo.hidden=true;
    if(fallback)fallback.hidden=false;
  },{once:true});
  if(logo?.complete && !logo.naturalWidth){
    logo.hidden=true;
    if(fallback)fallback.hidden=false;
  }
  const canvas = document.getElementById('game-canvas');
  const fill = document.getElementById('loading-fill');
  const status = document.getElementById('loading-status');
  const meter = document.getElementById('loading-bar');
  const setProgress = (value, message='왕국 자료 준비 중') => {
    fill.style.width = value + '%';
    if (status) status.textContent = message + ' · ' + value + '%';
    meter?.setAttribute('aria-valuenow', String(value));
  };

  // fake-but-honest progress: asset build is synchronous & fast,
  // so we animate the bar across the actual init steps.
  setProgress(30, '화면 준비 중');

  requestAnimationFrame(() => {
    setProgress(65, '마을 자료 불러오는 중');
    let game;
    try {
      game = new Game(canvas);
    } catch (err) {
      console.error('[KingdomTiles] fatal init error:', err);
      // Keep the actual image emblem visible on errors. Never inject error
      // messages into HTML (messages may contain arbitrary third-party text).
      document.getElementById('loading-screen')?.classList.add('loading-failure');
      if(status){
        const detail=String(err?.message||'알 수 없는 오류');
        status.textContent='왕국을 불러오지 못했습니다. 화면을 새로고침하세요. · '+detail;
        status.setAttribute('role','alert');
      }
      return;
    }
    setProgress(100, '왕국 준비 완료');
    game.start();
    // MobileDock installs on DOMContentLoaded after this bootstrap. Defer
    // panel grip registration one tick so both desktop and mobile are covered.
    setTimeout(()=>{
      installHudLayout();
      installRoyalLauncher(game);
    },0);
    // A high-detail logo needs a brief, meaningful on-screen debut. Keep the
    // game running immediately; only delay removal of the lightweight overlay.
    const logoVisibleForMs=900;
    const remaining=Math.max(250,logoVisibleForMs-(performance.now()-splashStartedAt));
    setTimeout(() => game.ui.hideLoading(), remaining);

    // expose for debugging / headless tests
    window.__game = game;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
