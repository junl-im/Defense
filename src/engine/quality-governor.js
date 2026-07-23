export const QUALITY_PROFILE_VERSION = '1.0.0';

export const QUALITY_PROFILES = Object.freeze({
  cinematic: Object.freeze({ id: 'cinematic', scale: 1, effectScale: 1, shadowScale: 1, simulationHz: 60, hudHz: 30, shadowHz: 30, chunkHz: 20 }),
  high: Object.freeze({ id: 'high', scale: 0.92, effectScale: 0.88, shadowScale: 0.8, simulationHz: 60, hudHz: 30, shadowHz: 24, chunkHz: 18 }),
  balanced: Object.freeze({ id: 'balanced', scale: 0.8, effectScale: 0.68, shadowScale: 0.5, simulationHz: 60, hudHz: 24, shadowHz: 18, chunkHz: 15 }),
  performance: Object.freeze({ id: 'performance', scale: 0.68, effectScale: 0.45, shadowScale: 0, simulationHz: 45, hudHz: 20, shadowHz: 12, chunkHz: 10 })
});

const ORDER = Object.freeze(['performance', 'balanced', 'high', 'cinematic']);

function clampIndex(index) {
  return Math.max(0, Math.min(ORDER.length - 1, index));
}

export class AdaptiveQualityGovernor {
  constructor(config = {}, { mobile = false, lowEnd = false, saveData = false } = {}) {
    this.config = config;
    this.device = { mobile, lowEnd, saveData };
    this.profileId = lowEnd || saveData ? 'balanced' : mobile ? 'high' : 'cinematic';
    this.badSamples = 0;
    this.goodSamples = 0;
    this.changeSerial = 0;
    this.lastReason = 'device-default';
  }

  get profile() {
    return QUALITY_PROFILES[this.profileId];
  }

  score(snapshot = {}) {
    const fps = Number(snapshot.fps || 60);
    const p95 = Number(snapshot.p95FrameMs || 16.67);
    const severe = Number(snapshot.severeFramePercent || 0);
    if (fps < 36 || p95 >= 42 || severe >= 5) return -2;
    if (fps < 49 || p95 >= 29 || severe >= 1.5) return -1;
    if (fps >= 58 && p95 <= 19.5 && severe === 0) return 1;
    return 0;
  }

  evaluate(snapshot = {}) {
    const signal = this.score(snapshot);
    if (signal < 0) {
      this.badSamples += Math.abs(signal);
      this.goodSamples = 0;
    } else if (signal > 0) {
      this.goodSamples += 1;
      this.badSamples = 0;
    } else {
      this.badSamples = Math.max(0, this.badSamples - 1);
      this.goodSamples = Math.max(0, this.goodSamples - 1);
    }

    const currentIndex = ORDER.indexOf(this.profileId);
    let nextIndex = currentIndex;
    let reason = 'stable';
    if (this.badSamples >= 2) {
      nextIndex = clampIndex(currentIndex - 1);
      this.badSamples = 0;
      reason = 'frame-pressure';
    } else if (this.goodSamples >= 3 && !this.device.saveData) {
      const deviceCeiling = this.device.lowEnd ? 1 : this.device.mobile ? 2 : 3;
      nextIndex = Math.min(deviceCeiling, clampIndex(currentIndex + 1));
      this.goodSamples = 0;
      reason = 'sustained-headroom';
    }

    const nextId = ORDER[nextIndex];
    if (nextId === this.profileId) return null;
    this.profileId = nextId;
    this.changeSerial += 1;
    this.lastReason = reason;
    return Object.freeze({ ...this.profile, reason, serial: this.changeSerial });
  }

  force(profileId, reason = 'manual') {
    if (!QUALITY_PROFILES[profileId]) throw new Error(`Unknown quality profile: ${profileId}`);
    if (profileId === this.profileId) return null;
    this.profileId = profileId;
    this.badSamples = 0;
    this.goodSamples = 0;
    this.changeSerial += 1;
    this.lastReason = reason;
    return Object.freeze({ ...this.profile, reason, serial: this.changeSerial });
  }

  get diagnostics() {
    return Object.freeze({
      version: QUALITY_PROFILE_VERSION,
      profile: this.profileId,
      badSamples: this.badSamples,
      goodSamples: this.goodSamples,
      changeSerial: this.changeSerial,
      lastReason: this.lastReason,
      device: { ...this.device }
    });
  }
}
