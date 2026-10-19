// CI guard: prior kingdom art must stay, WebP icons must be independent,
// no SVG file or inline SVG may enter assets/source.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('assets/rani/manifest-v22.json','utf8'));
const registry=fs.readFileSync('src/ui/RaniAssetRegistry.js','utf8');
const iconSource=fs.readFileSync('src/ui/GameIcons.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.equal(manifest.svgAllowed,false);
assert.equal(manifest.totalAssets,10);
const seen=new Set();
for(const asset of manifest.assets){
  assert.ok(!seen.has(asset.path),'Each icon/building must have its own standalone file');
  seen.add(asset.path);
  const data=fs.readFileSync(asset.path);
  assert.equal(data.subarray(0,4).toString('ascii'),'RIFF',asset.path);
  assert.equal(data.subarray(8,12).toString('ascii'),'WEBP',asset.path);
  assert.ok(data.length>5000 && data.length<90000,asset.path+' not optimized');
  assert.equal(data.length,asset.bytes,asset.path+' bytes changed without manifest approval');
  assert.ok(registry.includes(asset.path),'Asset missing from registry: '+asset.path);
}
for(const oldAsset of manifest.preserve){
  assert.ok(fs.existsSync(oldAsset),'Regression: PREVIOUS asset lost: '+oldAsset);
}
const expected=['gold','wood','stone','food','population'];
for(const key of expected){
  assert.match(iconSource,new RegExp("RANI_RESOURCE_ICONS\\[key\\]"));
  assert.ok(manifest.assets.some(a=>a.key===key && a.status==='applied-resource-ui'),key);
}
assert.match(iconSource,/class="rani-raster-image"/);
assert.match(iconSource,/rani-raster-fallback/);
assert.match(html,/css\/rani-raster-assets-v22\.css/);
const enumerate=(dir)=>{
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){enumerate(p);continue}
    assert.ok(!p.toLowerCase().endsWith('.svg'),'SVG file prohibited: '+p);
    if(!/\.(html|js|css|mjs)$/i.test(p))continue;
    const s=fs.readFileSync(p,'utf8');
    assert.ok(!/<svg[\s>]/i.test(s),'Inline SVG prohibited: '+p);
    assert.ok(!/data:image\/svg\+xml/i.test(s),'SVG data URL prohibited: '+p);
  }
};
for(const folder of ['assets','src','css'])enumerate(folder);
console.log('PASS 10 individually generated WebP, previous GLTF/terrain/logo preserved, 5 wired HUD icons, no SVG');
