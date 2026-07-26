import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ActionAssetAssuranceDirectorV125, { ACTION_ASSET_ASSURANCE_V125_ID, ACTION_ASSET_POLICY_V125 } from '../src/runtime/action-asset-assurance-director-v125.js';

const root = process.cwd();
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const registry = json('public/assets/visual-v125/action-asset-registry-v125.json');
const manifest = json('public/assets/visual-v125/action-asset-manifest-v125.json');
const runtime = text('src/runtime/action-asset-assurance-director-v125.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const main = text('src/main.js');
const css = text('src/style.css');
const sw = text('public/sw.js');
const index = text('index.html');
const workflow = text('.github/workflows/deploy.yml');

const [major, minor, patchVersion] = pkg.version.split('.').map(Number);
check(major === 1 && minor === 0 && patchVersion >= 25, 'v1.0.25 foundation is not preserved');
check(/^b24\.\d+$/.test(pkg.dokkaebi?.buildId || '') && pkg.dokkaebi?.buildRevision === patchVersion, 'current build identity mismatch');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package-lock build identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
check(index.includes(`const RELEASE_VERSION = '${pkg.version}'`) && index.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}'`), 'HTML boot identity mismatch');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
check(index.includes(currentRevision), 'current title cache revision missing');
if (!failures.length) pass(`v1.0.25 foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(ACTION_ASSET_ASSURANCE_V125_ID === 'DD-ACTION-ASSET-ASSURANCE-V125', 'runtime marker export mismatch');
check(ACTION_ASSET_POLICY_V125.directions === 11 && ACTION_ASSET_POLICY_V125.states.length === 6, 'direction/action policy dimensions mismatch');
check(runtime.includes('protagonistCoverageCells') && runtime.includes('tenWaveTargetReached'), 'runtime coverage or lifecycle telemetry missing');
check(runtime.includes("bombImpRuntime: 'quarantined'") && runtime.includes("bombImpDirectionalArt: 'replacement-pending'"), 'bomb imp approval boundary missing');
check(main.includes("import ActionAssetAssuranceDirectorV125") && main.includes('new ActionAssetAssuranceDirectorV125'), 'v1.0.25 runtime is not installed');
check(main.includes("'action-asset-assurance-v125'") && main.includes('actionAssetAssuranceV125: game.actionAssetAssuranceV125?.report'), 'v1.0.25 runtime is not updated or exported');
if (!failures.length) pass('action, viewport and 10-wave assurance runtime is integrated');

check(visual.includes('ACTION_HOLD_V125'), 'action hold policy missing');
check(visual.includes('stabilizeActionStateV125'), 'action state stabilizer missing');
check(visual.includes('protagonistDirectionStateCoverageV125'), '11-direction × action coverage matrix missing');
check(visual.includes('protagonistActionTransitionsV125') && visual.includes('protagonistActionLocksAppliedV125'), 'action transition diagnostics missing');
check(visual.includes('releasedRecordsV125') && visual.includes('peakActiveRecordsV125') && visual.includes('peakEchoesV125'), 'visual lifecycle diagnostics missing');
check(!visual.includes('actionArtApprovedV117 = true'), 'provisional action art was incorrectly promoted');
if (!failures.length) pass('protagonist action transitions are stabilized without overstating independent action art approval');

check(registry.schema === 'DD-ACTION-ASSET-REGISTRY-V125', 'asset registry schema mismatch');
check(registry.entries?.some((entry) => entry.id === 'hero-pupu-directional-v117' && entry.runtime === 'active' && entry.directionCount === 11), 'approved protagonist directional entry missing');
check(registry.entries?.some((entry) => entry.id === 'hero-pupu-action-runtime-v125' && entry.approval === 'approved-runtime' && entry.independentActionArt === false), 'action runtime approval entry missing');
check(registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v125' && entry.runtime === 'quarantined'), 'bomb imp candidate is not quarantined');
check(registry.summary?.newFinalCharacterArt === 0, 'registry overstates newly approved final character art');
check(manifest.id === 'DD-ACTION-ASSET-MANIFEST-V125' && manifest.registry.includes('action-asset-registry-v125.json'), 'asset manifest mismatch');
if (!failures.length) pass('asset management registry separates active, provisional, replacement-pending and quarantined entries');

check(css.includes('v1.0.25 Action Asset Assurance, Result & Codex Presentation'), 'v1.0.25 CSS section missing');
check(css.includes('.result-card') && css.includes('.collection-card') && css.includes('.codex-preview-card'), 'result/codex visual integration missing');
check(css.includes('hud-collision-guard-v125') && css.includes('data-v125-viewport'), 'viewport HUD fallback styles missing');
check(existsSync(path.join(root, 'public/action-asset-lab-v125.html')), 'v1.0.25 browser lab missing');
check(existsSync(path.join(root, 'docs/ACTION_ASSET_ASSURANCE_v1.0.25.md')), 'v1.0.25 assurance report missing');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.25.md')), 'v1.0.25 patch notes missing');
check(existsSync(path.join(root, 'docs/PATCH_APPLY_v1.0.25.md')), 'v1.0.25 apply guide missing');
check(existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.26.md')), 'next update schedule missing');
if (!failures.length) pass('result, codex, browser QA and next-update documentation are installed');

check(sw.includes('action-asset-assurance-director-v125.js'), 'service worker omits v1.0.25 runtime');
check(sw.includes('action-asset-lab-v125.html') && sw.includes('action-asset-registry-v125.json'), 'service worker omits v1.0.25 lab or registry');
check(pkg.scripts?.verify?.includes('verify:release:v125') && pkg.scripts?.['verify:dist:v125'], 'package verification chain omits v1.0.25');
check(workflow.includes('npm run verify:dist:v125'), 'GitHub Pages workflow omits v1.0.25 dist verification');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml') && !text('public/action-asset-lab-v125.html').includes('<svg'), 'v1.0.25 introduced SVG content');
if (!failures.length) pass('service worker, CI and no-SVG contracts include v1.0.25');

const coverage = Object.fromEntries(ACTION_ASSET_POLICY_V125.states.map((state) => [state, Array.from({ length: 11 }, (_, index) => index < 3 ? 1 : 0)]));
const fakeVisual = { diagnostics: {
  protagonistDirectionStateCoverageV125: coverage,
  protagonistActionTransitionsV125: 18,
  protagonistActionLocksAppliedV125: 12,
  protagonistActionStateRejectsV125: 2,
  activeRecords: 4,
  releasedRecordsV125: 20,
  peakActiveRecordsV125: 14,
  peakEchoesV125: 3,
  echoesV125: 0
} };
const director = new ActionAssetAssuranceDirectorV125({ combatVisual: fakeVisual });
for (let wave = 1; wave <= 10; wave += 1) {
  director.update(.3, { wave, enemies: 2, units: 2, particles: 8, projectiles: 3 });
}
check(director.report.tenWaveTargetReached === true, '10-wave target simulation failed');
check(director.report.lifecycleHealthy === true, 'lifecycle simulation reported unhealthy residuals');
check(director.report.protagonistDirectionsObserved === 3 && director.report.protagonistStatesObserved === 6, 'coverage simulation mismatch');
check(director.report.actionTransitions === 18 && director.report.actionLocksApplied === 12, 'action diagnostics simulation mismatch');
if (!failures.length) pass('10-wave lifecycle and 11-direction action coverage simulation passed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.25 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.25 Action & Asset Assurance verified.');
