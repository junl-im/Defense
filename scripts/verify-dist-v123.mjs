import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readDistText, verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) throw new Error('dist/index.html missing');
const index = fs.readFileSync(indexPath, 'utf8');
const distText = readDistText(dist);
if (distText.includes('도깨비 운빨 수호대')) throw new Error('legacy title remains in dist');
if (!index.includes('도깨비 럭 디펜스 3D')) throw new Error('current title missing from dist');
const mascot = verifyDeployedAssetReference({
  root,
  dist,
  sourceRelative: 'src/assets/title-v112/title-mascot-v112.webp',
  label: 'original title mascot'
});
if (distText.includes('title-v120/title-mascot')) throw new Error('replacement mascot remains active in dist');
console.log(`PASS v1.0.23 title and mascot deployment (${mascot.emittedRelative})`);
