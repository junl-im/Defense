import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
const required = [
  'index.html',
  'version.json',
  'sw.js',
  'static-bootstrap.js',
  'src/main.js',
  'src/style.css',
  'src/version-policy.js',
  'src/runtime/mobile-hud-director-v23.js'
];
for (const relative of required) if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.34 foundation missing dist/${relative}`);
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const version = JSON.parse(read('version.json'));
const parts = String(version.releaseVersion || '').split('.').map(Number);
const atLeastV134 = parts.length === 3 && parts.every(Number.isFinite)
  && (parts[0] > 1 || (parts[0] === 1 && (parts[1] > 0 || parts[2] >= 34)));
if (!atLeastV134 || version.buildEpoch !== 24 || Number(version.buildRevision) < 34 || version.buildId !== `b24.${version.buildRevision}`) throw new Error('v1.0.34 dist foundation identity mismatch');
if (!read('index.html').includes(version.cacheRevision) || !read('sw.js').includes(`const RELEASE_VERSION = '${version.releaseVersion}';`) || !read('sw.js').includes(`const BUILD_ID = '${version.buildId}';`)) throw new Error('current dist cache identity mismatch');
const mobile = read('src/runtime/mobile-hud-director-v23.js');
if (!mobile.includes('DD-MOBILE-HUD-RESILIENCE-V134') || !mobile.includes('lateMountRecoveries') || !mobile.includes('transitionEmergencyV23') || !mobile.includes('--mobile-visual-bottom-v23')) throw new Error('v1.0.34 resilience foundation missing');
const css = read('src/style.css');
if (!css.includes('v1.0.34 Mobile HUD Resilience') || !css.includes('min-height: 44px')) throw new Error('v1.0.34 accessibility CSS missing');
if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) throw new Error('obsolete compact root file leaked into dist');
console.log(`PASS v1.0.34 static deployment foundation preserved under current release ${version.releaseVersion} / ${version.buildId}`);
