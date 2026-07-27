import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { verifyCanonicalPresentationSurface } from './lib/verify-dist-presentation-surface.mjs';

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
const workflow = read('.github/workflows/deploy.yml');
const v123 = read('scripts/verify-dist-v123.mjs');
const v133 = read('scripts/verify-dist-v133.mjs');
const patch = Number(String(pkg.version || '').split('.')[2] || 0);

check(String(pkg.version).startsWith('1.0.') && patch >= 38 && pkg.dokkaebi?.releaseVersion === pkg.version, 'v1.0.38+ package release identity');
check(pkg.dokkaebi?.buildId === `b24.${patch}` && Number(pkg.dokkaebi?.buildRevision) === patch, 'current package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'current lock identity');
check(version.releaseVersion === pkg.version && version.lineageVersion === pkg.dokkaebi?.lineageVersion && version.buildId === pkg.dokkaebi?.buildId, 'current public version identity');
check(read('src/main.js').includes(`const GAME_VERSION = '${pkg.version}';`), 'current main version identity');
check(read('src/version-policy.js').includes(`PUBLIC_GAME_VERSION = '${pkg.version}'`) && read('src/version-policy.js').includes(`LEGACY_LINEAGE_VERSION = '${pkg.dokkaebi?.lineageVersion}'`), 'current version policy identity');
check(read('index.html').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('index.html').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current index identity');
check(read('public/sw.js').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('public/sw.js').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current service worker identity');
check(read('public/static-bootstrap.js').includes(`const RELEASE_VERSION = '${pkg.version}';`) && read('public/static-bootstrap.js').includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current bootstrap identity');
check(shell.releaseVersion === pkg.version && shell.buildId === pkg.dokkaebi?.buildId && shell.moduleCount >= 100, 'current runtime shell identity');
check(v123.includes('verifyCanonicalPresentationSurface') && !v123.includes("distText.includes('도깨비 운빨 수호대')"), 'v123 presentation-scope fix');
check(v133.includes('patch < 33') && !v133.includes("version.releaseVersion !== '1.0.33'"), 'v133 forward-compatible dist identity');
check(workflow.includes('npm run verify:dist:v138'), 'CI v138 dist gate retained');
check(pkg.scripts?.verify?.includes('verify:release:v138') && pkg.scripts?.['verify:dist:v138'], 'v138 scripts retained');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.38 / b24.38'), 'mandatory v138 handoff retained');
for (const doc of ['docs/CI_ACTIVE_PRESENTATION_CONTRACT_v1.0.38.md','docs/PATCH_NOTES_v1.0.38.md','docs/PATCH_APPLY_v1.0.38.md']) check(fs.existsSync(path.join(root, doc)), `document ${doc}`);

const fixture = mkdtempSync(path.join(os.tmpdir(), 'dd-v138-presentation-'));
try {
  mkdirSync(path.join(fixture, 'assets'), { recursive: true });
  writeFileSync(path.join(fixture, 'index.html'), '<title>도깨비 럭 디펜스 3D</title><script src="assets/game.js"></script>');
  writeFileSync(path.join(fixture, 'manifest.webmanifest'), JSON.stringify({ name: '도깨비 럭 디펜스 3D' }));
  writeFileSync(path.join(fixture, 'assets/game.js'), "const replacements=['도깨비 운빨 수호대','도깨비 럭 디펜스 3D'];");
  try { verifyCanonicalPresentationSurface({ dist: fixture, requireManifest: true }); } catch { check(false, 'runtime correction literals allowed outside presentation surface'); }
  writeFileSync(path.join(fixture, 'index.html'), '<title>도깨비 운빨 수호대</title>');
  let rejected = false;
  try { verifyCanonicalPresentationSurface({ dist: fixture, requireManifest: true }); } catch { rejected = true; }
  check(rejected, 'legacy title rejected on active presentation surface');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS v1.0.38 active presentation scope foundation preserved under current release ${pkg.version}`);
