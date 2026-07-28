import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, message) => { if (!value) failures.push(message); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const shell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const residency = json('docs/generated/asset-residency-v145.json');
const baseline = json('docs/PERFORMANCE_BASELINE_v1.0.44.json');
const main = read('src/main.js');
const assurance = read('src/runtime/long-session-assurance-v145.js');
const browser = read('scripts/run-long-session-v145.mjs');
const trend = read('scripts/verify-performance-trend-v145.mjs');
const workflow = read('.github/workflows/deploy.yml');
const rootPolicy = read('scripts/root-output-policy.mjs');
const rootMigration = read('scripts/verify-root-migration-v101.mjs');
const patchCreator = read('scripts/create-patch-v145.mjs');
const patchVerifier = read('scripts/verify-patch-v145.mjs');
const chain = read('scripts/verify-dist-chain-v140.mjs');
const v144Release = read('scripts/verify-release-v144.mjs');
const v144Dist = read('scripts/verify-dist-v144.mjs');
const handoff = read('PROJECT_HANDOFF.md');

const versionParts = pkg.version.split('.').map(Number);
check(versionParts[0] === 1 && versionParts[1] === 0 && versionParts[2] >= 45 && pkg.dokkaebi?.releaseVersion === pkg.version && pkg.dokkaebi?.buildId === `b24.${versionParts[2]}` && pkg.dokkaebi?.buildRevision === versionParts[2] && pkg.dokkaebi?.cacheRevision === `${pkg.version}-${pkg.dokkaebi.buildId}`, 'package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi.buildId && lock.dokkaebi?.cacheRevision === pkg.dokkaebi.cacheRevision, 'lock identity');
check(version.releaseVersion === pkg.version && version.lineageVersion === '23.12.0' && version.buildRevision === versionParts[2] && version.buildId === pkg.dokkaebi.buildId && version.cacheRevision === pkg.dokkaebi.cacheRevision, 'public identity');
check(shell.releaseVersion === pkg.version && shell.buildId === pkg.dokkaebi.buildId && shell.cacheRevision === pkg.dokkaebi.cacheRevision && shell.files?.some((entry) => entry.path === 'src/runtime/long-session-assurance-v145.js'), 'runtime shell identity and v145 module');
check(assurance.includes('DD-LONG-SESSION-ASSURANCE-V145') && assurance.includes('maxHeapSlopeMBPer10Waves') && assurance.includes('maxFrameSlopeMsPer10Waves') && assurance.includes('contextExercise'), 'long-session trend model');
check(main.includes("LongSessionAssuranceV145") && main.includes('prepareLongSessionV145') && main.includes('advanceLongSessionWaveV145') && main.includes('measureFrameWindowV145') && main.includes('exerciseWebGLRecoveryV145') && main.includes('finishLongSessionV145'), 'complete game long-session test API');
check(browser.includes('V145-CI-100-WAVES') && browser.includes('targetWaves:100') && browser.includes('wave===50') && browser.includes('exerciseWebGLRecoveryV145') && browser.includes('--js-flags=--expose-gc') && browser.includes('Page.captureScreenshot') && browser.includes('Runtime.exceptionThrown') && browser.includes('Network.loadingFailed'), '100-wave Chromium harness and diagnostics');
check(residency.id === 'DD-ASSET-RESIDENCY-V145' && residency.releaseVersion === '1.0.45' && residency.integrity?.allClassifiedOnce === true && residency.integrity?.portableUrls === true && residency.integrity?.nonPortableUrls?.length === 0 && !JSON.stringify(residency).includes('file://') && residency.totals?.boot?.count === 13 && residency.totals?.deferred?.count === 40 && residency.edges?.length >= residency.assets?.length, 'startup/deferred residency, portable URLs, and explicit reachability');
check(baseline.id === 'DD-PERFORMANCE-BASELINE-V144' && baseline.releaseVersion === '1.0.44' && baseline.buildId === 'b24.44' && baseline.maxRegressionPercent === 5 && baseline.metrics?.mainJs?.rawBytes === 397177, 'approved v1.0.44 performance baseline');
check(trend.includes('deltaPercent') && trend.includes('1 + percent / 100') && trend.includes('performance-trend-report.json'), '5 percent trend gate');
check(v144Release.includes('versionParts[2] >= 44') && v144Dist.includes("parts[2] < 44") && !v144Dist.includes("version.releaseVersion !== '1.0.44'"), 'v144 forward-compatible foundation');
check(chain.includes("'145'") && chain.includes('versions.length'), 'dist verification chain includes v145');
check(workflow.includes('REQUIRE_BROWSER_V144: 1') && workflow.includes('REQUIRE_BROWSER_V145: 1') && workflow.includes('logs/qa/v145') && workflow.includes('v1.0.45-long-session-qa'), 'CI long-session evidence contract');
check(workflow.includes('actions/upload-artifact@v7') && !workflow.includes('actions/upload-artifact@v4') && workflow.includes('if-no-files-found: ignore'), 'Node 24 artifact upload and quiet optional evidence contract');
check(rootPolicy.includes('APPLY_[A-Z]{2}') && rootMigration.includes("'APPLY_KO.txt'"), 'localized patch guide root migration regression');
check(patchCreator.includes("path.join(out, 'APPLY_KO.txt')") && patchCreator.includes('오직 overlay/') && patchVerifier.includes('patch metadata leaked into direct overlay'), 'patch metadata separation contract');
for (const name of ['generate:residency:v145', 'verify:residency:v145', 'verify:trend:v145', 'verify:model:v145', 'verify:browser:v145', 'verify:release:v145', 'verify:dist:v145', 'stage:package:v145', 'verify:package:v145', 'create:patch:v145', 'verify:patch:v145']) check(Boolean(pkg.scripts?.[name]), `package script ${name}`);
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-28 — v1.0.45 / b24.45'), 'mandatory v145 handoff');
for (const doc of ['docs/PERFORMANCE_BASELINE_v1.0.44.json', 'docs/RELEASE_ASSURANCE_v1.0.45.md', 'docs/PATCH_NOTES_v1.0.45.md', 'docs/PATCH_APPLY_v1.0.45.md', 'docs/NEXT_UPDATE_v1.0.46.md', 'docs/generated/asset-residency-v145.json', 'docs/generated/asset-residency-v145.md']) check(fs.existsSync(path.join(root, doc)), `document ${doc}`);

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.45 100-wave stability, WebGL recovery, performance trend, and explicit asset residency contracts');
