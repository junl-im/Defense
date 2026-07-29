export class FrameBudgetScheduler {
  constructor() {
    this.channels = new Map();
    this.frame = 0;
    this.elapsed = 0;
  }

  beginFrame(dt) {
    this.frame += 1;
    this.elapsed += Math.max(0, dt || 0);
  }

  shouldRun(channel, hz = 60, { immediate = false } = {}) {
    const interval = hz > 0 ? 1 / hz : Infinity;
    const state = this.channels.get(channel) || { elapsed: immediate ? interval : 0, runs: 0, skips: 0 };
    state.elapsed += Math.max(0, this.lastDt || 0);
    if (immediate || state.elapsed + 1e-6 >= interval) {
      state.elapsed = interval === Infinity || immediate ? 0 : Math.max(0, state.elapsed - interval);
      state.runs += 1;
      this.channels.set(channel, state);
      return true;
    }
    state.skips += 1;
    this.channels.set(channel, state);
    return false;
  }

  tick(dt) {
    this.lastDt = Math.max(0, dt || 0);
    this.beginFrame(this.lastDt);
  }

  reset(channel = '') {
    if (channel) this.channels.delete(channel);
    else this.channels.clear();
  }

  get diagnostics() {
    return Object.freeze({
      frame: this.frame,
      elapsed: Number(this.elapsed.toFixed(2)),
      channels: Object.fromEntries([...this.channels].map(([key, value]) => [key, { runs: value.runs, skips: value.skips }]))
    });
  }
}
