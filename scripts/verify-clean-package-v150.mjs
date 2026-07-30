import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const stage = path.join(root, 'logs/package/1.0.50/DokkaebiLuckDefense3D_FULL_v1.0.50_ATOMIC_CHECKPOINTS_VERIFIED');
if (!fs.existsSync(stage)) throw new Error('v150 staged package missing');
for (const banned of ['dist','node_modules','.git','overlay']) if (fs.existsSync(path.join(stage, banned))) throw new Error(`v150 staged package contains ${banned}`);
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
if (pkg.version !== '1.0.50' || pkg.dokkaebi?.buildId !== 'b24.50') throw new Error('v150 staged identity mismatch');
for (const file of [
  'src/runtime/atomic-save-snapshot-v150.js',
  'src/runtime/persistent-reward-orchestrator-v150.js',
  'src/runtime/production-error-boundary-v150.js',
  'scripts/generate-release-identity-v150.mjs',
  'scripts/generate-build-input-manifest-v150.mjs',
  'scripts/verify-release-v150.mjs',
  'docs/generated/build-input-manifest-v150.json',
  'docs/PERFORMANCE_BASELINE_STATUS_v1.0.50.json',
  'docs/DELIVERY_RESULT_RULE.md'
]) if (!fs.existsSync(path.join(stage, file))) throw new Error(`v150 staged contract missing ${file}`);
console.log('PASS v1.0.50 clean source package staging');
