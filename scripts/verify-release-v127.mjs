import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import BossTacticalAssuranceDirectorV127, { BOSS_TACTICAL_ASSURANCE_V127_ID, BOSS_TACTICAL_POLICY_V127, classifyOffscreenPointV127 } from '../src/runtime/boss-tactical-assurance-director-v127.js';

const root = process.cwd();
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const registry = json('public/assets/visual-v127/boss-tactical-registry-v127.json');
const manifest = json('public/assets/visual-v127/boss-tactical-manifest-v127.json');
const runtime = text('src/runtime/boss-tactical-assurance-director-v127.js');
const main = text('src/main.js');
const index = text('index.html');
const css = text('src/style.css');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');

check(pkg.version === '1.0.27', 'package version is not 1.0.27');
check(pkg.dokkaebi?.buildId === 'b24.27' && pkg.dokkaebi?.buildRevision === 27, 'package build identity mismatch');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package-lock build identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes("const GAME_VERSION = '1.0.27'"), 'runtime version identity mismatch');
check(index.includes("const RELEASE_VERSION = '1.0.27'") && index.includes("const BUILD_ID = 'b24.27'"), 'HTML boot identity mismatch');
check(index.includes('release-v127-b24-27'), 'title cache revision mismatch');
if (!failures.length) pass('v1.0.27 / b24.27 identity is synchronized');

check(BOSS_TACTICAL_ASSURANCE_V127_ID === 'DD-BOSS-TACTICAL-ASSURANCE-V127', 'runtime marker export mismatch');
check(BOSS_TACTICAL_POLICY_V127.waveTarget === 30 && BOSS_TACTICAL_POLICY_V127.maxIndicators === 4, '30-wave or indicator policy missing');
check(runtime.includes('classifyOffscreenPointV127') && runtime.includes('renderIndicators') && runtime.includes('updateCameraAssist'), 'offscreen radar or camera assist runtime missing');
check(runtime.includes("bombImpRuntime: 'quarantined'") && runtime.includes("protagonistIndependentActionArt: 'derived-provisional'"), 'art approval boundary missing');
check(main.includes("import BossTacticalAssuranceDirectorV127") && main.includes('new BossTacticalAssuranceDirectorV127'), 'v1.0.27 runtime is not installed');
check(main.includes("'boss-tactical-assurance-v127'") && main.includes('bossTacticalAssuranceV127: game.bossTacticalAssuranceV127?.report'), 'v1.0.27 runtime is not updated or exported');
check(main.includes('tacticalDistanceBonusV127') && main.includes('tacticalFovBonusV127') && main.includes('tacticalDirectiveV127.focus'), 'camera integration is incomplete');
if (!failures.length) pass('offscreen hazard radar, limited camera assist and reliability export are integrated');

check(css.includes('v1.0.27 Boss Tactical Radar') && css.includes('.offscreen-hazard-indicator-v127'), 'v1.0.27 radar styles missing');
check(css.includes('boss-hud-compact-v127') && css.includes('@media (max-height: 560px) and (orientation: landscape)'), 'mobile landscape compact boss HUD missing');
check(css.includes('prefers-reduced-motion') && css.includes('offscreen-danger-pulse-v127'), 'motion accessibility contract missing');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml') && !text('public/boss-tactical-lab-v127.html').includes('<svg'), 'v1.0.27 introduced SVG content');
if (!failures.length) pass('mobile landscape HUD, reduced-motion and no-SVG presentation contracts are installed');

check(registry.schema === 'DD-BOSS-TACTICAL-REGISTRY-V127', 'asset registry schema mismatch');
check(registry.entries?.some((entry) => entry.id === 'offscreen-hazard-radar-v127' && entry.runtime === 'active'), 'radar runtime approval missing');
check(registry.entries?.some((entry) => entry.id === 'boss-camera-assist-v127' && entry.approval === 'approved-runtime'), 'camera runtime approval missing');
check(registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v127' && entry.runtime === 'quarantined'), 'bomb imp candidate is not quarantined');
check(registry.summary?.newFinalCharacterArt === 0 && registry.summary?.waveTarget === 30, 'registry overstates art approval or misses 30-wave target');
check(manifest.id === 'DD-BOSS-TACTICAL-MANIFEST-V127' && manifest.registry.includes('boss-tactical-registry-v127.json'), 'manifest mismatch');
if (!failures.length) pass('runtime approvals and quarantined character candidates remain explicitly separated');

check(existsSync(path.join(root, 'public/boss-tactical-lab-v127.html')), 'v1.0.27 browser lab missing');
check(existsSync(path.join(root, 'docs/BOSS_TACTICAL_ASSURANCE_v1.0.27.md')), 'v1.0.27 assurance report missing');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.27.md')), 'v1.0.27 patch notes missing');
check(existsSync(path.join(root, 'docs/PATCH_APPLY_v1.0.27.md')), 'v1.0.27 apply guide missing');
check(existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.28.md')), 'next update schedule missing');
check(sw.includes('boss-tactical-assurance-director-v127.js') && sw.includes('boss-tactical-lab-v127.html'), 'service worker omits v1.0.27 runtime or lab');
check(pkg.scripts?.verify?.includes('verify:release:v127') && pkg.scripts?.['verify:dist:v127'], 'package verification chain omits v1.0.27');
check(workflow.includes('npm run verify:dist:v127'), 'GitHub Pages workflow omits v1.0.27 dist verification');
if (!failures.length) pass('browser QA, service worker, CI and documentation include v1.0.27');

const left = classifyOffscreenPointV127({ x: -1.8, y: .2, z: 0 });
const right = classifyOffscreenPointV127({ x: 1.8, y: -.1, z: 0 });
const inside = classifyOffscreenPointV127({ x: .1, y: -.1, z: 0 });
check(left.edge === 'left' && !left.onScreen, 'left offscreen classification failed');
check(right.edge === 'right' && !right.onScreen, 'right offscreen classification failed');
check(inside.onScreen === true, 'onscreen classification failed');

const fakeVisual = { diagnostics: { activeRecords: 4 } };
const director = new BossTacticalAssuranceDirectorV127({ combatVisual: fakeVisual });
for (let wave = 1; wave <= 30; wave += 1) {
  fakeVisual.diagnostics.activeRecords = 4 + Math.floor(wave / 10);
  director.update(.25, {
    wave,
    boss: wave % 5 === 0 ? { hp: 50, maxHp: 100, intentUrgency: 'critical', position: { x: 2, y: 0, z: 2 } } : null,
    hazards: [],
    enemies: 5,
    particles: 18 + wave,
    projectiles: 4 + Math.floor(wave / 5)
  });
}
check(director.report.thirtyWaveTargetReached === true, '30-wave target simulation failed');
check(director.report.lifecycleHealthy === true, '30-wave lifecycle trend simulation failed');
check(director.report.cameraAssistActivations > 0, 'boss critical camera assist simulation failed');
check(director.report.approval.bombImpRuntime === 'quarantined', 'simulation approval boundary mismatch');
if (!failures.length) pass('30-wave lifecycle, offscreen classification and camera assist simulation passed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.27 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.27 Boss Tactical & 30-Wave Assurance verified.');
