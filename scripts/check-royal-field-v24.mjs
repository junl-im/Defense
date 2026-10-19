// Rani Kingdom v2.4 — source-level guardrails for the REAL Three.js field.
// No fake DOM map, SVG or changes to economy, combat, selection or saves.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync('src/rendering/RoyalFieldScenery.js','utf8');
const field=fs.readFileSync('src/rendering/RaniFieldScene.js','utf8');
assert.match(code,/export function installRoyalFieldScenery\(scene\)/);
assert.match(code,/export function makeRoyalFieldTownDressing\(entry\)/);
assert.equal((code.match(/new THREE\.InstancedMesh\(/g)||[]).length,4);
assert.match(code,/new THREE\.Mesh\(merge\(parts\),MATS\.vcStatic\)/);
assert.match(code,/mesh\.raycast=\(\)=>\{\}/);
assert.match(code,/raniFieldVisualOnly/);
assert.match(code,/Math\.max\(Math\.abs\(q\),Math\.abs\(r\),Math\.abs\(q\+r\)\)<5/);
assert.match(field,/installRoyalFieldScenery\(this\.scene\)/);
assert.match(field,/group\.add\(makeRoyalFieldTownDressing\(entry\)\)/);
assert.match(field,/o\.userData\.raniFieldVisualOnly&&o\.geometry\)o\.geometry\.dispose\(\)/);
assert.match(field,/const playerRoofMaterial=.*0x285eaa/);
assert.doesNotMatch(code,/<svg|\.svg\b|localStorage|\.save\(|\.attack\(|\.canAttack\(/i);
assert.ok(fs.existsSync('assets/rani/manifest-v23.json'));
for(const old of ['src/rendering/RoyalWorldArt.js','src/rendering/RoyalInfrastructureArt.js',
  'src/rendering/RoyalDistrictArt.js','assets/rani/ui/icons/rk_icon_resource_gold_v001.webp'])
 assert.ok(fs.existsSync(old),'Old asset missing: '+old);
console.log('PASS v2.4 real 3D field royal forests/towns, draw-call budget, selection isolation and asset retention');
