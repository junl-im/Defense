import { CharacterPresentationBudgetV152 } from '../src/runtime/character-presentation-budget-v152.js';

const assert = (value, message) => { if (!value) throw new Error(message); };

const healthy = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 24; index += 1) healthy.observe({ cpuMs: 1.2, frameMs: 16.7, source: 'character-presentation-update' });
assert(healthy.report.activeTier === 'cinematic', 'healthy presentation samples must preserve cinematic tier');
assert(healthy.report.downgrades === 0, 'healthy samples must not count downgrade');

const wholeFrameOverload = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 24; index += 1) wholeFrameOverload.observe({ gpuMs: 28, frameMs: 45, source: 'whole-frame-gpu' });
assert(wholeFrameOverload.report.activeTier === 'cinematic', 'whole-frame GPU load must not be misattributed to character presentation');
assert(wholeFrameOverload.report.metrics.presentationGpuSamples === 0, 'whole-frame GPU samples must remain outside presentation GPU metrics');
assert(wholeFrameOverload.report.metrics.wholeFrameGpuP95Ms === 28, 'whole-frame GPU diagnostics must remain visible');

const gpuOverloaded = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 12; index += 1) gpuOverloaded.observe({ gpuMs: 18, source: 'character-presentation-gpu' });
assert(gpuOverloaded.report.activeTier === 'balanced', 'sustained scoped presentation GPU breach must downgrade cinematic to balanced');
assert(gpuOverloaded.report.lastReason === 'presentation-gpu-p95-budget', 'scoped GPU downgrade reason mismatch');
assert(gpuOverloaded.report.downgrades === 1, 'GPU downgrade must happen once');

const cpuOverloaded = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 12; index += 1) cpuOverloaded.observe({ cpuMs: 4.2, frameMs: 20, source: 'character-presentation-update' });
assert(cpuOverloaded.report.activeTier === 'balanced', 'sustained presentation CPU breach must downgrade cinematic to balanced');
assert(cpuOverloaded.report.lastReason === 'presentation-cpu-p95-budget', 'presentation CPU downgrade reason mismatch');

for (let index = 0; index < 30; index += 1) gpuOverloaded.observe({ gpuMs: 25, cpuMs: 8, frameMs: 45, source: 'character-presentation-gpu' });
assert(gpuOverloaded.report.activeTier === 'balanced', 'policy must not cascade below balanced');
assert(gpuOverloaded.report.downgrades === 1, 'post-downgrade samples must not repeat downgrade');

const invalid = new CharacterPresentationBudgetV152({ initialTier: 'balanced' });
invalid.observe({ gpuMs: Number.NaN, cpuMs: undefined, frameMs: null });
assert(invalid.report.metrics.samples === 0, 'invalid samples must be ignored');
assert(invalid.report.activeTier === 'balanced', 'non-cinematic requested tier must remain unchanged');

console.log('PASS v1.0.52 R9 presentation budget separates whole-frame diagnostics from scoped character cost and preserves one-way downgrade');
