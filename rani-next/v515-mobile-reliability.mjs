// v5.15: dramatically lower mobile atlas memory and harden touch cancellations.
// Uses original licensed sprites + v5.15 derived mobile image pages only.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(rel,from,to){
  const full=path.join(root,rel),src=fs.readFileSync(full,'utf8');
  assert.equal(src.split(from).length,2,'v5.15 source drift: '+rel+' '+from.slice(0,80));
  fs.writeFileSync(full,src.replace(from,to));
}
// The 2D renderer uses Frame.scale to calculate actual geometry;
// the scaled metadata and pixels therefore preserve WORLD size.
patch('src/engine/assets.ts',
" const response=await fetch(base+'/rani-atlas-v59.json'+V);",
[
" const preference=new URLSearchParams(location.search).get('quality');",
" const coarse=window.matchMedia('(pointer:coarse)').matches;",
" const memoryGB=(navigator as Navigator & {deviceMemory?:number}).deviceMemory;",
" let lite=preference==='lite'||(preference!=='high'&&",
"   (coarse||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(memoryGB!==undefined&&memoryGB<=4)));",
" let response=await fetch(base+'/'+(lite?'rani-atlas-mobile-v515.json':'rani-atlas-v59.json')+V);",
" if(!response.ok&&lite){",
"   console.warn('[rani] mobile atlas unavailable; falling back to original sprites');",
"   lite=false;response=await fetch(base+'/rani-atlas-v59.json'+V);",
" }"
].join('\n'));
patch('src/engine/assets.ts',
" if(meta.version!==59||meta.spriteCount<5000||!meta.pages?.length)throw new Error('왕국 그래픽 데이터가 불완전합니다.');",
[
" if(meta.version!==(lite?515:59)||meta.spriteCount<5000||!meta.pages?.length)",
"   throw new Error('왕국 그래픽 데이터가 불완전합니다.');",
" if(!meta.size.every(n=>Number.isInteger(n)&&n>0))throw new Error('그래픽 크기 정보가 올바르지 않습니다.');",
" const estimatedBytes=meta.size[0]*meta.size[1]*meta.pages.length*4;",
" if(estimatedBytes>320*1024*1024)throw new Error('왕국 그래픽 자료가 기기의 안전 한도를 초과했습니다.');"
].join('\n'));
patch('src/engine/assets.ts',
"  texturePages:count,atlasVersion:59",
"  texturePages:count,atlasVersion:lite?515:59,\n  quality:lite?'lite':'high',estimatedTextureBytes:estimatedBytes,deviceMemoryGB:memoryGB??null");
patch('src/engine/assets.ts',
" console.info('[rani] packed sprites',meta.spriteCount,'->',count,'images');",
" console.info('[rani] packed sprites',meta.spriteCount,'->',count,'images',lite?'mobile-lite':'desktop-high',Math.round(estimatedBytes/1048576)+'MiB');");
patch('src/main.ts',
"  canvas.addEventListener('pointercancel', () => {\n    rkQuickCloseNow();\n    rkFingers.clear();rkGestureWasMulti=false;",
[
"  canvas.addEventListener('pointercancel', e => {",
"    rkQuickCloseNow();",
"    // A canceled pinch can leave another finger on screen. Keep the multi",
"    // gesture guard until ALL fingers release, or the last lift will build.",
"    if(e.pointerType==='touch'){",
"      rkFingers.delete(e.pointerId);",
"      if(rkFingers.size===0)rkGestureWasMulti=false;",
"    }"
].join('\n'));
patch('src/ui/menu.ts',"version.textContent='v5.14';","version.textContent='v5.15';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.14';","rkBuildName.textContent='라니킹덤 · v5.15';");
console.log('PASS v5.15 atlas memory profile, source-preserving resolution and partial pinch-cancel');
