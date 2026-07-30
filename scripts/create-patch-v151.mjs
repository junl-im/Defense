import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V151_DELETED_PATHS, V151_PATCH_FILES } from './v151-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.51');
const overlay = path.join(out, 'overlay');
const base = JSON.parse(fs.readFileSync(path.join(root, 'docs/PATCH_BASE_v1.0.51.json'), 'utf8'));
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'docs/PATCH_PROVENANCE_v1.0.51.json'), 'utf8'));
const baseByPath = new Map((base.files || []).map((entry) => [entry.path, entry]));
const sha = (data) => createHash('sha256').update(data).digest('hex');
if (!V151_PATCH_FILES.length) throw new Error('v151 patch file list is empty');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const rows = [];
for (const file of V151_PATCH_FILES) {
  const source = path.join(root, file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`v151 patch source missing: ${file}`);
  const target = path.join(overlay, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  const prior = baseByPath.get(file) || null;
  rows.push({ path: file, bytes: data.length, sha256: sha(data), baseSha256: prior?.sha256 || null, basePresent: Boolean(prior) });
}
const manifest = {
  id: 'DD-DIRECT-OVERLAY-PATCH-V151',
  baseVersion: '1.0.50',
  targetVersion: '1.0.51',
  buildId: 'b24.51',
  applyMode: 'direct-root-overlay',
  repairRevision: 1,
  archiveRootLayout: 'flat',
  repositoryRootGuard: 'verify:repo-root:v151',
  baseZipSha256: base.receivedBaseZip.sha256,
  normalizedBaseTreeSha256: base.aggregateSha256,
  targetSourceTreeSha256: provenance.targetSourceTree.aggregateSha256,
  targetFullZipSha256: process.env.V151_TARGET_FULL_ZIP_SHA256 || 'PENDING_EXTERNAL_PACKAGE',
  counts: { changed: rows.length, deleted: V151_DELETED_PATHS.length },
  deletedPaths: [...V151_DELETED_PATHS],
  files: rows
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'DELETE_PATHS.txt'), `${V151_DELETED_PATHS.join('\n')}${V151_DELETED_PATHS.length ? '\n' : ''}`);
console.log(JSON.stringify({ patchRoot: out, changed: rows.length, deleted: V151_DELETED_PATHS.length }, null, 2));
