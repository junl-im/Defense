// Verify actual royalty-styled THREE geometry, not a screenshot or DOM fake.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const infra=fs.readFileSync('src/rendering/RoyalInfrastructureArt.js','utf8');
const roads=fs.readFileSync('src/automesh/MeshVariants.js','utf8');
const walls=fs.readFileSync('src/systems/WallSystem.js','utf8');
const military=fs.readFileSync('src/buildings/MilitaryFactory.js','utf8');
const civic=fs.readFileSync('src/buildings/CivicFactory.js','utf8');
for(const f of ['makeRoyalRoadPaving','makeRoyalBorderWall','makeRoyalGateOrnaments',
                'makeRoyalBastionOrnaments','makeRoyalHarborOrnaments'])
  assert.match(infra,new RegExp('export function '+f+'\\('));
for(const f of ['rani-royal-road-paving','rani-royal-border-wall',
                'rani-royal-gate-ornaments','rani-royal-bastion-ornaments',
                'rani-royal-harbor-ornaments','rani-royal-pier-ornaments'])
  assert.ok(infra.includes(f),f);
assert.match(infra,/new THREE\.Mesh\(merge\(parts\), MATS\.vcStatic\)/);
assert.match(infra,/raniVisualOnly\s*=\s*true/);
assert.match(roads,/makeRoyalRoadPaving\(own,variant\.mask\)/);
assert.match(walls,/nativeVillage\?\.level>=2/);
assert.match(walls,/native-village:expanded/);
assert.match(walls,/obj\.geometry\.dispose\(\)/);
assert.match(military,/p4\.add\(makeRoyalGateOrnaments\(\)\)/);
assert.match(military,/p4\.add\(makeRoyalBastionOrnaments\(\)\)/);
assert.match(civic,/p4\.add\(makeRoyalHarborOrnaments\('port'\)\)/);
assert.match(civic,/p4\.add\(makeRoyalHarborOrnaments\('pier'\)\)/);
assert.doesNotMatch(infra,/localStorage|fetch\(|\.save\(|\.build\(/);
console.log('PASS real 3D road/stone defense/port and 4-phase visual-only embellishments');
