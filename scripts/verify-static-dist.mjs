import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const releaseVersion = packageJson.version;
const buildId = packageJson.dokkaebi?.buildId || '';
const revision = `${releaseVersion}-${buildId}`;
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { throw new Error(message); };

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!html.includes(`src="./static-bootstrap.js?v=${revision}"`)) fail('resilient static bootstrap missing');
if (html.includes('type="importmap"')) fail('single-CDN import map should not be hardcoded in static HTML');
if (!html.includes(`href="./src/style.css?v=${revision}"`)) fail('versioned static stylesheet missing');
if (html.includes('src="/src/bootstrap.js"') || html.includes('src="/src/main.js"')) fail('root-only module path remains');
await access(path.join(dist, 'static-bootstrap.js'));
const staticBootstrap = await readFile(path.join(dist, 'static-bootstrap.js'), 'utf8');
if (!['local-vendor','jsdelivr','unpkg','esm-sh'].every((id) => staticBootstrap.includes(id))) fail('multi-source Three.js recovery missing');
pass('resilient static entrypoint and multi-source engine recovery');

const main = await readFile(path.join(dist, 'src/main.js'), 'utf8');
const style = await readFile(path.join(dist, 'src/style.css'), 'utf8');
if (main.includes("import './style.css'")) fail('CSS module import remains in static build');
if (!main.includes(`const GAME_VERSION = '${releaseVersion}'`)) fail('static main version mismatch');
if (!main.includes('renderAssetDiagnostics()')) fail('asset diagnostics missing from static build');
if (!main.includes('force3DModels')) fail('force 3D model mode missing from static build');
pass('static game module asset diagnostics');

const catalog = await readFile(path.join(dist, 'src/engine/asset-catalog.js'), 'utf8');
if (!catalog.includes("const ASSET_REVISION = CACHE_REVISION")) fail('asset cache revision missing');
if (!catalog.includes('?v=${ASSET_REVISION}')) fail('asset cache-busting URL missing');
if (!catalog.includes("CACHE_REVISION")) fail('central asset cache revision import missing');
pass(`v${releaseVersion} build-generation asset cache revision`);

const modelDir = path.join(dist, 'assets/models');
const models = (await readdir(modelDir)).filter((name) => name.endsWith('.glb'));
if (models.length !== 19) fail(`expected 19 combat GLBs, found ${models.length}`);
for (const model of models) await access(path.join(modelDir, model));
pass('19 combat GLB files in static dist');

const required = [
  'player-dokkaebi-warrior-golden-v1.glb', 'player-dokkaebi-archer-candidate-v1.glb', 'player-dokkaebi-mage-candidate-v1.glb',
  'guardian-ember-sd-toon.glb', 'guardian-frost-sd-toon.glb', 'guardian-wind-sd-toon.glb',
  'guardian-stone-sd-toon.glb', 'guardian-bell-sd-toon.glb', 'guardian-thunder-sd-toon.glb',
  'monster-imp-sd-toon.glb', 'monster-runner-sd-toon.glb', 'monster-brute-sd-toon.glb', 'monster-shaman-sd-toon.glb',
  'monster-ghost-candidate-v1.glb', 'monster-skeleton-candidate-v1.glb', 'monster-crow-candidate-v1.glb',
  'boss-tiger-sd-toon.glb', 'boss-serpent-sd-toon.glb', 'boss-king-sd-toon.glb'
];
for (const model of required) if (!models.includes(model)) fail(`missing model ${model}`);
pass('five logical hero classes backed by three hero GLBs, six guardians, seven monsters, three bosses');


const forge = JSON.parse(await readFile(path.join(dist, 'assets/ip-v10/asset-forge-v10.json'), 'utf8'));
if (forge.summary.transparentPresentationDerivatives !== 40) fail('v10 transparent derivative count mismatch');
if (forge.summary.silhouetteDerivatives !== 40) fail('v10 silhouette derivative count mismatch');
if (forge.summary.productionApproved !== 0) fail('automated derivatives must not be production approved');
await access(path.join(dist, 'asset-library-v10.html'));
await access(path.join(dist, 'assets/ip-v10/presentation/characters/hero_dokkaebi_warrior.png'));
await access(path.join(dist, 'assets/ip-v10/silhouettes/characters/hero_dokkaebi_warrior.png'));
pass('v10 asset forge manifest, review OS, transparent and silhouette derivatives');


const spriteManifest = JSON.parse(await readFile(path.join(dist, 'assets/ip-v13/asset-manifest-v13.json'), 'utf8'));
if (spriteManifest.summary.sourceSheets !== 10 || spriteManifest.summary.totalCrops !== 415) fail('v13 sprite manifest count mismatch');
if (spriteManifest.summary.production3DApproved !== 0) fail('v13 2D crops must not grant 3D approval');
await access(path.join(dist, 'asset-library-v13.html'));
await access(path.join(dist, 'assets/ip-v13/crops/heroes/heroes-r01-c01.png'));
await access(path.join(dist, 'assets/ip-v13/crops/ui/ui-r03-c01.png'));
pass('v13 sprite forge manifest, review OS and curated runtime crops');

const atlasManifest = JSON.parse(await readFile(path.join(dist, 'assets/ip-v14/atlas-manifest-v14.json'), 'utf8'));
if (atlasManifest.summary.totalFrames !== 128 || atlasManifest.summary.atlasPages !== 1) fail('v14 atlas manifest count mismatch');
if (atlasManifest.summary.production3DApproved !== 0 || atlasManifest.summary.massProductionUnlocked) fail('v14 atlas must not grant 3D approval or production unlock');
await access(path.join(dist, 'asset-library-v14.html'));
await access(path.join(dist, 'assets/ip-v14/atlas/runtime-atlas-v14-p01.webp'));
await access(path.join(dist, 'assets/ip-v14/mastered/heroes/heroes-r01-c01.png'));
pass('v14 runtime atlas manifest, review OS, pages and mastered sprites');

const livingManifest = JSON.parse(await readFile(path.join(dist, 'assets/ip-v15/atlas-manifest-v15.json'), 'utf8'));
if (livingManifest.summary.totalFrames !== 154 || livingManifest.summary.atlasPages !== 2) fail('v15 atlas manifest count mismatch');
if (livingManifest.summary.production3DApproved !== 0 || livingManifest.summary.massProductionUnlocked) fail('v15 atlas must not grant 3D approval or production unlock');
await access(path.join(dist, 'asset-library-v15.html'));
for (const page of livingManifest.pages) {
  await access(path.join(dist, page.png1x));
  await access(path.join(dist, page.webp1x));
  await access(path.join(dist, page.png2x));
  await access(path.join(dist, page.webp2x));
}
await access(path.join(dist, 'assets/ip-v15/mastered/props/props-r01-c01.png')).catch(async () => {
  const first = livingManifest.frames.find((frame) => frame.category === 'props') || livingManifest.frames[0];
  await access(path.join(dist, first.masteredPath));
});
pass('v15 living battlefield atlas, review OS, 1x/2x pages and mastered sprites');



await access(path.join(dist, 'src/assets/title-v112/title-bg-desktop-v112.webp'));
await access(path.join(dist, 'src/assets/title-v112/title-bg-mobile-v112.webp'));
await access(path.join(dist, 'src/assets/title-v112/title-mascot-v112.webp'));
const titleManifestV112 = JSON.parse(await readFile(path.join(dist, 'src/assets/title-v112/visual-polish-manifest-v112.json'), 'utf8'));
if (titleManifestV112.releaseVersion !== '1.0.12' || titleManifestV112.buildId !== 'b24.12') fail('v112 title manifest foundation mismatch');
const waveGuard = await readFile(path.join(dist, 'src/runtime/wave-flow-guard.js'), 'utf8');
if (!waveGuard.includes("WAVE_FLOW_GUARD_VERSION = '17.0.0'")) fail('v17 wave flow guard missing from static dist');
if (!html.includes('title-mascot-v112.webp') || !html.includes('title-panel-v112')) fail('v112 title presentation missing from static entrypoint');
pass('v112 responsive visual polish artwork and v17 wave flow guard lineage');

const reliability = await readFile(path.join(dist, 'src/runtime/wave-reliability-director.js'), 'utf8');
if (!reliability.includes("WAVE_RELIABILITY_VERSION = '18.0.0'")) fail('v18 reliability director missing from static dist');
const simulation = await readFile(path.join(dist, 'src/runtime/ten-wave-reliability-simulation.js'), 'utf8');
if (!simulation.includes('simulateTenWaveReliability')) fail('v18 ten-wave simulation module missing from static dist');
if (!main.includes('updateWaveReliability') || !main.includes('handleVisibilityChange')) fail('v18 runtime recovery hooks missing from static dist');
pass('v18 ten-wave reliability, background recovery and checkpoint modules');



const browserLab = await readFile(path.join(dist, 'src/runtime/browser-reliability-lab.js'), 'utf8');
if (!browserLab.includes("BROWSER_RELIABILITY_VERSION = '19.0.0'")) fail('v19 browser reliability module missing from static dist');
if (!main.includes('getBrowserAutomationSnapshot') || !main.includes('__DOKKAEBI_TEST_API__')) fail('v19 browser automation hooks missing from static dist');
const serviceWorker = await readFile(path.join(dist, 'sw.js'), 'utf8');
if (!serviceWorker.includes(`const RELEASE_VERSION = '${releaseVersion}'`) || !/const BUILD_ID = 'b\d+\.\d+'/.test(serviceWorker) || !serviceWorker.includes('DOKKAEBI_PURGE')) fail('v19 service worker recovery contract missing');
await access(path.join(dist, 'browser-lab-v19.html'));
pass('v19 browser reliability, test API, versioned service worker and browser lab page');


if (!main.includes('AssetPresenceEnforcer') || !main.includes('MobileHudDirectorV23') || !main.includes('CombatReadabilityDirectorV21') || !main.includes('CombatVisualDirectorV112') || !main.includes('CrossPlatformShellV112') || main.includes('new MobileHudDirectorV22')) fail('v112 cross-platform runtime integration modules missing or obsolete v22 runtime remains');
if (!style.includes('action-asset-v21') || style.includes('body.mobile-hud-v21 ') || style.includes('body.mobile-hud-v22 ')) fail('active action assets missing or obsolete mobile HUD CSS remains');
if (!(html.includes('title-feature-ribbon-v21') || html.includes('title-brand-v105') || html.includes('title-brand-v112')) || !(html.includes('title-screen-v112') || html.includes('quiet-screen-v23') || html.includes('boot-recovery-v2301') || html.includes('clean-foundation-v2302') || html.includes('native-input-v2310') || html.includes('release-v102-b24-2') || html.includes('release-v105-b24-5') || html.includes('release-v107-b24-7') || html.includes('release-v108-b24-8'))) fail('v112 title presentation missing');
pass('v21/v22 lineage plus v23 Quiet Screen mobile HUD integration');

const automationV22 = await readFile(path.join(dist, 'src/runtime/automation-director-v22.js'), 'utf8');
const targetingV22 = await readFile(path.join(dist, 'src/combat/guardian-targeting-director-v22.js'), 'utf8');
if (!automationV22.includes("AUTOMATION_DIRECTOR_V22_VERSION = '22.0.0'") || !targetingV22.includes("GUARDIAN_TARGETING_V22_VERSION = '22.0.0'")) fail('v22 automation modules missing');
if (!main.includes('vacuumRemainingCoins') || !main.includes('startRewardAutoChoice')) fail('v22 automatic progression hooks missing');
pass('v22 tower targeting, reward automation and loot vacuum');


const mobileHudV23 = await readFile(path.join(dist, 'src/runtime/mobile-hud-director-v23.js'), 'utf8');
if (!mobileHudV23.includes("MOBILE_HUD_V23_VERSION = '23.0.0'") || !style.includes('mobile-hud-v23')) fail('v23 mobile HUD module or styles missing');
if (html.includes('camera-zoom-controls') || html.includes('zoom-in-btn') || html.includes('zoom-out-btn')) fail('removed zoom buttons remain in static dist');
if (!style.includes('--v23-context-bottom') || !style.includes('mobile-context-suppressed-v23')) fail('v23 reserved context lane missing');
pass('v23 mobile reserved lanes, overlap protection and button-free zoom');


const megaIndex = JSON.parse(await readFile(path.join(dist, 'assets/ip-mega-v4/data/ip-mega-index-v4.json'), 'utf8'));
const megaSample = JSON.parse(await readFile(path.join(dist, 'assets/ip-mega-v4/data/ip-mega-sample-v4.json'), 'utf8'));
const megaViewer = await readFile(path.join(dist, 'ip-mega-library-v4.html'), 'utf8');
const megaSource = await readFile(path.join(dist, 'src/ip-knowledge-megabase-v4.js'), 'utf8');
await access(path.join(dist, 'assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp'));
await access(path.join(dist, 'assets/ip-mega-v4/reference/art-production-board-v4.webp'));
if (megaIndex.megabaseVersion !== '4.0.0') fail('v4 megabase version mismatch');
if (megaIndex.counts?.records?.baseAssets !== 8192 || megaIndex.counts?.records?.total !== 147232) fail('v4 megabase count mismatch');
if (megaIndex.authoredDirectionPolicy?.directions !== 11 || megaIndex.authoredDirectionPolicy?.mirrored !== false || megaIndex.authoredDirectionPolicy?.authored !== true) fail('v4 authored direction policy mismatch');
if (megaIndex.finalArtStatus?.approved !== 0 || megaIndex.finalArtStatus?.status !== 'planned') fail('v4 final-art status must remain planned and unapproved');
if (megaSample.count !== 128 || megaSample.rows?.length !== 128) fail('v4 public sample count mismatch');
if (!megaViewer.includes('IP KNOWLEDGE MEGAFORGE v4.0.0') || !megaViewer.includes('AUTHORED 11 / MIRROR 0') || !megaViewer.includes('ip-mega-index-v4.json') || !megaViewer.includes('ip-mega-sample-v4.json')) fail('v4 megabase viewer contract missing');
if (!megaSource.includes('total: 147232') || !megaSource.includes('baseAssets: 8192') || !megaSource.includes('finalArtApproved: 0')) fail('v4 megabase runtime summary mismatch');
for (const asset of [
  './src/ip-knowledge-megabase-v4.js',
  './ip-mega-library-v4.html',
  './assets/ip-mega-v4/data/ip-mega-index-v4.json',
  './assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  './assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
  './assets/ip-mega-v4/reference/art-production-board-v4.webp'
]) if (!serviceWorker.includes(`'${asset}'`)) fail(`v4 service worker precache missing: ${asset}`);
pass('v4 IP Knowledge Megabase viewer, 147232 records, 11 directions and reference art in static dist');


const p0ManifestV112 = JSON.parse(await readFile(path.join(dist, 'assets/visual-v112/directional/p0-directional-manifest-v112.json'), 'utf8'));
if (p0ManifestV112.releaseVersion !== '1.0.12' || p0ManifestV112.buildId !== 'b24.12') fail('v112 P0 directional manifest foundation mismatch');
if (p0ManifestV112.directionCount !== 11 || p0ManifestV112.stateCount !== 6 || p0ManifestV112.atlasCount !== 4 || p0ManifestV112.frameCount !== 264) fail('v112 P0 directional atlas counts mismatch');
if (!p0ManifestV112.authoredDirections || p0ManifestV112.mirroringAllowed !== false || p0ManifestV112.runtimeApproved !== true || p0ManifestV112.productionArtApproved !== false) fail('v112 P0 authored-direction approval policy mismatch');
for (const entry of p0ManifestV112.files) {
  for (const variant of Object.values(entry.variants || {})) {
    const relative = String(variant.path || '').replace(/^public\//, '');
    await access(path.join(dist, relative));
  }
}
const visualDirectorV112 = await readFile(path.join(dist, 'src/runtime/combat-visual-director-v112.js'), 'utf8');
const shellDirectorV112 = await readFile(path.join(dist, 'src/runtime/cross-platform-shell-v112.js'), 'utf8');
const p0ViewerV112 = await readFile(path.join(dist, 'p0-directional-library-v112.html'), 'utf8');
if (!visualDirectorV112.includes('P0_DIRECTIONAL_ATLAS_SPEC_V112') || !visualDirectorV112.includes('mirroringAllowed: false')) fail('v112 combat visual authored atlas contract missing');
if (!shellDirectorV112.includes("CROSS_PLATFORM_SHELL_V112_VERSION = '1.0.12'") || !shellDirectorV112.includes('shellSeparated: true')) fail('v112 cross-platform shell contract missing');
if (!style.includes('dd-shell-pc-v112') || !style.includes('dd-shell-mobile-v112') || !style.includes('dd-shell-tablet-v112')) fail('v112 independent shell CSS missing');
if (!p0ViewerV112.includes('11방향') || !p0ViewerV112.includes('productionArtApproved')) fail('v112 P0 directional review page contract missing');
for (const asset of [
  './src/runtime/combat-visual-director-v112.js',
  './src/runtime/cross-platform-shell-v112.js',
  './p0-directional-library-v112.html',
  './assets/visual-v112/directional/p0-directional-manifest-v112.json',
  './src/assets/title-v112/title-bg-desktop-v112.webp',
  './src/assets/title-v112/title-bg-mobile-v112.webp',
  './src/assets/title-v112/title-mascot-v112.webp'
]) if (!serviceWorker.includes(`'${asset}'`)) fail(`v112 service worker precache missing: ${asset}`);
pass('v112 PC/mobile shell separation, refined title art, 4 P0 authored 11-direction atlases and integrated world status bars');

console.log('Static deployment verification passed.');
