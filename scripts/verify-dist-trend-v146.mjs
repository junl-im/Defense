import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json'), 'utf8'));
const budgetRun = spawnSync(process.execPath, [path.join(root, 'scripts/verify-dist-budget-v144.mjs')], { cwd: root, env: process.env, encoding: 'utf8', timeout: 60000 });
process.stdout.write(budgetRun.stdout || ''); process.stderr.write(budgetRun.stderr || '');
if (budgetRun.status !== 0) process.exit(budgetRun.status || 1);
const sourceReport = path.join(root, 'logs/qa/v144/dist-budget-report.json');
const measured = JSON.parse(fs.readFileSync(sourceReport, 'utf8'));
const approved = baseline.approvedMeasurements;
const percent = Number(baseline.maxRegressionPercent || 5);
const keys = ['initialJsGzipBytes', 'initialCssGzipBytes', 'initialRequests', 'initialTextureUploadBytes'];
const actual = {
  initialJsGzipBytes: measured.initial.js.gzipBytes,
  initialCssGzipBytes: measured.initial.css.gzipBytes,
  initialRequests: measured.initial.requests,
  initialTextureUploadBytes: measured.initial.textures.estimatedUploadBytes
};
const envelope = measured.thresholds;
const envelopeMap = {
  initialJsGzipBytes: envelope.maxInitialJsGzipBytes,
  initialCssGzipBytes: envelope.maxInitialCssGzipBytes,
  initialRequests: envelope.maxInitialRequests,
  initialTextureUploadBytes: envelope.maxInitialTextureUploadBytes
};
const checks = {};
for (const key of keys) {
  const basis = approved?.[key];
  const maximum = Number.isFinite(basis) ? Math.floor(basis * (1 + percent / 100)) : envelopeMap[key];
  checks[key] = { actual: actual[key], baseline: Number.isFinite(basis) ? basis : null, maximum, mode: Number.isFinite(basis) ? 'approved-v145-measurement' : 'provisional-v144-envelope', pass: actual[key] <= maximum };
}
const report = { id: 'DD-DIST-TREND-V146', releaseVersion: '1.0.46', baseline, measuredBuild: { releaseVersion: measured.releaseVersion, buildId: measured.buildId }, actual, checks, passed: Object.values(checks).every((entry) => entry.pass) };
const out = path.join(root, 'logs/qa/v146/dist-trend-report.json'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
if (!report.passed) { for (const [key, value] of Object.entries(checks)) if (!value.pass) console.error(`FAIL v146 dist trend ${key}: ${value.actual} > ${value.maximum}`); process.exit(1); }
console.log(`PASS v1.0.46 Vite dist trend (${checks.initialJsGzipBytes.mode})`);
