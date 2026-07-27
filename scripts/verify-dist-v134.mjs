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
for (const relative of required) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.34 missing dist/${relative}`);
}
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const version = JSON.parse(read('version.json'));
if (version.releaseVersion !== '1.0.34' || version.lineageVersion !== '23.2.0' || version.buildId !== 'b24.34') throw new Error('v1.0.34 dist identity mismatch');
if (!read('index.html').includes('release-v134-b24-34') || !read('index.html').includes('1.0.34-b24.34')) throw new Error('v1.0.34 dist cache revision missing');
if (!read('sw.js').includes("const RELEASE_VERSION = '1.0.34';") || !read('sw.js').includes("const BUILD_ID = 'b24.34';")) throw new Error('v1.0.34 dist service worker mismatch');
const mobile = read('src/runtime/mobile-hud-director-v23.js');
if (!mobile.includes('DD-MOBILE-HUD-RESILIENCE-V134') || !mobile.includes("MOBILE_HUD_V23_VERSION = '23.2.0'")) throw new Error('v1.0.34 runtime marker missing');
if (!mobile.includes('lateMountRecoveries') || !mobile.includes('transitionEmergencyV23') || !mobile.includes('--mobile-visual-bottom-v23')) throw new Error('v1.0.34 resilience payload missing');
const css = read('src/style.css');
if (!css.includes('v1.0.34 Mobile HUD Resilience') || !css.includes('min-height: 44px')) throw new Error('v1.0.34 accessibility CSS missing');
if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) throw new Error('obsolete compact root file leaked into dist');
console.log('PASS v1.0.34 static deployment contains mobile HUD resilience marker, synchronized cache identity, and clean root');
