import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readDistText, verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const required = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'release-assurance-v124.html'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.24 static deployment missing dist/${file}`);
}
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const currentVersion = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const patchVersion = Number(String(currentVersion.releaseVersion || '').split('.')[2] || 0);
if (patchVersion < 24) throw new Error('v1.0.24 deployment foundation is not preserved');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
if (manifest.name !== '도깨비 럭 디펜스 3D') throw new Error('v1.0.24 canonical PWA name missing from dist');
if (JSON.stringify(manifest).includes('도깨비 운빨 수호대')) throw new Error('legacy PWA branding remains in dist');
if (!index.includes(currentRevision)) throw new Error('current title cache revision missing from dist');
const mascot = verifyDeployedAssetReference({
  root,
  dist,
  sourceRelative: 'src/assets/title-v112/title-mascot-v112.webp',
  label: 'v1.0.24 original title mascot'
});
if (readDistText(dist).includes('title-v120/title-mascot')) throw new Error('replacement mascot active in v1.0.24 dist');
if (!sw.includes('dokkaebi-luck-defense-shell-') || !sw.includes("'dokkaebi-shell-'")) throw new Error('v1.0.24 cache migration missing from dist');

const staticRuntime = path.join(dist, 'src/runtime/release-assurance-director-v124.js');
let runtimeFound = fs.existsSync(staticRuntime);
if (!runtimeFound) {
  const stack = [path.join(dist, 'assets')];
  while (stack.length && !runtimeFound) {
    const current = stack.pop();
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.name.endsWith('.js') && fs.readFileSync(target, 'utf8').includes('DD-RELEASE-ASSURANCE-V124')) { runtimeFound = true; break; }
    }
  }
}
if (!runtimeFound) throw new Error('v1.0.24 release assurance runtime missing from static source or Vite bundle');
console.log(`PASS v1.0.24 canonical identity, cache migration and runtime assurance deployment (${mascot.emittedRelative})`);
