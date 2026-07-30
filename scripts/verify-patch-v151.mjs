import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V151_DELETED_PATHS, V151_PATCH_FILES } from './v151-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.51');
const overlay = path.join(patchRoot, 'overlay');
const manifest = JSON.parse(fs.readFileSync(path.join(patchRoot, 'PATCH_MANIFEST.json'), 'utf8'));
if (manifest.id !== 'DD-DIRECT-OVERLAY-PATCH-V151' || manifest.baseVersion !== '1.0.50' || manifest.targetVersion !== '1.0.51' || manifest.buildId !== 'b24.51' || manifest.applyMode !== 'direct-root-overlay' || manifest.repairRevision !== 2 || manifest.archiveRootLayout !== 'flat' || manifest.repositoryRootGuard !== 'verify:repo-root:v151') throw new Error('v151 patch identity mismatch');
if (!/^[a-f0-9]{64}$/.test(manifest.baseZipSha256 || '') || !/^[a-f0-9]{64}$/.test(manifest.normalizedBaseTreeSha256 || '') || !/^[a-f0-9]{64}$/.test(manifest.targetSourceTreeSha256 || '')) throw new Error('v151 provenance hashes missing');
if (manifest.targetFullZipSha256 !== 'PENDING_EXTERNAL_PACKAGE' && !/^[a-f0-9]{64}$/.test(manifest.targetFullZipSha256 || '')) throw new Error('v151 target ZIP hash invalid');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const paths = new Set();
for (const entry of manifest.files) {
  if (paths.has(entry.path)) throw new Error(`duplicate patch path ${entry.path}`);
  paths.add(entry.path);
  const file = path.join(overlay, entry.path);
  if (!fs.existsSync(file)) throw new Error(`patch file missing ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || sha(data) !== entry.sha256) throw new Error(`patch hash mismatch ${entry.path}`);
}
if (manifest.counts.changed !== manifest.files.length || manifest.counts.deleted !== V151_DELETED_PATHS.length || manifest.deletedPaths.length !== V151_DELETED_PATHS.length || V151_DELETED_PATHS.some((file) => !manifest.deletedPaths.includes(file))) throw new Error('v151 patch count mismatch');
if (paths.size !== V151_PATCH_FILES.length || V151_PATCH_FILES.some((file) => !paths.has(file))) throw new Error('v151 patch manifest differs from declared list');
for (const required of ['package.json', '.github/workflows/deploy.yml', 'scripts/clean-obsolete-assets.mjs', 'scripts/verify-repository-root-v151.mjs', 'scripts/verify-ci-root-cleanup-v151.mjs', 'src/main.js', 'src/runtime/character-presentation-director-v151.js', 'src/engine/character-material-enhancer-v151.js', 'docs/PATCH_PROVENANCE_v1.0.51.json']) if (!paths.has(required)) throw new Error(`v151 patch contract file missing ${required}`);
console.log(`PASS v1.0.51 direct-root overlay patch with SHA-256 provenance (${manifest.files.length} files)`);
