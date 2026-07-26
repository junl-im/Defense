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
  'action-asset-lab-v125.html',
  'assets/visual-v125/action-asset-manifest-v125.json',
  'assets/visual-v125/action-asset-registry-v125.json'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.25 static deployment missing dist/${file}`);
}
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
const registry = JSON.parse(fs.readFileSync(path.join(dist, 'assets/visual-v125/action-asset-registry-v125.json'), 'utf8'));
const patchVersion = Number(String(version.releaseVersion || '').split('.')[2] || 0);
if (patchVersion < 25 || version.buildId !== `b24.${patchVersion}`) throw new Error('v1.0.25 deployment foundation is not preserved');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
if (!index.includes(currentRevision)) throw new Error('current title cache revision missing from dist');
if (!sw.includes('action-asset-assurance-director-v125.js') || !sw.includes('action-asset-lab-v125.html')) throw new Error('v1.0.25 service-worker deployment entries missing');
if (!registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v125' && entry.runtime === 'quarantined')) throw new Error('v1.0.25 quarantined candidate registry missing from dist');

const findMarker = (extension, marker) => {
  const staticCandidate = extension === '.js'
    ? path.join(dist, 'src/runtime/action-asset-assurance-director-v125.js')
    : path.join(dist, 'src/style.css');
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
if (!findMarker('.js', 'DD-ACTION-ASSET-ASSURANCE-V125')) throw new Error('v1.0.25 runtime marker missing from static source or Vite bundle');
if (!findMarker('.css', 'action-asset-assurance-v125')) throw new Error('v1.0.25 result/codex styles missing from static source or Vite bundle');
console.log('PASS v1.0.25 action, asset registry, UI and lifecycle assurance deployment');
