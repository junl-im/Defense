import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IP_ASSET_LIBRARY_V14, IP_V14_ATLAS_PAGES, getV14AtlasFrame } from '../src/ip-asset-library-v14.js';
import { HERO_CLASSES, HERO_CLASS_ORDER } from '../src/hero-classes.js';
import { EQUIPMENT_ITEMS } from '../src/equipment-system.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const hash = (path) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
let failures = 0;
const check = (value, message) => value ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

const pkg = json('package.json');
const atlas = json('public/assets/ip-v14/atlas-manifest-v14.json');
const v13 = json('public/assets/ip-v13/asset-manifest-v13.json');
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
const cameraSource = read('src/engine/camera-director-v14.js');
const spriteSource = read('src/runtime/battlefield-sprite-director.js');

check(Number(pkg.version.split('.')[0]) >= 14, 'package version remains v14 or later');
check(Number((main.match(/const GAME_VERSION = '(\d+)\./)?.[1] || 0)) >= 14, 'runtime game version remains v14 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 11, 'engine version remains 11.0.0 or later');
check(SAVE_SCHEMA_VERSION >= 12, 'save schema version remains 12 or later');
check(v13.summary.totalCrops === 415, 'v13 source crop library preserved');
check(IP_ASSET_LIBRARY_V14.totalFrames === 128 && atlas.summary.totalFrames === 128, '128 runtime atlas frames');
check(IP_ASSET_LIBRARY_V14.atlasPages === 1 && atlas.pages.length === 1 && IP_V14_ATLAS_PAGES.length === 1, 'one runtime atlas page');
check(atlas.summary.edgeMasterPass === 128 && atlas.summary.edgeMasterReview === 0, '128 automated edge-master candidates pass current thresholds');
check(atlas.summary.production3DApproved === 0 && !atlas.summary.massProductionUnlocked, 'atlas import grants no 3D approval or mass-production unlock');
check(atlas.frames.length === 128, 'atlas manifest contains 128 frames');
check(atlas.frames.every((frame) => existsSync(resolve(root, 'public', frame.masteredPath))), 'all mastered sprite files exist');
check(atlas.frames.every((frame) => hash(resolve('public', frame.masteredPath)) === frame.sha256), 'all mastered sprite hashes match');
check(atlas.pages.every((page) => ['png', 'webp'].every((type) => existsSync(resolve(root, 'public', page[type])) && hash(resolve('public', page[type])) === page[`${type}Sha256`])), 'PNG and WebP atlas hashes match');
check(HERO_CLASS_ORDER.every((id) => getV14AtlasFrame(HERO_CLASSES[id].conceptArt)), 'five hero cards resolve to v14 atlas frames');
check(EQUIPMENT_ITEMS.every((item) => getV14AtlasFrame(item.iconImage)), 'all equipment icons resolve to v14 atlas frames');
check(main.includes('atlasSpriteMarkup') && (main.includes('BattlefieldSpriteDirectorV16') || main.includes('BattlefieldSpriteDirector')) && (main.includes('CameraDirectorV16') || main.includes('CameraDirectorV14')), 'runtime integrates atlas UI, battlefield sprites and camera director');
check(main.includes('battlefieldSprites?.populate') && main.includes('cameraDirective.spreadBonus'), 'world population and adaptive camera framing are active');
check(style.includes('.atlas-sprite') && style.includes('background-size: var(--atlas-size-x) var(--atlas-size-y)'), 'atlas CSS frame renderer exists');
check(spriteSource.includes('RuntimeAtlasBattlefieldPropsV14') && spriteSource.includes('vfx-heal-circle'), 'battlefield sprite director uses environment and VFX atlas props');
check(cameraSource.includes('targetSpread') && cameraSource.includes('2.4'), 'camera director limits adaptive spread bonus');
check(existsSync(resolve(root, 'public/asset-library-v14.html')) && (consoleSource.includes('ASSET FORGE') || html.includes('asset-library-v14.html')), 'v14 Atlas Forge lineage remains available outside simplified title');
check(consoleSource.includes('IP_ASSET_LIBRARY_V14') && consoleSource.includes('BATTLEFIELD SPRITES'), 'production console exposes atlas and battlefield diagnostics');
check(existsSync(resolve(root, 'docs/ATLAS_FORGE_PREVIEW_v14.0.0.jpg')), 'v14 atlas preview board exists');

check(cameraSource.includes('spreadBonus') && cameraSource.includes('focusWeight') && cameraSource.includes('pressure'), 'camera director exposes adaptive framing diagnostics');

if (failures) {
  console.error(`\nFAIL v14.0.0 Atlas Dominion contract ${failures}`);
  process.exit(1);
}
console.log('\nv14.0.0 Atlas Dominion contract verified');
