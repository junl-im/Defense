import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V152_DELETED_PATHS, V152_PATCH_FILES } from './v152-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.52');
const overlay = path.join(patchRoot, 'overlay');
const manifest = JSON.parse(fs.readFileSync(path.join(patchRoot, 'PATCH_MANIFEST.json'), 'utf8'));
if (manifest.id !== 'DD-DIRECT-OVERLAY-PATCH-V152' || manifest.baseVersion !== '1.0.51' || manifest.targetVersion !== '1.0.52' || manifest.buildId !== 'b24.52' || manifest.applyMode !== 'overlay-directory-to-project-root') throw new Error('v152 patch identity mismatch');
if (!/^[a-f0-9]{64}$/.test(manifest.baseZipSha256 || '') || !/^[a-f0-9]{64}$/.test(manifest.aggregateSha256 || '')) throw new Error('v152 patch provenance hash missing');
if (manifest.targetFullZipSha256 !== 'PENDING_EXTERNAL_PACKAGE' && !/^[a-f0-9]{64}$/.test(manifest.targetFullZipSha256 || '')) throw new Error('v152 full ZIP hash invalid');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const paths = new Set();
for (const entry of manifest.files || []) {
  if (paths.has(entry.path)) throw new Error(`duplicate patch path ${entry.path}`);
  paths.add(entry.path);
  const file = path.join(overlay, entry.path);
  if (!fs.existsSync(file)) throw new Error(`patch file missing ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || sha(data) !== entry.sha256) throw new Error(`patch hash mismatch ${entry.path}`);
}
const aggregate = sha(Buffer.from(manifest.files.map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}`).join('\n')));
if (aggregate !== manifest.aggregateSha256) throw new Error('v152 patch aggregate hash mismatch');
if (paths.size !== V152_PATCH_FILES.length || V152_PATCH_FILES.some((file) => !paths.has(file))) throw new Error('v152 patch list mismatch');
if (manifest.counts.changed !== V152_PATCH_FILES.length || manifest.counts.deleted !== V152_DELETED_PATHS.length) throw new Error('v152 patch counts mismatch');
for (const required of ['package.json', '.github/workflows/deploy.yml', 'src/main.js', 'src/runtime/character-action-timing-v152.js', 'src/runtime/character-presentation-budget-v152.js', 'src/engine/gpu-frame-timer-v152.js', 'PROJECT_HANDOFF.md']) if (!paths.has(required)) throw new Error(`v152 patch contract file missing ${required}`);
console.log(`PASS v1.0.52 direct-overlay patch with SHA-256 verification (${paths.size} files)`);
