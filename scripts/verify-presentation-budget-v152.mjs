import { CharacterPresentationBudgetV152 } from '../src/runtime/character-presentation-budget-v152.js';

const assert = (value, message) => { if (!value) throw new Error(message); };

const healthy = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 24; index += 1) healthy.observe({ gpuMs: 8, cpuMs: 1.2, frameMs: 16.7, source: 'test-healthy' });
assert(healthy.report.activeTier === 'cinematic', 'healthy samples must preserve cinematic tier');
assert(healthy.report.downgrades === 0, 'healthy samples must not count downgrade');

const overloaded = new CharacterPresentationBudgetV152({ initialTier: 'cinematic' });
for (let index = 0; index < 12; index += 1) overloaded.observe({ gpuMs: 18, cpuMs: 1.1, frameMs: 20, source: 'test-gpu-overload' });
assert(overloaded.report.activeTier === 'balanced', 'sustained GPU p95 breach must downgrade cinematic to balanced');
assert(overloaded.report.lastReason === 'gpu-p95-budget', 'GPU downgrade reason mismatch');
assert(overloaded.report.downgrades === 1, 'downgrade must happen once');
for (let index = 0; index < 30; index += 1) overloaded.observe({ gpuMs: 25, cpuMs: 8, frameMs: 45, source: 'test-post-downgrade' });
assert(overloaded.report.activeTier === 'balanced', 'policy must not cascade below balanced');
assert(overloaded.report.downgrades === 1, 'post-downgrade samples must not repeat downgrade');

const invalid = new CharacterPresentationBudgetV152({ initialTier: 'balanced' });
invalid.observe({ gpuMs: Number.NaN, cpuMs: undefined, frameMs: null });
assert(invalid.report.metrics.samples === 0, 'invalid samples must be ignored');
assert(invalid.report.activeTier === 'balanced', 'non-cinematic requested tier must remain unchanged');

console.log('PASS v1.0.52 presentation budget preserves healthy cinematic mode and performs one-way sustained downgrade');
