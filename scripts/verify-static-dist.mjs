import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { throw new Error(message); };

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!html.includes('type="importmap"')) fail('static import map missing');
if (!html.includes('three@0.185.1/build/three.module.js')) fail('pinned Three.js import missing');
if (!html.includes('three@0.185.1/examples/jsm/')) fail('pinned Three.js addons import missing');
if (!html.includes('href="./src/style.css"')) fail('static stylesheet missing');
if (!html.includes('src="./src/main.js"')) fail('relative main module missing');
if (html.includes('src="/src/main.js"')) fail('root-only module path remains');
pass('static entrypoint and pinned import map');

const main = await readFile(path.join(dist, 'src/main.js'), 'utf8');
if (main.includes("import './style.css'")) fail('CSS module import remains in static build');
if (!main.includes("const GAME_VERSION = '19.0.0'")) fail('static main version mismatch');
if (!main.includes('renderAssetDiagnostics()')) fail('asset diagnostics missing from static build');
if (!main.includes('force3DModels')) fail('force 3D model mode missing from static build');
pass('static game module asset diagnostics');

const catalog = await readFile(path.join(dist, 'src/engine/asset-catalog.js'), 'utf8');
if (!catalog.includes("const ASSET_REVISION = '19.0.0'")) fail('asset cache revision missing');
if (!catalog.includes('?v=${ASSET_REVISION}')) fail('asset cache-busting URL missing');
pass('v19.0.0 asset cache revision');

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



await access(path.join(dist, 'src/assets/title-v17/title-bg-desktop-v17.webp'));
await access(path.join(dist, 'src/assets/title-v17/title-bg-mobile-v17.webp'));
await access(path.join(dist, 'src/assets/title-v17/title-mascot-v17.webp'));
const waveGuard = await readFile(path.join(dist, 'src/runtime/wave-flow-guard.js'), 'utf8');
if (!waveGuard.includes("WAVE_FLOW_GUARD_VERSION = '17.0.0'")) fail('v17 wave flow guard missing from static dist');
if (!html.includes('title-mascot-v17.webp') || !html.includes('title-panel-v17')) fail('v17 title presentation missing from static entrypoint');
pass('v17 responsive title artwork and wave flow guard');

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
if (!serviceWorker.includes("const VERSION = '19.0.0'") || !serviceWorker.includes('DOKKAEBI_PURGE')) fail('v19 service worker recovery contract missing');
await access(path.join(dist, 'browser-lab-v19.html'));
pass('v19 browser reliability, test API, versioned service worker and browser lab page');

console.log('Static deployment verification passed.');
