export const BOSS_ESCALATION_VERSION = '1.0.0';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class BossEscalationDirector {
  constructor() {
    this.states = new Map();
    this.enrages = 0;
    this.phaseTransitions = 0;
  }

  resetRun() {
    this.states.clear();
    this.enrages = 0;
    this.phaseTransitions = 0;
  }

  register(enemy) {
    if (!enemy?.boss) return null;
    const state = { elapsed: 0, enraged: false, rage: 0, phase: Number(enemy.bossPhase || 1), lastHpRatio: 1 };
    this.states.set(enemy.id, state);
    return state;
  }

  update(enemy, dt) {
    if (!enemy?.boss || enemy.dead) return null;
    const state = this.states.get(enemy.id) || this.register(enemy);
    state.elapsed += Math.max(0, Number(dt) || 0);
    const hpRatio = clamp(enemy.hp / Math.max(1, enemy.maxHp), 0, 1);
    state.rage = clamp((1 - hpRatio) * .62 + Math.max(0, state.elapsed - 55) / 120 + Math.max(0, Number(enemy.bossPhase || 1) - 1) * .16, 0, 1);
    state.lastHpRatio = hpRatio;
    let enteredEnrage = false;
    if (!state.enraged && (state.rage >= .82 || state.elapsed >= 105)) {
      state.enraged = true;
      this.enrages += 1;
      enteredEnrage = true;
    }
    return Object.freeze({ ...state, enteredEnrage });
  }

  recordPhase(enemy, phase) {
    const state = this.states.get(enemy?.id) || this.register(enemy);
    if (!state) return;
    if (Number(phase) > Number(state.phase || 1)) this.phaseTransitions += 1;
    state.phase = Number(phase) || state.phase;
  }

  specialDelayMultiplier(enemy) {
    const state = this.states.get(enemy?.id);
    if (!state) return 1;
    return clamp(1 - state.rage * .22 - (state.enraged ? .16 : 0), .58, 1);
  }

  damageMultiplier(enemy) {
    const state = this.states.get(enemy?.id);
    if (!state) return 1;
    return clamp(1 + state.rage * .16 + (state.enraged ? .16 : 0), 1, 1.32);
  }

  rewardMultiplier(enemy) {
    const state = this.states.get(enemy?.id);
    return state?.enraged ? 1.2 : 1;
  }

  unregister(enemy) {
    this.states.delete(enemy?.id);
  }

  get diagnostics() {
    const active = [...this.states.values()].map((state) => ({
      elapsed: Number(state.elapsed.toFixed(1)),
      enraged: state.enraged,
      rage: Number(state.rage.toFixed(3)),
      phase: state.phase
    }));
    return Object.freeze({ version: BOSS_ESCALATION_VERSION, enrages: this.enrages, phaseTransitions: this.phaseTransitions, active });
  }
}

export default BossEscalationDirector;
