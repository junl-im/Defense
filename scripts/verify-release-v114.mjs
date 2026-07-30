import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const passes = [];
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));
const check = (condition, message) => { if (!condition) failures.push(message); };
const pass = (message) => passes.push(message);

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const manifest = json('public/assets/visual-v114/asset-polish-manifest-v114.json');
const main = text('src/main.js');
const catalog = text('src/engine/asset-catalog.js');
const policy = text('src/runtime/combat-art-polish-policy-v114.js');
const director = text('src/runtime/combat-art-polish-director-v114.js');
const style = text('src/style.css');
const sw = text('public/sw.js');
const index = text('index.html');

check(pkg.version === pkg.dokkaebi?.releaseVersion, 'current package release metadata mismatch');
check(Number(pkg.dokkaebi?.buildRevision || 0) >= 14, 'current build is older than the v1.0.14 foundation');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock identity mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package-lock build metadata mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'main release identity mismatch');
check(index.includes(`RELEASE_VERSION = '${pkg.version}'`) && index.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`), 'index boot identity mismatch');
if (!failures.length) pass(`v1.0.14 art foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(manifest.version === '1.0.14' && manifest.build === 'b24.14', 'art manifest identity mismatch');
check(manifest.entries?.length === 25, 'art manifest must contain 25 entries');
check(manifest.summary?.characters === 21 && manifest.summary?.citadelStates === 4, 'art manifest category totals mismatch');
check(manifest.summary?.tierFiles === 75, 'art manifest tier file total mismatch');
const characters = manifest.entries.filter((entry) => entry.kind === 'character');
const citadel = manifest.entries.filter((entry) => entry.kind === 'citadel');
check(characters.length === 21 && citadel.length === 4, 'character/citadel entry split mismatch');
check(manifest.entries.every((entry) => entry.productionApproved === true && entry.runtimeApproved === true), 'v114 polished assets are not fully approved');
for (const entry of manifest.entries) {
  check(entry.outputs?.low?.size === 192, `low tier size mismatch: ${entry.id}`);
  check(entry.outputs?.medium?.size === 320, `medium tier size mismatch: ${entry.id}`);
  check(entry.outputs?.high?.size === 512, `high tier size mismatch: ${entry.id}`);
}
if (!failures.length) pass('21 combat characters, four citadel states and 75 tier files are production-gated');

check(catalog.includes("role: 'combat-art-polished-v114'"), 'v114 polished combat role missing from catalog');
check(catalog.includes("role: 'guardian-citadel-state-v114'"), 'v114 citadel state role missing from catalog');
check(catalog.includes("visual-v114/${folder}/${slug}-low-v114.webp"), 'v114 tier URL resolver missing');
check(!catalog.includes('...Object.entries(p0DirectionalAtlasUrls).map'), 'unapproved P0 directional atlases remain in runtime preload catalog');
check(main.includes("import CombatArtPolishDirectorV114 from './runtime/combat-art-polish-director-v114.js'") || main.includes("import CharacterPresentationDirectorV151 from './runtime/character-presentation-director-v151.js'"), 'v114-compatible director import missing');
check(main.includes('new CombatArtPolishDirectorV114') || main.includes('new CharacterPresentationDirectorV151'), 'v114-compatible director is not instantiated');
if (!failures.length) pass('runtime preloads polished art and excludes unapproved P0 prototype atlases');

check(policy.includes('staticArtMirroringAllowed: false'), 'static art no-mirroring policy missing');
check(policy.includes('independentlyAuthoredDirectionsRequired: true'), 'independent direction production gate missing');
for (const profile of ['melee','ranged','caster','support','controller','tank','roar']) check(policy.includes(`'${profile}'`), `action profile missing: ${profile}`);
check(director.includes('map.repeat.set(1, 1)'), 'static fallback no-mirroring enforcement missing');
check(director.includes("state === 'shielded'") && director.includes("state === 'critical'"), 'citadel state rendering missing');
check(director.includes('resolveCitadelState') && director.includes('citadelStateChanges'), 'citadel state diagnostics missing');
check(director.includes("mode: 'mega-art-polish-v114'"), 'v114 diagnostics mode missing');
if (!failures.length) pass('seven differentiated action profiles, no-mirroring and four-state citadel runtime are integrated');

check(style.includes('v1.0.14 Mega Art Polish'), 'v114 HUD style section missing');
check(style.includes('dd-shell-mobile-v112.dd-shell-portrait-v112.dd-shell-compact-height-v112'), 'compact mobile combat viewport rule missing');
check(style.includes('--dd-v114-panel-bg'), 'v114 cross-platform panel material missing');
if (!failures.length) pass('PC, tablet and mobile HUD readability polish is present');

check(sw.includes(`RELEASE_VERSION = '${pkg.version}'`) && sw.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`), 'service worker identity mismatch');
for (const asset of [
  './src/runtime/combat-art-polish-policy-v114.js',
  './src/runtime/combat-art-polish-director-v114.js',
  './assets/visual-v114/asset-polish-manifest-v114.json',
  './assets/visual-v114/characters/hero-warrior-low-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-critical-high-v114.webp'
]) check(sw.includes(`'${asset}'`), `service worker v114 precache missing: ${asset}`);
check(pkg.scripts?.verify?.includes('verify:release:v114'), 'full verify chain does not include v114');
for (const file of ['docs/PATCH_NOTES_v1.0.14.md','docs/PATCH_APPLY_v1.0.14.md','docs/ART_POLISH_REPORT_v1.0.14.md','docs/v1.0.14-asset-polish-board.png']) check(existsSync(path.join(root, file)), `v114 documentation missing: ${file}`);
if (!failures.length) pass('service worker, documentation and verification chain include v1.0.14');

check(!/<svg\b|createElementNS\([^)]*svg/i.test([policy, director, style].join('\n')), 'SVG markup/construction introduced');
if (!failures.length) pass('v1.0.14 art polish introduces no SVG');

for (const message of passes) console.log(`PASS ${message}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.14 release verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.14 Mega Asset Polish and Design Reinforcement verified.');
