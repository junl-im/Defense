export const CHARACTER_PRESENTATION_BUDGET_POLICY_V152 = Object.freeze({
  id: 'DD-CHARACTER-PRESENTATION-BUDGET-V152',
  version: '1.0.52',
  buildId: 'b24.52',
  sampleWindow: 18,
  minSamples: 8,
  cinematicGpuP95Ms: 13.5,
  cinematicCpuP95Ms: 2.4,
  cinematicFrameP95Ms: 30,
  sustainedBreaches: 3,
  downgrade: Object.freeze({ from: 'cinematic', to: 'balanced' })
});

const finite = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};
const percentile = (values, ratio = .95) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))];
};

export class CharacterPresentationBudgetV152 {
  constructor({ initialTier = 'cinematic', policy = CHARACTER_PRESENTATION_BUDGET_POLICY_V152 } = {}) {
    this.policy = policy;
    this.requestedTier = initialTier;
    this.activeTier = initialTier;
    this.samples = [];
    this.breachWindows = 0;
    this.downgrades = 0;
    this.lastReason = '';
    this.lastMetrics = Object.freeze({ gpuP95Ms: 0, cpuP95Ms: 0, frameP95Ms: 0, samples: 0 });
  }

  observe({ gpuMs = null, cpuMs = null, frameMs = null, source = 'runtime' } = {}) {
    const sample = { gpuMs: finite(gpuMs), cpuMs: finite(cpuMs), frameMs: finite(frameMs), source: String(source || 'runtime') };
    if (sample.gpuMs === null && sample.cpuMs === null && sample.frameMs === null) return this.report;
    this.samples.push(sample);
    while (this.samples.length > this.policy.sampleWindow) this.samples.shift();
    const gpu = this.samples.map((entry) => entry.gpuMs).filter((value) => value !== null);
    const cpu = this.samples.map((entry) => entry.cpuMs).filter((value) => value !== null);
    const frame = this.samples.map((entry) => entry.frameMs).filter((value) => value !== null);
    this.lastMetrics = Object.freeze({
      gpuP95Ms: percentile(gpu),
      cpuP95Ms: percentile(cpu),
      frameP95Ms: percentile(frame),
      samples: this.samples.length,
      gpuSamples: gpu.length,
      cpuSamples: cpu.length,
      frameSamples: frame.length
    });
    if (this.activeTier !== this.policy.downgrade.from || this.samples.length < this.policy.minSamples) return this.report;
    const gpuBreach = gpu.length >= this.policy.minSamples && this.lastMetrics.gpuP95Ms > this.policy.cinematicGpuP95Ms;
    const cpuBreach = cpu.length >= this.policy.minSamples && this.lastMetrics.cpuP95Ms > this.policy.cinematicCpuP95Ms;
    const frameBreach = frame.length >= this.policy.minSamples && this.lastMetrics.frameP95Ms > this.policy.cinematicFrameP95Ms;
    if (gpuBreach || cpuBreach || frameBreach) this.breachWindows += 1;
    else this.breachWindows = Math.max(0, this.breachWindows - 1);
    if (this.breachWindows >= this.policy.sustainedBreaches) {
      this.activeTier = this.policy.downgrade.to;
      this.downgrades += 1;
      this.lastReason = gpuBreach ? 'gpu-p95-budget' : cpuBreach ? 'cpu-p95-budget' : 'frame-p95-budget';
      this.breachWindows = 0;
    }
    return this.report;
  }

  get report() {
    return Object.freeze({
      id: this.policy.id,
      requestedTier: this.requestedTier,
      activeTier: this.activeTier,
      downgraded: this.activeTier !== this.requestedTier,
      downgrades: this.downgrades,
      breachWindows: this.breachWindows,
      lastReason: this.lastReason,
      metrics: this.lastMetrics
    });
  }
}
