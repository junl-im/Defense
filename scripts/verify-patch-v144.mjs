import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.44');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
const overlay = path.join(patchRoot, 'overlay');
if (!fs.existsSync(manifestPath)) throw new Error('v144 patch manifest missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.43' || manifest.targetVersion !== '1.0.44' || manifest.buildId !== 'b24.44' || manifest.applyMode !== 'direct-overlay') throw new Error('v144 patch identity mismatch');
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
if (manifest.counts.changed !== manifest.files.length || manifest.counts.deleted !== 0 || manifest.deletedPaths.length !== 0) throw new Error('patch count mismatch');
for (const required of ['scripts/verify-dist-v143.mjs', 'scripts/run-built-game-mobile-matrix-v144.mjs', 'docs/generated/asset-review-v144.json']) if (!paths.has(required)) throw new Error(`patch contract file missing ${required}`);
console.log(`PASS v1.0.44 direct-overlay patch (${manifest.files.length} files)`);
