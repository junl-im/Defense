import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = '1.0.3';
const outputRoot = path.join(root, 'logs/patch', version);
const stagingRoot = path.join(outputRoot, 'staging');
const stagingMetadataRoot = path.join(stagingRoot, 'logs/patch', version);
const manifest = JSON.parse(readFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), 'utf8'));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];

for (const item of manifest.added) {
  const source = path.join(root, item.path);
  const staged = path.join(stagingRoot, item.path);
  if (!existsSync(source) || sha256(readFileSync(source)) !== item.sha256) failures.push(`source added hash mismatch: ${item.path}`);
  if (!existsSync(staged) || sha256(readFileSync(staged)) !== item.sha256) failures.push(`staged added hash mismatch: ${item.path}`);
}
for (const item of manifest.modified) {
  const source = path.join(root, item.path);
  const staged = path.join(stagingRoot, item.path);
  if (!existsSync(source) || sha256(readFileSync(source)) !== item.after.sha256) failures.push(`source modified hash mismatch: ${item.path}`);
  if (!existsSync(staged) || sha256(readFileSync(staged)) !== item.after.sha256) failures.push(`staged modified hash mismatch: ${item.path}`);
}
for (const item of manifest.deleted) if (existsSync(path.join(root, item.path))) failures.push(`deleted path still exists: ${item.path}`);

const hashLines = readFileSync(path.join(stagingMetadataRoot, 'PATCH_CONTENT_SHA256.txt'), 'utf8').trim().split('\n').filter(Boolean);
for (const line of hashLines) {
  const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
  if (!match) { failures.push(`invalid hash line: ${line}`); continue; }
  const file = path.join(stagingRoot, match[2]);
  if (!existsSync(file) || sha256(readFileSync(file)) !== match[1]) failures.push(`patch content hash mismatch: ${match[2]}`);
}

const changedPaths = [...manifest.added.map((item) => item.path), ...manifest.modified.map((item) => item.path)];
if (changedPaths.some((file) => file.toLowerCase().endsWith('.svg'))) failures.push('SVG file included in patch');
if (changedPaths.some((file) => file.startsWith('src/assets/') || file.startsWith('public/assets/') || file.startsWith('dist/src/assets/') || file.startsWith('dist/assets/') || file === 'src/style.css' || file === 'dist/src/style.css' || file === 'src/art-style-tokens.js' || file === 'dist/src/art-style-tokens.js' || file === 'docs/ABSOLUTE_ART_BIBLE_v2.0.md')) failures.push('Art Bible protected path changed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS patch v${version} files and SHA-256 hashes verified (${changedPaths.length} changed, ${manifest.deleted.length} deleted)`);
