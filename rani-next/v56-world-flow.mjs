// v5.6: real stage flow, image load progress and living coast.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const BT=String.fromCharCode(96),D=String.fromCharCode(36);
const file=x=>path.join(root,x);
function modify(p,a,b){const s=fs.readFileSync(file(p),'utf8');assert.equal(s.split(a).length,2,'Anchor '+p+' '+a.slice(0,60));fs.writeFileSync(file(p),s.replace(a,b));}
// v5.4 quick entry is replaced by a three-screen transition.
// The ORIGINAL chosen MapDef, validated lordScreen promise, and BEGIN
// settlement generation stay in charge of the gameplay and save compatibility.
{
 const p='src/ui/menu.ts',src=fs.readFileSync(file(p),'utf8');
 const a=src.indexOf('    quick.onclick = async () => {');
 const b=src.indexOf("    go.classList.add('rk-manual-start');",a);
 assert.ok(a>0&&b>a,'v5.4 quickstart anchor changed');
 let s=src.slice(0,a)+[
  "    quick.textContent='게임 시작';",
  "    quick.setAttribute('aria-label','게임 시작 · 지역 선택');",
  "    quick.onclick=()=>{",
  "      root.classList.add('rk-choose-region');",
  "      const region=root.querySelector<HTMLDetailsElement>('#rani-map-picker');",
  "      if(region)region.open=true;",
  "    };",
  "    go.textContent='다음 · 영주 선택';",
  "    const backToTitle=document.createElement('button');",
  "    backToTitle.id='rk-region-back';backToTitle.type='button';",
  "    backToTitle.textContent='← 첫 화면';",
  "    backToTitle.onclick=()=>{",
  "      root.classList.remove('rk-choose-region');",
  "      const region=root.querySelector<HTMLDetailsElement>('#rani-map-picker');",
  "      if(region)region.open=false;",
  "    };",
 ].join('\n')+'\n'+src.slice(b);
 assert.ok(s.includes('    acts.append(quick, go);'));
 s=s.replace('    acts.append(quick, go);','    acts.append(quick, go, backToTitle);');
 assert.ok(s.includes("version.textContent='v5.5'"));
 s=s.replace("version.textContent='v5.5'","version.textContent='v5.6'");
 fs.writeFileSync(file(p),s);
}
{
 const p='index.html',s=fs.readFileSync(file(p),'utf8');
 const original='<div id="loading">building the world…</div>';
 assert.ok(s.includes(original));
 fs.writeFileSync(file(p),s.replace(original,[
 '<div id="loading" role="progressbar" aria-label="왕국 준비 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">',
 ' <div class="rk-load-card">',
 '  <img src="/rani/rk_logo.webp" class="rk-load-logo" alt="라니킹덤">',
 '  <p class="rk-load-crest">✦　왕국이 깨어납니다　✦</p>',
 '  <p class="rk-load-stage" aria-live="polite">왕국으로 향하는 중</p>',
 '  <div class="rk-load-track"><div class="rk-load-bar"></div></div>',
 '  <div class="rk-load-foot"><span>라니킹덤</span><strong class="rk-load-value">0%</strong></div>',
 ' </div>',
 '</div>'
 ].join('\n')));
}
// Loader derives progress from REAL completed tile & sprite image requests.
{
 const p='src/engine/assets.ts';let s=fs.readFileSync(file(p),'utf8');
 function rep(a,b){assert.equal(s.split(a).length,2,'asset drift '+a.slice(0,60));s=s.replace(a,b);}
 rep('export async function loadTileArray(base: string): Promise<{',
     'export async function loadTileArray(base: string, onProgress?: (n:number,total:number)=>void): Promise<{');
 const tile='      const img = await loadImage('+BT+D+'{base}/'+D+'{types[t]}_'+D+'{v}.png'+D+'{V}'+BT+');';
 rep(tile,tile+'\n      onProgress?.(t*variants+v+1,depth);');
 rep('  maxH = 8192,\n): Promise<PackedAtlas> {',
 '  maxH = 8192,\n  onProgress?: (n:number,total:number)=>void,\n): Promise<PackedAtlas> {');
 const atlasStart=s.indexOf('  const loaded = await Promise.all(entries.map(async e => ({');
 const atlasEnd=s.indexOf('  })));',atlasStart)+'  })));'.length;
 assert.ok(atlasStart>0&&atlasEnd>atlasStart,'packFrames loader changed');
 s=s.slice(0,atlasStart)+[
 '  let loadedCount=0;',
 '  const loaded=await Promise.all(entries.map(async e=>{',
 '    const img=await loadImage('+BT+D+'{base}/'+D+'{e.file}'+D+'{V}'+BT+');',
 '    onProgress?.(++loadedCount,entries.length);',
 '    return {e,img};',
 '  }));'
 ].join('\n')+s.slice(atlasEnd);
 rep('export async function buildCombinedAtlas(base: string): Promise<CombinedAtlas> {',
     'export async function buildCombinedAtlas(base: string, onProgress?: (n:number,total:number)=>void): Promise<CombinedAtlas> {');
 rep('const packed = await packFrames(base, entries, bMeta[0]?.scale ?? 2, 2, 8192, maxH);',
     'const packed = await packFrames(base, entries, bMeta[0]?.scale ?? 2, 2, 8192, maxH, onProgress);');
 fs.writeFileSync(file(p),s);
}
// Animated water is injected into the existing actual terrain shader
// AFTER v5.2 shoreline work; land/height/collision are not touched.
{
 const p='src/engine/terrain.ts';let s=fs.readFileSync(file(p),'utf8');
 function rep(a,b){assert.equal(s.split(a).length,2,'sea shader drift '+a.slice(0,60));s=s.replace(a,b);}
 rep('        uTiles: { value: texture },','        uTiles: { value: texture },\n        uRaniSeaSeconds: { value: 0 },');
 rep('        uniform sampler2DArray uTiles;','        uniform sampler2DArray uTiles;\n        uniform float uRaniSeaSeconds;');
 rep('          // In build mode, wash legal ground green and mute everything else, so',
 [
 '          // Animated royal sea: actual tile shader, water layer index 6 only.',
 '          if(floor(vLayer/uVariants+0.001) == 6.0){',
 '            float swell=sin(vWorld.x*3.3+vWorld.z*3.9-uRaniSeaSeconds*1.3)',
 '              *cos(vWorld.z*2.7-vWorld.x*1.1-uRaniSeaSeconds*.8);',
 '            float sparkle=pow(max(0.0,sin(vWorld.x*8.0-vWorld.z*3.3+uRaniSeaSeconds*1.5)),10.0);',
 '            float ripple=.014*swell+.025*sparkle;',
 '            colour=clamp(colour*vec3(.988,1.005,1.028)+ripple*vec3(.42,.84,1.0),0.0,1.0);',
 '          }',
 '',
 '          // In build mode, wash legal ground green and mute everything else, so'
 ].join('\n'));
 rep('  setOverlay(test: ((x: number, z: number) => boolean) | null): void {',
 "  setRaniSeaTime(seconds:number):void{this.material.uniforms.uRaniSeaSeconds.value=seconds;}\n\n  setOverlay(test: ((x: number, z: number) => boolean) | null): void {");
 fs.writeFileSync(file(p),s);
}
{
 const p='src/main.ts';let s=fs.readFileSync(file(p),'utf8');
 function rep(a,b){assert.equal(s.split(a).length,2,'game drift '+a.slice(0,60));s=s.replace(a,b);}
 rep('async function main(chosen: MapDef, restore: SaveGame | null = null,',[
 'let rkLoadProgress=0;',
 'function rkLoading(stage:string,fraction?:number):void{',
 " const root=document.getElementById('loading');if(!root)return;",
 " const text=root.querySelector<HTMLElement>('.rk-load-stage');",
 " const bar=root.querySelector<HTMLElement>('.rk-load-bar');",
 " const number=root.querySelector<HTMLElement>('.rk-load-value');",
 ' if(!text||!bar||!number){root.textContent=stage;return;}',
 ' text.textContent=stage;',
 ' if(fraction!==undefined){',
 '  rkLoadProgress=Math.max(rkLoadProgress,Math.min(1,Math.max(0,fraction)));',
 '  const n=Math.floor(rkLoadProgress*100);',
 "  bar.style.width=n+'%';number.textContent=n+'%';",
 "  root.setAttribute('aria-valuenow',String(n));",
 ' }',
 '}',
 '',
 'async function main(chosen: MapDef, restore: SaveGame | null = null,'
 ].join('\n'));
 rep('  legacyHud.remove();\n\n  const renderer',
 "  rkLoadProgress=0;rkLoading('왕국을 준비하고 있습니다',0.02);\n  legacyHud.remove();\n\n  const renderer");
 rep('  const [tiles, atlas, models, units, ground] = await Promise.all([',
 [
 '  let landDone=0,landTotal=1,spriteDone=0,spriteTotal=1;',
 "  const report=(kind:'land'|'art',n:number,total:number)=>{",
 "    if(kind==='land'){landDone=n;landTotal=Math.max(1,total);}",
 '    else {spriteDone=n;spriteTotal=Math.max(1,total);}',
 '    const ratio=.04+.18*landDone/landTotal+.64*spriteDone/spriteTotal;',
 "    rkLoading(kind==='land'?'땅과 해안을 준비하는 중':'건축물과 캐릭터를 준비하는 중',ratio);",
 '  };',
 '  const [tiles, atlas, models, units, ground] = await Promise.all(['
 ].join('\n'));
 rep("    loadTileArray('/assets/tiles'),","    loadTileArray('/assets/tiles',(n,total)=>report('land',n,total)),");
 rep("    buildCombinedAtlas('/assets/sprites'),","    buildCombinedAtlas('/assets/sprites',(n,total)=>report('art',n,total)),");
 rep('  const terrain = new Terrain({ width: MAP_W, height: MAP_H, layers: 20 }, tiles.texture);',
 "  rkLoading('왕국 지형을 생성하는 중',0.87);\n  const terrain = new Terrain({ width: MAP_W, height: MAP_H, layers: 20 }, tiles.texture);");
 rep('  // ONE batch for the whole scene. Everything is drawn in a single',
 [
 '  // Real-world, decorative approved WebP ships; no harbor economy yet.',
 '  const rkSeaShips: THREE.Sprite[]=[];',
 "  if((chosen.id==='rani_coast'||chosen.id==='coast')){",
 '   try{',
 "    const texture=await new THREE.TextureLoader().loadAsync('/rani/rk_ship.webp');",
 '    texture.colorSpace=THREE.SRGBColorSpace;',
 '    const mat=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,alphaTest:.05});',
 "    const waterType=GROUND_TYPES.indexOf('water');",
 '    const water=(x:number,z:number)=>x>=0&&x<MAP_W&&z>=0&&z<MAP_H&&groundType[z*MAP_W+x]===waterType;',
 '    // Scan actual navigable water instead of guessing a fixed coastline.',
 '    const sites:{x:number,z:number}[]=[];',
 '    for(let z=MAP_H-10;z>=10&&sites.length<3;z-=2){',
 '     for(let x=12;x<MAP_W-12&&sites.length<3;x+=2){',
 '      if(![[0,0],[-2,0],[2,0],[0,-2],[0,2]].every(([dx,dz])=>water(x+dx,z+dz)))continue;',
 '      if(sites.some(p=>Math.hypot(p.x-x,p.z-z)<32))continue;',
 '      sites.push({x,z});',
 '     }',
 '    }',
 '    for(const {x,z} of sites){',
 '     const vessel=new THREE.Sprite(mat);',
 '     vessel.name=\'rk-coast-trade-ship\';',
 '     vessel.position.set(x+.5,terrain.heightAt(x,z)+2.3,z+.5);',
 '     vessel.scale.set(7.2,4.9,1);',
 '     vessel.userData.originalY=vessel.position.y;',
 '     vessel.userData.wavePhase=x*.31;',
 '     scene.add(vessel);rkSeaShips.push(vessel);',
 '    }',
 "   }catch(error){console.warn('[rani] optional ship artwork could not load',error);}",
 '  }',
 '  // ONE batch for the whole scene. Everything is drawn in a single'
 ].join('\n'));
 rep('  function frame() {\n    const now = performance.now();',
 "  function frame() {\n    const now = performance.now();\n    if((chosen.id==='rani_coast'||chosen.id==='coast')){\n      terrain.setRaniSeaTime(now/1000);\n      for(const ship of rkSeaShips){\n        ship.position.y=(ship.userData.originalY as number)+Math.sin(now/1550+(ship.userData.wavePhase as number))*.06;\n      }\n    }");
 rep('    state, workers, placement, terrain, iso, stepSim,','    state, workers, placement, terrain, iso, stepSim,\n    rkSeaShips,');
 // Preserve original 3D diagnostics, but no longer overwrite nested loader DOM.
 let n=0;
 s=s.replace(/loading\.textContent = ([^\n;]+);/g,(_all,expression)=>{
   n++;
   if(expression.includes('loading models'))return "rkLoading('3D 건축 모델을 불러오는 중 '+done+'/'+total);";
   if(expression.includes('warming up the graphics'))return "rkLoading('빛과 그림자를 준비하는 중',0.95);";
   if(expression.includes('building '))return "rkLoading('선택한 왕국을 건설하는 중');";
   if(expression.includes('loading '))return "rkLoading('저장한 왕국을 불러오는 중');";
   if(expression.includes('mustering '))return "rkLoading('영주를 준비하는 중');";
   if(expression.includes('opening the editor'))return "rkLoading('지도 제작실을 여는 중');";
   return 'rkLoading('+expression+');';
 });
 assert.ok(n>=5&&n<=9,'Loading content replacement count '+n);
 rep("  loading.classList.add('done');\n  frame();",
 "  rkLoading('왕국 준비 완료',1);\n  loading.classList.add('done');\n  frame();");
 const errorText="document.getElementById('loading')!.textContent = "+BT+'error: '+D+'{err.message}'+BT+';';
 assert.ok(s.includes(errorText),'Boot errors changed');
 s=s.replace(errorText,"rkLoading('왕국 준비에 실패했습니다 · '+err.message);");
 fs.writeFileSync(file(p),s);
}
{
 // Real end-to-end engine smoke follows the new title stage.
 const p='tools/e2e/smoke.mjs';
 let s=fs.readFileSync(file(p),'utf8');
 const oldText='await ev('+BT+"[...document.querySelectorAll('button')].find(b => /영주 선택/.test(b.textContent)).click()"+BT+');';
 assert.ok(s.includes(oldText),'Smoke start changed');
 s=s.replace(oldText,"await ev("+BT+"document.querySelector('#rk-start-now').click()"+BT+");\n"+oldText);
 fs.writeFileSync(file(p),s);
}
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v56-style.css'),'utf8'));
console.log('PASS v5.6 ordered region/lord, measured asset bar, coast shader/ships');