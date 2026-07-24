export const CORE_FOUNDATION_VERSION = '1.0.2';

const KNOWN_STATES = new Set([
  'loading', 'title', 'playing', 'paused', 'blessing', 'relic', 'contract',
  'choice', 'choice-summon', 'gameover', 'result'
]);

const percentile = (values, ratio) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))];
};

export class CoreFoundationDirectorV101 {
  constructor({ versionPolicy = {}, lowPower = false } = {}) {
    this.versionPolicy = versionPolicy;
    this.lowPower = Boolean(lowPower);
    this.frames = [];
    this.maxFrames = this.lowPower ? 120 : 240;
    this.elapsed = 0;
    this.frame = 0;
    this.emaFrameMs = 16.7;
    this.pressure = 0;
    this.health = 'healthy';
    this.lastState = '';
    this.transitions = [];
    this.invalidStates = 0;
    this.longFrames = 0;
    this.severeFrames = 0;
    this.milestones = [];
    this.channelCadence = new Map();
    this.markMilestone('foundation-created', { lowPower: this.lowPower });
  }

  markMilestone(name, payload = {}) {
    this.milestones.push(Object.freeze({ name, at: Date.now(), ...payload }));
    if (this.milestones.length > 24) this.milestones.shift();
  }

  noteState(state, reason = 'runtime-observation') {
    const next = String(state || 'unknown');
    if (!KNOWN_STATES.has(next)) this.invalidStates += 1;
    if (next === this.lastState) return;
    this.transitions.push(Object.freeze({ from: this.lastState || 'boot', to: next, reason, atFrame: this.frame }));
    if (this.transitions.length > 32) this.transitions.shift();
    this.lastState = next;
  }

  sampleFrame(dt, { state = '', hidden = false } = {}) {
    const seconds = Math.max(0, Math.min(0.25, Number(dt) || 0));
    const frameMs = seconds * 1000;
    this.frame += 1;
    this.elapsed += seconds;
    this.noteState(state);
    if (frameMs > 0) {
      this.frames.push(frameMs);
      if (this.frames.length > this.maxFrames) this.frames.shift();
      this.emaFrameMs += (frameMs - this.emaFrameMs) * 0.08;
      if (frameMs >= 25) this.longFrames += 1;
      if (frameMs >= 40) this.severeFrames += 1;
    }
    const p95 = percentile(this.frames, 0.95);
    const fps = this.emaFrameMs > 0 ? 1000 / this.emaFrameMs : 60;
    const target = hidden ? 0.15 : (fps < 34 || p95 > 42 ? 1 : fps < 48 || p95 > 28 ? 0.55 : 0);
    this.pressure += (target - this.pressure) * (target > this.pressure ? 0.16 : 0.06);
    this.health = this.pressure >= 0.72 ? 'critical' : this.pressure >= 0.28 ? 'watch' : 'healthy';
    return this.diagnostics;
  }

  cadence(channel, baseHz, { minHz = 1, criticalScale = 0.45 } = {}) {
    const base = Math.max(minHz, Number(baseHz) || minHz);
    const lowPowerScale = this.lowPower ? 0.82 : 1;
    const pressureScale = 1 - this.pressure * (1 - criticalScale);
    const hz = Math.max(minHz, base * lowPowerScale * pressureScale);
    this.channelCadence.set(channel, Number(hz.toFixed(2)));
    return hz;
  }

  get diagnostics() {
    const p95 = percentile(this.frames, 0.95);
    const p99 = percentile(this.frames, 0.99);
    const fps = this.emaFrameMs > 0 ? 1000 / this.emaFrameMs : 60;
    return Object.freeze({
      version: CORE_FOUNDATION_VERSION,
      releaseVersion: this.versionPolicy.releaseVersion || '',
      lineageVersion: this.versionPolicy.lineageVersion || '',
      buildId: this.versionPolicy.buildId || '',
      health: this.health,
      pressure: Number(this.pressure.toFixed(3)),
      fps: Number(fps.toFixed(1)),
      emaFrameMs: Number(this.emaFrameMs.toFixed(2)),
      p95FrameMs: Number(p95.toFixed(2)),
      p99FrameMs: Number(p99.toFixed(2)),
      longFrames: this.longFrames,
      severeFrames: this.severeFrames,
      frame: this.frame,
      elapsed: Number(this.elapsed.toFixed(2)),
      state: this.lastState || 'boot',
      invalidStates: this.invalidStates,
      transitions: [...this.transitions],
      channelCadence: Object.fromEntries(this.channelCadence),
      milestones: [...this.milestones]
    });
  }

  get report() {
    return this.diagnostics;
  }
}

export default CoreFoundationDirectorV101;
