import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V148_PATCH_FILES } from './v148-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.48');
const overlay = path.join(patchRoot, 'overlay');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
if (!fs.existsSync(manifestPath) || !fs.existsSync(path.join(patchRoot, 'APPLY_KO.txt'))) throw new Error('v148 patch metadata missing');
if (fs.existsSync(path.join(overlay, 'APPLY_KO.txt')) || fs.existsSync(path.join(overlay, 'PATCH_MANIFEST.json'))) throw new Error('v148 patch metadata leaked into overlay');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.47' || manifest.targetVersion !== '1.0.48' || manifest.buildId !== 'b24.48' || manifest.applyMode !== 'direct-overlay') throw new Error('v148 patch identity mismatch');
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
if (manifest.counts.changed !== manifest.files.length || manifest.counts.deleted !== 0 || manifest.deletedPaths.length !== 0) throw new Error('v148 patch count mismatch');
if (paths.size !== V148_PATCH_FILES.length || V148_PATCH_FILES.some((file) => !paths.has(file))) throw new Error('v148 patch manifest differs from declared file list');
for (const required of ['package.json','src/runtime/safe-storage-v148.js','src/runtime/runtime-health-assurance-v148.js','scripts/generate-system-audit-v148.mjs','docs/DELIVERY_RESULT_RULE.md']) if (!paths.has(required)) throw new Error(`v148 patch contract file missing ${required}`);
console.log(`PASS v1.0.48 direct-overlay patch (${manifest.files.length} files)`);
