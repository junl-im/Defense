import assert from 'node:assert/strict';
import { VILLAGE_ART_CATALOG, artBuildingKey } from '../src/rendering/VillageBuildingArt.js';
assert.deepEqual(Object.keys(VILLAGE_ART_CATALOG).sort(),['barracks','farm','market']);
for(const [id,url] of Object.entries(VILLAGE_ART_CATALOG)){
  assert(url.endsWith('.gltf'),id);
  assert(url.startsWith('assets/quaternius/'),id);
}
assert.equal(artBuildingKey('1,-1',{id:'farm',slot:0}),'1,-1/0/farm');
assert.notEqual(artBuildingKey('0,0',{id:'market',slot:0}),artBuildingKey('0,0',{id:'farm',slot:0}));
console.log('PASS native 3D building catalog: compatible IDs and stable keys');
