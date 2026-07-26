import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import BossEncounterAssuranceDirectorV126, { BOSS_ENCOUNTER_ASSURANCE_V126_ID, BOSS_ENCOUNTER_POLICY_V126 } from '../src/runtime/boss-encounter-assurance-director-v126.js';

const root = process.cwd();
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const registry = json('public/assets/visual-v126/boss-encounter-registry-v126.json');
const manifest = json('public/assets/visual-v126/boss-encounter-manifest-v126.json');
const runtime = text('src/runtime/boss-encounter-assurance-director-v126.js');
const main = text('src/main.js');
const index = text('index.html');
const css = text('src/style.css');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');

const [major, minor, patchVersion] = pkg.version.split('.').map(Number);
check(major === 1 && minor === 0 && patchVersion >= 26, 'v1.0.26 foundation is not preserved');
check(/^b24\.\d+$/.test(pkg.dokkaebi?.buildId || '') && pkg.dokkaebi?.buildRevision === patchVersion, 'current build identity mismatch');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package-lock build identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
check(index.includes(`const RELEASE_VERSION = '${pkg.version}'`) && index.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}'`), 'HTML boot identity mismatch');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
check(index.includes(currentRevision), 'current title cache revision missing');
if (!failures.length) pass(`v1.0.26 foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(BOSS_ENCOUNTER_ASSURANCE_V126_ID === 'DD-BOSS-ENCOUNTER-ASSURANCE-V126', 'runtime marker export mismatch');
check(BOSS_ENCOUNTER_POLICY_V126.waveTarget === 20, '20-wave target policy missing');
check(runtime.includes('damageTrailRatio') && runtime.includes('resourceTrendHealthy'), 'damage trail or lifecycle trend telemetry missing');
check(runtime.includes("bombImpRuntime: 'quarantined'") && runtime.includes("protagonistIndependentActionArt: 'derived-provisional'"), 'art approval boundary missing');
check(main.includes("import BossEncounterAssuranceDirectorV126") && main.includes('new BossEncounterAssuranceDirectorV126'), 'v1.0.26 runtime is not installed');
check(main.includes("'boss-encounter-assurance-v126'") && main.includes('bossEncounterAssuranceV126: game.bossEncounterAssuranceV126?.report'), 'v1.0.26 runtime is not updated or exported');
if (!failures.length) pass('boss encounter assurance runtime and 20-wave telemetry are integrated');

check(index.includes('id="boss-health-damage"') && index.includes('aria-label="보스 체력"'), 'boss damage trail markup missing');
check(main.includes('initialWarning:warningDuration') && main.includes('warningProgressV126'), 'hazard warning progress metadata missing');
check(main.includes('RingGeometry(radius*.96,radius*1.075') && main.includes('RingGeometry(radius*.09,radius*.17'), 'high-contrast hazard outline or center marker missing');
check(css.includes('v1.0.26 Boss Encounter Assurance') && css.includes('.boss-health-damage'), 'v1.0.26 boss HUD styles missing');
check(css.includes('--boss-safe-top-v126') && css.includes('boss-hazard-pressure-v126'), 'HUD safe-zone or pressure styles missing');
check(css.includes('min-height: 46px') && css.includes('overscroll-behavior: contain'), 'mobile result/codex touch polish missing');
if (!failures.length) pass('boss HP trail, telegraph contrast and mobile touch polish are installed');

check(registry.schema === 'DD-BOSS-ENCOUNTER-REGISTRY-V126', 'asset registry schema mismatch');
check(registry.entries?.some((entry) => entry.id === 'boss-hud-damage-trail-v126' && entry.runtime === 'active'), 'boss HUD runtime approval missing');
check(registry.entries?.some((entry) => entry.id === 'hazard-telegraph-contrast-v126' && entry.approval === 'approved-runtime'), 'hazard runtime approval missing');
check(registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v126' && entry.runtime === 'quarantined'), 'bomb imp candidate is not quarantined');
check(registry.summary?.newFinalCharacterArt === 0, 'registry overstates newly approved character art');
check(manifest.id === 'DD-BOSS-ENCOUNTER-MANIFEST-V126' && manifest.registry.includes('boss-encounter-registry-v126.json'), 'manifest mismatch');
if (!failures.length) pass('runtime approvals and quarantined character candidates remain explicitly separated');

check(existsSync(path.join(root, 'public/boss-encounter-lab-v126.html')), 'v1.0.26 browser lab missing');
check(existsSync(path.join(root, 'docs/BOSS_ENCOUNTER_ASSURANCE_v1.0.26.md')), 'v1.0.26 assurance report missing');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.26.md')), 'v1.0.26 patch notes missing');
check(existsSync(path.join(root, 'docs/PATCH_APPLY_v1.0.26.md')), 'v1.0.26 apply guide missing');
check(existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.27.md')), 'next update schedule missing');
check(sw.includes('boss-encounter-assurance-director-v126.js') && sw.includes('boss-encounter-lab-v126.html'), 'service worker omits v1.0.26 runtime or lab');
check(pkg.scripts?.verify?.includes('verify:release:v126') && pkg.scripts?.['verify:dist:v126'], 'package verification chain omits v1.0.26');
check(workflow.includes('npm run verify:dist:v126'), 'GitHub Pages workflow omits v1.0.26 dist verification');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml') && !text('public/boss-encounter-lab-v126.html').includes('<svg'), 'v1.0.26 introduced SVG content');
if (!failures.length) pass('browser QA, service worker, CI, documentation and no-SVG contracts include v1.0.26');

const fakeVisual = { diagnostics: { activeRecords: 4 } };
const director = new BossEncounterAssuranceDirectorV126({ combatVisual: fakeVisual });
for (let wave = 1; wave <= 20; wave += 1) {
  director.update(.3, {
    wave,
    boss: wave % 5 === 0 ? { hp: 60, maxHp: 100, phase: 2, intentUrgency: 'warning', intentRemaining: .8 } : null,
    hazards: wave % 5 === 0 ? [{ type: 'bossPounce', phase: 'warning', warning: .5 }] : [],
    enemies: 4,
    units: 3,
    particles: 12 + wave,
    projectiles: 5
  });
}
check(director.report.twentyWaveTargetReached === true, '20-wave target simulation failed');
check(director.report.lifecycleHealthy === true, '20-wave lifecycle trend simulation failed');
check(director.report.peakHazards === 1 && director.report.latestWave === 20, 'hazard or wave telemetry simulation mismatch');
check(director.report.approval.bombImpRuntime === 'quarantined', 'simulation approval boundary mismatch');
if (!failures.length) pass('20-wave lifecycle, boss damage trail and hazard telemetry simulation passed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.26 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.26 Boss Encounter & 20-Wave Assurance verified.');
