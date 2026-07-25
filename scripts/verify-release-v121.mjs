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
const runtime = text('src/runtime/live-combat-director-v121.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const css = text('src/style.css');
const workflow = text('.github/workflows/deploy.yml');

const releasePatch = Number(String(pkg.version).split('.').at(-1) || 0);
check(releasePatch >= 21 && Number(pkg.dokkaebi?.buildRevision || 0) >= 21, 'package identity is older than v1.0.21 / b24.21');
check(lock.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package lock identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
if (!failures.length) pass(`v1.0.21 foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(runtime.includes('DD-LIVE-COMBAT-V121'), 'live combat runtime marker missing');
check(runtime.includes("return 'extreme'") && runtime.includes("return 'crowded'"), 'four density bands are not implemented');
check(runtime.includes('--v121-boss-top') && runtime.includes('getBoundingClientRect'), 'measured top HUD safe lane missing');
check(main.includes('new LiveCombatDirectorV121') && main.includes("'live-combat-v121'"), 'live combat runtime is not installed and updated');
if (!failures.length) pass('live combat density and measured HUD orchestration are integrated');

check(visual.includes('damageGhost') && visual.includes('ghostRatioV121'), 'delayed damage health-bar trail missing');
check(visual.includes('dangerGlow') && visual.includes('criticalPulse'), 'critical health glow missing');
check(visual.includes('setLiveCombatPolicyV121') && visual.includes("density === 'extreme'"), 'density-aware world HP policy missing');
check(visual.includes('healthBarsSuppressedV121') && visual.includes('laneOffset'), 'crowd overlap diagnostics and lane offsets missing');
if (!failures.length) pass('world HP bars use damage trails, critical feedback and crowd prioritization');

check(css.includes('v1.0.21 Live Combat Ascension'), 'v1.0.21 CSS section missing');
check(css.includes('var(--v121-boss-top)') && css.includes('combat-boss-active-v121'), 'boss HUD measured positioning missing');
check(css.includes('data-combat-density-v121="extreme"'), 'extreme-density UI reduction missing');
check(existsSync(path.join(root, 'public/combat-lab-v121.html')), 'combat lab page missing');
if (!failures.length) pass('PC and mobile HUD safe zones and combat lab are present');

check(pkg.scripts?.verify?.includes('verify:release:v121'), 'full verification chain omits v1.0.21');
check(pkg.scripts?.['verify:dist:v121'], 'v1.0.21 dist verification command missing');
check(workflow.includes('npm run verify:dist:v121'), 'GitHub Pages workflow omits v1.0.21 dist verification');
check(existsSync(path.join(root, 'docs/LIVE_COMBAT_ASCENSION_v1.0.21.md')), 'v1.0.21 implementation guide missing');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.21.md')), 'v1.0.21 patch notes missing');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml'), 'v1.0.21 introduced SVG content');
if (!failures.length) pass('v1.0.21 release, CI and no-SVG contracts are installed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.21 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.21 Live Combat Ascension verified.');
