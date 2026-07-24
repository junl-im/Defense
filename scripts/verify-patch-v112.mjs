import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const metadataRoot = path.join(root, 'logs/patch/1.0.12');
const applyRoot = path.join(metadataRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(metadataRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('Patch metadata missing. Run npm run create:patch:v112 or apply the official v1.0.12 patch first.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];
const changed = [...manifest.added.map((item) => item.path), ...manifest.modified.map((item) => item.path)];

if (manifest.baseVersion !== '1.0.11' || manifest.targetVersion !== '1.0.12' || manifest.buildId !== 'b24.12') failures.push('patch version range mismatch');
if (manifest.visualPolish?.p0Actors !== 4 || manifest.visualPolish?.directions !== 11 || manifest.visualPolish?.states !== 6 || manifest.visualPolish?.authoredFrames !== 264 || manifest.visualPolish?.runtimeAtlasFiles !== 12) failures.push('visual polish summary mismatch');
if (manifest.visualPolish?.runtimeApproved !== true || manifest.visualPolish?.productionArtApproved !== false) failures.push('P0 approval boundary mismatch');
if (manifest.retainedKnowledgeRecords !== 147232) failures.push('knowledge megabase retention count mismatch');

for (const item of manifest.added) {
  const file = path.join(root, item.path);
  if (!existsSync(file) || sha256(readFileSync(file)) !== item.sha256) failures.push(`added hash mismatch: ${item.path}`);
  const staged = path.join(applyRoot, item.path);
  if (existsSync(applyRoot) && (!existsSync(staged) || sha256(readFileSync(staged)) !== item.sha256)) failures.push(`staged added hash mismatch: ${item.path}`);
}
for (const item of manifest.modified) {
  const file = path.join(root, item.path);
  if (!existsSync(file) || sha256(readFileSync(file)) !== item.after.sha256) failures.push(`modified hash mismatch: ${item.path}`);
  const staged = path.join(applyRoot, item.path);
  if (existsSync(applyRoot) && (!existsSync(staged) || sha256(readFileSync(staged)) !== item.after.sha256)) failures.push(`staged modified hash mismatch: ${item.path}`);
}
for (const item of manifest.deleted) if (existsSync(path.join(root, item.path))) failures.push(`deleted path still exists: ${item.path}`);

const hashListPath = path.join(metadataRoot, 'PATCH_CONTENT_SHA256.txt');
if (!existsSync(hashListPath)) failures.push('patch content hash list is missing');
else {
  const lines = readFileSync(hashListPath, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length !== changed.length) failures.push(`patch hash line count mismatch: ${lines.length} != ${changed.length}`);
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match) { failures.push(`invalid hash line: ${line}`); continue; }
    const file = path.join(root, match[2]);
    if (!existsSync(file) || sha256(readFileSync(file)) !== match[1]) failures.push(`patch content hash mismatch: ${match[2]}`);
  }
}

if (changed.some((file) => file.toLowerCase().endsWith('.svg'))) failures.push('SVG file included in patch');
const allowedArtPrefixes = ['src/assets/title-v112/', 'public/assets/visual-v112/', 'dist/src/assets/title-v112/', 'dist/assets/visual-v112/'];
const allowedArtFiles = new Set(['public/cover.webp', 'dist/cover.webp']);
const allowedArt = (file) => allowedArtFiles.has(file) || allowedArtPrefixes.some((prefix) => file.startsWith(prefix));
const badArt = changed.filter((file) => {
  if (allowedArt(file)) return false;
  return file.startsWith('src/assets/') || file.startsWith('dist/src/assets/') || file.startsWith('public/assets/') || file.startsWith('dist/assets/') || file === 'src/art-style-tokens.js' || file === 'dist/src/art-style-tokens.js' || file === 'docs/ABSOLUTE_ART_BIBLE_v2.0.md';
});
if (badArt.length) failures.push(`unexpected protected art changed: ${badArt.join(', ')}`);

const required = [
  'README.md', 'PROJECT_HANDOFF.md', 'package.json', 'package-lock.json', 'index.html',
  'src/main.js', 'src/style.css', 'src/version-policy.js', 'src/engine/asset-catalog.js',
  'src/runtime/combat-visual-director-v112.js', 'src/runtime/cross-platform-shell-v112.js',
  'public/p0-directional-library-v112.html', 'public/assets/visual-v112/directional/p0-directional-manifest-v112.json',
  'docs/PATCH_NOTES_v1.0.12.md', 'docs/PATCH_APPLY_v1.0.12.md',
  'scripts/verify-release-v112.mjs', 'scripts/create-patch-v112.mjs', 'scripts/verify-patch-v112.mjs',
  'dist/index.html', 'dist/src/runtime/combat-visual-director-v112.js', 'dist/src/runtime/cross-platform-shell-v112.js'
];
for (const file of required) if (!changed.includes(file)) failures.push(`required v1.0.12 file missing from patch: ${file}`);
for (const actor of ['hero-warrior', 'guardian-ember', 'monster-imp', 'boss-tiger']) {
  for (const suffix of ['', '-medium', '-low']) {
    for (const prefix of ['public', 'dist']) {
      const file = `${prefix}/assets/visual-v112/directional/${actor}-atlas${suffix}-v112.webp`;
      if (!changed.includes(file)) failures.push(`required P0 atlas missing from patch: ${file}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS patch v1.0.11 -> v1.0.12 files and SHA-256 hashes verified (${changed.length} changed, ${manifest.deleted.length} deleted, 4 P0 actors / 264 authored frames / 12 runtime atlases)`);
