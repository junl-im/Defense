import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { verifyDistV134Foundation } from './lib/verify-dist-v134-foundation.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const patch = Number(String(version.releaseVersion || '').split('.')[2] || 0);
if (!String(version.releaseVersion || '').startsWith('1.0.') || patch < 39 || version.buildId !== `b24.${patch}`) {
  throw new Error('v1.0.39+ dist identity mismatch');
}
const foundation = verifyDistV134Foundation({ dist });
const verifier = fs.readFileSync(path.join(root, 'scripts/verify-dist-v134.mjs'), 'utf8');
if (!verifier.includes('verifyDistV134Foundation') || !verifier.includes('DIST_DIR')) throw new Error('portable v1.0.34 verifier wrapper missing');
console.log(`PASS v1.0.39+ ${foundation.mode} deployment keeps v1.0.34 mobile HUD foundation without requiring dist/src source files`);
