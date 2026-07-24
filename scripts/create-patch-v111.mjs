import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = '1.0.11';
const baselinePath = path.join(root, 'scripts/patch-baselines/v1.0.10.json');
const outputRoot = path.join(root, 'logs/patch', version);
const stagingRoot = path.join(outputRoot, 'staging');
const stagingMetadataRoot = path.join(stagingRoot, 'logs/patch', version);
const excludedDirectories = new Set(['.git', 'node_modules', 'logs', '__pycache__']);
const protectedArtFiles = new Set([
  'src/art-style-tokens.js',
  'docs/ABSOLUTE_ART_BIBLE_v2.0.md',
  'dist/src/art-style-tokens.js'
]);
const allowedNewArtPrefixes = [
  'public/assets/ip-mega-v4/',
  'dist/assets/ip-mega-v4/',
  'docs/reference/IP_MEGA_'
];
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
if (baseline.version !== '1.0.10') throw new Error(`Unexpected baseline ${baseline.version}`);
const before = new Map(Object.entries(baseline.files || {}));
const after = collect(root);
const logContract = path.join(root, 'logs/README.md');
const logData = readFileSync(logContract);
after.set('logs/README.md', { sha256: sha256(logData), size: logData.length });

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
const isAllowedNewArt = (file) => allowedNewArtPrefixes.some((prefix) => file.startsWith(prefix));
const forbiddenArtChanges = changedPaths.filter((file) => {
  if (isAllowedNewArt(file)) return false;
  if (protectedArtFiles.has(file) || file.startsWith('src/assets/') || file.startsWith('dist/src/assets/')) return true;
  if (file.startsWith('public/assets/') || file.startsWith('dist/assets/')) return true;
  return false;
});
if (forbiddenArtChanges.length) throw new Error(`Protected pre-v1.0.11 art changed: ${forbiddenArtChanges.join(', ')}`);
const forbiddenVectorChanges = changedPaths.filter((file) => file.toLowerCase().endsWith('.svg'));
if (forbiddenVectorChanges.length) throw new Error(`SVG files are forbidden in this patch: ${forbiddenVectorChanges.join(', ')}`);

const required = [
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/version-policy.js',
  'src/ip-knowledge-megabase-v4.js',
  'src/production-console.js',
  'src/style.css',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/ip-mega-library-v4.html',
  'public/assets/ip-mega-v4/data/ip-mega-index-v4.json',
  'public/assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  'public/assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
  'public/assets/ip-mega-v4/reference/art-production-board-v4.webp',
  'production/DokkaebiDefense/14_IP_Knowledge_Megabase/IP_MEGA_INDEX_v4.0.0.json',
  'docs/IP_KNOWLEDGE_MEGAFORGE_v4.0.0.md',
  'docs/PATCH_NOTES_v1.0.11.md',
  'docs/PATCH_APPLY_v1.0.11.md',
  'scripts/generate-ip-megabase-v4.mjs',
  'scripts/verify-ip-megabase-v4.mjs',
  'scripts/verify-release-v110.mjs',
  'scripts/verify-release-v111.mjs',
  'scripts/create-patch-v111.mjs',
  'scripts/verify-patch-v111.mjs',
  'scripts/patch-baselines/v1.0.10.json',
  'logs/README.md'
];
for (const file of required) if (!changedPaths.includes(file)) throw new Error(`Required v1.0.11 file is missing: ${file}`);

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
  knowledgeMegabase: {
    version: '4.0.0',
    baseAssets: 8192,
    totalRecords: 147232,
    finalArtApproved: 0
  },
  added: added.sort((a, b) => a.path.localeCompare(b.path)),
  modified: modified.sort((a, b) => a.path.localeCompare(b.path)),
  deleted: deleted.sort((a, b) => a.path.localeCompare(b.path))
};
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
const deleteText = `${manifest.deleted.map((item) => item.path).join('\n')}${manifest.deleted.length ? '\n' : ''}`;
for (const directory of [outputRoot, stagingMetadataRoot]) {
  writeFileSync(path.join(directory, 'PATCH_MANIFEST.json'), manifestText);
  writeFileSync(path.join(directory, 'DELETE_LIST.txt'), deleteText);
}

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
for (const directory of [outputRoot, stagingMetadataRoot]) writeFileSync(path.join(directory, 'PATCH_CONTENT_SHA256.txt'), `${hashFiles.join('\n')}\n`);
console.log(JSON.stringify({ outputRoot, stagingRoot, ...manifest.counts, totalRecords: manifest.knowledgeMegabase.totalRecords }, null, 2));
