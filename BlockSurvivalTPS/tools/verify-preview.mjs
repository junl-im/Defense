// Static gate is independent of browser/CDN/network and rejects missing UI bindings.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const game=read('src/game.mjs'),html=read('index.html');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const refs=[...game.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
const missing=refs.filter(id=>!ids.has(id));
if(missing.length)throw Error('Game JS refers to absent DOM ids: '+[...new Set(missing)].join(','));
for(const id of ['shell','stage','hud','primary','overlay','stickZone','lookZone','fire','reload','healthFill','ammo','pause','fps','message']){
 if(!ids.has(id))throw Error('Missing UI: '+id);
}
for(const p of ['dist/index.html','dist/game.bundle.js','dist/style.css','dist/THREE_LICENSE.txt','dist/START_HERE.txt','dist/BLOCK_SURVIVAL_TPS_바로실행.html']){
 const file=path.join(base,p);
 if(!fs.existsSync(file)||fs.statSync(file).size===0)throw Error('Missing build file '+p);
}
const bundle=read('dist/game.bundle.js'),ready=read('dist/index.html');
if(/from\s+["']three(?:\/|["'])/.test(bundle))throw Error('Three.js must be bundled');
if(!ready.includes('./game.bundle.js')||ready.includes('importmap'))throw Error('Preview should have no external code dependencies');
if(/\.svg(?:["'\s?]|$)/i.test(ready))throw Error('SVG asset references forbidden');
const direct=read('dist/BLOCK_SURVIVAL_TPS_바로실행.html');
if(!direct.includes('<style>')||!direct.includes('type="module"')||direct.includes('./game.bundle.js'))throw Error('Direct-play HTML is not self-contained');
if(!bundle.includes('Gobkit')&&!bundle.includes('Ariescar'))throw Error('Missing optional pinned CC0 asset source');
console.log('PASS: complete HTML UI bindings, no SVG, bundled Three.js, runtime fallbacks, static output.');
