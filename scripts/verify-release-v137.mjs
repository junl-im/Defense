import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { verifyDeployedAssetReference } from './lib/verify-dist-asset-reference.mjs';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const patch = Number(String(pkg.version || '').split('.')[2] || 0);
const expectedBuild = `b24.${patch}`;
const expectedRevision = `${pkg.version}-${expectedBuild}`;
const shell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const v123 = read('scripts/verify-dist-v123.mjs');
const workflow = read('.github/workflows/deploy.yml');

check(patch >= 37 && pkg.dokkaebi?.releaseVersion === pkg.version, 'v137+ package foundation');
check(pkg.dokkaebi?.buildId === expectedBuild && pkg.dokkaebi?.cacheRevision === expectedRevision, 'current build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === expectedBuild, 'public version identity');
check(v123.includes('verify-dist-presentation-surface.mjs'), 'v123 active presentation verifier');
check(!v123.includes("distText.includes('도깨비 운빨 수호대')"), 'global bundle legacy-title assertion removed');
check(workflow.includes('npm run verify:dist:v137'), 'CI v137 foundation gate');
check(shell.releaseVersion === pkg.version && shell.buildId === expectedBuild && shell.moduleCount >= 100, 'runtime shell current identity');
check(read('PROJECT_HANDOFF.md').includes('인수인계 내역 작성 필수'), 'mandatory handoff rule');
for (const doc of ['docs/CI_DIST_ARTIFACT_CONTRACT_v1.0.37.md','docs/PATCH_NOTES_v1.0.37.md','docs/PATCH_APPLY_v1.0.37.md']) check(fs.existsSync(path.join(root, doc)), `v137 document ${doc}`);

const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'dd-v137-fixture-'));
try {
  const source = path.join(root, 'src/assets/title-v112/title-mascot-v112.webp');
  for (const variant of [
    { name: 'static', emitted: 'src/assets/title-v112/title-mascot-v112.webp' },
    { name: 'vite', emitted: 'assets/title-mascot-v112.webp' }
  ]) {
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
console.log(`PASS v1.0.37 deployment foundation remains forward-compatible under ${pkg.version}`);
