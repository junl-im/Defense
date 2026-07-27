import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verifyDistV134Foundation } from './lib/verify-dist-v134-foundation.mjs';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const handoff = read('PROJECT_HANDOFF.md');
const workflow = read('.github/workflows/deploy.yml');
const v134 = read('scripts/verify-dist-v134.mjs');
const foundation = read('scripts/lib/verify-dist-v134-foundation.mjs');
const patch = Number(String(pkg.version || '').split('.')[2] || 0);

check(String(pkg.version).startsWith('1.0.') && patch >= 39 && pkg.dokkaebi?.releaseVersion === pkg.version, 'v1.0.39+ package release identity');
check(pkg.dokkaebi?.buildId === `b24.${patch}` && Number(pkg.dokkaebi?.buildRevision) === patch && pkg.dokkaebi?.cacheRevision === `${pkg.version}-${pkg.dokkaebi?.buildId}`, 'current package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'current lock identity');
check(version.releaseVersion === pkg.version && version.lineageVersion === pkg.dokkaebi?.lineageVersion && version.buildId === pkg.dokkaebi?.buildId, 'current public version identity');
check(read('src/main.js').includes(`const GAME_VERSION = '${pkg.version}';`), 'current main version identity');
check(read('src/version-policy.js').includes(`PUBLIC_GAME_VERSION = '${pkg.version}'`) && read('src/version-policy.js').includes(`LEGACY_LINEAGE_VERSION = '${pkg.dokkaebi?.lineageVersion}'`), 'current version policy identity');
check(read('index.html').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('index.html').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`) && read('index.html').includes(`release-v1${String(patch).padStart(2, '0')}-b24-${patch}`), 'current index identity');
check(read('public/sw.js').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('public/sw.js').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current service worker identity');
check(read('public/static-bootstrap.js').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('public/static-bootstrap.js').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current bootstrap identity');
check(v134.includes('verifyDistV134Foundation') && v134.includes('DIST_DIR'), 'v134 portable wrapper');
check(foundation.includes("staticMode") && foundation.includes("Vite JavaScript bundle"), 'v134 dual-mode helper');
check(workflow.includes('npm run verify:dist:v139'), 'CI v139 dist gate');
check(pkg.scripts?.verify?.includes('verify:release:v139') && pkg.scripts?.['verify:dist:v139'] && pkg.scripts?.['audit:dist-portability:v139'], 'v139 scripts');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.39 / b24.39'), 'mandatory v139 handoff');
for (const doc of ['docs/CI_DIST_PORTABILITY_CONTRACT_v1.0.39.md','docs/PATCH_NOTES_v1.0.39.md','docs/PATCH_APPLY_v1.0.39.md','docs/NEXT_UPDATE_v1.0.40.md']) {
  check(fs.existsSync(path.join(root, doc)), `document ${doc}`);
}

const fixture = mkdtempSync(path.join(os.tmpdir(), 'dd-v139-vite-dist-'));
try {
  mkdirSync(path.join(fixture, 'assets/system-v135'), { recursive: true });
  writeFileSync(path.join(fixture, 'index.html'), `<title>도깨비 럭 디펜스 3D</title><meta content="release-v1${String(patch).padStart(2, '0')}-b24-${patch}"><script src="assets/game.js"></script><link rel="stylesheet" href="assets/game.css">`);
  writeFileSync(path.join(fixture, 'version.json'), JSON.stringify({ releaseVersion:pkg.version, lineageVersion:pkg.dokkaebi?.lineageVersion, buildEpoch:24, buildRevision:patch, buildId:pkg.dokkaebi?.buildId, cacheRevision:pkg.dokkaebi?.cacheRevision }));
  writeFileSync(path.join(fixture, 'sw.js'), `const RELEASE_VERSION = '${pkg.version}';\nconst BUILD_ID = '${pkg.dokkaebi?.buildId}';\n`);
  writeFileSync(path.join(fixture, 'static-bootstrap.js'), '// public recovery bootstrap');
  writeFileSync(path.join(fixture, 'assets/game.js'), "const id='DD-MOBILE-HUD-STABILITY-V135';const boss='DD-BOSS-IDENTITY-ASSURANCE-V133';const release='DD-RELEASE-ASSURANCE-V124';const p='--mobile-visual-bottom-v23';const lateMountRecoveries=1;function animateTransientVisual(){}document.body.classList.toggle('mobile-hud-v23-emergency',false);");
  copyFileSync(path.join(root, 'public/assets/system-v135/runtime-module-shell-v135.json'), path.join(fixture, 'assets/system-v135/runtime-module-shell-v135.json'));
  writeFileSync(path.join(fixture, 'assets/game.css'), ':root{--mobile-visual-bottom-v23:0px}.x{min-height:44px}.x:focus-visible{outline:2px solid}');
  const result = verifyDistV134Foundation({ dist: fixture });
  check(result.mode === 'vite', 'v134 Vite fixture accepted without dist/src');
  check(!fs.existsSync(path.join(fixture, 'src/main.js')), 'fixture contains no source tree');
  for (const script of ['scripts/verify-dist-v134.mjs', 'scripts/verify-dist-v135.mjs', 'scripts/verify-dist-v136.mjs']) {
    const run = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, env: { ...process.env, DIST_DIR: fixture }, encoding: 'utf8' });
    if (run.status !== 0) {
      console.error(run.stdout);
      console.error(run.stderr);
      check(false, `fixture execution ${script}`);
    }
  }
} catch (error) {
  console.error(error);
  check(false, 'v134 Vite fixture regression');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.39 Vite dist portability, v1.0.34 foundation regression fixture, identity, and handoff verified');
