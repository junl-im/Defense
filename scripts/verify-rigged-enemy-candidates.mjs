import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RIGGED_ENEMY_CANDIDATES } from '../src/rigged-enemy-candidate-spec.js';

const root = resolve(import.meta.dirname, '..');
const LEGACY_TECHNICAL_STYLE_LOCK_ID = 'DD-AAA-CASUAL-SD-PBR-3.0';
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);

function parseGlb(file) {
  const buffer = readFileSync(file);
  check(buffer.toString('ascii', 0, 4) === 'glTF', `${file} GLB header`);
  let offset = 12;
  let json = null;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const chunk = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4E4F534A) json = JSON.parse(chunk.toString('utf8').replace(/\0+$/g, '').trim());
    offset += 8 + length;
  }
  if (!json) throw new Error(`GLB JSON chunk missing: ${file}`);
  return json;
}

for (const [key, spec] of Object.entries(RIGGED_ENEMY_CANDIDATES)) {
  const file = resolve(root, 'public/assets/models', `${spec.assetId}.glb`);
  const json = parseGlb(file);
  const triangles = (json.meshes || []).flatMap((mesh) => mesh.primitives || []).reduce((sum, primitive) => {
    const accessor = json.accessors?.[primitive.indices ?? primitive.attributes?.POSITION];
    return sum + Math.floor((accessor?.count || 0) / 3);
  }, 0);
  const clips = new Set((json.animations || []).map((clip) => clip.name));
  const nodes = new Set((json.nodes || []).map((node) => node.name));
  check(triangles >= spec.triangleRange[0] && triangles <= spec.triangleRange[1], `${key} triangles ${triangles}/${spec.triangleRange.join('-')}`);
  check((json.skins || []).length === 1, `${key} Skin 1`);
  check(spec.requiredClips.every((name) => clips.has(name)) && clips.size === spec.requiredClips.length, `${key} seven clips`);
  check(spec.requiredSockets.every((name) => nodes.has(name)), `${key} shared sockets`);
  check((json.images || []).length >= 4 && (json.textures || []).length >= 4, `${key} BaseColor/Normal/ORM/Emissive`);
  check(json.asset?.extras?.styleLockId === LEGACY_TECHNICAL_STYLE_LOCK_ID, `${key} legacy technical style metadata`);
  check(json.asset?.extras?.approvalStage === 'art-review' && json.asset?.extras?.technicalReady === true, `${key} art-review technical stage`);
  check(json.asset?.extras?.rigVersion === spec.rigId, `${key} shared rig ${spec.rigId}`);
  check((json.meshes || []).flatMap((mesh) => mesh.primitives || []).every((primitive) => primitive.attributes?.JOINTS_0 != null && primitive.attributes?.WEIGHTS_0 != null), `${key} skinned primitives`);
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('Rigged enemy candidate audit complete');
