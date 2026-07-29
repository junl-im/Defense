import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.47');
const overlay = path.join(patchRoot, 'overlay');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
if (!fs.existsSync(manifestPath) || !fs.existsSync(path.join(patchRoot, 'APPLY_KO.txt'))) {
  throw new Error('v147 patch metadata missing');
}
if (fs.existsSync(path.join(overlay, 'APPLY_KO.txt')) || fs.existsSync(path.join(overlay, 'PATCH_MANIFEST.json'))) {
  throw new Error('v147 patch metadata leaked into direct overlay');
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.46' || manifest.targetVersion !== '1.0.47' || manifest.buildId !== 'b24.47' || manifest.applyMode !== 'direct-overlay') {
  throw new Error('v147 patch identity mismatch');
}
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const paths = new Set();
for (const entry of manifest.files) {
  if (paths.has(entry.path)) throw new Error(`duplicate patch path ${entry.path}`);
  paths.add(entry.path);
  const file = path.join(overlay, entry.path);
  if (!fs.existsSync(file)) throw new Error(`patch file missing ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || sha256(data) !== entry.sha256) throw new Error(`patch hash mismatch ${entry.path}`);
}
if (manifest.counts.changed !== manifest.files.length || manifest.counts.deleted !== 0 || manifest.deletedPaths.length !== 0) {
  throw new Error('v147 patch count mismatch');
}
for (const required of [
  'scripts/run-offline-reconnect-v147.mjs',
  'scripts/save-schema-fuzz-v147.mjs',
  'scripts/device-trace-ingestion-v147.mjs',
  'scripts/promote-v145-dist-baseline-v147.mjs',
  'scripts/browser-evidence-bundle-v147.mjs',
  'scripts/create-patch-v147.mjs',
  'scripts/verify-patch-v147.mjs',
  'docs/qa/device-viewport-traces-v147.json',
  'docs/qa/v145-dist-baseline-approval-v147.json',
  'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json',
]) {
  if (!paths.has(required)) throw new Error(`v147 patch contract file missing ${required}`);
}
console.log(`PASS v1.0.47 direct-overlay patch (${manifest.files.length} files)`);
