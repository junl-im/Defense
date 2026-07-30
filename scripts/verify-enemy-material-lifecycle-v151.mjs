import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  applyEnemyBodyEmissiveV151,
  clearEnemyBodyMaterialCacheV151,
  resolveEnemyBodyMaterialsV151
} from '../src/runtime/enemy-body-material-v151.js';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function groupWith(nodes = [], declaredBody = null) {
  return {
    userData: { body: declaredBody },
    getObjectByName(name) { return nodes.find((node) => node.name === name) || null; },
    traverse(visitor) { nodes.forEach(visitor); }
  };
}

const makeMaterial = () => ({ emissive: { value: null, set(value) { this.value = value; } }, emissiveIntensity: 0 });
const namedMaterialA = makeMaterial();
const namedMaterialB = makeMaterial();
const namedBody = { name: 'Body', isMesh: true, material: [namedMaterialA, namedMaterialB] };
const recoveredGroup = groupWith([{ name: 'helper', isMesh: false }, namedBody], null);
const recovered = resolveEnemyBodyMaterialsV151(recoveredGroup);
assert.equal(recovered.body, namedBody);
assert.equal(recovered.recovered, true);
assert.equal(recovered.source, 'named:Body');
assert.equal(recovered.materials.length, 2);
assert.equal(recoveredGroup.userData.body, namedBody);
applyEnemyBodyEmissiveV151(recoveredGroup, { color: 0x8cecff, intensity: 1.15 });
assert.equal(namedMaterialA.emissive.value, 0x8cecff);
assert.equal(namedMaterialB.emissive.value, 0x8cecff);
assert.equal(namedMaterialA.emissiveIntensity, 1.15);
assert.equal(namedMaterialB.emissiveIntensity, 1.15);

clearEnemyBodyMaterialCacheV151(recoveredGroup);
assert.equal('enemyBodyMaterialsV151' in recoveredGroup.userData, false);

const fallbackMaterial = makeMaterial();
const fallbackMesh = { name: 'BossMesh_0', isMesh: true, material: fallbackMaterial };
const fallbackGroup = groupWith([{ name: 'empty', isMesh: true, material: null }, fallbackMesh], null);
const fallback = resolveEnemyBodyMaterialsV151(fallbackGroup);
assert.equal(fallback.body, fallbackMesh);
assert.equal(fallback.source, 'first-renderable:BossMesh_0');
assert.equal(fallback.materials.length, 1);

const unavailable = resolveEnemyBodyMaterialsV151(groupWith([], null));
assert.equal(unavailable.body, null);
assert.deepEqual(unavailable.materials, []);
assert.equal(unavailable.source, 'unavailable');

const main = read('src/main.js');
assert.doesNotMatch(main, /enemy\.group\.userData\.body\.material/);
assert.match(main, /applyEnemyBodyEmissiveV151\(enemy\.group/);

const premium = read('src/premium-assets.js');
assert.ok(premium.indexOf('resolveEnemyBodyMaterialsV151(group)') < premium.indexOf('return group;\n}\n\nexport function createCodexPreviewModel'), 'imported enemy body resolution must complete before returning to combat presentation attachment');
assert.match(premium, /findImportedPartAny\(root, \['body', 'Body', 'torso', 'Torso'/);
assert.match(premium, /resolveEnemyBodyMaterialsV151\(group\)/);
assert.match(premium, /applyEnemyBodyEmissiveV151\(group, \{ intensity:/);

function glbNodeNames(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'glTF');
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (type === 0x4e4f534a) {
      const json = JSON.parse(buffer.subarray(offset, offset + length).toString('utf8').replace(/[\u0000\s]+$/u, ''));
      return (json.nodes || []).map((node) => node.name || '');
    }
    offset += length;
  }
  throw new Error(`JSON chunk missing: ${file}`);
}

for (const file of [
  'public/assets/models/boss-tiger-sd-toon.glb',
  'public/assets/models/boss-serpent-sd-toon.glb',
  'public/assets/models/boss-king-sd-toon.glb'
]) {
  const names = glbNodeNames(file);
  assert.ok(names.includes('body'), `${file} must retain the authored body node`);
}

console.log('PASS v1.0.51 enemy material lifecycle: null body recovery, multi-material emissive safety, boss GLB body nodes, and no direct enemy body.material access');
