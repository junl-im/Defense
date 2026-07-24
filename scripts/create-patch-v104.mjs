import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = '1.0.4';
const baselinePath = path.join(root, 'scripts/patch-baselines/v1.0.3.json');
const outputRoot = path.join(root, 'logs/patch', version);
const stagingRoot = path.join(outputRoot, 'staging');
const stagingMetadataRoot = path.join(stagingRoot, 'logs/patch', version);
const excludedDirectories = new Set(['.git', 'node_modules', 'logs', '__pycache__']);
const protectedArtFiles = new Set([
  'src/style.css',
  'src/art-style-tokens.js',
  'docs/ABSOLUTE_ART_BIBLE_v2.0.md',
  'dist/src/style.css',
  'dist/src/art-style-tokens.js'
]);

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function collect(directory, result = new Map()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(full, result);
    else if (entry.isFile()) {
      const data = readFileSync(full);
      result.set(relative(full), { sha256: sha256(data), size: data.length });
    }
  }
  return result;
}

function copyRelative(file) {
  const source = path.join(root, file);
  const target = path.join(stagingRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const before = new Map(Object.entries(baseline.files || {}));
const after = collect(root);
const added = [];
const modified = [];
const deleted = [];

for (const [file, meta] of after) {
  const previous = before.get(file);
  if (!previous) added.push({ path: file, ...meta });
  else if (previous.sha256 !== meta.sha256 || previous.size !== meta.size) modified.push({ path: file, before: previous, after: meta });
}
for (const [file, meta] of before) if (!after.has(file)) deleted.push({ path: file, before: meta });

const changedPaths = [...added.map((item) => item.path), ...modified.map((item) => item.path)].sort();
const forbiddenArtChanges = changedPaths.filter((file) => protectedArtFiles.has(file) || file.startsWith('src/assets/') || file.startsWith('public/assets/') || file.startsWith('dist/src/assets/') || file.startsWith('dist/assets/'));
const forbiddenVectorChanges = changedPaths.filter((file) => file.toLowerCase().endsWith('.svg'));
if (forbiddenArtChanges.length) throw new Error(`Art Bible protected paths changed: ${forbiddenArtChanges.join(', ')}`);
if (forbiddenVectorChanges.length) throw new Error(`SVG files are forbidden in this patch: ${forbiddenVectorChanges.join(', ')}`);

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(stagingRoot, { recursive: true });
mkdirSync(stagingMetadataRoot, { recursive: true });
for (const file of changedPaths) copyRelative(file);

const manifest = {
  schema: 'DD-PATCH-MANIFEST-1.0',
  baseVersion: baseline.version,
  targetVersion: version,
  algorithm: 'sha256',
  generatedAt: new Date().toISOString(),
  counts: { added: added.length, modified: modified.length, deleted: deleted.length },
  added: added.sort((a, b) => a.path.localeCompare(b.path)),
  modified: modified.sort((a, b) => a.path.localeCompare(b.path)),
  deleted: deleted.sort((a, b) => a.path.localeCompare(b.path))
};
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
const deleteText = `${manifest.deleted.map((item) => item.path).join('\n')}${manifest.deleted.length ? '\n' : ''}`;
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), manifestText);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), deleteText);
writeFileSync(path.join(stagingMetadataRoot, 'PATCH_MANIFEST.json'), manifestText);
writeFileSync(path.join(stagingMetadataRoot, 'DELETE_LIST.txt'), deleteText);

const hashFiles = [];
function collectStaging(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collectStaging(full);
    else if (entry.isFile() && entry.name !== 'PATCH_CONTENT_SHA256.txt') {
      const rel = path.relative(stagingRoot, full).split(path.sep).join('/');
      hashFiles.push(`${sha256(readFileSync(full))}  ${rel}`);
    }
  }
}
collectStaging(stagingRoot);
hashFiles.sort();
writeFileSync(path.join(stagingMetadataRoot, 'PATCH_CONTENT_SHA256.txt'), `${hashFiles.join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${hashFiles.join('\n')}\n`);

console.log(JSON.stringify({ outputRoot, stagingRoot, ...manifest.counts }, null, 2));
