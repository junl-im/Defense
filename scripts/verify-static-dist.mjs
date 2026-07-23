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
if (!main.includes("const GAME_VERSION = '13.0.0'")) fail('static main version mismatch');
if (!main.includes('renderAssetDiagnostics()')) fail('asset diagnostics missing from static build');
if (!main.includes('force3DModels')) fail('force 3D model mode missing from static build');
pass('static game module asset diagnostics');

const catalog = await readFile(path.join(dist, 'src/engine/asset-catalog.js'), 'utf8');
if (!catalog.includes("const ASSET_REVISION = '13.0.0'")) fail('asset cache revision missing');
if (!catalog.includes('?v=${ASSET_REVISION}')) fail('asset cache-busting URL missing');
pass('v13.0.0 asset cache revision');

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

console.log('Static deployment verification passed.');
