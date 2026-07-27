import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const required = [
  'index.html', 'version.json', 'sw.js', 'static-bootstrap.js',
  'src/main.js', 'src/style.css', 'src/version-policy.js', 'src/runtime-lifecycle.js',
  'src/runtime/mobile-hud-director-v23.js', 'src/runtime/boss-identity-assurance-director-v133.js',
  'assets/system-v135/runtime-module-shell-v135.json'
];
for (const relative of required) if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.35 missing dist/${relative}`);
const version = JSON.parse(read('version.json'));
if (version.releaseVersion !== '1.0.35' || version.lineageVersion !== '23.3.0' || version.buildId !== 'b24.35') throw new Error('v1.0.35 dist identity mismatch');
if (!read('index.html').includes('release-v135-b24-35') || !read('index.html').includes('1.0.35-b24.35')) throw new Error('v1.0.35 dist cache revision missing');
if (!read('sw.js').includes("const RELEASE_VERSION = '1.0.35';") || !read('sw.js').includes("const BUILD_ID = 'b24.35';")) throw new Error('v1.0.35 dist service worker mismatch');
if (!read('src/runtime-lifecycle.js').includes('export class FrameScope')) throw new Error('v1.0.35 frame lifecycle missing');
if (!read('src/main.js').includes('animateTransientVisual') || /requestAnimationFrame\((?:animate|fade)\)/.test(read('src/main.js'))) throw new Error('v1.0.35 transient effect lifecycle mismatch');
if (!read('src/runtime/mobile-hud-director-v23.js').includes('DD-MOBILE-HUD-STABILITY-V135') || !read('src/runtime/mobile-hud-director-v23.js').includes("MOBILE_HUD_V23_VERSION = '23.3.0'")) throw new Error('v1.0.35 mobile stability marker missing');
if (!read('src/runtime/boss-identity-assurance-director-v133.js').includes("removeAttribute('aria-label')")) throw new Error('v1.0.35 boss accessibility cleanup missing');
const moduleShell = JSON.parse(read('assets/system-v135/runtime-module-shell-v135.json'));
if (moduleShell.releaseVersion !== '1.0.35' || moduleShell.moduleCount < 100) throw new Error('v1.0.35 module shell manifest mismatch');
for (const entry of moduleShell.files) {
  const absolute = path.join(dist, entry.path);
  if (!fs.existsSync(absolute)) throw new Error(`dist runtime module missing: ${entry.path}`);
  const data = fs.readFileSync(absolute);
  if (entry.path === 'src/main.js') {
    const expected = Buffer.from(fs.readFileSync(path.join(root, entry.path), 'utf8').replace("import './style.css';\n", ''));
    if (data.length !== expected.length || hash(data) !== hash(expected)) throw new Error('dist runtime module transform mismatch: src/main.js');
  } else if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`dist runtime module hash mismatch: ${entry.path}`);
}
if (fs.existsSync(path.join(dist, 'assets/ip-v13/sheets'))) throw new Error('audit-only IP sheets leaked into dist');
if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) throw new Error('obsolete compact root file leaked into dist');
console.log(`PASS v1.0.35 static deployment contains ${moduleShell.moduleCount} hashed runtime modules, lifecycle fixes, UI safety, and clean assets`);
