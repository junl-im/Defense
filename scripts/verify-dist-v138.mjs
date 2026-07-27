import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { verifyCanonicalPresentationSurface } from './lib/verify-dist-presentation-surface.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
if (version.releaseVersion !== '1.0.38' || version.lineageVersion !== '23.6.0' || version.buildId !== 'b24.38') {
  throw new Error('v1.0.38 dist identity mismatch');
}
const surfaces = verifyCanonicalPresentationSurface({ dist, requireManifest: true });
const index = surfaces.index;
if (!index.includes('release-v138-b24-38')) throw new Error('v1.0.38 cache revision missing from dist/index.html');

const bundleRoots = [path.join(dist, 'assets'), path.join(dist, 'src/runtime')];
let guardFound = false;
const stack = bundleRoots.filter((entry) => fs.existsSync(entry));
while (stack.length && !guardFound) {
  const current = stack.pop();
  const stat = fs.statSync(current);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(current)) stack.push(path.join(current, entry));
    continue;
  }
  if (!/\.js$/i.test(current)) continue;
  const text = fs.readFileSync(current, 'utf8');
  if (text.includes('DD-TITLE-PRESENTATION-V123') && text.includes('도깨비 운빨 수호대')) guardFound = true;
}
if (!guardFound) throw new Error('title presentation correction guard missing from deployed runtime');
console.log('PASS v1.0.38 active presentation surfaces exclude legacy branding while runtime correction data remains deployed');
