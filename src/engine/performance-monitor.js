export class PerformanceMonitor {
  constructor(config) {
    this.config = config;
    this.elapsed = 0;
    this.frames = 0;
    this.lowSamples = 0;
    this.recoverySamples = 0;
    this.lastFps = 60;
  }

  sample(dt, currentScale) {
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
      return { fps, scale: Math.min(currentScale, this.config.lowScale), tier: 'low' };
    }
    if (fps < this.config.mediumFps) {
      this.lowSamples = 0;
      this.recoverySamples = 0;
      return { fps, scale: Math.min(currentScale, this.config.mediumScale), tier: 'medium' };
    }
    if (fps >= this.config.recoveryFps) {
      this.lowSamples = 0;
      this.recoverySamples += 1;
      if (this.recoverySamples >= this.config.recoverySamples && currentScale < 1) {
        this.recoverySamples = 0;
        return { fps, scale: Math.min(1, currentScale + 0.08), tier: 'recover' };
      }
    } else {
      this.recoverySamples = 0;
    }
    return { fps, scale: currentScale, tier: 'stable' };
  }
}
