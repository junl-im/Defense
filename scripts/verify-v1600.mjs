import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import { getCameraProfile } from '../src/engine/camera-profile.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
let failures = 0;
const check = (value, message) => value ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

const pkg = json('package.json');
const html = read('index.html');
const main = read('src/main.js');
const style = read('src/style.css');
const camera = read('src/engine/camera-director-v16.js');
const sprites = read('src/runtime/battlefield-sprite-director-v16.js');
const audit = read('src/runtime/runtime-visual-audit.js');
const consoleSource = read('src/production-console.js');
const titleBlock = html.slice(html.indexOf('<section id="title-screen"'), html.indexOf('<header id="hud"'));

check(Number(pkg.version.split('.')[0]) >= 16, 'package version remains v16 or later');
check(/const GAME_VERSION = '(?:16|17|18|19|20|21|22|23)\.0\.0'/.test(main), 'runtime game version remains v16 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 13, 'engine version remains 13.0.0 or later');
check(SAVE_SCHEMA_VERSION >= 14, 'save schema version remains 14 or later');

check(titleBlock.includes('id="start-btn"') && titleBlock.includes('id="title-setup-btn"') && titleBlock.includes('id="title-vault-btn"') && titleBlock.includes('id="controls-btn"'), 'first screen exposes only primary player actions');
check(!titleBlock.includes('ATLAS FRAMES') && !titleBlock.includes('ENGINE 12') && !titleBlock.includes('RUNTIME SLICE') && !titleBlock.includes('asset-library-v15.html') && !titleBlock.includes('absolute-lock-badge'), 'first screen removes patch, engine and production status text');
check(html.includes('id="title-setup-modal"') && html.includes('id="run-mode-options"') && html.includes('id="hero-class-options"') && html.includes('id="council-options"') && html.includes('id="seed-mode-options"'), 'run configuration moved into setup modal');
check(html.includes('id="title-vault-modal"') && html.includes('id="collection-btn"') && html.includes('id="equipment-btn"') && html.includes('id="meta-btn"') && html.includes('id="how-btn"'), 'secondary menus moved into vault modal');
check(style.includes('.title-panel-simple') && style.includes('.title-primary-actions') && style.includes('.title-setup-card'), 'simplified entry responsive styles');

check(!main.includes("cameraObstacles.push({ x: 0, z: 0, radius: 2.15") && main.includes("if (obstacle.type === 'core') continue"), 'central guardian castle removed from camera collision zoom');
check(main.includes('updateCoreOcclusion') && main.includes('targetOpacity = occluded ? .28 : 1'), 'central guardian castle fades instead of forcing close camera');
check(main.includes("minimumByProfile = profileId === 'scenic' ? 14.8") && main.includes('resolveCameraCollisionDistance(target, framedDistance, profile.id)'), 'camera collision keeps safe scenic minimum distance');
check(getCameraProfile('scenic').distance === 19.5 && getCameraProfile('scenic').minZoom === 10, 'scenic base camera remains wide');
check(camera.includes("CAMERA_DIRECTOR_VERSION = '16.0.0'") && camera.includes('coreProximity') && camera.includes('coreKeepout'), 'camera director v16 core proximity diagnostics');

check(sprites.includes('versionedAssetUrl') && sprites.includes('fallbackUsed') && sprites.includes("return loadTexture(versionedAssetUrl(page[fallback]))"), 'atlas loading uses cache-busted WebP with PNG fallback');
check(sprites.includes("RuntimeAtlasBattlefieldPropsV16") && sprites.includes("position: [-8.6, 1.8, 10.5]") && sprites.includes('scale: 7.4'), 'atlas environment placed prominently in battlefield');
check(html.includes('id="hero-hud-portrait"') && main.includes('updateHeroHudPortrait'), 'selected atlas hero is visible in combat HUD');
check(audit.includes('core-collision-guard') && audit.includes('title-simplified') && main.includes('runRuntimeVisualAudit'), 'runtime visual self-audit integrated');
check(consoleSource.includes('VISUAL AUDIT') && (consoleSource.includes('CLEAR HORIZON v16') || (consoleSource.includes('MOON GATE REBORN v17') || consoleSource.includes('TEN-WAVE RELIABILITY v18'))), 'production console reports visual audit without cluttering title');
check(html.includes(`const VERSION = '${pkg.version}'`), 'boot cache reset uses current version');
check(['docs/CLEAR_HORIZON_v16.0.0.md', 'docs/RUNTIME_VISUAL_AUDIT_v16.0.0.json', 'docs/PATCH_NOTES_v16.0.0.md', 'docs/PATCH_APPLY_v16.0.0.md', 'docs/NEXT_PATCH_LINEUP_v16.x.md'].every((path) => existsSync(resolve(root, path))), 'v16 operating and audit documents exist');

if (failures) {
  console.error(`\nFAIL v16.0.0 Clear Horizon contract ${failures}`);
  process.exit(1);
}
console.log('\nv16.0.0 Clear Horizon contract verified');
