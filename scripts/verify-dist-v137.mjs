import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readDistText, verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';
import { verifyCanonicalPresentationSurface } from './lib/verify-dist-presentation-surface.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
for (const file of ['index.html', 'version.json', 'sw.js', 'assets/system-v135/runtime-module-shell-v135.json']) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.37 foundation missing ${file}`);
}
const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const patch = Number(String(version.releaseVersion || '').split('.')[2] || 0);
if (patch < 37 || version.buildId !== `b24.${patch}`) throw new Error('v1.0.37 deployment foundation identity mismatch');
const surfaces = verifyCanonicalPresentationSurface({ dist, requireManifest: true });
const expectedRevision = `release-v1${String(patch).padStart(2, '0')}-b24-${patch}`;
if (!surfaces.index.includes(expectedRevision)) throw new Error(`current cache identity missing: ${expectedRevision}`);
const full = verifyDeployedAssetReference({ root, dist, sourceRelative: 'src/assets/title-v112/title-mascot-v112.webp', label: 'full title mascot' });
const lite = verifyDeployedAssetReference({ root, dist, sourceRelative: 'src/assets/title-v112/title-mascot-lite-v112.webp', label: 'lite title mascot' });
const active = readDistText(dist);
if (active.includes('title-v120/title-mascot')) throw new Error('replacement mascot remains active');
const mode = fs.existsSync(path.join(dist, 'src/bootstrap.js')) ? 'static' : 'vite';
if (mode === 'vite' && (!full.emittedRelative.startsWith('assets/') || !lite.emittedRelative.startsWith('assets/'))) throw new Error('Vite mascot emission path mismatch');
const shell = JSON.parse(fs.readFileSync(path.join(dist, 'assets/system-v135/runtime-module-shell-v135.json'), 'utf8'));
if (shell.releaseVersion !== version.releaseVersion || shell.buildId !== version.buildId || shell.moduleCount < 100) throw new Error('runtime shell mismatch');
console.log(`PASS v1.0.37+ ${mode} deployment foundation under ${version.releaseVersion} (${full.emittedRelative}, ${lite.emittedRelative})`);
