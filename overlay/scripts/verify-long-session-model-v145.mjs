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
assert.equal(passingReport.metrics.measurementMode, 'absolute-frame-budget');

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

const ciSoftware = new LongSessionAssuranceV145({ thresholds: { totalWaves: 100, sampleEveryWaves: 5 } });
ciSoftware.start({
  seed: 'CI-SWIFTSHADER-V145',
  targetWaves: 100,
  environment: { softwareRenderer: true, renderer: 'ANGLE SwiftShader Device', vendor: 'Google Inc.', headless: true }
});
let measuredLongTasks = 0;
let measuredLongTaskMs = 0;
for (let wave = 0; wave <= 100; wave += 5) {
  const frameP95Ms = 200 + Math.sin(wave / 8) * 14;
  const windowLongTasks = 26 + (wave % 15 === 0 ? 2 : 0);
  measuredLongTasks += windowLongTasks;
  measuredLongTaskMs += windowLongTasks * frameP95Ms;
  ciSoftware.record({
    wave,
    state: 'playing',
    frameWindow: {
      samples: 24,
      requestedSamples: 24,
      complete: true,
      timedOut: false,
      p50Ms: frameP95Ms - 16,
      p95Ms: frameP95Ms,
      maxMs: frameP95Ms + 17,
      longTasksDelta: windowLongTasks,
      longTaskMsDelta: windowLongTasks * frameP95Ms
    },
    memory: { supported: true, usedJSHeapMB: 92 + wave * .05 },
    renderer: { textures: 30, geometries: 320 - wave * 2, drawCalls: 140, triangles: 52000 },
    browserReliability: {
      contextLosses: wave >= 50 ? 1 : 0,
      contextRestores: wave >= 50 ? 1 : 0,
      longTasks: measuredLongTasks,
      longTaskMs: measuredLongTaskMs
    },
    runtimeErrors: 0
  });
}
ciSoftware.noteContextExercise({ supported: true, lost: true, restored: true, lossDelta: 1, restoreDelta: 1 });
const ciSoftwareReport = ciSoftware.finish({ requireContextExercise: true });
assert.equal(ciSoftwareReport.passed, true);
assert.equal(ciSoftwareReport.metrics.measurementMode, 'software-renderer-calibrated');
assert.equal(ciSoftwareReport.metrics.longTaskMeasurementMode, 'software-renderer-rate');
assert.ok(ciSoftwareReport.metrics.frameP95Ms > ciSoftwareReport.thresholds.maxFrameP95Ms);
assert.ok(ciSoftwareReport.metrics.longTaskGrowth > ciSoftwareReport.thresholds.maxLongTaskGrowth);
assert.equal(ciSoftwareReport.checks.frameP95, true);
assert.equal(ciSoftwareReport.checks.longTasks, true);
assert.equal(ciSoftwareReport.checks.measurementCoverage, true);

const sameLoadOnHardware = new LongSessionAssuranceV145({ thresholds: { totalWaves: 10, sampleEveryWaves: 5 } });
sameLoadOnHardware.start({ targetWaves: 10, environment: { softwareRenderer: false, renderer: 'Hardware GPU' } });
for (let wave = 0; wave <= 10; wave += 5) sameLoadOnHardware.record({
  wave,
  frameWindow: { samples: 24, requestedSamples: 24, complete: true, p95Ms: 200, longTasksDelta: 26 },
  browserReliability: { longTasks: (wave / 5 + 1) * 26 }
});
sameLoadOnHardware.noteContextExercise({ supported: true, lost: true, restored: true });
const hardwareReport = sameLoadOnHardware.finish({ requireContextExercise: true });
assert.equal(hardwareReport.passed, false);
assert.equal(hardwareReport.checks.frameP95, false);
assert.equal(hardwareReport.metrics.measurementMode, 'absolute-frame-budget');

const softwareRegression = new LongSessionAssuranceV145({ thresholds: { totalWaves: 20, sampleEveryWaves: 5 } });
softwareRegression.start({ targetWaves: 20, environment: { softwareRenderer: true, renderer: 'SwiftShader' } });
let cumulativeTasks = 0;
for (let wave = 0; wave <= 20; wave += 5) {
  const p95 = wave < 10 ? 200 : 200 + (wave - 5) * 10;
  const deltaTasks = wave < 10 ? 24 : 40;
  cumulativeTasks += deltaTasks;
  softwareRegression.record({
    wave,
    frameWindow: { samples: 24, requestedSamples: 24, complete: true, p95Ms: p95, longTasksDelta: deltaTasks },
    browserReliability: { longTasks: cumulativeTasks }
  });
}
softwareRegression.noteContextExercise({ supported: true, lost: true, restored: true });
const softwareRegressionReport = softwareRegression.finish({ requireContextExercise: true });
assert.equal(softwareRegressionReport.passed, false);
assert.ok(!softwareRegressionReport.checks.frameP95 || !softwareRegressionReport.checks.frameTrend || !softwareRegressionReport.checks.longTasks);

const incompleteWindow = new LongSessionAssuranceV145({ thresholds: { totalWaves: 5, sampleEveryWaves: 5 } });
incompleteWindow.start({ targetWaves: 5, environment: { softwareRenderer: true, renderer: 'SwiftShader' } });
incompleteWindow.record({ wave: 0, frameWindow: { samples: 12, requestedSamples: 24, complete: false, timedOut: true, p95Ms: 200, longTasksDelta: 12 } });
incompleteWindow.record({ wave: 5, frameWindow: { samples: 24, requestedSamples: 24, complete: true, p95Ms: 205, longTasksDelta: 24 } });
incompleteWindow.noteContextExercise({ supported: true, lost: true, restored: true });
const incompleteReport = incompleteWindow.finish({ requireContextExercise: true });
assert.equal(incompleteReport.checks.measurementCoverage, false);
assert.equal(incompleteReport.passed, false);

assert.throws(() => {
  const invalid = new LongSessionAssuranceV145();
  invalid.start();
  invalid.record({ wave: 10 });
  invalid.record({ wave: 10 });
}, /must increase/);

const compensated = normalizeLongSessionBrowserSampleV145(
  { longTasks: 24, longTaskMs: 850, contextLosses: 1, contextRestores: 1 },
  { measuredLongTasks: 2, measuredLongTaskMs: 110, measuredFrames: 48 }
);
assert.equal(compensated.longTasks, 2);
assert.equal(compensated.longTaskMs, 110);
assert.equal(compensated.measuredFrames, 48);
assert.equal(compensated.longTasksPerMeasuredFrame, 0.042);

console.log('PASS v1.0.45 long-session model separates software-renderer CI calibration from real hardware regressions');
