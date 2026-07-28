import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const stage = path.join(root, 'logs/package/1.0.45/DokkaebiLuckDefense3D_FULL_v1.0.45_LONG_SESSION_ASSURANCE_VERIFIED');
if (!fs.existsSync(stage)) throw new Error('v145 staged package missing');
for (const forbidden of ['dist', 'node_modules', '.git']) if (fs.existsSync(path.join(stage, forbidden))) throw new Error(`forbidden staged path ${forbidden}`);
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
if (pkg.version !== '1.0.45' || pkg.dokkaebi?.buildId !== 'b24.45') throw new Error('v145 staged identity mismatch');
for (const required of ['src/runtime/long-session-assurance-v145.js', 'scripts/run-long-session-v145.mjs', 'scripts/verify-performance-trend-v145.mjs', 'docs/generated/asset-residency-v145.json', 'docs/PERFORMANCE_BASELINE_v1.0.44.json']) {
  if (!fs.existsSync(path.join(stage, required))) throw new Error(`staged file missing ${required}`);
}
console.log('PASS v1.0.45 clean source package staging');
