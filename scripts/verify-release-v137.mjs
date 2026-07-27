import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const shell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const handoff = read('PROJECT_HANDOFF.md');
const readme = read('README.md');
const v123 = read('scripts/verify-dist-v123.mjs');
const v124 = read('scripts/verify-dist-v124.mjs');
const v135 = read('scripts/verify-dist-v135.mjs');
const v136 = read('scripts/verify-dist-v136.mjs');
const workflow = read('.github/workflows/deploy.yml');

check(pkg.version === '1.0.37' && pkg.dokkaebi?.releaseVersion === '1.0.37', 'package release identity');
check(pkg.dokkaebi?.lineageVersion === '23.5.0' && pkg.dokkaebi?.buildId === 'b24.37' && pkg.dokkaebi?.cacheRevision === '1.0.37-b24.37', 'package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === 'b24.37', 'lock identity');
check(version.releaseVersion === '1.0.37' && version.lineageVersion === '23.5.0' && version.buildId === 'b24.37', 'public version identity');
check(read('src/main.js').includes("const GAME_VERSION = '1.0.37';"), 'main version identity');
check(read('src/version-policy.js').includes("PUBLIC_GAME_VERSION = '1.0.37'") && read('src/version-policy.js').includes("LEGACY_LINEAGE_VERSION = '23.5.0'"), 'version policy identity');
check(read('index.html').includes("const RELEASE_VERSION = '1.0.37';") && read('index.html').includes("const BUILD_ID = 'b24.37';") && read('index.html').includes('release-v137-b24-37'), 'index identity');
check(read('public/sw.js').includes("const RELEASE_VERSION = '1.0.37';") && read('public/sw.js').includes("const BUILD_ID = 'b24.37';"), 'service worker identity');
check(read('public/static-bootstrap.js').includes("const RELEASE_VERSION = '1.0.37';") && read('public/static-bootstrap.js').includes("const BUILD_ID = 'b24.37';"), 'bootstrap identity');

check(v123.includes("./lib/verify-dist-asset-reference.mjs") && v124.includes("./lib/verify-dist-asset-reference.mjs"), 'v123/v124 shared asset verifier');
check(!v123.includes("index.includes('title-v112/title-mascot-v112.webp')") && !v124.includes("index.includes('title-v112/title-mascot-v112.webp')"), 'raw source path assertions removed');
check(v135.includes('staticMode') && v135.includes('Vite runtime bundles are missing'), 'v135 dual-mode dist verification');
check(v136.includes('staticMode') && v136.includes('Vite runtime bundles are missing'), 'v136 dual-mode dist verification');
check(workflow.includes('npm run verify:dist:v137'), 'CI v137 dist gate');
check(pkg.scripts?.verify?.includes('verify:release:v137') && pkg.scripts?.['verify:dist:v137'] && pkg.scripts?.['create:patch:v137'], 'v137 scripts');

check(shell.releaseVersion === '1.0.37' && shell.buildId === 'b24.37' && shell.moduleCount >= 100, 'runtime shell current identity');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.37 / b24.37'), 'mandatory v137 handoff');
check(readme.includes('v1.0.37') && readme.includes('Vite'), 'README v137 guidance');
for (const doc of ['docs/CI_DIST_ARTIFACT_CONTRACT_v1.0.37.md','docs/PATCH_NOTES_v1.0.37.md','docs/PATCH_APPLY_v1.0.37.md','docs/NEXT_UPDATE_v1.0.38.md']) check(fs.existsSync(path.join(root, doc)), `document ${doc}`);

const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'dd-v137-fixture-'));
try {
  const source = path.join(root, 'src/assets/title-v112/title-mascot-v112.webp');
  const variants = [
    { name: 'static', emitted: 'src/assets/title-v112/title-mascot-v112.webp' },
    { name: 'vite', emitted: 'assets/title-mascot-v112.webp' }
  ];
  for (const variant of variants) {
    const dist = path.join(fixtureRoot, variant.name);
    mkdirSync(path.dirname(path.join(dist, variant.emitted)), { recursive: true });
    copyFileSync(source, path.join(dist, variant.emitted));
    writeFileSync(path.join(dist, 'index.html'), `<title>도깨비 럭 디펜스 3D</title><img src="/${variant.emitted}">`);
    const result = verifyDeployedAssetReference({ root, dist, sourceRelative: 'src/assets/title-v112/title-mascot-v112.webp', label: `${variant.name} fixture mascot` });
    check(result.emittedRelative === variant.emitted, `${variant.name} fixture emitted path`);
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.37 CI dist artifact contract, Vite/static compatibility, identity, and handoff verified');
