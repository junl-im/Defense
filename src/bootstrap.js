import { PUBLIC_GAME_VERSION, LEGACY_LINEAGE_VERSION, BUILD_ID } from './version-policy.js';
const BOOTSTRAP_VERSION = PUBLIC_GAME_VERSION;
window.__DOKKAEBI_ENTRY_DIAGNOSTICS__ = {
  version: BOOTSTRAP_VERSION,
  lineageVersion: LEGACY_LINEAGE_VERSION,
  buildId: BUILD_ID,
  loadedAt: Date.now(),
  mode: 'resilient-entry'
};

import('./main.js').catch((error) => {
  console.error('[DokkaebiLuckDefense3D] entry import failed', error);
  const reason = error instanceof Error ? error.message : String(error);
  window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(`게임 엔진 모듈을 불러오지 못했습니다: ${reason}`);
});
