export const BOSS_BREAK_SYSTEM_VERSION = '1.0.0';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class BossBreakSystem {
  constructor() {
    this.states = new Map();
    this.breaks = 0;
    this.totalBreakDamage = 0;
  }

  resetRun() {
    this.states.clear();
    this.breaks = 0;
    this.totalBreakDamage = 0;
  }

  register(enemy) {
    if (!enemy?.boss) return null;
    const state = {
      gauge: 0,
      staggerRemaining: 0,
      immunityRemaining: 0,
      breaks: 0,
      lastSource: '',
      vulnerability: 1
    };
    this.states.set(enemy.id, state);
    return state;
  }

  getState(enemy) {
    return this.states.get(enemy?.id) || this.register(enemy);
  }

  recordDamage(enemy, amount, { reaction = false, critical = false, status = false, source = '' } = {}) {
    if (!enemy?.boss || enemy.dead) return null;
    const state = this.getState(enemy);
    if (!state || state.immunityRemaining > 0 || state.staggerRemaining > 0) return null;
    const ratio = Math.max(0, Number(amount) || 0) / Math.max(1, Number(enemy.maxHp) || 1);
    let gain = ratio * 430;
    if (reaction) gain *= 1.55;
    if (critical) gain *= 1.2;
    if (status) gain *= 1.12;
    gain = clamp(gain, 0, 18);
    state.gauge = clamp(state.gauge + gain, 0, 100);
    state.lastSource = String(source || 'damage');
    if (state.gauge < 100) return Object.freeze({ triggered: false, gauge: state.gauge, gain });
    state.gauge = 0;
    state.staggerRemaining = 3.25;
    state.immunityRemaining = 8.5;
    state.breaks += 1;
    state.vulnerability = 1.22;
    this.breaks += 1;
    this.totalBreakDamage += amount;
    return Object.freeze({ triggered: true, gauge: 0, gain, duration: state.staggerRemaining, breaks: state.breaks });
  }

  update(enemy, dt) {
    if (!enemy?.boss || enemy.dead) return null;
    const state = this.getState(enemy);
    const delta = Math.max(0, Number(dt) || 0);
    state.staggerRemaining = Math.max(0, state.staggerRemaining - delta);
    state.immunityRemaining = Math.max(0, state.immunityRemaining - delta);
    state.vulnerability = state.staggerRemaining > 0 ? 1.22 : 1;
    return Object.freeze({ ...state, staggered: state.staggerRemaining > 0 });
  }

  damageTakenMultiplier(enemy) {
    return this.states.get(enemy?.id)?.vulnerability || 1;
  }

  unregister(enemy) {
    this.states.delete(enemy?.id);
  }

  get diagnostics() {
    const active = [...this.states.values()].map((state) => ({
      gauge: Number(state.gauge.toFixed(1)),
      staggerRemaining: Number(state.staggerRemaining.toFixed(2)),
      immunityRemaining: Number(state.immunityRemaining.toFixed(2)),
      breaks: state.breaks,
      lastSource: state.lastSource
    }));
    return Object.freeze({
      version: BOSS_BREAK_SYSTEM_VERSION,
      breaks: this.breaks,
      totalBreakDamage: Math.round(this.totalBreakDamage),
      active
    });
  }
}

export default BossBreakSystem;
