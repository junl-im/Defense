export const MOONFRONT_CAMPAIGN_VERSION = '1.0.0';

export const MOONFRONT_ACTS = Object.freeze([
  Object.freeze({ id: 'moon-gate', index: 1, startWave: 1, endWave: 3, icon: '門', name: '달문 전초', subtitle: 'FIRST LIGHT', description: '기본 전열을 세우고 원정의 흐름을 익힙니다.', modifiers: Object.freeze({ enemyHp: 1, enemySpeed: 1, enemyDamage: 1, reward: 1, eliteChance: 0, reactionDamage: 1 }) }),
  Object.freeze({ id: 'moon-market', index: 2, startWave: 4, endWave: 6, icon: '市', name: '도깨비 장터', subtitle: 'MARKET SIEGE', description: '정예 요괴가 늘고 전리품 가치가 상승합니다.', modifiers: Object.freeze({ enemyHp: 1.06, enemySpeed: 1.03, enemyDamage: 1.04, reward: 1.08, eliteChance: .035, reactionDamage: 1.05 }) }),
  Object.freeze({ id: 'spirit-road', index: 3, startWave: 7, endWave: 9, icon: '靈', name: '백귀 영로', subtitle: 'SPIRIT MARCH', description: '빠른 적과 주술 계열이 강해지고 원소 반응이 증폭됩니다.', modifiers: Object.freeze({ enemyHp: 1.1, enemySpeed: 1.08, enemyDamage: 1.08, reward: 1.13, eliteChance: .06, reactionDamage: 1.12 }) }),
  Object.freeze({ id: 'eclipse-throne', index: 4, startWave: 10, endWave: 10, icon: '蝕', name: '월식 왕좌', subtitle: 'FINAL CONVERGENCE', description: '최종 보스전. 모든 전투 체계가 결집합니다.', modifiers: Object.freeze({ enemyHp: 1.18, enemySpeed: 1.08, enemyDamage: 1.14, reward: 1.25, eliteChance: .08, reactionDamage: 1.18 }) })
]);

export function getMoonfrontAct(wave = 1) {
  const target = Math.max(1, Number(wave) || 1);
  return MOONFRONT_ACTS.find((act) => target >= act.startWave && target <= act.endWave) || MOONFRONT_ACTS.at(-1);
}

export class MoonfrontCampaignDirector {
  constructor() {
    this.current = getMoonfrontAct(1);
    this.transitions = 0;
    this.clearedActs = new Set();
  }

  resetRun() {
    this.current = getMoonfrontAct(1);
    this.transitions = 0;
    this.clearedActs.clear();
  }

  enterWave(wave) {
    const next = getMoonfrontAct(wave);
    const changed = next.id !== this.current?.id;
    if (changed) this.transitions += 1;
    this.current = next;
    return Object.freeze({ act: next, changed });
  }

  completeWave(wave) {
    const act = getMoonfrontAct(wave);
    const completed = wave >= act.endWave;
    if (completed) this.clearedActs.add(act.id);
    return Object.freeze({ act, completed, clearedCount: this.clearedActs.size });
  }

  get modifiers() {
    return this.current?.modifiers || MOONFRONT_ACTS[0].modifiers;
  }

  get diagnostics() {
    return Object.freeze({
      version: MOONFRONT_CAMPAIGN_VERSION,
      current: this.current,
      transitions: this.transitions,
      clearedActs: Object.freeze([...this.clearedActs])
    });
  }
}

export default MoonfrontCampaignDirector;
