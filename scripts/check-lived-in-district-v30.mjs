// Rani Kingdom v3.0 — seven genuine civic-buildings' post-build decoration.
// Previous original assets and every original maker's 4 stages stay unchanged.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const kinds=['apiary','bakery','stable','temple','university','observatory','library'];
const art=fs.readFileSync('src/rendering/RoyalLivedInDistrictArt.js','utf8');
const civic=fs.readFileSync('src/buildings/CivicFactory.js','utf8');
const residential=fs.readFileSync('src/buildings/BuildingFactory.js','utf8');
const construction=fs.readFileSync('src/buildings/ConstructionSystem.js','utf8');
const lock=JSON.parse(fs.readFileSync('assets/rani/asset-integrity-lock-v25.json','utf8'));
const old=JSON.parse(fs.readFileSync('assets/rani/manifest-v27.json','utf8'));
assert.equal(lock.protectedFiles.length,16);
assert.equal(old.assets.filter(a=>a.status.startsWith('applied-')).length,10);
assert.match(art,/export function makeRoyalLivedInDistrict\(kind\)/);
assert.match(art,/mesh=new THREE\.Mesh\(merge\(p\),MATS\.vcStatic\)/);
assert.match(art,/mesh\.userData\.raniVisualOnly=true/);
assert.match(art,/mesh\.raycast=\(\)=>\{\}/);
assert.ok(civic.includes("import { makeRoyalLivedInDistrict } from '../rendering/RoyalLivedInDistrictArt.js';"));
for(const kind of kinds){
 const cap=kind[0].toUpperCase()+kind.slice(1);
 const begin=civic.indexOf('export function make'+cap+'(');
 assert.ok(begin>=0,kind+' original maker missing');
 const next=civic.indexOf('export function ',begin+17);
 const body=civic.slice(begin,next<0?civic.length:next);
 const needle="p4.add(makeRoyalLivedInDistrict('"+kind+"'))";
 assert.equal(body.split(needle).length-1,1,kind+' decoration not installed exactly once');
 assert.ok(body.indexOf(needle)<body.indexOf('return wrap([p1, p2, p3, p4]);'),kind+' must be phase4');
 assert.equal(art.split("kind==='"+kind+"'").length-1,1,'Each supported building requires unique branch '+kind);
}
assert.equal((civic.match(/p4\.add\(makeRoyalLivedInDistrict\('/g)||[]).length,7);
assert.match(civic,/p4\.add\(makeRoyalHarborFleetDetail\('port'\)\)/);
assert.match(civic,/p4\.add\(makeRoyalHarborFleetDetail\('pier'\)\)/);
assert.match(civic,/p4\.add\(makeRoyalDistrictDetails\('forge'\)\)/);
assert.match(residential,/makeRoyalHouseDetails/);
assert.match(construction,/PHASE_DELAY = \[0, 1\.4, 2\.9, 4\.4\]/);
assert.doesNotMatch(art,/<svg|\.svg\b|localStorage|saveSystem|ResourceSystem|BuildingSystem|\.spend\(|fetch\(/);
console.log('PASS v3.0: seven real built civic professions, 4 construction phases, unique batched 3D, old 16 image/GLTF locks');
