const LOAD_PHASE_BOSS_SEQUENCE_V146 = Object.freeze({
  10: 'tiger',
  25: 'serpent',
  50: 'king',
  75: 'tiger',
  100: 'king'
});

export const LONG_SESSION_LOAD_WAVES_V146 = Object.freeze(
  Object.keys(LOAD_PHASE_BOSS_SEQUENCE_V146).map(Number)
);

export function getLoadPhaseBossTypeV146(wave) {
  return LOAD_PHASE_BOSS_SEQUENCE_V146[Math.max(0, Math.round(Number(wave) || 0))] || '';
}

export function buildLongSessionLoadProfileV146() {
  return Object.freeze(LONG_SESSION_LOAD_WAVES_V146.map((wave) => Object.freeze({
    wave,
    bossType: getLoadPhaseBossTypeV146(wave),
    boss: Boolean(getLoadPhaseBossTypeV146(wave))
  })));
}
