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
const isPresentationSourceV152 = (source) => source === 'character-presentation-update' || source === 'character-presentation-gpu' || source.startsWith('test-presentation-');
const isPresentationGpuSourceV152 = (source) => source === 'character-presentation-gpu' || source === 'test-presentation-gpu-overload';
const isWholeFrameGpuSourceV152 = (source) => source === 'whole-frame-gpu' || source === 'webgl2-disjoint-timer-query' || source.startsWith('test-whole-frame-');

export class CharacterPresentationBudgetV152 {
  constructor({ initialTier = 'cinematic', policy = CHARACTER_PRESENTATION_BUDGET_POLICY_V152 } = {}) {
    this.policy = policy;
    this.requestedTier = initialTier;
    this.activeTier = initialTier;
    this.samples = [];
    this.breachWindows = 0;
    this.downgrades = 0;
    this.lastReason = '';
    this.lastMetrics = Object.freeze({
      gpuP95Ms: 0,
      cpuP95Ms: 0,
      frameP95Ms: 0,
      presentationGpuP95Ms: 0,
      presentationCpuP95Ms: 0,
      wholeFrameGpuP95Ms: 0,
      wholeFrameP95Ms: 0,
      samples: 0,
      presentationGpuSamples: 0,
      presentationCpuSamples: 0,
      wholeFrameGpuSamples: 0,
      wholeFrameSamples: 0
    });
  }

  observe({ gpuMs = null, cpuMs = null, frameMs = null, source = 'character-presentation-update' } = {}) {
    const normalizedSource = String(source || 'character-presentation-update');
    const gpu = finite(gpuMs);
    const cpu = finite(cpuMs);
    const frame = finite(frameMs);
    const presentationSource = isPresentationSourceV152(normalizedSource);
    const presentationGpuSource = isPresentationGpuSourceV152(normalizedSource);
    const wholeFrameGpuSource = isWholeFrameGpuSourceV152(normalizedSource);
    const sample = {
      source: normalizedSource,
      presentationGpuMs: presentationGpuSource ? gpu : null,
      presentationCpuMs: presentationSource ? cpu : null,
      wholeFrameGpuMs: wholeFrameGpuSource ? gpu : null,
      wholeFrameMs: frame
    };
    if (sample.presentationGpuMs === null && sample.presentationCpuMs === null && sample.wholeFrameGpuMs === null && sample.wholeFrameMs === null) return this.report;
    this.samples.push(sample);
    while (this.samples.length > this.policy.sampleWindow) this.samples.shift();
    const presentationGpu = this.samples.map((entry) => entry.presentationGpuMs).filter((value) => value !== null);
    const presentationCpu = this.samples.map((entry) => entry.presentationCpuMs).filter((value) => value !== null);
    const wholeFrameGpu = this.samples.map((entry) => entry.wholeFrameGpuMs).filter((value) => value !== null);
    const wholeFrame = this.samples.map((entry) => entry.wholeFrameMs).filter((value) => value !== null);
    const presentationGpuP95Ms = percentile(presentationGpu);
    const presentationCpuP95Ms = percentile(presentationCpu);
    const wholeFrameGpuP95Ms = percentile(wholeFrameGpu);
    const wholeFrameP95Ms = percentile(wholeFrame);
    this.lastMetrics = Object.freeze({
      gpuP95Ms: presentationGpuP95Ms,
      cpuP95Ms: presentationCpuP95Ms,
      frameP95Ms: wholeFrameP95Ms,
      presentationGpuP95Ms,
      presentationCpuP95Ms,
      wholeFrameGpuP95Ms,
      wholeFrameP95Ms,
      samples: this.samples.length,
      gpuSamples: presentationGpu.length,
      cpuSamples: presentationCpu.length,
      frameSamples: wholeFrame.length,
      presentationGpuSamples: presentationGpu.length,
      presentationCpuSamples: presentationCpu.length,
      wholeFrameGpuSamples: wholeFrameGpu.length,
      wholeFrameSamples: wholeFrame.length
    });
    if (this.activeTier !== this.policy.downgrade.from) return this.report;
    const gpuBreach = presentationGpu.length >= this.policy.minSamples && presentationGpuP95Ms > this.policy.cinematicGpuP95Ms;
    const cpuBreach = presentationCpu.length >= this.policy.minSamples && presentationCpuP95Ms > this.policy.cinematicCpuP95Ms;
    if (gpuBreach || cpuBreach) this.breachWindows += 1;
    else if (presentationGpu.length || presentationCpu.length) this.breachWindows = Math.max(0, this.breachWindows - 1);
    if (this.breachWindows >= this.policy.sustainedBreaches) {
      this.activeTier = this.policy.downgrade.to;
      this.downgrades += 1;
      this.lastReason = gpuBreach ? 'presentation-gpu-p95-budget' : 'presentation-cpu-p95-budget';
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
