import assert from 'node:assert/strict';
import { LongSessionAssuranceV145 } from '../src/runtime/long-session-assurance-v145.js';
import { buildFailureDigestV146 } from '../src/runtime/failure-digest-v146.js';
const model = new LongSessionAssuranceV145({ thresholds: { totalWaves: 30, sampleEveryWaves: 5 } });
model.start({ targetWaves: 30 });
for (let wave = 0; wave <= 30; wave += 5) model.record({
  wave,
  frameWindow: { p95Ms: wave < 20 ? 18 : 48 },
  memory: { supported: true, usedJSHeapMB: 80 + wave * .1 },
  renderer: { textures: 20, geometries: 20 },
  browserReliability: { contextLosses: 0, contextRestores: 0, longTasks: 0 },
  runtimeErrors: 0
});
model.noteContextExercise({ supported: true, lost: true, restored: true });
const report = model.finish({ requireContextExercise: true });
const digest = buildFailureDigestV146(report);
assert.equal(report.passed, false);
assert.equal(digest.firstRegression.wave, 20);
assert.equal(digest.firstRegression.metric, 'frameP95Ms');
assert.match(digest.summary, /wave 20/);
console.log('PASS v1.0.46 machine-readable first-regression digest');
