// v5.32: test every real shipped region against the original terrain generator.
// No approximated "rating" bars: inspect actual corner levels + ground footprints.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const {build}=await import(pathToFileURL(path.join(root,'node_modules/esbuild/lib/main.js')).href);
async function tsModule(relative){
  const result=await build({entryPoints:[path.join(root,relative)],bundle:true,platform:'node',
    format:'esm',write:false,logLevel:'silent'});
  assert.equal(result.outputFiles.length,1,'Single output required for '+relative);
  const url='data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64');
  return import(url);
}
const {MAPS,MAP_W,MAP_H}=await tsModule('src/game/maps.ts');
const {shapeTerrain,heightFieldOf,isBuildable,findStartSite,GROUND_TYPES}=
  await tsModule('src/game/worldgen.ts');
assert.equal(MAPS.length,13,'The royal coast + 12 stock regions must all remain accessible');
const bad=new Set(['marsh','water']);
const stats=[];
for(const m of MAPS){
  const shape=shapeTerrain(m,MAP_W,MAP_H),field=heightFieldOf(shape);
  const start=findStartSite(field,shape.groundType);
  const ground=(x,z)=>GROUND_TYPES[shape.groundType[z*MAP_W+x]];
  assert.ok(isBuildable(field,start.x-1,start.z-1,5,5),
    m.id+' keep foundation is not 5x5 flat: '+JSON.stringify(start));
  for(let dz=-1;dz<=3;dz++)for(let dx=-1;dx<=3;dx++){
    const g=ground(start.x+dx,start.z+dz);
    assert.ok(!bad.has(g)&&g!=='iron',m.id+' keep occupies unusable '+g+' at '+JSON.stringify(start));
  }
  const resources={dry3:0,green3:0,rock3:0,iron3:0};
  for(let z=start.z-18;z<=start.z+18;z+=2){
    for(let x=start.x-18;x<=start.x+18;x+=2){
      if(Math.hypot(x-start.x,z-start.z)>19 || !isBuildable(field,x,z,3,3))continue;
      const types=[];
      for(let dz=0;dz<3;dz++)for(let dx=0;dx<3;dx++)types.push(ground(x+dx,z+dz));
      if(types.some(v=>bad.has(v)))continue;
      resources.dry3++;
      if(types.every(v=>v==='grass'||v==='grass_dark'))resources.green3++;
      if(types.every(v=>v==='rock'))resources.rock3++;
      if(types.every(v=>v==='iron'))resources.iron3++;
    }
  }
  stats.push({id:m.id,start,...resources});
  assert.ok(resources.dry3>=5,m.id+' has no room to develop near the starting castle: '+JSON.stringify(resources));
}
console.log('PASS v5.32 13/13 map foundation and local dry construction coverage');
for(const s of stats)console.log('MAP_AUDIT '+JSON.stringify(s));
