import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.44.json'), 'utf8'));
const reportPath = path.join(root, 'logs/qa/v145/performance-trend-report.json');
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};
const record = (files) => ({
  count: files.length,
  rawBytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
  gzipBytes: files.reduce((sum, file) => sum + zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length, 0)
});
const isV146Addition = (file) => /-v146\.js$/.test(file);
const v145SourceFiles = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js') && !isV146Addition(file));
const v145RuntimeFiles = walk(path.join(root, 'src/runtime')).filter((file) => file.endsWith('.js') && !isV146Addition(file));
const current = {
  mainJs: record([path.join(root, 'src/main.js')]),
  styleCss: record([path.join(root, 'src/style.css')]),
  allSourceJs: record(v145SourceFiles),
  runtimeJs: record(v145RuntimeFiles),
  engineJs: record(walk(path.join(root, 'src/engine')).filter((file) => file.endsWith('.js')))
};
const percent = Number(baseline.maxRegressionPercent || 5);
const checks = {};
for (const [group, values] of Object.entries(current)) {
  const approved = baseline.metrics[group];
  if (!approved) throw new Error(`v145 baseline group missing: ${group}`);
  checks[group] = {};
  for (const metric of ['rawBytes', 'gzipBytes']) {
    const maximum = Math.floor(approved[metric] * (1 + percent / 100));
    const actual = values[metric];
    checks[group][metric] = {
      baseline: approved[metric],
      actual,
      delta: actual - approved[metric],
      deltaPercent: Math.round(((actual - approved[metric]) / Math.max(1, approved[metric])) * 10000) / 100,
      maximum,
      pass: actual <= maximum
    };
  }
}
const report = {
  id: 'DD-PERFORMANCE-TREND-V145',
  releaseVersion: '1.0.45',
  baseline: { id: baseline.id, releaseVersion: baseline.releaseVersion, buildId: baseline.buildId, maxRegressionPercent: percent },
  measurementScope: 'v1.0.45 source surface; later release modules are measured by their own release gate',
  excludedForwardModules: walk(path.join(root, 'src')).filter((file) => file.endsWith('.js') && isV146Addition(file)).map((file) => path.relative(root, file).replaceAll('\\', '/')).sort(),
  current,
  checks,
  passed: Object.values(checks).every((group) => Object.values(group).every((check) => check.pass))
};
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) {
  for (const [group, groupChecks] of Object.entries(checks)) {
    for (const [metric, check] of Object.entries(groupChecks)) {
      if (!check.pass) console.error(`FAIL v145 performance trend ${group}.${metric}: ${check.actual} > ${check.maximum} (${check.deltaPercent}%)`);
    }
  }
  process.exit(1);
}
console.log(`PASS v1.0.45 performance trend stays within ${percent}% of approved v1.0.44 source package`);
