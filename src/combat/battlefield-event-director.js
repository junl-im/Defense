export const BATTLEFIELD_EVENT_VERSION = '1.0.0';

export const BATTLEFIELD_EVENTS = Object.freeze([
  Object.freeze({ id: 'moonfall', icon: '☾', name: '월광 낙하', description: '달빛 전리품이 증가합니다.', rewardMultiplier: 1.12, soulMultiplier: 1.05, propRateMultiplier: 1 }),
  Object.freeze({ id: 'siege', icon: '砲', name: '장터 공성전', description: '대포와 방어 장치가 빠르게 재장전됩니다.', rewardMultiplier: 1.04, soulMultiplier: 1, propRateMultiplier: 1.42 }),
  Object.freeze({ id: 'crystal', icon: '◆', name: '수정 공명', description: '혼불 획득량과 원소 반응이 강화됩니다.', rewardMultiplier: 1.03, soulMultiplier: 1.18, propRateMultiplier: 1.08 }),
  Object.freeze({ id: 'treasure', icon: '◉', name: '보물 바람', description: '상자와 보급품 보상이 강화됩니다.', rewardMultiplier: 1.16, soulMultiplier: 1, propRateMultiplier: 1.05 }),
  Object.freeze({ id: 'sacred-flame', icon: '🔥', name: '신목 성화', description: '웨이브 종료 시 신목이 회복됩니다.', rewardMultiplier: 1.02, soulMultiplier: 1.04, propRateMultiplier: 1.12 })
]);

export default class BattlefieldEventDirector {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.active = null;
    this.history = [];
    this.completed = 0;
    this.totalHealing = 0;
  }

  beginWave({ wave = 1, boss = false } = {}) {
    const index = boss ? (wave + 1) % BATTLEFIELD_EVENTS.length : Math.floor(this.random() * BATTLEFIELD_EVENTS.length);
    const definition = BATTLEFIELD_EVENTS[index];
    this.active = Object.freeze({ ...definition, wave, boss, startedAt: Date.now() });
    this.history.push(this.active);
    if (this.history.length > 16) this.history.shift();
    return this.active;
  }

  completeWave({ coreHp = 0, coreMaxHp = 0 } = {}) {
    const event = this.active;
    let heal = 0;
    if (event?.id === 'sacred-flame') heal = Math.max(2, Math.round(coreMaxHp * .06));
    heal = Math.max(0, Math.min(heal, Math.max(0, coreMaxHp - coreHp)));
    if (heal > 0) this.totalHealing += heal;
    if (event) this.completed += 1;
    this.active = null;
    return Object.freeze({ event, heal });
  }

  get rewardMultiplier() { return this.active?.rewardMultiplier || 1; }
  get soulMultiplier() { return this.active?.soulMultiplier || 1; }
  get propRateMultiplier() { return this.active?.propRateMultiplier || 1; }

  get diagnostics() {
    return Object.freeze({
      version: BATTLEFIELD_EVENT_VERSION,
      active: this.active,
      completed: this.completed,
      totalHealing: this.totalHealing,
      history: Object.freeze(this.history.slice(-6))
    });
  }
}
