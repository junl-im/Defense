import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { resolveSummonButtonStateV142, syncSummonButtonPresentationV142, SUMMON_BUTTON_PRESENTATION_V142_ID } from '../src/runtime/summon-button-presentation-v142.js';

const root = path.resolve(import.meta.dirname, '..');
const fail = (message) => { throw new Error(message); };
const pngPath = path.join(root, 'src/assets/ui-v142/random-summon-emblem-v142.png');
const data = fs.readFileSync(pngPath);
if (!data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) fail('summon emblem is not PNG');
let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = -1, interlace = -1; const idat = [];
while (offset < data.length) {
  const length = data.readUInt32BE(offset); const type = data.toString('ascii', offset + 4, offset + 8); const chunk = data.subarray(offset + 8, offset + 8 + length);
  if (type === 'IHDR') { width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); bitDepth = chunk[8]; colorType = chunk[9]; interlace = chunk[12]; }
  if (type === 'IDAT') idat.push(chunk);
  offset += 12 + length;
}
if (width !== 256 || height !== 256 || bitDepth !== 8 || colorType !== 6 || interlace !== 0) fail('summon emblem must be 256x256 RGBA non-interlaced');
const raw = zlib.inflateSync(Buffer.concat(idat)); const bpp = 4, stride = width * bpp; const pixels = Buffer.alloc(stride * height);
const paeth = (a,b,c) => { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:pb<=pc?b:c; };
let input = 0;
for (let y=0;y<height;y++) {
  const filter=raw[input++]; const row=y*stride;
  for (let x=0;x<stride;x++) {
    const value=raw[input++], left=x>=bpp?pixels[row+x-bpp]:0, up=y?pixels[row-stride+x]:0, upLeft=y&&x>=bpp?pixels[row-stride+x-bpp]:0;
    pixels[row+x]=(value + (filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,upLeft):fail('unsupported PNG filter'))) & 255;
  }
}
let edgeMax=0, minX=width, minY=height, maxX=-1, maxY=-1, visible=0;
for (let y=0;y<height;y++) for (let x=0;x<width;x++) { const alpha=pixels[y*stride+x*4+3]; if (x===0||y===0||x===width-1||y===height-1) edgeMax=Math.max(edgeMax,alpha); if(alpha){visible++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);} }
if (edgeMax !== 0) fail('summon emblem clips opaque pixels at outer edge');
if (minX < 2 || minY < 2 || maxX > 253 || maxY > 253 || visible < 18000) fail('summon emblem transparent safety margin or visible area invalid');
if (data.length > 120000) fail('summon emblem file budget exceeded');
const ready=resolveSummonButtonStateV142({gold:100,cost:30,tickets:1}); const short=resolveSummonButtonStateV142({gold:12,cost:30}); const sealed=resolveSummonButtonStateV142({gold:100,cost:30,locked:true});
if(ready.state!=='ready'||ready.disabled||short.state!=='short'||!short.disabled||sealed.state!=='sealed'||!sealed.disabled) fail('summon state resolution');
const attrs={}; const classes=new Set(); const button={dataset:{},disabled:false,classList:{remove:(x)=>classes.delete(x),add:(x)=>classes.add(x)},setAttribute:(k,v)=>attrs[k]=v};
const synced=syncSummonButtonPresentationV142(button,{gold:100,cost:30,tickets:2}); if(synced.state!=='ready'||button.dataset.summonPresentation!==SUMMON_BUTTON_PRESENTATION_V142_ID||attrs['aria-disabled']!=='false') fail('summon button sync');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8'), css=fs.readFileSync(path.join(root,'src/style.css'),'utf8'), main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
for (const marker of ['summon-emblem-v142','data-summon-state-v142']) if(!index.includes(marker)) fail(`index marker ${marker}`);
for (const marker of ['summon-ready-v142','summon-cast-v142','random-summon-emblem-v142.png']) if(!css.includes(marker)) fail(`css marker ${marker}`);
for (const marker of ['syncSummonButtonPresentationV142','triggerSummonButtonCastV142']) if(!main.includes(marker)) fail(`runtime marker ${marker}`);
console.log(`PASS v1.0.42 random summon presentation (${data.length} bytes, edge alpha ${edgeMax}, ${visible} visible pixels)`);
