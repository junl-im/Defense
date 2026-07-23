function percentile(sorted, ratio) {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

export class PerformanceMonitor {
  constructor(config) {
    this.config = config;
    this.elapsed = 0;
    this.frames = 0;
    this.lowSamples = 0;
    this.recoverySamples = 0;
    this.lastFps = 60;
    this.lastTier = 'stable';

    const telemetryFrames = Math.max(60, config.telemetryWindowFrames || 240);
    this.frameTimes = new Float32Array(telemetryFrames);
    this.frameCursor = 0;
    this.frameCount = 0;
    this.telemetryElapsed = 0;
    this.totalFrames = 0;
    this.longFrames = 0;
    this.severeFrames = 0;
    this.cachedSnapshot = Object.freeze({
      fps: 60,
      averageFrameMs: 16.67,
      p95FrameMs: 16.67,
      p99FrameMs: 16.67,
      maxFrameMs: 16.67,
      frameJitterMs: 0,
      smoothnessScore: 100,
      longFramePercent: 0,
      severeFramePercent: 0,
      targetFrameMs: 1000 / (config.targetFps || 60),
      sampleFrames: 0,
      totalFrames: 0,
      tier: 'stable'
    });
  }

  recordFrame(dt) {
    const frameMs = Math.max(0, Math.min(250, dt * 1000));
    this.frameTimes[this.frameCursor] = frameMs;
    this.frameCursor = (this.frameCursor + 1) % this.frameTimes.length;
    this.frameCount = Math.min(this.frameCount + 1, this.frameTimes.length);
    this.totalFrames += 1;
    if (frameMs >= (this.config.longFrameMs || 25)) this.longFrames += 1;
    if (frameMs >= (this.config.severeFrameMs || 40)) this.severeFrames += 1;
    this.telemetryElapsed += dt;
    if (this.telemetryElapsed >= (this.config.telemetryReportSeconds || 1)) this.refreshSnapshot();
  }

  refreshSnapshot() {
    const values = Array.from(this.frameTimes.subarray(0, this.frameCount)).sort((a, b) => a - b);
    const total = values.reduce((sum, value) => sum + value, 0);
    const averageFrameMs = values.length ? total / values.length : 0;
    const p95FrameMs = percentile(values, 0.95);
    const p99FrameMs = percentile(values, 0.99);
    const variance = values.length ? values.reduce((sum, value) => sum + ((value - averageFrameMs) ** 2), 0) / values.length : 0;
    const frameJitterMs = Math.sqrt(variance);
    const maxFrameMs = values.at(-1) || 0;
    const longFrameCount = values.filter((value) => value >= (this.config.longFrameMs || 25)).length;
    const severeFrameCount = values.filter((value) => value >= (this.config.severeFrameMs || 40)).length;
    const sampleFrames = values.length;
    this.cachedSnapshot = Object.freeze({
      fps: this.lastFps,
      averageFrameMs: Number(averageFrameMs.toFixed(2)),
      p95FrameMs: Number(p95FrameMs.toFixed(2)),
      p99FrameMs: Number(p99FrameMs.toFixed(2)),
      maxFrameMs: Number(maxFrameMs.toFixed(2)),
      frameJitterMs: Number(frameJitterMs.toFixed(2)),
      smoothnessScore: Math.max(0, Math.min(100, Math.round(100 - Math.max(0, p95FrameMs - 16.67) * 2.4 - frameJitterMs * 1.8))),
      longFramePercent: sampleFrames ? Number(((longFrameCount / sampleFrames) * 100).toFixed(1)) : 0,
      severeFramePercent: sampleFrames ? Number(((severeFrameCount / sampleFrames) * 100).toFixed(1)) : 0,
      targetFrameMs: Number((1000 / (this.config.targetFps || 60)).toFixed(2)),
      sampleFrames,
      totalFrames: this.totalFrames,
      sessionLongFrames: this.longFrames,
      sessionSevereFrames: this.severeFrames,
      tier: this.lastTier
    });
    this.telemetryElapsed = 0;
  }

  sample(dt, currentScale) {
    this.recordFrame(dt);
    this.elapsed += dt;
    this.frames += 1;
    if (this.elapsed < this.config.sampleSeconds) return null;

    const fps = this.frames / Math.max(this.elapsed, 0.001);
    this.lastFps = fps;
    this.elapsed = 0;
    this.frames = 0;

    if (fps < this.config.lowFps) {
      this.lowSamples += 1;
      this.recoverySamples = 0;
      this.lastTier = 'low';
      return { fps, scale: Math.min(currentScale, this.config.lowScale), tier: 'low' };
    }
    if (fps < this.config.mediumFps) {
      this.lowSamples = 0;
      this.recoverySamples = 0;
      this.lastTier = 'medium';
      return { fps, scale: Math.min(currentScale, this.config.mediumScale), tier: 'medium' };
    }
    if (fps >= this.config.recoveryFps) {
      this.lowSamples = 0;
      this.recoverySamples += 1;
      if (this.recoverySamples >= this.config.recoverySamples && currentScale < 1) {
        this.recoverySamples = 0;
        this.lastTier = 'recover';
        return { fps, scale: Math.min(1, currentScale + 0.08), tier: 'recover' };
      }
    } else {
      this.recoverySamples = 0;
    }
    this.lastTier = 'stable';
    return { fps, scale: currentScale, tier: 'stable' };
  }

  get snapshot() {
    return this.cachedSnapshot;
  }
}
