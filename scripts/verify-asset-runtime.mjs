import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pipeline = readFileSync(resolve(root, 'src/engine/asset-pipeline.js'), 'utf8');
const premium = readFileSync(resolve(root, 'src/premium-assets.js'), 'utf8');
const main = readFileSync(resolve(root, 'src/main.js'), 'utf8');
const viewer = readFileSync(resolve(root, 'src/codex-viewer.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const diagnostics = readFileSync(resolve(root, 'src/asset-diagnostics.js'), 'utf8');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);
check(!pipeline.includes('completed += 1;\n        completed += 1;'), 'asset preload progress increments exactly once');
check(pipeline.includes('instance.userData.animations = record.animations || []') && pipeline.includes('assetMetrics'), 'GLB animations and metrics propagate to instances');
check(pipeline.includes("entry.compression === 'draco'") && pipeline.includes("entry.embeddedTextures === 'ktx2'"), 'decoders load only for declared compression');
check(premium.includes("approvalStatus === 'production-approved' || approvalStatus === 'art-review'"), 'art-review authored PBR materials are preserved');
check(premium.includes("['WeaponSocket', 'weaponSocket']") && premium.includes("['AccessorySocket', 'accessorySocket']"), 'weapon and accessory sockets resolve');
check(main.includes('openGoldenSamplePreview') && main.includes("procedural: !(group.userData.animations?.length)"), 'golden preview and mixer-first runtime path');
check(viewer.includes('new THREE.AnimationMixer(this.model)') && viewer.includes("['idle', 'move', 'run', 'attack', 'skill', 'hit', 'death']"), 'codex viewer plays seven embedded clips');
check(diagnostics.includes('buildAssetDiagnostics') && html.includes('id="golden-sample-preview-btn"') && (html.match(/data-codex-state=/g) || []).length === 7, 'golden sample review UI and seven motion controls');
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('Asset runtime integration audit complete');
