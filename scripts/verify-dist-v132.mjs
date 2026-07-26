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
  'silhouette-assurance-lab-v132.html',
  'assets/visual-v132/silhouette-audit-v132.json',
  'assets/visual-v132/action-evidence-v132.json',
  'assets/visual-v132/silhouette-assurance-registry-v132.json',
  'assets/visual-v132/silhouette-assurance-manifest-v132.json'
];
for (const relative of required) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.32 missing dist/${relative}`);
}
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const version = JSON.parse(read('version.json'));
const silhouette = JSON.parse(read('assets/visual-v132/silhouette-audit-v132.json'));
const action = JSON.parse(read('assets/visual-v132/action-evidence-v132.json'));
if (version.releaseVersion !== '1.0.32' || version.buildId !== 'b24.32') throw new Error('v1.0.32 dist identity mismatch');
if (silhouette.summary?.assets !== 10 || silhouette.summary?.pairs !== 45 || silhouette.summary?.nearDuplicatePairs !== 0) throw new Error('v1.0.32 silhouette payload mismatch');
if (action.summary?.cells !== 66 || action.summary?.distinctRuntimeFrames !== true || action.summary?.independentOriginalArtApproved !== false) throw new Error('v1.0.32 action evidence mismatch');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const marker = walk(dist).filter((file) => file.endsWith('.js')).some((file) => {
  try { return fs.readFileSync(file, 'utf8').includes('DD-SILHOUETTE-ASSURANCE-V132'); } catch { return false; }
});
if (!marker) throw new Error('v1.0.32 runtime marker missing');
console.log('PASS v1.0.32 static deployment contains silhouette audit, action evidence, and runtime marker');
