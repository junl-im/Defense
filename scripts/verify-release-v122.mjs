import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));
const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const main = text('src/main.js');
const runtime = text('src/runtime/battlefield-clarity-director-v122.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const css = text('src/style.css');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');

const [maj,min,patch] = pkg.version.split('.').map(Number);
check(maj > 1 || (maj === 1 && (min > 0 || patch >= 22)), 'package identity is earlier than v1.0.22');
check(lock.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package lock identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
if (!failures.length) pass('v1.0.22 identity is synchronized');

check(runtime.includes('DD-BATTLEFIELD-CLARITY-V122'), 'battlefield clarity runtime marker missing');
check(runtime.includes('ResizeObserver') && runtime.includes('--v122-boss-top'), 'measured HUD overlap observer missing');
check(runtime.includes('sustainedPressure') && runtime.includes('directionHoldScale'), 'sustained pressure policy missing');
check(main.includes('new BattlefieldClarityDirectorV122') && main.includes("'battlefield-clarity-v122'"), 'battlefield clarity runtime is not installed and updated');
if (!failures.length) pass('measured HUD safety and sustained performance protection are integrated');

check(visual.includes('stabilizeDirectionalFrameV122') && visual.includes('directionLockV122'), '11-direction stability lock missing');
check(visual.includes('assignHealthLanesV122') && visual.includes('HEALTH_LANE_PATTERN_V122'), 'screen-space health lane assignment missing');
check(visual.includes('directionSwitchesDeferredV122') && visual.includes('healthOverlapClustersV122'), 'battlefield clarity diagnostics missing');
check(visual.includes('suppressMonsterAura') && visual.includes('sustainedPressure'), 'pressure-aware VFX reduction missing');
if (!failures.length) pass('direction switching, HP overlap lanes and VFX pressure control are active');

check(css.includes('v1.0.22 Battlefield Clarity & Direction Lock'), 'v1.0.22 CSS section missing');
check(css.includes('var(--v122-boss-top)') && css.includes('var(--v122-secondary-top)'), 'v1.0.22 dynamic top lanes missing');
check(css.includes('battlefield-compact-v122') && css.includes('battlefield-pressure-v122'), 'compact and pressure UI modes missing');
check(existsSync(path.join(root, 'public/combat-lab-v122.html')), 'v1.0.22 combat lab page missing');
if (!failures.length) pass('PC/mobile UI safety and battle clarity QA page are present');

check(pkg.scripts?.verify?.includes('verify:release:v122'), 'full verification chain omits v1.0.22');
check(pkg.scripts?.['verify:dist:v122'], 'v1.0.22 dist verification command missing');
check(workflow.includes('npm run verify:dist:v122'), 'GitHub Pages workflow omits v1.0.22 dist verification');
check(sw.includes('battlefield-clarity-director-v122.js'), 'service worker omits v1.0.22 runtime');
check(existsSync(path.join(root, 'docs/BATTLEFIELD_CLARITY_v1.0.22.md')), 'v1.0.22 implementation guide missing');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.22.md')), 'v1.0.22 patch notes missing');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml'), 'v1.0.22 introduced SVG content');
if (!failures.length) pass('v1.0.22 release, CI, offline and no-SVG contracts are installed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.22 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.22 Battlefield Clarity verified.');
