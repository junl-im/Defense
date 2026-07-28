import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.45');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
const overlay = path.join(patchRoot, 'overlay');
const applyGuide = path.join(patchRoot, 'APPLY_KO.txt');
if (!fs.existsSync(manifestPath)) throw new Error('v145 patch manifest missing');
if (!fs.existsSync(applyGuide)) throw new Error('v145 patch apply guide missing');
if (fs.existsSync(path.join(overlay, 'APPLY_KO.txt')) || fs.existsSync(path.join(overlay, 'PATCH_MANIFEST.json'))) throw new Error('patch metadata leaked into direct overlay');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (
  manifest.baseVersion !== '1.0.44' ||
  manifest.targetVersion !== '1.0.45' ||
  manifest.buildId !== 'b24.45' ||
  manifest.applyMode !== 'direct-overlay'
) throw new Error('v145 patch identity mismatch');

const hash = (data) => createHash('sha256').update(data).digest('hex');
const paths = new Set();
for (const entry of manifest.files) {
  if (paths.has(entry.path)) throw new Error(`duplicate patch path ${entry.path}`);
  paths.add(entry.path);
  const file = path.join(overlay, entry.path);
  if (!fs.existsSync(file)) throw new Error(`patch file missing ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`patch hash mismatch ${entry.path}`);
}
if (
  manifest.counts.changed !== manifest.files.length ||
  manifest.counts.deleted !== 0 ||
  manifest.deletedPaths.length !== 0
) throw new Error('v145 patch count mismatch');
for (const required of [
  'scripts/root-output-policy.mjs',
  'scripts/verify-root-migration-v101.mjs',
  'src/runtime/long-session-assurance-v145.js',
  'scripts/run-long-session-v145.mjs',
  'scripts/verify-performance-trend-v145.mjs',
  'docs/generated/asset-residency-v145.json',
  'docs/generated/runtime-asset-reachability-v143.json',
  'docs/generated/runtime-asset-reachability-v143.md',
  'docs/generated/presentation-surface-snapshots-v143.json',
  'docs/generated/asset-review-v144.json',
  'docs/generated/asset-review-v144.md',
  'docs/PERFORMANCE_BASELINE_v1.0.44.json'
]) {
  if (!paths.has(required)) throw new Error(`patch contract file missing ${required}`);
}
console.log(`PASS v1.0.45 direct-overlay patch (${manifest.files.length} files)`);
