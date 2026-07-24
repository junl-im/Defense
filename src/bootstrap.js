const BOOTSTRAP_VERSION = '23.1.0';
window.__DOKKAEBI_ENTRY_DIAGNOSTICS__ = {
  version: BOOTSTRAP_VERSION,
  loadedAt: Date.now(),
  mode: 'bundled-entry'
};

import('./main.js').catch((error) => {
  console.error('[DokkaebiLuckDefense3D] entry import failed', error);
  const reason = error instanceof Error ? error.message : String(error);
  window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(`게임 엔진 모듈을 불러오지 못했습니다: ${reason}`);
});
