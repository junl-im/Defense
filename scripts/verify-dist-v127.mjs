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
  'boss-tactical-lab-v127.html',
  'assets/visual-v127/boss-tactical-manifest-v127.json',
  'assets/visual-v127/boss-tactical-registry-v127.json'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.27 static deployment missing dist/${file}`);
}
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');
const index = read('index.html');
const version = JSON.parse(read('version.json'));
const sw = read('sw.js');
const registry = JSON.parse(read('assets/visual-v127/boss-tactical-registry-v127.json'));
if (version.releaseVersion !== '1.0.27' || version.buildId !== 'b24.27') throw new Error('v1.0.27 dist identity mismatch');
if (!index.includes('release-v127-b24-27')) throw new Error('v1.0.27 title revision missing from dist');
if (!sw.includes('boss-tactical-assurance-director-v127.js') || !sw.includes('boss-tactical-lab-v127.html')) throw new Error('v1.0.27 service-worker entries missing');
if (!registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v127' && entry.runtime === 'quarantined')) throw new Error('v1.0.27 quarantined candidate registry missing from dist');

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(dist);
const findMarker = (extension, marker, staticRelative) => {
  const staticFile = path.join(dist, staticRelative);
  if (fs.existsSync(staticFile) && fs.readFileSync(staticFile, 'utf8').includes(marker)) return true;
  return files.filter((file) => file.endsWith(extension)).some((file) => {
    try { return fs.readFileSync(file, 'utf8').includes(marker); } catch { return false; }
  });
};
if (!findMarker('.js', 'DD-BOSS-TACTICAL-ASSURANCE-V127', 'src/runtime/boss-tactical-assurance-director-v127.js')) throw new Error('v1.0.27 runtime marker missing from static source or Vite bundle');
if (!findMarker('.css', 'boss-tactical-assurance-v127', 'src/style.css')) throw new Error('v1.0.27 tactical styles missing from static source or Vite bundle');
console.log('PASS v1.0.27 static deployment contains tactical runtime, QA assets and approval boundaries');
