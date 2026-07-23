import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const LEGACY_TECHNICAL_STYLE_LOCK_ID = 'DD-AAA-CASUAL-SD-PBR-3.0';
const file = resolve(root, 'public/assets/models/player-dokkaebi-warrior-golden-v1.glb');
const buffer = readFileSync(file);
if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('Golden sample is not a valid GLB');
let offset = 12;
let json = null;
while (offset + 8 <= buffer.length) {
  const length = buffer.readUInt32LE(offset);
  const type = buffer.readUInt32LE(offset + 4);
  const chunk = buffer.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4E4F534A) json = JSON.parse(chunk.toString('utf8').replace(/\0+$/g, '').trim());
  offset += 8 + length;
}
if (!json) throw new Error('Golden sample JSON chunk missing');
const triangles = (json.meshes || []).flatMap((mesh) => mesh.primitives || []).reduce((sum, primitive) => {
  const accessor = json.accessors?.[primitive.indices ?? primitive.attributes?.POSITION];
  return sum + Math.floor((accessor?.count || 0) / 3);
}, 0);
const clips = (json.animations || []).map((animation) => animation.name);
const expectedClips = ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn'];
const nodes = new Set((json.nodes || []).map((node) => node.name));
const expectedNodes = ['Armature', 'Hips', 'Spine', 'Head', 'Arm_L', 'Hand_L', 'Arm_R', 'Hand_R', 'HelmetSocket', 'ShoulderSocket', 'WeaponSocket', 'AccessorySocket', 'BackSocket', 'FXSocket', 'Leg_L', 'Foot_L', 'Leg_R', 'Foot_R'];
const failures = [];
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);
check(triangles >= 6000 && triangles <= 10000, `golden hero triangles ${triangles}/6000-10000`);
check((json.skins || []).length === 1, 'golden hero Skin 1');
check(expectedClips.every((name) => clips.includes(name)) && clips.length === 11, `golden hero clips ${clips.join(', ')}`);
check(expectedNodes.every((name) => nodes.has(name)), 'golden hero shared rig and six equipment sockets');
check((json.images || []).length >= 4 && (json.textures || []).length >= 4, 'golden hero BaseColor/Normal/ORM/Emissive textures');
check(json.asset?.extras?.styleLockId === LEGACY_TECHNICAL_STYLE_LOCK_ID, 'golden hero legacy technical style metadata');
check(json.asset?.extras?.approvalStage === 'art-review' && json.asset?.extras?.technicalReady === true, 'golden hero art-review technical stage');
check((json.meshes?.[0]?.primitives || []).every((primitive) => primitive.attributes?.JOINTS_0 != null && primitive.attributes?.WEIGHTS_0 != null), 'all golden hero primitives are skinned');
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('Golden hero GLB technical production audit complete');
