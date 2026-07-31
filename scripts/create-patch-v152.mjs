import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V152_DELETED_PATHS, V152_PATCH_FILES } from './v152-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.52-r5');
const directRoot = path.join(out, 'project-root');
const sha = (data) => createHash('sha256').update(data).digest('hex');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(directRoot, { recursive: true });
const rows = [];
for (const file of V152_PATCH_FILES) {
  const source = path.join(root, file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`v152 R5 patch source missing: ${file}`);
  const target = path.join(directRoot, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: sha(data) });
}
const aggregateSha256 = sha(Buffer.from(rows.map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}`).join('\n')));
const manifest = {
  id: 'DD-PROJECT-ROOT-PATCH-V152-R5',
  repairRevision: 5,
  baseVersion: '1.0.52',
  compatibleBaseVersions: ['1.0.51', '1.0.52'],
  targetVersion: '1.0.52',
  buildId: 'b24.52',
  applyMode: 'project-root-direct-overlay',
  zipLayout: 'project paths only; no overlay wrapper and no patch metadata entries',
  baseZipSha256: 'ddcbc1ccebcae9efa8494086422d020c04cbbcb7e460dbe4c6d106d68a4d7ca4',
  targetFullZipSha256: process.env.V152_TARGET_FULL_ZIP_SHA256 || 'PENDING_EXTERNAL_PACKAGE',
  aggregateSha256,
  counts: { changed: rows.length, deleted: V152_DELETED_PATHS.length },
  deletedPaths: [...V152_DELETED_PATHS],
  files: rows
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST_R5.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'DELETE_PATHS_R5.txt'), `${V152_DELETED_PATHS.join('\n')}\n`);
console.log(JSON.stringify({ patchRoot: out, directRoot, changed: rows.length, deleted: V152_DELETED_PATHS.length, aggregateSha256 }, null, 2));
