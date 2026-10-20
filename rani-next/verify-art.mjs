// Strict raster-only content gate for game distribution.
// SVG and data:image/svg+xml are forbidden; no WebP -> inline vector fallback.
// Does not change any original Git blobs. Runs before and after Vite build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const mode=process.argv[3]||'source';
const check=mode==='dist'?path.join(root,'dist'):path.join(root,'public');
assert.ok(fs.existsSync(check),'Missing engine asset directory');
const errors=[];
let raster=0,webp=0,svg=0,codeFiles=0;
function visit(dir){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,e.name);
  if(e.isDirectory()){visit(full);continue;}
  if(!e.isFile())continue;
  if(/\.svg(?:\.|$)/i.test(e.name)){errors.push('SVG FILE '+full);svg++;continue;}
  if(/\.(?:png|webp|jpg|jpeg|avif)$/i.test(e.name)){
    const b=fs.readFileSync(full);
    if(b.length===0)errors.push('EMPTY ART '+full);
    if(e.name.toLowerCase().endsWith('.webp')){
      webp++;
      if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')
        errors.push('INVALID WEBP '+full);
    }
    if(e.name.toLowerCase().endsWith('.png')){
      if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
        errors.push('INVALID PNG '+full);
    }
    raster++;
  }
  if(/\.(?:html|css|js|mjs)$/i.test(e.name)){
    codeFiles++;
    const s=fs.readFileSync(full,'utf8');
    const bad=/<svg\b|data:image\/svg\+xml|\.svg(?:["'?#]|$)/i.exec(s);
    if(bad) errors.push('SVG REFERENCED '+full+' '+s.slice(Math.max(0,bad.index-90),bad.index+130).replace(/\s+/g,' '));
  }
 }
}
visit(check);
const required=['rk_logo.webp','rk_gold.webp','rk_house.webp','rk_market.webp','rk_royal_button.webp','rk_royal_panel.webp'];
for(const file of required){
 if(!fs.existsSync(path.join(root,'public/rani',file)))errors.push('APPROVED IMAGE MISSING '+file);
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/assets/sprites/buildings.json'),'utf8'));
for(const id of ['keep','gatehouse','gatehouse_shut','wall','tower','round_tower','lookout_tower']){
 const angles=new Set(manifest.filter(x=>x.name===id).map(x=>x.rotation));
 if(angles.size!==4)errors.push('INCOMPLETE 4 DIRECTION SPRITES '+id);
}
assert.ok(raster>500,'2.5D world assets suspiciously missing: '+raster);
assert.ok(webp>=7,'Approved WebP graphics missing: '+webp);
assert.deepEqual(errors,[],'Raster-only image quality gate failed');
console.log('PASS Rani raster-only '+mode,{raster,webp,svg,codeFiles,originalSpriteCount:manifest.length});
