// ============================================================
// main.js — bootstrap: loading screen, game creation, start.
// ============================================================
import { Game } from './core/Game.js';
import { initTooltip } from './ui/Tooltip.js';

function boot() {
  initTooltip();
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
      const inner = document.getElementById('loading-inner');
      if (inner) {
        inner.innerHTML =
          '<h1>라니킹덤</h1><p style="color:#e08a7a">게임을 시작할 수 없습니다: ' +
          String(err && err.message ? err.message : err) +
          '</p>';
      }
      return;
    }
    setProgress(100, '왕국 준비 완료');
    game.start();
    setTimeout(() => game.ui.hideLoading(), 350);

    // expose for debugging / headless tests
    window.__game = game;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
