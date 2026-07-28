import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, message) => { if (!value) failures.push(message); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const shell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const review = json('docs/generated/asset-review-v144.json');
const budgets = json('docs/DIST_BUDGETS_v1.0.44.json');
const workflow = read('.github/workflows/deploy.yml');
const v143Dist = read('scripts/verify-dist-v143.mjs');
const browser = read('scripts/run-built-game-mobile-matrix-v144.mjs');
const handoff = read('PROJECT_HANDOFF.md');

const versionParts = String(pkg.version || '').split('.').map(Number);
check(versionParts.length === 3 && versionParts[0] === 1 && versionParts[1] === 0 && versionParts[2] >= 44 && pkg.dokkaebi?.releaseVersion === pkg.version, 'package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId && version.cacheRevision === pkg.dokkaebi?.cacheRevision, 'public identity');
check(shell.releaseVersion === pkg.version && shell.buildId === pkg.dokkaebi?.buildId && shell.cacheRevision === pkg.dokkaebi?.cacheRevision, 'runtime shell identity');
check(review.id === 'DD-ASSET-REVIEW-V144' && review.reviewedCount === 24 && review.sourceCandidateCount === 24 && review.deleteApprovedCount === 0 && review.reviews?.every((item) => item.deleteApproved === false), '24-candidate asset review');
check(budgets.id === 'DD-DIST-BUDGETS-V144' && budgets.releaseVersion === '1.0.44' && budgets.thresholds?.maxInitialJsGzipBytes > 0 && budgets.thresholds?.maxInitialTextureUploadBytes > 0, 'approved v1.0.44 dist budget contract');
check(browser.includes('complete Vite bundle') && browser.includes('Page.captureScreenshot') && browser.includes('__DOKKAEBI_TEST_API__.startRun()') && browser.includes('--enable-unsafe-swiftshader') && browser.includes('Runtime.exceptionThrown') && browser.includes('Network.loadingFailed') && browser.includes('ERR_BLOCKED_BY_ADMINISTRATOR') && browser.includes('profile cleanup') && !browser.includes('mobile-browser-recovery-v143.html'), 'complete built-game browser matrix and diagnostics');
check(!v143Dist.includes("css.includes('finger-occlusion safety')") && v143Dist.includes('missingCssContracts'), 'v143 minifier-safe CSS verification');
check(workflow.includes('REQUIRE_BROWSER_V144: 1') && workflow.includes('logs/qa/v144') && workflow.includes('npm run verify:dist:all'), 'CI browser and QA artifact contract');
for (const name of ['generate:asset-review:v144', 'verify:asset-review:v144', 'verify:budget:v144', 'verify:browser:v144', 'verify:release:v144', 'verify:dist:v144', 'create:patch:v144', 'verify:patch:v144']) check(Boolean(pkg.scripts?.[name]), `package script ${name}`);
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-28 — v1.0.44 / b24.44'), 'mandatory v144 handoff');
for (const doc of ['docs/RELEASE_ASSURANCE_v1.0.44.md', 'docs/PATCH_NOTES_v1.0.44.md', 'docs/PATCH_APPLY_v1.0.44.md', 'docs/NEXT_UPDATE_v1.0.45.md', 'docs/generated/asset-review-v144.json', 'docs/generated/asset-review-v144.md']) check(fs.existsSync(path.join(root, doc)), `document ${doc}`);

const reviewRun = spawnSync(process.execPath, [path.join(root, 'scripts/generate-asset-review-v144.mjs'), '--check'], { cwd: root, encoding: 'utf8' });
process.stdout.write(reviewRun.stdout || '');
process.stderr.write(reviewRun.stderr || '');
check(reviewRun.status === 0, 'asset review generator check');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS v1.0.44 complete-build foundation preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);
