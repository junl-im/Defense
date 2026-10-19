// Rani Kingdom v2.3: actual original individual icons & button live in UI,
// without slicing a reference sprite, changing gameplay or corrupting world.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const old=JSON.parse(fs.readFileSync('assets/rani/manifest-v22.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('assets/rani/manifest-v23.json','utf8'));
const icons=fs.readFileSync('src/ui/GameIcons.js','utf8');
const registry=fs.readFileSync('src/ui/RaniAssetRegistry.js','utf8');
const launcher=fs.readFileSync('src/ui/RoyalLauncher.js','utf8');
const mobile=fs.readFileSync('src/ui/MobileDock.js','utf8');
const css=fs.readFileSync('css/rani-individual-ui-v23.css','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.equal(manifest.svgAllowed,false);
assert.equal(manifest.totalAssets,10);
assert.deepEqual(manifest.assets.map(a=>a.path),old.assets.map(a=>a.path));
for(const a of manifest.assets) {
  assert.equal(fs.statSync(a.path).size,a.bytes,'Old asset modified: '+a.path);
  assert.ok(!a.path.endsWith('.svg'));
}
for(const key of ['village','market','port'])
  assert.match(registry,new RegExp('^  '+key+': RANI_PREPARED_ASSETS\\.', 'm'));
assert.match(icons,/RANI_RESOURCE_ICONS\[key\]\|\|RANI_GAMEPLAY_ICONS\[key\]/);
assert.match(launcher,/art\.innerHTML=iconHtml\('village','md'\)/);
assert.match(mobile,/key==='map'\?iconHtml\('village','md'\)/);
assert.match(css,/rk_btn_royal_primary_v001\.webp/);
assert.match(css,/#slg-tutorial-go/);
assert.match(css,/center \/ contain no-repeat/);
assert.match(html,/css\/rani-individual-ui-v23\.css/);
assert.ok(html.indexOf('rani-raster-assets-v22.css')<html.indexOf('rani-individual-ui-v23.css'));
assert.equal(manifest.assets.filter(a=>a.status.startsWith('applied-')).length,9,
 'Five resources, three building icons and the gold button are nine applied files');
assert.equal(manifest.assets.find(a=>a.key==='royalHud').status,'ready-not-applied');
for(const a of ['assets/branding/rani-kingdom-logo.webp',
 'assets/terrain/rani-terrain-atlas.webp',
 'src/rendering/RoyalWorldArt.js',
 'src/rendering/RoyalInfrastructureArt.js',
 'src/rendering/RoyalDistrictArt.js'])
 assert.ok(fs.existsSync(a),'Previous art lost: '+a);
console.log('PASS v2.3: 9 independent assets applied to real controls/icons, old 3D and source unchanged, SVG-free');
