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
const manifest = json('public/manifest.webmanifest');
const index = text('index.html');
const main = text('src/main.js');
const runtime = text('src/runtime/release-assurance-director-v124.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const css = text('src/style.css');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');
const rootPolicy = text('scripts/root-output-policy.mjs');
const obsoleteCleaner = text('scripts/clean-obsolete-assets.mjs');

const [major, minor, patchVersion] = pkg.version.split('.').map(Number);
check(major === 1 && minor === 0 && patchVersion >= 24, 'v1.0.24 foundation is not preserved');
check(/^b24\.\d+$/.test(pkg.dokkaebi?.buildId || ''), 'current build identity mismatch');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package-lock build identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
if (!failures.length) pass(`v1.0.24 identity foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(manifest.name === '도깨비 럭 디펜스 3D', 'PWA manifest canonical name missing');
check(manifest.short_name === '도깨비 디펜스', 'PWA manifest short name mismatch');
check(!JSON.stringify(manifest).includes('도깨비 운빨 수호대') && !JSON.stringify(manifest).includes('깨비수호대'), 'legacy PWA branding remains');
check(index.includes(`manifest.webmanifest?rev=release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`), 'versioned PWA manifest link missing');
check(index.includes('data-text="럭 디펜스"') && index.includes('<em class="title-subtitle-v107">3D</em>'), 'v1.0.24 title wordmark structure missing');
check(index.includes(`title-v112/title-mascot-v112.webp?rev=release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`), 'original mascot is not active with current cache revision');
check(!index.includes('title-v120/title-mascot'), 'replacement mascot returned to title path');
if (!failures.length) pass('canonical branding and original mascot are locked across browser and PWA entrypoints');

check(runtime.includes('DD-RELEASE-ASSURANCE-V124'), 'release assurance marker missing');
check(runtime.includes('observedDirections') && runtime.includes('observedStates'), 'direction and state usage telemetry missing');
check(runtime.includes("actionRuntimeMapping: 'approved'") && runtime.includes("actionArt: 'derived-provisional'"), 'approval boundary is not explicit');
check(runtime.includes('overlapArea') && runtime.includes('--v124-secondary-top'), 'runtime HUD collision measurement missing');
check(main.includes('new ReleaseAssuranceDirectorV124') && main.includes("'release-assurance-v124'"), 'release assurance runtime is not installed and updated');
check(main.includes('releaseAssuranceV124: game.releaseAssuranceV124?.report'), 'release assurance diagnostics are not exported');
if (!failures.length) pass('11-direction usage, action mapping and HUD collision assurance are integrated');

check(visual.includes('protagonistDirectionHitsV124') && visual.includes('protagonistStateHitsV124'), 'combat runtime usage counters missing');
check(visual.includes('actionRuntimeMappedV124') && visual.includes("actionArtStatusV124 = record.actionRuntimeMappedV124 ? 'derived-provisional'"), 'combat actor approval metadata missing');
check(visual.includes('approvedProtagonistRecordsV124') && visual.includes('protagonistFallbackSelectionsV124'), 'protagonist fallback diagnostics missing');
check(visual.includes('actionRuntimeMappingApprovedV124: true') && visual.includes("actionArtStatusV124: 'derived-provisional'"), 'diagnostic approval boundary missing');
if (!failures.length) pass('protagonist direction and six-state action-row runtime mapping are auditable without overstating art approval');

check(sw.includes("CACHE_PREFIX = 'dokkaebi-luck-defense-shell-'"), 'new cache namespace missing');
check(sw.includes("'dokkaebi-shell-'" ) && sw.includes('LEGACY_CACHE_PREFIXES.some'), 'legacy cache migration missing');
check(sw.includes('release-assurance-director-v124.js') && sw.includes('release-assurance-v124.html'), 'service worker omits v1.0.24 runtime or lab');
check(!sw.match(/title-mascot-lite-v112\.webp'\s*,\s*'\.\/src\/assets\/title-v112\/title-mascot-lite-v112\.webp'/), 'duplicate mascot shell cache entry remains');
check(!index.includes("if ((result?.version && result.version !== RELEASE_VERSION) || (result?.buildId && result.buildId !== BUILD_ID)) {\n            if"), 'duplicate service-worker version branch remains');
if (!failures.length) pass('old shell caches are migrated and the boot cache path is de-duplicated');

check(css.includes('v1.0.24 Identity Lock, Direction QA & HUD Collision Assurance'), 'v1.0.24 CSS section missing');
check(css.includes('title-screen-v124') && css.includes('hud-collision-guard-v124'), 'title polish or collision fallback style missing');
check(existsSync(path.join(root, 'public/release-assurance-v124.html')), 'v1.0.24 browser assurance lab missing');
check(existsSync(path.join(root, 'docs/RELEASE_ASSURANCE_v1.0.24.md')), 'v1.0.24 assurance report missing');
check(existsSync(path.join(root, 'docs/CI_ROOT_HYGIENE_FIX_v1.0.24.md')), 'v1.0.24 root hygiene fix report missing');
check(existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.25.md')), 'next update schedule missing');
check(pkg.scripts?.verify?.includes('verify:release:v124') && pkg.scripts?.['verify:dist:v124'], 'verification chain omits v1.0.24');
check(workflow.includes('npm run verify:dist:v124'), 'GitHub Pages workflow omits v1.0.24 dist verification');
check(rootPolicy.includes('README_PATCH'), 'legacy README_PATCH.txt migration rule missing');
check(rootPolicy.includes('APPLIED'), 'legacy root PATCH_APPLIED marker migration rule missing');
check(obsoleteCleaner.includes('organizeLegacyRootOutput'), 'obsolete cleanup does not run root migration before hygiene');
check(!runtime.includes('<svg') && !css.includes('data:image/svg+xml'), 'v1.0.24 introduced SVG content');
if (!failures.length) pass('title polish, browser QA, CI, documentation and no-SVG contracts are installed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.24 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.24 Identity Lock & Runtime Assurance verified.');
