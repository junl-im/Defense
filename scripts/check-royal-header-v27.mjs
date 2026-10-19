// v2.7: last previously prepared royal raster becomes functional kingdom
// information header WITHOUT stretching the 512x254 original image.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { RANI_PREPARED_ASSETS, RANI_ALL_ASSET_PATHS } from '../src/ui/RaniAssetRegistry.js';
const old=JSON.parse(fs.readFileSync('assets/rani/manifest-v23.json','utf8'));
const next=JSON.parse(fs.readFileSync('assets/rani/manifest-v27.json','utf8'));
const lock=JSON.parse(fs.readFileSync('assets/rani/asset-integrity-lock-v25.json','utf8'));
const resource=fs.readFileSync('src/ui/ResourcePanel.js','utf8');
const css=fs.readFileSync('css/rani-royal-header-v27.css','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.equal(next.version,'2.7.0');
assert.equal(next.svgAllowed,false);
assert.equal(next.totalAssets,10);
assert.equal(old.totalAssets,10);
assert.deepEqual(next.assets.map(x=>x.path),old.assets.map(x=>x.path));
assert.deepEqual(next.assets.map(x=>x.bytes),old.assets.map(x=>x.bytes));
assert.equal(next.assets.filter(a=>a.status.startsWith('applied-')).length,10,
  'All ten original independent illustrations should now be applied');
assert.equal(old.assets.filter(a=>a.status.startsWith('applied-')).length,9,
  'Historical v2.3 status must remain immutable');
const hud=next.assets.find(x=>x.key==='royalHud');
assert.equal(hud.status,'applied-royal-kingdom-info-header');
assert.deepEqual(hud.dimensions,[512,254]);
assert.equal(RANI_PREPARED_ASSETS.hudPanel,hud.path);
assert.ok(RANI_ALL_ASSET_PATHS.includes(hud.path));
assert.equal(lock.protectedFiles.length,16);
assert.ok(lock.protectedFiles.find(x=>x.path===hud.path));
assert.match(resource,/import \{ RANI_PREPARED_ASSETS \} from '.\/RaniAssetRegistry.js'/);
assert.match(resource,/src="\$\{RANI_PREPARED_ASSETS\.hudPanel\}"/);
assert.match(resource,/rani-royal-header-art rani-raster-image/);
assert.match(resource,/width="512" height="254"/);
assert.match(resource,/rani-raster-fallback" hidden/);
assert.match(css,/aspect-ratio:512 \/ 254/);
assert.match(css,/object-fit:contain/);
assert.doesNotMatch(css,/background-size:cover|object-fit:cover|clip-path|background-position:-|image-set\(/);
assert.ok(html.indexOf('rani-individual-ui-v23.css') < html.indexOf('rani-royal-header-v27.css'));
assert.match(html,/css\/rani-royal-header-v27.css/);
assert.equal((html.match(/rani-royal-header-v27\.css/g)||[]).length,1);
assert.ok(next.pending.some(x=>x.category==='new_independent_icons'),
  'Do not claim new icons already exist: individual originals remain pending');
assert.equal(fs.statSync(hud.path).size,hud.bytes);
console.log('PASS v2.7: native 512x254 original royal info header, 10/10 pre-existing art applied, no sprite crop, v2.5 SHA locks retained');
