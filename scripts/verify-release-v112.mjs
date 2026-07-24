import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const expectedVersion = '1.0.12';
const expectedBuildId = 'b24.12';
const failures = [];
const passes = [];
const read = (file) => readFileSync(path.join(root, file));
const text = (file) => read(file).toString('utf8');
const json = (file) => JSON.parse(text(file));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const check = (value, message) => { if (!value) failures.push(message); };
const pass = (message) => passes.push(message);

const required = [
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/style.css',
  'src/version-policy.js',
  'src/engine/asset-catalog.js',
  'src/runtime/combat-visual-director-v112.js',
  'src/runtime/cross-platform-shell-v112.js',
  'src/runtime/visual-integration-director.js',
  'src/assets/title-v112/visual-polish-manifest-v112.json',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/p0-directional-library-v112.html',
  'public/assets/visual-v112/directional/p0-directional-manifest-v112.json',
  'scripts/generate-visual-polish-assets-v112.py',
  'scripts/generate-p0-directional-atlases-v112.py',
  'scripts/build-static-fallback.mjs',
  'scripts/verify-static-dist.mjs',
  'scripts/create-patch-v112.mjs',
  'scripts/verify-patch-v112.mjs',
  'docs/PATCH_NOTES_v1.0.12.md',
  'docs/PATCH_APPLY_v1.0.12.md',
  'docs/CROSS_PLATFORM_VISUAL_POLISH_v1.0.12.md',
  'docs/P0_DIRECTIONAL_ATLAS_v1.0.12.md'
];
for (const file of required) check(existsSync(path.join(root, file)), `required v1.0.12 file missing: ${file}`);
if (!failures.length) pass(`${required.length} release files exist`);

const pkg = json('package.json');
const lock = json('package-lock.json');
const publicVersion = json('public/version.json');
const policy = text('src/version-policy.js');
const index = text('index.html');
const main = text('src/main.js');
const serviceWorker = text('public/sw.js');
const staticBootstrap = text('public/static-bootstrap.js');
const staticBuilder = text('scripts/build-static-fallback.mjs');
const productionConsole = text('src/production-console.js');

check(pkg.version === expectedVersion, 'package version mismatch');
check(pkg.dokkaebi?.releaseVersion === expectedVersion, 'package releaseVersion mismatch');
check(pkg.dokkaebi?.buildRevision === 12, 'package buildRevision mismatch');
check(pkg.dokkaebi?.buildId === expectedBuildId, 'package buildId mismatch');
check(lock.version === expectedVersion && lock.packages?.['']?.version === expectedVersion, 'package-lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.releaseVersion === expectedVersion, 'package-lock releaseVersion mismatch');
check(lock.packages?.['']?.dokkaebi?.buildId === expectedBuildId, 'package-lock buildId mismatch');
check(publicVersion.releaseVersion === expectedVersion && publicVersion.buildId === expectedBuildId, 'public version identity mismatch');
check(publicVersion.cacheRevision === `${expectedVersion}-${expectedBuildId}`, 'public cache revision mismatch');
check(policy.includes(`PUBLIC_GAME_VERSION = '${expectedVersion}'`) && policy.includes('BUILD_REVISION = 12'), 'version policy identity mismatch');
check(index.includes(`const RELEASE_VERSION = '${expectedVersion}'`) && index.includes(`const BUILD_ID = '${expectedBuildId}'`), 'index boot identity mismatch');
check(index.includes(`./src/bootstrap.js?v=${expectedVersion}-${expectedBuildId}`), 'index bootstrap revision mismatch');
check(main.includes(`const GAME_VERSION = '${expectedVersion}'`), 'main game version mismatch');
check(serviceWorker.includes(`const RELEASE_VERSION = '${expectedVersion}'`) && serviceWorker.includes(`const BUILD_ID = '${expectedBuildId}'`), 'service worker identity mismatch');
check(staticBootstrap.includes(`RELEASE_VERSION = '${expectedVersion}'`) && staticBootstrap.includes(`BUILD_ID = '${expectedBuildId}'`), 'static bootstrap identity mismatch');
check(staticBuilder.includes(`const version = '${expectedVersion}'`) && staticBuilder.includes(`const buildId = '${expectedBuildId}'`), 'static builder identity mismatch');
check(productionConsole.includes('VISUAL POLISH 1.0.12'), 'production console release label mismatch');
if (!failures.length) pass(`${expectedVersion} / ${expectedBuildId} identity is synchronized`);

const titleManifest = json('src/assets/title-v112/visual-polish-manifest-v112.json');
check(titleManifest.releaseVersion === expectedVersion && titleManifest.buildId === expectedBuildId, 'title manifest identity mismatch');
check(titleManifest.policy?.runtimeReady === true && titleManifest.policy?.noSvg === true, 'title manifest runtime policy mismatch');
check(Array.isArray(titleManifest.files) && titleManifest.files.length === 7, 'title manifest must contain 7 files');
for (const entry of titleManifest.files || []) {
  const file = path.join(root, entry.path);
  check(existsSync(file), `title asset missing: ${entry.path}`);
  if (existsSync(file)) {
    const data = readFileSync(file);
    check(data.length === entry.bytes, `title asset size mismatch: ${entry.path}`);
    check(sha256(data) === entry.sha256, `title asset hash mismatch: ${entry.path}`);
  }
}
if (!failures.length) pass('7 refined title, mascot and cover assets match their manifest hashes');

const decodedTextureMB = (width, height, bpp = 4) => (width * height * bpp * (4 / 3)) / 1048576;
const titleById = Object.fromEntries((titleManifest.files || []).map((entry) => [entry.id, entry]));
for (const [profile, backgroundId, mascotId] of [
  ['desktop-hq', 'desktop_hq', 'mascot_hq'],
  ['mobile-hq', 'mobile_hq', 'mascot_hq'],
  ['desktop-lite', 'desktop_lite', 'mascot_lite'],
  ['mobile-lite', 'mobile_lite', 'mascot_lite']
]) {
  const background = titleById[backgroundId];
  const mascot = titleById[mascotId];
  const memoryMB = background && mascot
    ? decodedTextureMB(background.width, background.height) + decodedTextureMB(mascot.width, mascot.height)
    : Infinity;
  check(memoryMB <= 16, `title lifecycle texture budget exceeded (${profile}): ${memoryMB.toFixed(2)}MB / 16MB`);
}
if (!failures.length) pass('responsive title art stays within the independent 16MB boot/title lifecycle budget');

const p0 = json('public/assets/visual-v112/directional/p0-directional-manifest-v112.json');
check(p0.releaseVersion === expectedVersion && p0.buildId === expectedBuildId, 'P0 manifest identity mismatch');
check(p0.directionCount === 11 && p0.stateCount === 6, 'P0 direction/state counts mismatch');
check(p0.atlasCount === 4 && p0.frameCount === 264, 'P0 atlas/frame counts mismatch');
check(p0.authoredDirections === true && p0.mirroringAllowed === false, 'P0 authored direction policy mismatch');
check(p0.runtimeApproved === true && p0.productionArtApproved === false, 'P0 approval boundary mismatch');
check(JSON.stringify(p0.states) === JSON.stringify(['idle','move','attack','skill','hit','death']), 'P0 state order mismatch');
const expectedActors = new Set(['hero-warrior','guardian-ember','monster-imp','boss-tiger']);
let variantCount = 0;
let frameCount = 0;
const p0TierMemoryMB = { low: 0, medium: 0, high: 0 };
for (const entry of p0.files || []) {
  expectedActors.delete(entry.id);
  check(entry.columns === 11 && entry.rows === 6 && entry.frames === 66, `P0 grid mismatch: ${entry.id}`);
  check(entry.authoredDirections === true && entry.mirroringAllowed === false, `P0 actor direction policy mismatch: ${entry.id}`);
  check(entry.runtimeApproved === true && entry.productionArtApproved === false, `P0 actor approval boundary mismatch: ${entry.id}`);
  frameCount += entry.frames || 0;
  for (const tier of ['high','medium','low']) {
    const variant = entry.variants?.[tier];
    check(Boolean(variant), `P0 ${tier} variant missing: ${entry.id}`);
    if (!variant) continue;
    variantCount += 1;
    const file = path.join(root, variant.path);
    check(existsSync(file), `P0 atlas file missing: ${variant.path}`);
    if (existsSync(file)) {
      const data = readFileSync(file);
      check(data.length === variant.bytes, `P0 atlas size mismatch: ${variant.path}`);
      check(sha256(data) === variant.sha256, `P0 atlas hash mismatch: ${variant.path}`);
    }
    check(variant.width === variant.cell * 11 && variant.height === variant.cell * 6, `P0 atlas dimensions mismatch: ${variant.path}`);
    check(Math.max(variant.width, variant.height) <= 2048, `P0 atlas exceeds 2048 edge: ${variant.path}`);
    p0TierMemoryMB[tier] += decodedTextureMB(variant.width, variant.height);
  }
}
check(expectedActors.size === 0, `P0 actor set incomplete: ${[...expectedActors].join(', ')}`);
check(variantCount === 12 && frameCount === 264, 'P0 totals do not equal 12 atlases / 264 frames');
check(p0TierMemoryMB.low <= 6, `P0 low tier texture budget exceeded: ${p0TierMemoryMB.low.toFixed(2)}MB / 6MB`);
check(p0TierMemoryMB.medium <= 25, `P0 medium tier texture budget exceeded: ${p0TierMemoryMB.medium.toFixed(2)}MB / 25MB`);
check(p0TierMemoryMB.high <= 40, `P0 high tier texture budget exceeded: ${p0TierMemoryMB.high.toFixed(2)}MB / 40MB`);
if (!failures.length) pass(`4 P0 actors, 264 authored frames and 12 quality atlases verified by SHA-256 (${p0TierMemoryMB.low.toFixed(2)}/${p0TierMemoryMB.medium.toFixed(2)}/${p0TierMemoryMB.high.toFixed(2)}MB)`);

const catalog = text('src/engine/asset-catalog.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const shell = text('src/runtime/cross-platform-shell-v112.js');
const visualIntegration = text('src/runtime/visual-integration-director.js');
const style = text('src/style.css');
const viewer = text('public/p0-directional-library-v112.html');
check(catalog.includes('P0_DIRECTIONAL_ATLAS_IDS') && catalog.includes('P0_DIRECTIONAL_ATLAS_SPEC_V112'), 'P0 asset catalog contract missing');
for (const id of ['hero-warrior','guardian-ember','monster-imp','boss-tiger']) check(catalog.includes(id), `P0 catalog actor missing: ${id}`);
check(visual.includes('ATLAS_COLUMNS = P0_DIRECTIONAL_ATLAS_SPEC_V112.columns'), 'combat visual atlas column contract missing');
check(visual.includes('authoredDirectionalAtlasV112') && visual.includes('mirroringAllowed: false'), 'combat visual no-mirror diagnostics missing');
check(visual.includes('shieldFill') && visual.includes('breakFill') && visual.includes('statusPips'), 'integrated world HP status bar missing');
check(main.includes("import CombatVisualDirectorV112 from './runtime/combat-visual-director-v112.js'"), 'main CombatVisualDirectorV112 import missing');
check(main.includes("import CrossPlatformShellV112 from './runtime/cross-platform-shell-v112.js'"), 'main CrossPlatformShellV112 import missing');
check(!main.includes('new CombatVisualDirectorV110'), 'obsolete v110 visual director is still instantiated');
check(shell.includes("CROSS_PLATFORM_SHELL_V112_VERSION = '1.0.12'"), 'cross-platform shell version mismatch');
check(shell.includes('shellSeparated: true') && shell.includes('sharedScaleOnly: false'), 'cross-platform shell separation diagnostics missing');
check(visualIntegration.includes("VISUAL_INTEGRATION_VERSION = '1.1.2'") && visualIntegration.includes('title-bg-desktop-lite-v112.webp'), 'adaptive v112 title integration missing');
check(!visualIntegration.includes('title-v17/title-bg'), 'obsolete title-v17 probe remains active');
check(style.includes('title-art-lite-v112') && style.includes('title-bg-mobile-lite-v112.webp'), 'lite title-art CSS lifecycle missing');
for (const className of ['dd-shell-pc-v112','dd-shell-tablet-v112','dd-shell-mobile-v112','dd-shell-overlap-safe-v112']) check(style.includes(className), `cross-platform CSS class missing: ${className}`);
check(index.includes('title-bg-desktop-v112.webp') && index.includes('title-bg-mobile-v112.webp') && index.includes('title-mascot-v112.webp'), 'v112 title assets not referenced by index');
check(index.includes('p0-directional-library-v112.html'), 'P0 review page link missing');
check(viewer.includes('AUTHORED 11 · MIRROR 0') && viewer.includes('productionArtApproved'), 'P0 review page policy disclosure missing');
if (!failures.length) pass('combat visual, world HP, independent shells and browser review are integrated');

const requiredPrecache = [
  './src/runtime/combat-visual-director-v112.js',
  './src/runtime/cross-platform-shell-v112.js',
  './p0-directional-library-v112.html',
  './assets/visual-v112/directional/p0-directional-manifest-v112.json',
  './src/assets/title-v112/title-bg-desktop-v112.webp',
  './src/assets/title-v112/title-bg-mobile-v112.webp',
  './src/assets/title-v112/title-mascot-v112.webp'
];
for (const asset of requiredPrecache) check(serviceWorker.includes(`'${asset}'`), `service worker precache missing: ${asset}`);
for (const entry of p0.files || []) {
  for (const variant of Object.values(entry.variants || {})) {
    const asset = `./${variant.path.replace(/^public\//, '')}`;
    check(serviceWorker.includes(`'${asset}'`), `service worker atlas precache missing: ${asset}`);
  }
}
check(serviceWorker.includes("pathname.includes('/src/assets/title-v112/')"), 'title network-first rule not upgraded to v112');
if (!failures.length) pass('v112 code, title art and all P0 atlas variants are service-worker precached');

const scripts = pkg.scripts || {};
for (const key of ['generate:visual-polish:v112','generate:p0-directional:v112','verify:release:v112','create:patch:v112','verify:patch:v112']) check(Boolean(scripts[key]), `package script missing: ${key}`);
check(scripts.verify?.includes('verify:release:v112'), 'full verify chain does not include v112');
const docs = ['README.md','PROJECT_HANDOFF.md','docs/PATCH_NOTES_v1.0.12.md','docs/PATCH_APPLY_v1.0.12.md'];
for (const file of docs) check(text(file).includes('1.0.12'), `v1.0.12 identity missing from ${file}`);
if (!failures.length) pass('release scripts and handoff documentation are synchronized');

const v112Files = [];
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.isFile() && /v112|v1\.0\.12/i.test(full)) v112Files.push(full);
  }
}
for (const directory of ['src','public','scripts','docs']) collect(path.join(root, directory));
check(!v112Files.some((file) => file.toLowerCase().endsWith('.svg')), 'SVG file introduced in the v112 release slice');
check(!/<svg\b|createElementNS\([^)]*svg/i.test([main, visual, shell, viewer].join('\n')), 'runtime SVG markup/construction introduced in v112 integration');
if (!failures.length) pass('v112 integration preserves the no-SVG runtime policy');

for (const message of passes) console.log(`PASS ${message}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.12 release verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.12 Cross-Platform Visual Polish verified: 7 refined title assets, 4 P0 actors, 264 authored frames, 12 quality atlases, independent PC/tablet/mobile shells. Final production-art approvals remain 0.');
