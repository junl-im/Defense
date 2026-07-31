import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V152_DELETED_PATHS, V152_PATCH_FILES } from './v152-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.52');
const overlay = path.join(out, 'overlay');
const sha = (data) => createHash('sha256').update(data).digest('hex');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const rows = [];
for (const file of V152_PATCH_FILES) {
  const source = path.join(root, file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`v152 patch source missing: ${file}`);
  const target = path.join(overlay, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: sha(data) });
}
const aggregateSha256 = sha(Buffer.from(rows.map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}`).join('\n')));
const manifest = {
  id: 'DD-DIRECT-OVERLAY-PATCH-V152-R1',
  repairRevision: 1,
  baseVersion: '1.0.52',
  compatibleBaseVersions: ['1.0.51', '1.0.52'],
  targetVersion: '1.0.52',
  buildId: 'b24.52',
  applyMode: 'overlay-directory-to-project-root',
  baseZipSha256: '1f5f5ea84eb1f34df79830f2a70b1cb749392504f9d511337fce7c7206305412',
  targetFullZipSha256: process.env.V152_TARGET_FULL_ZIP_SHA256 || 'PENDING_EXTERNAL_PACKAGE',
  aggregateSha256,
  counts: { changed: rows.length, deleted: V152_DELETED_PATHS.length },
  deletedPaths: [...V152_DELETED_PATHS],
  files: rows
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'DELETE_PATHS.txt'), `${V152_DELETED_PATHS.join('\n')}\n`);
fs.writeFileSync(path.join(out, 'README_PATCH.txt'), 'v1.0.52 CI chain hotfix R1 direct-overlay patch\n\nCompatible with v1.0.51 and the first v1.0.52 delivery.\n\n1. Back up the project.\n2. Delete paths listed in DELETE_PATHS.txt when present.\n3. Copy only the contents of overlay/ into the project root.\n4. Do not copy patch metadata into the project root.\n5. Run npm ci, npm run verify:release:v152, VITE_BASE_PATH=/Defense/ npm run build, and npm run verify:dist:all.\n');
console.log(JSON.stringify({ patchRoot: out, changed: rows.length, deleted: V152_DELETED_PATHS.length, aggregateSha256 }, null, 2));
