export const LONG_SESSION_ASSURANCE_VERSION = '1.0.45';
export const LONG_SESSION_ASSURANCE_ID = 'DD-LONG-SESSION-ASSURANCE-V145';

export const DEFAULT_LONG_SESSION_THRESHOLDS_V145 = Object.freeze({
  totalWaves: 100,
  sampleEveryWaves: 5,
  maxRuntimeErrors: 0,
  maxUnmatchedContextLosses: 0,
  maxHeapGrowthMB: 32,
  maxHeapSlopeMBPer10Waves: 3.2,
  maxTextureGrowth: 12,
  maxTextureSlopePer10Waves: 1.2,
  maxGeometryGrowth: 12,
  maxGeometrySlopePer10Waves: 1.2,
  maxFrameP95Ms: 34,
  maxFrameSlopeMsPer10Waves: 1.5,
  maxLongTaskGrowth: 12
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => {
  const scale = 10 ** digits;
  return Math.round(finite(value) * scale) / scale;
};
const freeze = (value) => Object.freeze(value);

export function normalizeLongSessionBrowserSampleV145(browser = {}, harness = {}) {
  const measuredLongTasks = finite(harness.measuredLongTasks, NaN);
  const measuredLongTaskMs = finite(harness.measuredLongTaskMs, NaN);
  return freeze({
    ...browser,
    rawLongTasks: Math.max(0, Math.round(finite(browser.longTasks))),
    rawLongTaskMs: round(browser.longTaskMs),
    longTasks: Math.max(0, Math.round(Number.isFinite(measuredLongTasks) ? measuredLongTasks : finite(browser.longTasks))),
    longTaskMs: round(Number.isFinite(measuredLongTaskMs) ? measuredLongTaskMs : finite(browser.longTaskMs))
  });
}

export function summarizeFrameDurationsV145(values = [], { warmupFrames = 0 } = {}) {
  const allDurations = [...values].map((value) => Math.max(0, finite(value, NaN))).filter(Number.isFinite);
  const warmup = Math.max(0, Math.min(allDurations.length, Math.round(finite(warmupFrames))));
  const durations = allDurations.slice(warmup);
  const sorted = [...durations].sort((a, b) => a - b);
  const pick = (ratio) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))] : 0;
  return freeze({
    samples: durations.length,
    warmupFrames: warmup,
    p50Ms: round(pick(.5)),
    p95Ms: round(pick(.95)),
    maxMs: round(sorted.at(-1) || 0)
  });
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function slopePer10Waves(samples, key) {
  const points = samples
    .map((sample) => ({ x: finite(sample.wave), y: finite(sample[key], NaN) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (points.length < 2) return 0;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (denominator <= 0) return 0;
  const numerator = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
  return round((numerator / denominator) * 10);
}

function growth(samples, key) {
  if (samples.length < 2) return 0;
  return round(finite(samples.at(-1)?.[key]) - finite(samples[0]?.[key]));
}

export function normalizeLongSessionSampleV145(input = {}) {
  const frameWindow = input.frameWindow || {};
  const renderer = input.renderer || {};
  const browser = input.browserReliability || input.browser || {};
  const memory = input.memory || {};
  return freeze({
    wave: Math.max(0, Math.round(finite(input.wave ?? input.currentWave))),
    state: String(input.state || ''),
    timestampMs: round(input.timestampMs ?? (typeof performance !== 'undefined' ? performance.now() : Date.now())),
    frameP50Ms: round(frameWindow.p50Ms ?? input.frameP50Ms ?? (finite(input.fps) > 0 ? 1000 / finite(input.fps) : 0)),
    frameP95Ms: round(frameWindow.p95Ms ?? input.frameP95Ms ?? (finite(input.fps) > 0 ? 1000 / finite(input.fps) : 0)),
    frameMaxMs: round(frameWindow.maxMs ?? input.frameMaxMs ?? 0),
    heapUsedMB: round(memory.usedJSHeapMB ?? input.heapUsedMB),
    heapSupported: Boolean(memory.supported ?? input.heapSupported),
    textures: Math.max(0, Math.round(finite(renderer.textures ?? input.textures))),
    geometries: Math.max(0, Math.round(finite(renderer.geometries ?? input.geometries))),
    drawCalls: Math.max(0, Math.round(finite(renderer.drawCalls ?? input.drawCalls))),
    triangles: Math.max(0, Math.round(finite(renderer.triangles ?? input.triangles))),
    contextLosses: Math.max(0, Math.round(finite(browser.contextLosses ?? input.contextLosses))),
    contextRestores: Math.max(0, Math.round(finite(browser.contextRestores ?? input.contextRestores))),
    longTasks: Math.max(0, Math.round(finite(browser.longTasks ?? input.longTasks))),
    longTaskMs: round(browser.longTaskMs ?? input.longTaskMs),
    rawLongTasks: Math.max(0, Math.round(finite(browser.rawLongTasks ?? input.rawLongTasks ?? browser.longTasks ?? input.longTasks))),
    rawLongTaskMs: round(browser.rawLongTaskMs ?? input.rawLongTaskMs ?? browser.longTaskMs ?? input.longTaskMs),
    runtimeErrors: Math.max(0, Math.round(finite(input.runtimeErrors))),
    enemies: Math.max(0, Math.round(finite(input.counts?.enemies ?? input.enemies))),
    units: Math.max(0, Math.round(finite(input.counts?.units ?? input.units))),
    projectiles: Math.max(0, Math.round(finite(input.counts?.projectiles ?? input.projectiles))),
    particles: Math.max(0, Math.round(finite(input.counts?.particles ?? input.particles)))
  });
}

export class LongSessionAssuranceV145 {
  constructor({ thresholds = DEFAULT_LONG_SESSION_THRESHOLDS_V145 } = {}) {
    this.thresholds = freeze({ ...DEFAULT_LONG_SESSION_THRESHOLDS_V145, ...thresholds });
    this.reset();
  }

  reset() {
    this.started = false;
    this.completed = false;
    this.seed = '';
    this.targetWaves = this.thresholds.totalWaves;
    this.samples = [];
    this.startedAt = 0;
    this.completedAt = 0;
    this.contextExercise = freeze({ attempted: false, supported: false, lost: false, restored: false });
    return this;
  }

  start({ seed = 'V145-LONG-SESSION', targetWaves = this.thresholds.totalWaves } = {}) {
    this.reset();
    this.started = true;
    this.seed = String(seed);
    this.targetWaves = Math.max(1, Math.round(finite(targetWaves, this.thresholds.totalWaves)));
    this.startedAt = Date.now();
    return this.report;
  }

  record(input = {}) {
    if (!this.started) this.start();
    const sample = normalizeLongSessionSampleV145(input);
    const previous = this.samples.at(-1);
    if (previous && sample.wave <= previous.wave) throw new Error(`v145 sample wave must increase (${sample.wave} <= ${previous.wave})`);
    this.samples.push(sample);
    return sample;
  }

  noteContextExercise(result = {}) {
    this.contextExercise = freeze({
      attempted: true,
      supported: Boolean(result.supported),
      lost: Boolean(result.lost),
      restored: Boolean(result.restored),
      lossDelta: Math.max(0, Math.round(finite(result.lossDelta))),
      restoreDelta: Math.max(0, Math.round(finite(result.restoreDelta))),
      detail: String(result.detail || '')
    });
    return this.contextExercise;
  }

  finish({ requireContextExercise = true } = {}) {
    this.completed = true;
    this.completedAt = Date.now();
    const report = this.buildReport({ requireContextExercise });
    return freeze(report);
  }

  buildReport({ requireContextExercise = false } = {}) {
    const samples = this.samples;
    const first = samples[0] || normalizeLongSessionSampleV145({});
    const last = samples.at(-1) || first;
    const frameP95Values = samples.map((sample) => sample.frameP95Ms).filter((value) => value > 0);
    const heapSamples = samples.filter((sample) => sample.heapSupported);
    const heapGrowthMB = heapSamples.length >= 2 ? growth(heapSamples, 'heapUsedMB') : 0;
    const contextBalance = last.contextLosses - last.contextRestores;
    const metrics = freeze({
      sampledWaves: samples.length,
      firstWave: first.wave,
      lastWave: last.wave,
      durationMs: Math.max(0, (this.completedAt || Date.now()) - (this.startedAt || Date.now())),
      runtimeErrors: last.runtimeErrors,
      frameP95Ms: round(percentile(frameP95Values, .95)),
      frameSlopeMsPer10Waves: slopePer10Waves(samples, 'frameP95Ms'),
      heapSupported: heapSamples.length >= 2,
      heapGrowthMB,
      heapSlopeMBPer10Waves: heapSamples.length >= 2 ? slopePer10Waves(heapSamples, 'heapUsedMB') : 0,
      textureGrowth: growth(samples, 'textures'),
      textureSlopePer10Waves: slopePer10Waves(samples, 'textures'),
      geometryGrowth: growth(samples, 'geometries'),
      geometrySlopePer10Waves: slopePer10Waves(samples, 'geometries'),
      longTaskGrowth: growth(samples, 'longTasks'),
      longTaskMsGrowth: growth(samples, 'longTaskMs'),
      rawLongTaskGrowth: growth(samples, 'rawLongTasks'),
      rawLongTaskMsGrowth: growth(samples, 'rawLongTaskMs'),
      contextLosses: last.contextLosses,
      contextRestores: last.contextRestores,
      contextBalance
    });

    const checks = freeze({
      targetReached: last.wave >= this.targetWaves,
      sampleCoverage: samples.length >= Math.floor(this.targetWaves / Math.max(1, this.thresholds.sampleEveryWaves)),
      runtimeErrors: metrics.runtimeErrors <= this.thresholds.maxRuntimeErrors,
      frameP95: metrics.frameP95Ms > 0 && metrics.frameP95Ms <= this.thresholds.maxFrameP95Ms,
      frameTrend: metrics.frameSlopeMsPer10Waves <= this.thresholds.maxFrameSlopeMsPer10Waves,
      heapGrowth: !metrics.heapSupported || metrics.heapGrowthMB <= this.thresholds.maxHeapGrowthMB,
      heapTrend: !metrics.heapSupported || metrics.heapSlopeMBPer10Waves <= this.thresholds.maxHeapSlopeMBPer10Waves,
      textureGrowth: metrics.textureGrowth <= this.thresholds.maxTextureGrowth,
      textureTrend: metrics.textureSlopePer10Waves <= this.thresholds.maxTextureSlopePer10Waves,
      geometryGrowth: metrics.geometryGrowth <= this.thresholds.maxGeometryGrowth,
      geometryTrend: metrics.geometrySlopePer10Waves <= this.thresholds.maxGeometrySlopePer10Waves,
      longTasks: metrics.longTaskGrowth <= this.thresholds.maxLongTaskGrowth,
      contextBalanced: metrics.contextBalance <= this.thresholds.maxUnmatchedContextLosses,
      contextExercise: !requireContextExercise || (this.contextExercise.supported && this.contextExercise.lost && this.contextExercise.restored)
    });

    return {
      id: LONG_SESSION_ASSURANCE_ID,
      releaseVersion: LONG_SESSION_ASSURANCE_VERSION,
      seed: this.seed,
      targetWaves: this.targetWaves,
      thresholds: this.thresholds,
      contextExercise: this.contextExercise,
      metrics,
      checks,
      passed: Object.values(checks).every(Boolean),
      samples: [...samples]
    };
  }

  get report() {
    return freeze(this.buildReport());
  }
}

export default LongSessionAssuranceV145;
