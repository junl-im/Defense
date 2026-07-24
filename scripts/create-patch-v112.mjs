import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.11';
const targetVersion = '1.0.12';
const baselinePath = path.join(root, 'scripts/patch-baselines/v1.0.11.json');
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
const embeddedMetadataRoot = path.join(applyRoot, 'logs/patch', targetVersion);
const excludedDirectories = new Set(['.git', 'node_modules', 'logs', '__pycache__']);
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

const allowedArtPrefixes = [
  'src/assets/title-v112/',
  'public/assets/visual-v112/',
  'dist/src/assets/title-v112/',
  'dist/assets/visual-v112/'
];
const allowedArtFiles = new Set(['public/cover.webp', 'dist/cover.webp']);
const protectedArtFiles = new Set([
  'src/art-style-tokens.js',
  'docs/ABSOLUTE_ART_BIBLE_v2.0.md',
  'dist/src/art-style-tokens.js'
]);

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
  const target = path.join(applyRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
if (baseline.version !== baseVersion) throw new Error(`Unexpected baseline ${baseline.version}`);
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
const allowedArt = (file) => allowedArtFiles.has(file) || allowedArtPrefixes.some((prefix) => file.startsWith(prefix));
const forbiddenArtChanges = changedPaths.filter((file) => {
  if (allowedArt(file)) return false;
  if (protectedArtFiles.has(file)) return true;
  if (file.startsWith('src/assets/') || file.startsWith('dist/src/assets/')) return true;
  if (file.startsWith('public/assets/') || file.startsWith('dist/assets/')) return true;
  return false;
});
if (forbiddenArtChanges.length) throw new Error(`Unexpected pre-v1.0.12 art changes: ${forbiddenArtChanges.join(', ')}`);
const forbiddenVectorChanges = changedPaths.filter((file) => file.toLowerCase().endsWith('.svg'));
if (forbiddenVectorChanges.length) throw new Error(`SVG files are forbidden in this patch: ${forbiddenVectorChanges.join(', ')}`);

const required = [
  'README.md', 'PROJECT_HANDOFF.md', 'package.json', 'package-lock.json', 'index.html',
  'src/main.js', 'src/style.css', 'src/version-policy.js', 'src/production-console.js',
  'src/engine/asset-catalog.js',
  'src/runtime/combat-visual-director-v112.js', 'src/runtime/cross-platform-shell-v112.js',
  'src/assets/title-v112/visual-polish-manifest-v112.json',
  'public/version.json', 'public/sw.js', 'public/static-bootstrap.js', 'public/cover.webp',
  'public/p0-directional-library-v112.html',
  'public/assets/visual-v112/directional/p0-directional-manifest-v112.json',
  'scripts/generate-visual-polish-assets-v112.py', 'scripts/generate-p0-directional-atlases-v112.py',
  'scripts/build-static-fallback.mjs', 'scripts/verify-static-dist.mjs',
  'scripts/verify-release-v112.mjs', 'scripts/create-patch-v112.mjs', 'scripts/verify-patch-v112.mjs',
  'scripts/patch-baselines/v1.0.11.json',
  'docs/PATCH_NOTES_v1.0.12.md', 'docs/PATCH_APPLY_v1.0.12.md',
  'docs/CROSS_PLATFORM_VISUAL_POLISH_v1.0.12.md', 'docs/P0_DIRECTIONAL_ATLAS_v1.0.12.md',
  'dist/index.html', 'dist/src/main.js', 'dist/src/style.css', 'dist/sw.js', 'dist/version.json',
  'dist/src/runtime/combat-visual-director-v112.js', 'dist/src/runtime/cross-platform-shell-v112.js',
  'dist/p0-directional-library-v112.html',
  'dist/assets/visual-v112/directional/p0-directional-manifest-v112.json'
];
for (const file of required) if (!changedPaths.includes(file)) throw new Error(`Required v1.0.12 patch file is missing: ${file}`);
for (const actor of ['hero-warrior', 'guardian-ember', 'monster-imp', 'boss-tiger']) {
  for (const suffix of ['', '-medium', '-low']) {
    const source = `public/assets/visual-v112/directional/${actor}-atlas${suffix}-v112.webp`;
    const built = `dist/assets/visual-v112/directional/${actor}-atlas${suffix}-v112.webp`;
    for (const file of [source, built]) if (!changedPaths.includes(file)) throw new Error(`Required P0 atlas missing from patch: ${file}`);
  }
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(applyRoot, { recursive: true });
mkdirSync(embeddedMetadataRoot, { recursive: true });
for (const file of changedPaths) copyRelative(file);

const manifest = {
  schema: 'DD-PATCH-MANIFEST-1.0',
  baseVersion,
  targetVersion,
  buildId: 'b24.12',
  algorithm: 'sha256',
  generatedAt: new Date().toISOString(),
  counts: { added: added.length, modified: modified.length, deleted: deleted.length, changed: changedPaths.length },
  visualPolish: {
    titleAssets: 7,
    p0Actors: 4,
    directions: 11,
    states: 6,
    authoredFrames: 264,
    runtimeAtlasFiles: 12,
    shells: ['pc', 'tablet', 'mobile'],
    runtimeApproved: true,
    productionArtApproved: false
  },
  retainedKnowledgeRecords: 147232,
  added: added.sort((a, b) => a.path.localeCompare(b.path)),
  modified: modified.sort((a, b) => a.path.localeCompare(b.path)),
  deleted: deleted.sort((a, b) => a.path.localeCompare(b.path))
};
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
const deleteText = `${manifest.deleted.map((item) => item.path).join('\n')}${manifest.deleted.length ? '\n' : ''}`;
const readme = [
  'Dokkaebi Luck Defense 3D patch v1.0.11 -> v1.0.12',
  '',
  '1. Back up the v1.0.11 project.',
  '2. Copy everything inside APPLY_TO_PROJECT_ROOT into the project root.',
  '3. Delete only the paths listed in DELETE_LIST.txt.',
  '4. Run: npm ci',
  '5. Run: npm run verify:patch:v112',
  '6. Run: npm run verify:release:v112',
  '7. Run: npm run build:static && node scripts/verify-static-dist.mjs',
  '',
  'P0 runtime content: 4 actors, 11 directions, 6 states, 264 frames.',
  'Final production-art approval remains false.',
  ''
].join('\n');
for (const directory of [outputRoot, embeddedMetadataRoot]) {
  writeFileSync(path.join(directory, 'PATCH_MANIFEST.json'), manifestText);
  writeFileSync(path.join(directory, 'DELETE_LIST.txt'), deleteText);
  writeFileSync(path.join(directory, 'README_PATCH.txt'), readme);
}

const hashFiles = [];
for (const file of changedPaths) {
  const staged = path.join(applyRoot, file);
  hashFiles.push(`${sha256(readFileSync(staged))}  ${file}`);
}
hashFiles.sort();
const hashText = `${hashFiles.join('\n')}\n`;
for (const directory of [outputRoot, embeddedMetadataRoot]) writeFileSync(path.join(directory, 'PATCH_CONTENT_SHA256.txt'), hashText);

console.log(JSON.stringify({ outputRoot, applyRoot, ...manifest.counts, visualPolish: manifest.visualPolish }, null, 2));
