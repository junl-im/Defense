import assert from 'node:assert/strict';
import { LongSessionAssuranceV145, normalizeLongSessionBrowserSampleV145 } from '../src/runtime/long-session-assurance-v145.js';

const passing = new LongSessionAssuranceV145({ thresholds: { totalWaves: 100, sampleEveryWaves: 5 } });
passing.start({ seed: 'UNIT-V145', targetWaves: 100 });
for (let wave = 0; wave <= 100; wave += 5) {
  passing.record({
    wave,
    state: 'playing',
    frameWindow: { p50Ms: 16.2 + wave * .002, p95Ms: 18 + wave * .01, maxMs: 22 },
    memory: { supported: true, usedJSHeapMB: 80 + wave * .08 },
    renderer: { textures: 28 + Math.floor(wave / 50), geometries: 35 + Math.floor(wave / 50), drawCalls: 120, triangles: 45000 },
    browserReliability: { contextLosses: wave >= 50 ? 1 : 0, contextRestores: wave >= 50 ? 1 : 0, longTasks: Math.floor(wave / 25) },
    runtimeErrors: 0
  });
}
passing.noteContextExercise({ supported: true, lost: true, restored: true, lossDelta: 1, restoreDelta: 1 });
const passingReport = passing.finish({ requireContextExercise: true });
assert.equal(passingReport.passed, true);
assert.equal(passingReport.metrics.lastWave, 100);
assert.equal(passingReport.metrics.contextBalance, 0);

const failing = new LongSessionAssuranceV145({ thresholds: { totalWaves: 100, sampleEveryWaves: 5 } });
failing.start({ targetWaves: 100 });
for (let wave = 0; wave <= 100; wave += 5) {
  failing.record({
    wave,
    frameWindow: { p50Ms: 18, p95Ms: 18 + wave * .5, maxMs: 90 },
    memory: { supported: true, usedJSHeapMB: 60 + wave },
    renderer: { textures: 20 + wave, geometries: 20 + wave },
    browserReliability: { contextLosses: 1, contextRestores: 0, longTasks: wave },
    runtimeErrors: wave === 100 ? 1 : 0
  });
}
failing.noteContextExercise({ supported: true, lost: true, restored: false });
const failingReport = failing.finish({ requireContextExercise: true });
assert.equal(failingReport.passed, false);
assert.equal(failingReport.checks.runtimeErrors, false);
assert.equal(failingReport.checks.contextBalanced, false);
assert.equal(failingReport.checks.contextExercise, false);
assert.equal(failingReport.checks.heapGrowth, false);
assert.equal(failingReport.checks.textureGrowth, false);

assert.throws(() => {
  const invalid = new LongSessionAssuranceV145();
  invalid.start();
  invalid.record({ wave: 10 });
  invalid.record({ wave: 10 });
}, /must increase/);


const compensated = normalizeLongSessionBrowserSampleV145(
  { longTasks: 24, longTaskMs: 850, contextLosses: 1, contextRestores: 1 },
  { measuredLongTasks: 2, measuredLongTaskMs: 110 }
);
assert.equal(compensated.longTasks, 2);
assert.equal(compensated.longTaskMs, 110);

console.log('PASS v1.0.45 long-session trend model rejects runtime, memory, renderer, frame, and context regressions');
