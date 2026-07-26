import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
const required = [
  'index.html',
  'version.json',
  'sw.js',
  'boss-identity-lab-v133.html',
  'assets/visual-v133/boss-identity-audit-v133.json',
  'assets/visual-v133/boss-identity-registry-v133.json',
  'assets/visual-v133/boss-identity-manifest-v133.json'
];
for (const relative of required) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.33 missing dist/${relative}`);
}
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const version = JSON.parse(read('version.json'));
const audit = JSON.parse(read('assets/visual-v133/boss-identity-audit-v133.json'));
const registry = JSON.parse(read('assets/visual-v133/boss-identity-registry-v133.json'));
if (version.releaseVersion !== '1.0.33' || version.buildId !== 'b24.33') throw new Error('v1.0.33 dist identity mismatch');
if (audit.waveTarget !== 90 || audit.reviewPair?.humanReviewRetained !== true || audit.reviewPair?.nearDuplicate !== false) throw new Error('v1.0.33 audit payload mismatch');
if (registry.summary?.bossProfiles !== 3 || registry.summary?.newFinalCharacterArt !== 0) throw new Error('v1.0.33 registry mismatch');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const marker = walk(dist).filter((file) => file.endsWith('.js')).some((file) => {
  try { return fs.readFileSync(file, 'utf8').includes('DD-BOSS-IDENTITY-ASSURANCE-V133'); } catch { return false; }
});
if (!marker) throw new Error('v1.0.33 runtime marker missing');
if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) throw new Error('obsolete compact root file leaked into dist');
console.log('PASS v1.0.33 static deployment contains boss identity payload, runtime marker, and clean root');
