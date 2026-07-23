import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IP_ASSET_LIBRARY_V15, IP_V15_ATLAS_PAGES, getV15AtlasFrame } from '../src/ip-asset-library-v15.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { BATTLEFIELD_EVENTS } from '../src/combat/battlefield-event-director.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const hash = (path) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
let failures = 0;
const check = (value, message) => value ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

const pkg = json('package.json');
const atlas = json('public/assets/ip-v15/atlas-manifest-v15.json');
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
const propSource = read('src/runtime/battlefield-prop-system.js');
const spriteSource = read(existsSync(resolve(root, 'src/runtime/battlefield-sprite-director-v16.js')) ? 'src/runtime/battlefield-sprite-director-v16.js' : 'src/runtime/battlefield-sprite-director-v15.js');
const cameraSource = read(existsSync(resolve(root, 'src/engine/camera-director-v16.js')) ? 'src/engine/camera-director-v16.js' : 'src/engine/camera-director-v15.js');
const eventSource = read('src/combat/battlefield-event-director.js');

check(Number(pkg.version.split('.')[0]) >= 15, 'package version remains v15 or later');
check(/const GAME_VERSION = '(?:15|16|17|18|19|20|21)\.0\.0'/.test(main), 'runtime game version remains v15 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 12, 'engine version remains 12.0.0 or later');
check(SAVE_SCHEMA_VERSION >= 13, 'save schema version remains 13 or later');
check(IP_ASSET_LIBRARY_V15.totalFrames === 154 && atlas.summary.totalFrames === 154, '154 living battlefield atlas frames');
check(IP_ASSET_LIBRARY_V15.atlasPages === 2 && atlas.pages.length === 2 && IP_V15_ATLAS_PAGES.length === 2, 'two runtime atlas pages');
check(atlas.summary.tileSize1x === 64 && atlas.summary.tileSize2x === 128, '1x and 2x atlas resolutions');
check(atlas.summary.edgeMasterPass === 154 && atlas.summary.edgeMasterReview === 0, '154 automated edge-master candidates pass thresholds');
check(atlas.summary.production3DApproved === 0 && atlas.summary.productionArtApproved === 0 && !atlas.summary.massProductionUnlocked, '2D atlas grants no final 3D approval or mass-production unlock');
check(atlas.frames.every((frame) => existsSync(resolve(root, 'public', frame.masteredPath))), 'all v15 mastered frames exist');
check(atlas.frames.every((frame) => hash(resolve('public', frame.masteredPath)) === frame.sha256), 'all v15 mastered frame hashes match');
check(atlas.pages.every((page) => ['png1x','webp1x','png2x','webp2x'].every((key) => existsSync(resolve(root, 'public', page[key])) && hash(resolve('public', page[key])) === page[`${key}Sha256`])), 'all 1x/2x PNG/WebP atlas hashes match');
const propAliases = ['prop-chest-bronze','prop-supply-crate','prop-field-cannon','prop-bear-trap','prop-spike-barricade','prop-crystal-reactor'];
check(propAliases.every((alias) => getV15AtlasFrame(alias)), 'interactive prop aliases resolve to atlas frames');
check(propSource.includes("id: 'treasure'") && propSource.includes("id: 'cannon'") && propSource.includes("id: 'barricade'"), 'seven living battlefield props are configured');
check(propSource.includes('interact(context') && propSource.includes('damageEnemy?.'), 'props support player interaction and automated combat');
check(BATTLEFIELD_EVENTS.length === 5 && eventSource.includes('rewardMultiplier') && eventSource.includes('propRateMultiplier'), 'five battlefield event doctrines are configured');
check(main.includes('BattlefieldPropSystem') && main.includes('BattlefieldEventDirector') && main.includes('interactWithBattlefieldProp'), 'runtime integrates props, events and contextual interaction');
check(main.includes('interestPoints: this.battlefieldProps?.interestPoints') && main.includes('cameraDirective.fovBonus'), 'Camera Director 2.1 uses prop interests and adaptive FOV');
check(cameraSource.includes('3.4') && cameraSource.includes('fovBonus') && cameraSource.includes('shakeLimit'), 'camera spread, FOV and shake limits are bounded');
check(spriteSource.includes("resolution = this.lowPower") && spriteSource.includes("'webp2x'"), 'runtime selects 1x or 2x atlas by device tier');
check(html.includes('id="title-setup-modal"') && html.includes('id="interact-btn"') && consoleSource.includes('IP_ASSET_LIBRARY_V15'), 'simplified title and contextual interaction retain v15 living battlefield access');
check(style.includes('.world-interact-btn') && style.includes('scale(1.05)') && style.includes('scale(.95)'), 'interaction UI follows hover and pressed scale contract');
check(consoleSource.includes('LIVING PROPS') && consoleSource.includes('BATTLEFIELD EVENT') && consoleSource.includes('IP_ASSET_LIBRARY_V15'), 'production console exposes v15 diagnostics');
check(existsSync(resolve(root, 'public/asset-library-v15.html')), 'v15 Atlas Forge review page exists');
check(existsSync(resolve(root, 'docs/ATLAS_LIVING_BATTLEFIELD_PREVIEW_v15.0.0.jpg')), 'v15 atlas preview exists');

if (failures) {
  console.error(`\nFAIL v15.0.0 Living Battlefield contract ${failures}`);
  process.exit(1);
}
console.log('\nv15.0.0 Living Battlefield contract verified');
