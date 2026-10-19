// v2.5 approved asset shield — exact old bytes, stable UI mappings,
// and hard failures for missing local CSS/HTML/ESM references.
// Deliberately no rewrite or recompression of any previously approved artwork.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { RANI_RESOURCE_ICONS, RANI_PREPARED_ASSETS, RANI_GAMEPLAY_ICONS,
  RANI_ALL_ASSET_PATHS } from '../src/ui/RaniAssetRegistry.js';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p));
const old=JSON.parse(read('assets/rani/manifest-v22.json'));
const prior=JSON.parse(read('assets/rani/manifest-v23.json'));
const lock=JSON.parse(read('assets/rani/asset-integrity-lock-v25.json'));
const fail=(msg)=>{throw new Error('라니킹덤 v2.5 자산 보호 실패: '+msg)};
assert.equal(lock.version,'2.5.0');
assert.equal(lock.protectedFiles.length,16);
assert.equal(lock.originalArchive.sizeBytes,16285113);
assert.equal(old.totalAssets,10);
assert.equal(prior.totalAssets,10);
assert.equal(old.svgAllowed,false);
assert.equal(prior.svgAllowed,false);
assert.deepEqual(old.assets.map(x=>x.path),prior.assets.map(x=>x.path));
const oldSet=new Set(prior.assets.map(x=>x.path));
const allRequired=new Set([
  ...oldSet,...prior.preserve.filter(x=>/\.(?:webp|gltf)$/i.test(x))
]);
const registered=new Set(RANI_ALL_ASSET_PATHS);
assert.equal(allRequired.size,16,'Old 10 raster + branding/terrain + 4 GLTF must be present');
assert.equal(new Set(lock.protectedFiles.map(x=>x.path)).size,16,'Duplicate asset locks');
assert.deepEqual([...allRequired].sort(),
  lock.protectedFiles.map(x=>x.path).sort(),'Missing original asset from immutable lock');
for(const item of lock.protectedFiles){
  const relative=item.path;
  if(!/^assets\/[A-Za-z0-9_./-]+\.(webp|gltf)$/.test(relative) ||
      relative.includes('..'))fail('Unsafe asset path: '+relative);
  if(!registered.has(relative))fail('Asset registry omits '+relative);
  if(!fs.existsSync(path.join(root,relative)))fail('Missing approved original '+relative);
  const bytes=read(relative);
  if(bytes.length!==item.bytes)fail('Original byte count changed: '+relative);
  // Git's canonical SHA-1 hashes the "blob <length>\\0" prefix + raw bytes.
  // This catches byte changes even when malicious/mistaken outputs retain size.
  const blob=crypto.createHash('sha1')
    .update('blob '+bytes.length).update(Buffer.alloc(1)).update(bytes).digest('hex');
  if(blob!==item.gitBlobSha1)fail('Original content fingerprint changed: '+relative);
  if(relative.endsWith('.webp')){
    assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF',relative);
    assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP',relative);
  }else{
    const data=JSON.parse(bytes.toString('utf8'));
    if(!String(data.asset?.version||'').startsWith('2.'))fail('Malformed original GLTF '+relative);
  }
}
for(const a of prior.assets){
  if(!registered.has(a.path))fail('v2.3 original manifest asset unregistered: '+a.path);
  if(fs.statSync(a.path).size!==a.bytes)fail('v2.3 manifest asset size drift: '+a.path);
}
assert.deepEqual(Object.keys(RANI_RESOURCE_ICONS).sort(),
  ['gold','wood','stone','food','population'].sort());
assert.deepEqual(Object.keys(RANI_GAMEPLAY_ICONS).sort(),
  ['village','market','port'].sort());
assert.deepEqual(new Set(Object.values(RANI_RESOURCE_ICONS)),
  new Set(prior.assets.filter(a=>['gold','wood','stone','food','population'].includes(a.key)).map(a=>a.path)));
assert.equal(RANI_GAMEPLAY_ICONS.village,RANI_PREPARED_ASSETS.houseA);
assert.equal(RANI_GAMEPLAY_ICONS.market,RANI_PREPARED_ASSETS.market);
assert.equal(RANI_GAMEPLAY_ICONS.port,RANI_PREPARED_ASSETS.tradeShip);
assert.equal(prior.assets.filter(a=>a.status.startsWith('applied-')).length,9);
assert.equal(prior.assets.find(a=>a.key==='royalHud')?.status,'ready-not-applied');
if(!fs.existsSync('LICENSE')||!fs.existsSync('docs/THIRD_PARTY_ASSETS_KO.md'))
  fail('License or 3D asset credit document missing');

// Unlike the earlier basic import audit, this checks HTML and CSS URL paths
// as well as each source's local static/dynamic import against *its own folder*.
const isExternal=u=>/^(?:[a-z]+:|\/\/|#|data:)/i.test(u);
function expectLocal(owner,url){
  const raw=url.trim().replace(/[?#].*$/,'');
  if(!raw||isExternal(raw)||raw.startsWith('/'))return;
  const resolved=path.resolve(root,path.dirname(owner),decodeURIComponent(raw));
  if(!resolved.startsWith(root+path.sep))fail('Path escapes repository: '+owner+' -> '+url);
  if(!fs.existsSync(resolved) && !fs.existsSync(resolved+'.js'))
    fail('Broken local reference: '+owner+' -> '+url);
}
const html=read('index.html').toString();
for(const m of html.matchAll(/<(?:script|img|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["']/gi))
  expectLocal('index.html',m[1]);
function walk(dir,ext,fn){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p,ext,fn);
    else if(p.endsWith(ext))fn(p);
  }
}
walk('css','.css',p=>{
  const source=read(p).toString();
  for(const m of source.matchAll(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/gi))
    expectLocal(p,m[1]);
});
walk('src','.js',p=>{
  const source=read(p).toString();
  for(const m of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g))
    if(m[1].startsWith('.'))expectLocal(p,m[1]);
});
// Store v2.5's latest approved 16 fingerprints. Future *new* assets may be
// appended to a new versioned manifest with explicit review, not silently replace.
console.log('PASS v2.5: 16 immutable original file fingerprints, 10 independent raster sources, live icon mapping, CSS/HTML/JS refs and licensed GLTF');
