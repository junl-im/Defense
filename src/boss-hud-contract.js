export const BOSS_INTENT_TYPES = Object.freeze({
  strike: Object.freeze({ id: 'strike', label: '직격', icon: 'assets/ui/v390/boss-strike.png', color: '#ff806f' }),
  summon: Object.freeze({ id: 'summon', label: '소환', icon: 'assets/ui/v390/boss-summon.png', color: '#d18aff' }),
  control: Object.freeze({ id: 'control', label: '영역', icon: 'assets/ui/v390/boss-control.png', color: '#6eeeff' })
});

export function classifyBossIntent(name = '') {
  if (/소환|행진|백귀/.test(name)) return BOSS_INTENT_TYPES.summon;
  if (/덫|윤무|포효|충격파|장판/.test(name)) return BOSS_INTENT_TYPES.control;
  return BOSS_INTENT_TYPES.strike;
}

export function getBossHudState(boss, intentName) {
  const timer = Math.max(0, Number(boss?.specialTimer) || 0);
  const maxTimer = Math.max(.01, Number(boss?.intentDuration) || 5.2);
  const ratio = Math.min(1, timer / maxTimer);
  const type = classifyBossIntent(intentName);
  return Object.freeze({
    type,
    timer,
    progress: ratio,
    urgency: timer <= .85 ? 'critical' : timer <= 1.8 ? 'warning' : 'stable',
    phase: Math.max(1, Number(boss?.bossPhase) || 1)
  });
}
