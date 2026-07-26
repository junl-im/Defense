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
  'asset-refinement-lab-v129.html',
  'assets/visual-v129/asset-refinement-profile-v129.json',
  'assets/visual-v129/asset-refinement-manifest-v129.json',
  'assets/visual-v129/asset-refinement-registry-v129.json',
  'assets/visual-v129/directional/guardian-ember-pupu-atlas-low-v129.webp',
  'assets/visual-v129/directional/guardian-ember-pupu-atlas-medium-v129.webp',
  'assets/visual-v129/directional/guardian-ember-pupu-atlas-high-v129.webp'
];
for (const relative of required) if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.29 static deployment missing dist/${relative}`);
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const version = JSON.parse(read('version.json'));
const index = read('index.html');
const sw = read('sw.js');
const registry = JSON.parse(read('assets/visual-v129/asset-refinement-registry-v129.json'));
const releasePatch = Number(String(version.releaseVersion || '').split('.')[2]);
if (!version.releaseVersion?.startsWith('1.0.') || releasePatch < 29 || Number(version.buildRevision) < 29) throw new Error('v1.0.29+ dist identity mismatch');
if (!index.includes(`release-v1${releasePatch}-b24-${version.buildRevision}`)) throw new Error('current title revision missing');
if (!sw.includes('asset-refinement-assurance-director-v129.js')) throw new Error('v1.0.29 service worker runtime missing');
if (!registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v129' && entry.runtime === 'quarantined')) throw new Error('v1.0.29 quarantine registry missing');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const files = walk(dist);
const marker = (extension, value, staticFile) => {
  const staticPath = path.join(dist, staticFile);
  if (fs.existsSync(staticPath) && fs.readFileSync(staticPath, 'utf8').includes(value)) return true;
  return files.filter((file) => file.endsWith(extension)).some((file) => {
    try { return fs.readFileSync(file, 'utf8').includes(value); } catch { return false; }
  });
};
if (!marker('.js', 'DD-ASSET-REFINEMENT-ASSURANCE-V129', 'src/runtime/asset-refinement-assurance-director-v129.js')) throw new Error('v1.0.29 runtime marker missing from static source or Vite bundle');
if (!marker('.css', 'asset-refinement-assurance-v129', 'src/style.css')) throw new Error('v1.0.29 styles missing from static source or Vite bundle');
console.log('PASS v1.0.29 static deployment contains refined atlases, runtime marker and approval boundaries');
