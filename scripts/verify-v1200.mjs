import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINE_VERSION, MOBILE_ENGINE_CONFIG } from '../src/engine/engine-config.js';
import { CAMERA_PROFILES, DEFAULT_CAMERA_PROFILE_ID, getCameraProfile, resolveCameraDistance } from '../src/engine/camera-profile.js';
import { GOLDEN_SLICE_CERTIFICATION_SUMMARY, GOLDEN_SLICE_RUNTIME_CERTIFICATION } from '../src/golden-slice-certification.js';
import { ART_PRODUCTION_SUMMARY, GOLDEN_VERTICAL_SLICE } from '../src/art-production-gate.js';
import { SAVE_SCHEMA_VERSION, migrateSaveSchema } from '../src/runtime/save-schema.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(resolve(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`PASS ${message}`);
  else { failures += 1; console.error(`FAIL ${message}`); }
};
const sha = (rel) => createHash('sha256').update(readFileSync(resolve(root, rel))).digest('hex');

function readGlbJson(rel) {
  const data = readFileSync(resolve(root, rel));
  if (data.toString('ascii', 0, 4) !== 'glTF' || data.readUInt32LE(4) !== 2 || data.readUInt32LE(8) !== data.length) return null;
  let offset = 12;
  while (offset + 8 <= data.length) {
    const length = data.readUInt32LE(offset);
    const type = data.readUInt32LE(offset + 4);
    const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4E4F534A) return JSON.parse(chunk.toString('utf8').replace(/\0+$/g, '').trim());
    offset += 8 + length;
  }
  return null;
}

const pkg = json('package.json');
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
const catalog = read('src/engine/asset-catalog.js');
const registry = json('docs/ART_ASSET_APPROVAL_REGISTRY_v12.0.0.json');
const certificate = json('docs/GOLDEN_SLICE_RUNTIME_CERTIFICATION_v12.0.0.json');

check(Number(pkg.version.split('.')[0]) >= 12, 'package version v12 or later');
check(/const GAME_VERSION = '(?:12|13)\.0\.0'/.test(main), 'runtime game version v12 or later');
check(ENGINE_VERSION === '10.0.0', 'engine version 10.0.0');
check(/ASSET_REVISION = '(?:12|13)\.0\.0'/.test(catalog), 'asset revision v12 or later');
check(SAVE_SCHEMA_VERSION >= 10, 'save schema version 10 or later');

const scenic = getCameraProfile(DEFAULT_CAMERA_PROFILE_ID);
check(DEFAULT_CAMERA_PROFILE_ID === 'scenic' && Object.keys(CAMERA_PROFILES).length === 3, 'three camera presets with scenic default');
check(scenic.distance === 19.5 && scenic.pitch === 0.73 && scenic.fov === 52, 'scenic camera distance, pitch and FOV contract');
check(resolveCameraDistance('scenic', { waveActive: true, bossActive: true }) > scenic.distance, 'combat auto framing expands scenic distance');
check(MOBILE_ENGINE_CONFIG.world.visibleChunkRadius === 2, 'desktop scenic chunk radius 2');
check(main.includes("code === 'F5'") && main.includes('cycleCameraView()') && main.includes('resolveCameraDistance'), 'F5 camera cycle and dynamic framing integrated');
check(html.includes('data-camera-preset="scenic"') && html.includes('전장 조망') && html.includes('max="300"'), 'camera preset UI and extended zoom range');
check(style.includes('GOLDEN DOMINION v12.0.0') && style.includes('.camera-preset-options'), 'camera preset responsive styling');

check(GOLDEN_SLICE_RUNTIME_CERTIFICATION.length === 6, 'six runtime vertical slice categories');
check(GOLDEN_SLICE_CERTIFICATION_SUMMARY.runtimeCertified === 6 && GOLDEN_SLICE_CERTIFICATION_SUMMARY.runtimePassed, 'runtime vertical slice 6/6 certified');
check(GOLDEN_SLICE_CERTIFICATION_SUMMARY.productionArtApproved === 0 && !GOLDEN_SLICE_CERTIFICATION_SUMMARY.massProductionUnlocked, 'production art remains honestly locked');
check(GOLDEN_VERTICAL_SLICE.every((entry) => entry.status === 'runtime-certified' && entry.completion === 100), 'art gate records 6/6 runtime certification');
check(ART_PRODUCTION_SUMMARY.runtimeCertified === 6 && ART_PRODUCTION_SUMMARY.approved === 0 && ART_PRODUCTION_SUMMARY.massProductionUnlocked === false, 'art gate separates runtime pass from production approval');
check(registry.runtimeVerticalSliceApproved === 6 && registry.goldenVerticalSliceApproved === 0 && registry.massProductionUnlocked === false, 'v12 approval registry distinction');
check(certificate.runtimeVerticalSlice.passed === 6 && certificate.productionArt.approved === 0, 'runtime certification document distinction');

for (const entry of certificate.entries) {
  check(entry.runtimeStatus === 'runtime-certified' && entry.checks.length >= 7, `${entry.id} evidence checklist`);
  for (const evidence of entry.evidence) {
    check(existsSync(resolve(root, evidence.path)), `${entry.id} evidence exists: ${evidence.path}`);
    if (existsSync(resolve(root, evidence.path))) {
      const mutableInLaterVersions = Number(pkg.version.split('.')[0]) > 12 && ['src/main.js', 'index.html', 'src/style.css'].includes(evidence.path);
      check(mutableInLaterVersions || sha(evidence.path) === evidence.sha256, `${entry.id} evidence hash: ${evidence.path}`);
    }
  }
}

const elevenClips = ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn'];
const sixSockets = ['HelmetSocket', 'ShoulderSocket', 'WeaponSocket', 'AccessorySocket', 'BackSocket', 'FXSocket'];
const upgradedRiggedAssets = [
  'public/assets/models/player-dokkaebi-warrior-golden-v1.glb',
  'public/assets/models/player-dokkaebi-archer-candidate-v1.glb',
  'public/assets/models/player-dokkaebi-mage-candidate-v1.glb',
  'public/assets/models/monster-brute-sd-toon.glb',
  'public/assets/models/monster-shaman-sd-toon.glb',
  'public/assets/models/monster-ghost-candidate-v1.glb',
  'public/assets/models/monster-skeleton-candidate-v1.glb',
  'public/assets/models/monster-crow-candidate-v1.glb'
];
for (const rel of upgradedRiggedAssets) {
  const gltf = readGlbJson(rel);
  const clips = new Set((gltf?.animations || []).map((item) => item.name));
  const nodes = new Set((gltf?.nodes || []).map((item) => item.name));
  check(Boolean(gltf?.skins?.length === 1), `${rel} Skin 1`);
  check(elevenClips.every((name) => clips.has(name)) && clips.size === 11, `${rel} 11 clip contract`);
  check(sixSockets.every((name) => nodes.has(name)), `${rel} six equipment sockets`);
  check(gltf?.asset?.extras?.animationContract === 'DD-11-CLIP-v2.0', `${rel} animation contract metadata`);
}

const fakeData = new Map([
  ['dokkaebi-save-schema-version', '9'],
  ['dokkaebi-control-settings-v1', JSON.stringify({ cameraProfile: 'close' })]
]);
const storage = { getItem: (key) => fakeData.has(key) ? fakeData.get(key) : null, setItem: (key, value) => fakeData.set(key, String(value)) };
const migration = migrateSaveSchema(storage);
check(migration.migrated && Number(fakeData.get('dokkaebi-save-schema-version')) >= 10, 'save schema migration writes current schema');
const currentBackup = fakeData.get('dokkaebi-save-backup-v11') || fakeData.get('dokkaebi-save-backup-v10');
check(Boolean(currentBackup), 'save migration writes current backup');
check(currentBackup.includes('dokkaebi-control-settings-v1'), 'save backup includes camera settings');

check((html.includes('GOLDEN DOMINION') || html.includes('TRANSPARENT ARSENAL') || html.includes('Sprite Forge')) && html.includes('v13.0.0'), 'current title retains v12 camera lineage');
check((consoleSource.includes('GOLDEN DOMINION v12') || consoleSource.includes('TRANSPARENT ARSENAL v13')) && consoleSource.includes('RUNTIME SLICE') && consoleSource.includes('CAMERA'), 'production console retains v12 diagnostics');
check(existsSync(resolve(root, 'docs/GOLDEN_DOMINION_v12.0.0.md')) && existsSync(resolve(root, 'docs/PATCH_NOTES_v12.0.0.md')) && existsSync(resolve(root, 'docs/PATCH_APPLY_v12.0.0.md')) && existsSync(resolve(root, 'docs/GOLDEN_SLICE_RUNTIME_BOARD_v12.0.0.jpg')), 'v12 operating documents and certification board exist');

if (failures) {
  console.error(`\nFAIL v12.0.0 Golden Dominion contract ${failures}`);
  process.exit(1);
}
console.log('\nv12.0.0 Golden Dominion contract verified');
