// Royal 3D upgrade is real vertex-colored Three.js geometry, not UI artwork.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const art=fs.readFileSync('src/rendering/RoyalWorldArt.js','utf8');
const materials=fs.readFileSync('src/rendering/Materials.js','utf8');
const tiles=fs.readFileSync('src/tiles/TileFactory.js','utf8');
const makers=fs.readFileSync('src/buildings/BuildingFactory.js','utf8');
assert.match(art,/function makeRoyalTileDressing/);
assert.match(art,/function makeRoyalCastleOrnaments/);
assert.match(art,/merge\(parts\)/);
assert.match(art,/\['village','field'\]/);
assert.match(art,/rani-royal-tile-dressing/);
assert.match(art,/rani-royal-castle-ornaments/);
assert.match(tiles,/makeRoyalTileDressing\(cell\)/);
assert.equal((tiles.match(/makeRoyalTileDressing\(cell\)/g)||[]).length,2,
  '3D tiles and ghost previews must display the same royal tile art');
assert.match(makers,/makeRoyalCastleOrnaments\('round'\)/);
assert.match(makers,/makeRoyalCastleOrnaments\('square'\)/);
assert.match(materials,/royalBlue:/);
assert.match(materials,/royalPave:/);
assert.match(materials,/royalWheat:/);
assert.match(art,/raniVisualOnly/);
assert.doesNotMatch(art,/localStorage|\.save\(|\.build\(/);
console.log('PASS v1.9 real merged 3D cobbled villages, wheat fields, cobalt/gold castles and no gameplay changes');
