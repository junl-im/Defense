// v2.1: real 3D guild/residential embellishments, no gameplay rewrites.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const art=fs.readFileSync('src/rendering/RoyalDistrictArt.js','utf8');
const houses=fs.readFileSync('src/buildings/BuildingFactory.js','utf8');
const civic=fs.readFileSync('src/buildings/CivicFactory.js','utf8');
const construction=fs.readFileSync('src/buildings/ConstructionSystem.js','utf8');
assert.match(art,/new THREE\.Mesh\(merge\(parts\),MATS\.vcStatic\)/);
assert.match(art,/raniVisualOnly=true/);
for(const kind of ['A','B','C','D','E'])
  assert.match(houses,new RegExp("p4\\.add\\(makeRoyalHouseDetails\\('"+kind+"'"));
for(const kind of ['market','lumber'])
  assert.match(houses,new RegExp("p4\\.add\\(makeRoyalDistrictDetails\\('"+kind+"'"));
for(const kind of ['sawmill','forge','barracks'])
  assert.match(civic,new RegExp("p4\\.add\\(makeRoyalDistrictDetails\\('"+kind+"'"));
for(const kind of ['house','market','barracks','forge','sawmill','lumber'])
  assert.ok(art.includes(kind),kind);
assert.match(houses,/rng\.pick\(\[PALETTE\.roofBlue, PALETTE\.roofBlue/);
assert.match(civic,/part\(gableRoof\(w, d, 0\.18\), PALETTE\.roofBlue/);
assert.match(construction,/PHASE_DELAY = \[0, 1\.4, 2\.9, 4\.4\]/);
assert.doesNotMatch(art,/\.spend\(|\.save\(|localStorage|ResourceSystem|BuildingSystem/);
console.log('PASS 5 distinct original house variants, 5 trades, merged details, original 4-stage contract');
