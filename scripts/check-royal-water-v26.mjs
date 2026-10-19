// v2.6 water terrain artwork: one merged Three.js draw call, never a fake map.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const art=fs.readFileSync('src/rendering/RoyalWaterfrontArt.js','utf8');
const tiles=fs.readFileSync('src/tiles/TileFactory.js','utf8');
const old=fs.readFileSync('src/rendering/RoyalWorldArt.js','utf8');
const build=fs.readFileSync('src/tiles/TileMeshBuilder.js','utf8');
const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.match(art,/export function makeRoyalWaterfrontDressing\(cell\)/);
assert.match(art,/ROYAL_WATER_TILE_TYPES=Object\.freeze\(\['river','lake'\]\)/);
assert.match(art,/new THREE\.Mesh\(merge\(parts\),MATS\.vcStatic\)/);
assert.match(art,/new Rng\(/);
assert.match(art,/edgeAngle\(edge\)/);
assert.match(art,/raniWaterVisualOnly=true/);
assert.match(art,/mesh\.raycast=\(\)=>\{\}/);
assert.match(tiles,/import \{ makeRoyalWaterfrontDressing \}/);
assert.equal((tiles.match(/makeRoyalWaterfrontDressing\(cell\)/g)||[]).length,2,
  'Real 3D placed tile and translucent ghost must use identical waterfront art');
assert.equal((tiles.match(/makeRoyalTileDressing\(cell\)/g)||[]).length,2,
  'Previous village/field tile dressing must not be replaced');
assert.match(build,/cell\.tileType === 'lake'/);
assert.match(build,/cell\.riverEdges && cell\.riverEdges\.length/);
assert.match(old,/makeRoyalCastleOrnaments/);
assert.doesNotMatch(art,/\.save\(|localStorage|\.attack\(|\.canAttack\(|<svg|\.svg\b/i);
assert.equal(packageJson.scripts.build,'npm run test');
for(const f of ['assets/rani/asset-integrity-lock-v25.json','src/rendering/RoyalInfrastructureArt.js',
 'src/rendering/RoyalDistrictArt.js','assets/rani/manifest-v23.json'])
 assert.ok(fs.existsSync(f),'Lost v2.5-approved asset: '+f);
console.log('PASS v2.6: royal lake/river 3D art, real water connectors, ghost/real rendering and v2.5 asset protection');
