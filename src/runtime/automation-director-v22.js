export const AUTOMATION_DIRECTOR_V22_VERSION = '22.0.0';

export default class AutomationDirectorV22 {
  constructor() {
    this.version = AUTOMATION_DIRECTOR_V22_VERSION;
    this.reward = null;
    this.autoSelections = 0;
    this.waveSkips = 0;
    this.vacuumEvents = 0;
    this.vacuumCoins = 0;
    this.vacuumValue = 0;
  }

  beginReward(type, seconds = 10) {
    this.reward = { type, duration: Math.max(1, Number(seconds) || 10), remaining: Math.max(1, Number(seconds) || 10) };
    return this.reward;
  }

  cancelReward(type = '') {
    if (!this.reward || (type && this.reward.type !== type)) return;
    this.reward = null;
  }

  update(dt, state) {
    if (!this.reward) return null;
    if (state !== this.reward.type) { this.reward = null; return null; }
    this.reward.remaining = Math.max(0, this.reward.remaining - Math.max(0, Number(dt) || 0));
    if (this.reward.remaining > 0.0001) return null;
    const rewardType = this.reward.type;
    this.reward = null;
    this.autoSelections += 1;
    return { type: 'auto-select-reward', rewardType };
  }

  noteWaveSkip() { this.waveSkips += 1; }
  noteVacuum(count, value) {
    this.vacuumEvents += 1;
    this.vacuumCoins += Math.max(0, Number(count) || 0);
    this.vacuumValue += Math.max(0, Number(value) || 0);
  }

  get report() {
    return Object.freeze({
      version: this.version,
      reward: this.reward ? { ...this.reward } : null,
      autoSelections: this.autoSelections,
      waveSkips: this.waveSkips,
      vacuumEvents: this.vacuumEvents,
      vacuumCoins: this.vacuumCoins,
      vacuumValue: this.vacuumValue
    });
  }
}
