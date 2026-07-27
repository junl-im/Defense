import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readDistText, verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';
import { verifyCanonicalPresentationSurface } from './lib/verify-dist-presentation-surface.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/index.html missing');
verifyCanonicalPresentationSurface({ dist });
const mascot = verifyDeployedAssetReference({
  root,
  dist,
  sourceRelative: 'src/assets/title-v112/title-mascot-v112.webp',
  label: 'original title mascot'
});
const runtimeText = readDistText(dist);
if (runtimeText.includes('title-v120/title-mascot')) throw new Error('replacement mascot remains active in dist');
console.log(`PASS v1.0.23 active presentation title and original mascot deployment (${mascot.emittedRelative})`);
