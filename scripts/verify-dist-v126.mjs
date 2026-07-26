import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const required = [
  'index.html',
  'manifest.webmanifest',
  'version.json',
  'sw.js',
  'boss-encounter-lab-v126.html',
  'assets/visual-v126/boss-encounter-manifest-v126.json',
  'assets/visual-v126/boss-encounter-registry-v126.json'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.26 static deployment missing dist/${file}`);
}
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
const registry = JSON.parse(fs.readFileSync(path.join(dist, 'assets/visual-v126/boss-encounter-registry-v126.json'), 'utf8'));
const [major, minor, patchVersion] = String(version.releaseVersion || '').split('.').map(Number);
if (major !== 1 || minor !== 0 || patchVersion < 26 || version.buildId !== `b24.${patchVersion}`) throw new Error('v1.0.26+ dist identity mismatch');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
if (!index.includes(currentRevision) || !index.includes('boss-health-damage')) throw new Error('current title revision or v1.0.26 boss trail markup missing from dist');
if (!sw.includes('boss-encounter-assurance-director-v126.js') || !sw.includes('boss-encounter-lab-v126.html')) throw new Error('v1.0.26 service-worker entries missing');
if (!registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v126' && entry.runtime === 'quarantined')) throw new Error('v1.0.26 quarantined candidate registry missing from dist');

const findMarker = (extension, marker, staticPath) => {
  const staticCandidate = path.join(dist, staticPath);
  if (fs.existsSync(staticCandidate) && fs.readFileSync(staticCandidate, 'utf8').includes(marker)) return true;
  const stack = [path.join(dist, 'assets')];
  while (stack.length) {
    const current = stack.pop();
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.name.endsWith(extension) && fs.readFileSync(target, 'utf8').includes(marker)) return true;
    }
  }
  return false;
};
if (!findMarker('.js', 'DD-BOSS-ENCOUNTER-ASSURANCE-V126', 'src/runtime/boss-encounter-assurance-director-v126.js')) throw new Error('v1.0.26 runtime marker missing from static source or Vite bundle');
if (!findMarker('.css', 'boss-encounter-assurance-v126', 'src/style.css')) throw new Error('v1.0.26 boss encounter styles missing from static source or Vite bundle');
console.log('PASS v1.0.26 boss encounter, asset boundary and 20-wave deployment assurance');
