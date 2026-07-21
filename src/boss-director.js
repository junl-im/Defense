export const BOSS_WAVE_TABLE = Object.freeze({
  4: Object.freeze({ type: 'tiger', adds: 13, label: '첫 월식 수문장' }),
  7: Object.freeze({ type: 'serpent', adds: 18, label: '혼령 균열의 지배자' }),
  10: Object.freeze({ type: 'king', adds: 23, label: '백귀 야행 최종막' })
});

export const BOSS_PROFILES = Object.freeze({
  tiger: Object.freeze({ phases: 2, thresholds: [.5], color: 0xff5a45, intent: '돌진과 충격파' }),
  serpent: Object.freeze({ phases: 2, thresholds: [.56], color: 0x55e7c4, intent: '독월 고리와 혼령 덫' }),
  king: Object.freeze({ phases: 3, thresholds: [.68, .32], color: 0xa864ff, intent: '소환·야행진·처형 도약' })
});

export function getBossWave(wave) {
  return BOSS_WAVE_TABLE[wave] || null;
}

export function getBossTypeForWave(wave) {
  return getBossWave(wave)?.type || '';
}

export function getBossSpawnCount(wave) {
  const boss = getBossWave(wave);
  return boss ? boss.adds + 1 : 0;
}

export function isBossWave(wave) {
  return Boolean(getBossWave(wave));
}
