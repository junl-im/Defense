import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeLongSessionBrowserSampleV145, summarizeFrameDurationsV145 } from '../src/runtime/long-session-assurance-v145.js';

const root = path.resolve(import.meta.dirname, '..');
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const harness = fs.readFileSync(path.join(root, 'scripts/run-long-session-v145.mjs'), 'utf8');

const measured = normalizeLongSessionBrowserSampleV145(
  { longTasks: 27, longTaskMs: 910, contextLosses: 1, contextRestores: 1 },
  { measuredLongTasks: 3, measuredLongTaskMs: 146.25 }
);
assert.equal(measured.longTasks, 3);
assert.equal(measured.longTaskMs, 146.25);
assert.equal(measured.contextLosses, 1);
assert.equal(measured.rawLongTasks, 27);
assert.equal(measured.rawLongTaskMs, 910);

const fallback = normalizeLongSessionBrowserSampleV145({ longTasks: 4, longTaskMs: 205 });
assert.equal(fallback.longTasks, 4);
assert.equal(fallback.longTaskMs, 205);

const contaminated = summarizeFrameDurationsV145([84, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17, 16, 17], { warmupFrames: 1 });
assert.equal(contaminated.warmupFrames, 1);
assert.equal(contaminated.samples, 24);
assert.equal(contaminated.p95Ms, 17);
assert.equal(contaminated.maxMs, 17);

const realRegression = summarizeFrameDurationsV145([16, 16, 17, 18, 50, 52, 55, 16, 17, 18, 16, 17, 18, 16, 17, 18, 16, 17, 18, 16, 17, 18, 16, 17], { warmupFrames: 0 });
assert.ok(realRegression.p95Ms >= 50);

assert.match(main, /stabilizeLongSessionMeasurementV145/);
assert.match(main, /longTasksDelta/);
assert.match(main, /warmupFrames/);
assert.match(main, /measuredLongTasks/);
assert.match(harness, /measureFrameWindowV145\(24,\{warmupFrames:3\}\)/);
assert.match(harness, /stabilizeLongSessionMeasurementV145/);
assert.doesNotMatch(harness, /if\(typeof gc===['"]function['"]\) gc\(\)/);
assert.match(harness, /failedChecks/);
assert.match(harness, /worstFrames/);

console.log('PASS v1.0.45 long-session harness excludes controlled GC, warms frame windows, and reports measured regressions');
