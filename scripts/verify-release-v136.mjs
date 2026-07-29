import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const moduleShell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const storage = json('logs/audits/STORAGE_FOOTPRINT_v136.json');
const main = read('src/main.js');
const versionPolicy = read('src/version-policy.js');
const html = read('index.html');
const sw = read('public/sw.js');
const bootstrap = read('public/static-bootstrap.js');
const handoff = read('PROJECT_HANDOFF.md');
const readme = read('README.md');
const lifecycle = read('src/runtime-lifecycle.js');
const mobile = read('src/runtime/mobile-hud-director-v23.js');
const boss = read('src/runtime/boss-identity-assurance-director-v133.js');

const versionAtLeast = (current, minimum) => {
  const left = String(current).split('.').map((value) => Number.parseInt(value, 10) || 0);
  const right = String(minimum).split('.').map((value) => Number.parseInt(value, 10) || 0);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] || 0) > (right[index] || 0)) return true;
    if ((left[index] || 0) < (right[index] || 0)) return false;
  }
  return true;
};
const currentBuildId = pkg.dokkaebi?.buildId;
const currentLineage = pkg.dokkaebi?.lineageVersion;
const currentCacheRevision = pkg.dokkaebi?.cacheRevision;
const patch = String(pkg.version).split('.')[2] || '0';
const cacheToken = `release-v1${patch}-${String(currentBuildId).replace('.', '-')}`;

check(versionAtLeast(pkg.version, '1.0.36') && pkg.dokkaebi?.releaseVersion === pkg.version, 'package release identity');
check(versionAtLeast(currentLineage, '23.4.0') && currentBuildId && currentCacheRevision === `${pkg.version}-${currentBuildId}`, 'package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === currentBuildId, 'lock identity');
check(version.releaseVersion === pkg.version && version.lineageVersion === currentLineage && version.buildId === currentBuildId, 'public version identity');
check(main.includes(`const GAME_VERSION = '${pkg.version}';`), 'main version');
check(versionPolicy.includes(`PUBLIC_GAME_VERSION = '${pkg.version}'`) && versionPolicy.includes(`LEGACY_LINEAGE_VERSION = '${currentLineage}'`), 'version policy');
check(html.includes(`const RELEASE_VERSION = '${pkg.version}';`) && html.includes(`const BUILD_ID = '${currentBuildId}';`) && html.includes(cacheToken), 'index identity');
check(sw.includes(`const RELEASE_VERSION = '${pkg.version}';`) && sw.includes(`const BUILD_ID = '${currentBuildId}';`), 'service worker identity');
check(bootstrap.includes(`const RELEASE_VERSION = '${pkg.version}';`) && bootstrap.includes(`const BUILD_ID = '${currentBuildId}';`), 'static bootstrap identity');

check(storage.id === 'DD-STORAGE-HYGIENE-V136' && storage.releaseVersion === '1.0.36' && storage.buildId === 'b24.36', 'storage audit identity');
check(storage.cleanupPolicy?.excludeFromFullZip?.includes('dist') && storage.cleanupPolicy?.excludeFromFullZip?.includes('node_modules'), 'generated output exclusion policy');
check(storage.cleanupPolicy?.preserve?.includes('public') && storage.cleanupPolicy?.preserve?.includes('production'), 'authored source preservation policy');
check(read('scripts/stage-clean-package-v136.mjs').includes("['dist', 'node_modules', '.git']"), 'clean package staging exclusions');
check(read('scripts/cleanup-generated-output-v136.mjs').includes("const dist = path.join(root, 'dist')"), 'generated output cleanup command');

check(lifecycle.includes('export class FrameScope') && lifecycle.includes('this.frames.cancelAll()'), 'v1.0.35 frame lifecycle preserved');
check(main.includes('animateTransientVisual') && main.includes('clearTransientVisuals'), 'managed transient visuals preserved');
check(mobile.includes('DD-MOBILE-HUD-STABILITY-V135') && mobile.includes("MOBILE_HUD_V23_VERSION = '23.3.0'"), 'mobile HUD stability preserved');
check(boss.includes("removeAttribute('aria-label')") && boss.includes("setAttribute('role', 'status')"), 'boss accessibility preserved');

check(moduleShell.id === 'DD-RELEASE-INTEGRITY-V135' && moduleShell.releaseVersion === pkg.version && moduleShell.buildId === currentBuildId, 'runtime module shell current identity');
check(moduleShell.moduleCount === moduleShell.files?.length && moduleShell.moduleCount >= 100, 'runtime module shell coverage');
for (const entry of moduleShell.files || []) {
  const absolute = path.join(root, entry.path);
  check(fs.existsSync(absolute), `runtime module exists ${entry.path}`);
  if (!fs.existsSync(absolute)) continue;
  const data = fs.readFileSync(absolute);
  check(data.length === entry.bytes && hash(data) === entry.sha256, `runtime module hash ${entry.path}`);
  check(sw.includes(`'./${entry.path}'`), `service worker module ${entry.path}`);
}

let assetCount = 0;
let zeroByte = 0;
let svg = 0;
for (const relative of ['public/assets', 'src/assets']) {
  const pending = [path.join(root, relative)];
  while (pending.length) {
    const current = pending.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) pending.push(absolute);
      else if (item.isFile()) {
        assetCount += 1;
        if (fs.statSync(absolute).size === 0) zeroByte += 1;
        if (item.name.toLowerCase().endsWith('.svg')) svg += 1;
      }
    }
  }
}
check(assetCount >= 1900 && zeroByte === 0 && svg === 0, 'asset inventory preserved');

const requiredDocs = [
  'docs/STORAGE_HYGIENE_AUDIT_v1.0.36.md',
  'docs/PACKAGE_POLICY_v1.0.36.json',
  'docs/PATCH_NOTES_v1.0.36.md',
  'docs/PATCH_APPLY_v1.0.36.md',
  'docs/NEXT_UPDATE_v1.0.37.md'
];
check(requiredDocs.every(exists), 'v1.0.36 operating docs');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.36 / b24.36'), 'mandatory v1.0.36 handoff history');
check(readme.includes('dist') && readme.includes('Vite') && readme.includes('Static fallback'), 'README storage guidance');
check(pkg.scripts?.verify?.includes('verify:release:v136') && pkg.scripts?.['stage:package:v136'] && pkg.scripts?.['verify:package:v136'] && pkg.scripts?.['create:patch:v136'] && pkg.scripts?.['verify:patch:v136'], 'v1.0.36 package scripts');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS v1.0.36 storage hygiene, release identity, runtime preservation, and asset boundary verified (${assetCount} assets)`);
