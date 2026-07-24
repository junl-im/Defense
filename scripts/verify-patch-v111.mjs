import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = '1.0.11';
const outputRoot = path.join(root, 'logs/patch', version);
const stagingRoot = path.join(outputRoot, 'staging');
const metadataRoot = path.join(stagingRoot, 'logs/patch', version);
const manifestPath = path.join(outputRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('Run npm run create:patch:v111 first');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];

for (const item of manifest.added) {
  for (const file of [path.join(root, item.path), path.join(stagingRoot, item.path)]) {
    if (!existsSync(file) || sha256(readFileSync(file)) !== item.sha256) failures.push(`added hash mismatch: ${item.path}`);
  }
}
for (const item of manifest.modified) {
  for (const file of [path.join(root, item.path), path.join(stagingRoot, item.path)]) {
    if (!existsSync(file) || sha256(readFileSync(file)) !== item.after.sha256) failures.push(`modified hash mismatch: ${item.path}`);
  }
}
for (const item of manifest.deleted) if (existsSync(path.join(root, item.path))) failures.push(`deleted path still exists: ${item.path}`);

const hashListPath = path.join(metadataRoot, 'PATCH_CONTENT_SHA256.txt');
if (!existsSync(hashListPath)) failures.push('staged patch hash list is missing');
else {
  const lines = readFileSync(hashListPath, 'utf8').trim().split('\n').filter(Boolean);
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match) { failures.push(`invalid hash line: ${line}`); continue; }
    const file = path.join(stagingRoot, match[2]);
    if (!existsSync(file) || sha256(readFileSync(file)) !== match[1]) failures.push(`patch content hash mismatch: ${match[2]}`);
  }
}

const changed = [...manifest.added.map((item) => item.path), ...manifest.modified.map((item) => item.path)];
if (changed.some((file) => file.toLowerCase().endsWith('.svg'))) failures.push('SVG file included in patch');
const allowedNewArtPrefixes = ['public/assets/ip-mega-v4/', 'dist/assets/ip-mega-v4/', 'docs/reference/IP_MEGA_'];
const allowedNewArt = (file) => allowedNewArtPrefixes.some((prefix) => file.startsWith(prefix));
const badArt = changed.filter((file) => {
  if (allowedNewArt(file)) return false;
  return file.startsWith('src/assets/') || file.startsWith('dist/src/assets/') || file === 'src/art-style-tokens.js' || file === 'dist/src/art-style-tokens.js' || file === 'docs/ABSOLUTE_ART_BIBLE_v2.0.md' || file.startsWith('public/assets/') || file.startsWith('dist/assets/');
});
if (badArt.length) failures.push(`protected art changed: ${badArt.join(', ')}`);

const required = [
  'README.md', 'PROJECT_HANDOFF.md', 'package.json', 'package-lock.json', 'index.html',
  'src/main.js', 'src/version-policy.js', 'src/ip-knowledge-megabase-v4.js', 'src/production-console.js', 'src/style.css',
  'public/version.json', 'public/sw.js', 'public/static-bootstrap.js', 'public/ip-mega-library-v4.html',
  'public/assets/ip-mega-v4/data/ip-mega-index-v4.json', 'public/assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  'public/assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp', 'public/assets/ip-mega-v4/reference/art-production-board-v4.webp',
  'production/DokkaebiDefense/14_IP_Knowledge_Megabase/IP_MEGA_INDEX_v4.0.0.json',
  'docs/IP_KNOWLEDGE_MEGAFORGE_v4.0.0.md', 'docs/PATCH_NOTES_v1.0.11.md', 'docs/PATCH_APPLY_v1.0.11.md',
  'scripts/generate-ip-megabase-v4.mjs', 'scripts/verify-ip-megabase-v4.mjs', 'scripts/verify-release-v111.mjs',
  'scripts/create-patch-v111.mjs', 'scripts/verify-patch-v111.mjs', 'scripts/patch-baselines/v1.0.10.json', 'logs/README.md'
];
for (const file of required) if (!changed.includes(file)) failures.push(`required v1.0.11 file missing: ${file}`);
if (manifest.baseVersion !== '1.0.10' || manifest.targetVersion !== '1.0.11') failures.push('patch version range mismatch');
if (manifest.knowledgeMegabase?.version !== '4.0.0' || manifest.knowledgeMegabase?.baseAssets !== 8192 || manifest.knowledgeMegabase?.totalRecords !== 147232 || manifest.knowledgeMegabase?.finalArtApproved !== 0) failures.push('megabase manifest summary mismatch');

const stagedIndexPath = path.join(stagingRoot, 'production/DokkaebiDefense/14_IP_Knowledge_Megabase/IP_MEGA_INDEX_v4.0.0.json');
if (!existsSync(stagedIndexPath)) failures.push('staged production megabase index missing');
else {
  const index = JSON.parse(readFileSync(stagedIndexPath, 'utf8'));
  if (index.counts?.records?.total !== 147232 || index.counts?.base?.heroes !== 176 || index.finalArtStatus?.approved !== 0) failures.push('staged production megabase index mismatch');
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS patch v${version} files and SHA-256 hashes verified (${changed.length} changed, ${manifest.deleted.length} deleted, 147232 knowledge records)`);
