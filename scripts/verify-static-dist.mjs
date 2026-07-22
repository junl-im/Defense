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
if (!main.includes("const GAME_VERSION = '3.8.0'")) fail('static main version mismatch');
if (!main.includes('renderAssetDiagnostics()')) fail('asset diagnostics missing from static build');
if (!main.includes('force3DModels')) fail('force 3D model mode missing from static build');
pass('static game module asset diagnostics');

const catalog = await readFile(path.join(dist, 'src/engine/asset-catalog.js'), 'utf8');
if (!catalog.includes("const ASSET_REVISION = '3.8.0'")) fail('asset cache revision missing');
if (!catalog.includes('?v=${ASSET_REVISION}')) fail('asset cache-busting URL missing');
pass('v3.8.0 asset cache revision');

const modelDir = path.join(dist, 'assets/models');
const models = (await readdir(modelDir)).filter((name) => name.endsWith('.glb'));
if (models.length !== 14) fail(`expected 14 SD Toon GLBs, found ${models.length}`);
for (const model of models) await access(path.join(modelDir, model));
pass('14 combat GLB files in static dist');

const required = [
  'player-dokkaebi-warrior-golden-v1.glb',
  'guardian-ember-sd-toon.glb', 'guardian-frost-sd-toon.glb', 'guardian-wind-sd-toon.glb',
  'guardian-stone-sd-toon.glb', 'guardian-bell-sd-toon.glb', 'guardian-thunder-sd-toon.glb',
  'monster-imp-sd-toon.glb', 'monster-runner-sd-toon.glb', 'monster-brute-sd-toon.glb', 'monster-shaman-sd-toon.glb',
  'boss-tiger-sd-toon.glb', 'boss-serpent-sd-toon.glb', 'boss-king-sd-toon.glb'
];
for (const model of required) if (!models.includes(model)) fail(`missing model ${model}`);
pass('golden player, six guardians, four monsters, three bosses');

console.log('Static deployment verification passed.');
