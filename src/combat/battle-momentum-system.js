export const BATTLE_MOMENTUM_VERSION = '1.0.0';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class BattleMomentumSystem {
  constructor() {
    this.gauge = 0;
    this.overdriveRemaining = 0;
    this.overdriveCount = 0;
    this.totalGained = 0;
    this.lastReason = '';
  }

  resetRun() {
    this.gauge = 0;
    this.overdriveRemaining = 0;
    this.overdriveCount = 0;
    this.totalGained = 0;
    this.lastReason = '';
  }

  gain(amount, reason = '') {
    const value = Math.max(0, Number(amount) || 0);
    if (!value) return false;
    this.totalGained += value;
    this.lastReason = reason;
    if (this.overdriveRemaining > 0) {
      this.overdriveRemaining = clamp(this.overdriveRemaining + value * .025, 0, 10);
      return false;
    }
    this.gauge = clamp(this.gauge + value, 0, 100);
    if (this.gauge < 100) return false;
    this.gauge = 0;
    this.overdriveRemaining = 7.5;
    this.overdriveCount += 1;
    return true;
  }

  recordDamage(amount) {
    return this.gain(Math.min(1.8, Math.max(0, Number(amount) || 0) * .012), 'damage');
  }

  recordKill({ boss = false, elite = false, chain = 1 } = {}) {
    return this.gain((boss ? 28 : elite ? 9 : 3) + Math.min(7, Math.max(0, chain - 1) * .18), boss ? 'boss-kill' : elite ? 'elite-kill' : 'kill');
  }

  recordReaction(momentum = 10) {
    return this.gain(momentum, 'reaction');
  }

  recordWave({ perfect = false } = {}) {
    return this.gain(perfect ? 18 : 7, perfect ? 'perfect-wave' : 'wave-clear');
  }

  update(dt) {
    if (this.overdriveRemaining <= 0) return false;
    this.overdriveRemaining = Math.max(0, this.overdriveRemaining - Math.max(0, Number(dt) || 0));
    return this.overdriveRemaining > 0;
  }

  get active() {
    return this.overdriveRemaining > 0;
  }

  get damageMultiplier() {
    return this.active ? 1.22 : 1;
  }

  get rewardMultiplier() {
    return this.active ? 1.14 : 1;
  }

  get diagnostics() {
    return Object.freeze({
      version: BATTLE_MOMENTUM_VERSION,
      gauge: Number(this.gauge.toFixed(1)),
      active: this.active,
      overdriveRemaining: Number(this.overdriveRemaining.toFixed(2)),
      overdriveCount: this.overdriveCount,
      totalGained: Math.round(this.totalGained),
      lastReason: this.lastReason,
      damageMultiplier: this.damageMultiplier,
      rewardMultiplier: this.rewardMultiplier
    });
  }
}

export default BattleMomentumSystem;
