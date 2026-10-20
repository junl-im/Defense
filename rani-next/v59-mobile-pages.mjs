// v5.9 — prevent mobile Github Pages 429s by removing 6,900 sprite requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function replace(rel,before,after){
 const p=path.join(root,rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(before).length,2,'Source drift '+rel+' '+before.slice(0,95));
 fs.writeFileSync(p,s.replace(before,after));
}
const loader=String.raw`interface RaniOfflineAtlas {
 version: number; spriteCount: number;
 size: [number,number]; scale: number; pages:string[];
 frames: Record<string,Frame>; footprints:Record<string,[number,number]>;
 directions:number; clips:Record<string,ClipMeta>;
}
/** Fetches lossless prebuilt sprite atlases rather than 6,900 original files. */
async function loadRaniOfflineAtlas(base:string,onProgress?: (n:number,total:number)=>void):Promise<CombinedAtlas>{
 const response=await fetch(base+'/rani-atlas-v59.json'+V);
 if(!response.ok)throw new Error('왕국 그래픽 묶음 다운로드에 실패했습니다 (HTTP '+response.status+'). 서버 접속 상태를 확인하세요.');
 const meta=await response.json() as RaniOfflineAtlas;
 if(meta.version!==59||meta.spriteCount<5000||!meta.pages?.length)throw new Error('왕국 그래픽 데이터가 불완전합니다.');
 const [W,H]=meta.size;
 const count=meta.pages.length,layer=W*H*4;
 const bytes=new Uint8Array(layer*count);
 const canvases:HTMLCanvasElement[]=[];
 for(let p=0;p<count;p++){
   const image=await loadImage(base+'/'+meta.pages[p]+V);
   const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   if(!context)throw new Error('기기에서 그래픽 작업 영역을 사용할 수 없습니다.');
   context.drawImage(image,0,0);
   const rgba=context.getImageData(0,0,W,H).data;
   const row=W*4;
   for(let r=0;r<H;r++)bytes.set(rgba.subarray(r*row,(r+1)*row),p*layer+(H-1-r)*row);
   canvases.push(canvas);
   onProgress?.(p+1,count);
 }
 const texture=new THREE.DataArrayTexture(bytes,W,H,count);
 texture.format=THREE.RGBAFormat;texture.type=THREE.UnsignedByteType;
 texture.needsUpdate=true;
 (window as Window&{__rkNetworkSavings?:unknown}).__rkNetworkSavings={
  originalSpriteRequests:meta.spriteCount,
  packedImageRequests:count,
  requestsSaved:meta.spriteCount-count,
  texturePages:count,atlasVersion:59
 };
 console.info('[rani] packed sprites',meta.spriteCount,'->',count,'images');
 return {image:'',size:meta.size,scale:meta.scale,frames:meta.frames,
         footprints:meta.footprints,directions:meta.directions,
         clips:meta.clips,pages:canvases,texture};
}

`;
replace('src/engine/assets.ts',
 'export async function buildCombinedAtlas(base: string, onProgress?: (n:number,total:number)=>void): Promise<CombinedAtlas> {',
 loader+'export async function buildCombinedAtlas(base: string, onProgress?: (n:number,total:number)=>void): Promise<CombinedAtlas> {\n  return loadRaniOfflineAtlas(base,onProgress);');
replace('src/main.ts',"  const use3d = flags.get('r3d') === '1';",[
 "  const use3d=flags.get('r3d')==='1';",
 "  document.documentElement.dataset.rkSceneMode=use3d?'3d':'sprites';",
].join('\n'));
replace('src/ui/menu.ts',"version.textContent='v5.8';","version.textContent='v5.9';");
console.log('PASS v5.9 packed sprites, adaptive mobile, original desktop 3D');
