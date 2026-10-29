// © 2026 곰같은여우. Deterministic CC0 GLB clip-pruner. No new dependencies.
// Retains full skinned mesh and only named animations; rewrites referenced bufferViews.
import fs from 'node:fs';
const align4=n=>(n+3)&~3;
const ensure=(cond,msg)=>{if(!cond)throw Error(msg);};
export function compactGlb(bytes,clipNames){
 const source=Buffer.from(bytes);
 ensure(source.toString('ascii',0,4)==='glTF'&&source.readUInt32LE(4)===2,'Requires glTF 2.0 binary');
 ensure(source.readUInt32LE(8)===source.length,'Corrupt GLB length');
 let offset=12,doc=null,bin=null;
 while(offset<source.length){
  const n=source.readUInt32LE(offset),type=source.readUInt32LE(offset+4);
  const part=source.subarray(offset+8,offset+8+n);
  if(type===0x4e4f534a)doc=JSON.parse(part.toString('utf8'));
  if(type===0x004e4942)bin=part;
  offset+=8+n;
 }
 ensure(doc&&bin&&doc.buffers?.length===1,'Only single-buffer source GLB is supported');
 ensure(Array.isArray(doc.animations),'Animation source is absent');
 const selected=new Set(clipNames);
 const kept=(doc.animations||[]).filter(a=>selected.has(a.name));
 ensure(kept.length===selected.size,'Required animation clip missing: '+[...selected].filter(x=>!kept.some(a=>a.name===x)).join(','));
 doc.animations=kept;
 const used=new Set();
 const requireAccessor=id=>{if(id!==undefined&&id!==null)used.add(id);};
 for(const mesh of doc.meshes||[])for(const primitive of mesh.primitives||[]){
  requireAccessor(primitive.indices);
  Object.values(primitive.attributes||{}).forEach(requireAccessor);
  for(const target of primitive.targets||[])Object.values(target).forEach(requireAccessor);
 }
 for(const skin of doc.skins||[])requireAccessor(skin.inverseBindMatrices);
 for(const a of kept)for(const sampler of a.samplers||[]){requireAccessor(sampler.input);requireAccessor(sampler.output);}
 const accessors=[...used].sort((a,b)=>a-b);
 const aMap=new Map(accessors.map((id,i)=>[id,i]));
 const remapAccessor=id=>{
  if(id===undefined||id===null)return id;
  ensure(aMap.has(id),'Referenced accessor not included');
  return aMap.get(id);
 };
 for(const mesh of doc.meshes||[])for(const p of mesh.primitives||[]){
  if(p.indices!==undefined)p.indices=remapAccessor(p.indices);
  for(const k of Object.keys(p.attributes||{}))p.attributes[k]=remapAccessor(p.attributes[k]);
  for(const target of p.targets||[])for(const k of Object.keys(target))target[k]=remapAccessor(target[k]);
 }
 for(const skin of doc.skins||[])if(skin.inverseBindMatrices!==undefined)skin.inverseBindMatrices=remapAccessor(skin.inverseBindMatrices);
 for(const a of kept)for(const s of a.samplers){s.input=remapAccessor(s.input);s.output=remapAccessor(s.output);}
 const selectedAccessors=accessors.map(id=>doc.accessors[id]);
 ensure(selectedAccessors.every(a=>!a.sparse),'Sparse accessors are not currently supported');
 const viewsUsed=new Set();
 for(const a of selectedAccessors)if(a.bufferView!==undefined)viewsUsed.add(a.bufferView);
 for(const im of doc.images||[])if(im.bufferView!==undefined)viewsUsed.add(im.bufferView);
 const viewIds=[...viewsUsed].sort((a,b)=>a-b);
 const vMap=new Map(viewIds.map((id,i)=>[id,i]));
 const outputViews=[],parts=[];
 let total=0;
 for(const id of viewIds){
  const v=doc.bufferViews[id],start=v.byteOffset||0;
  ensure(v.buffer===0&&start+v.byteLength<=bin.length,'Invalid source buffer view');
  total=align4(total);
  const slice=bin.subarray(start,start+v.byteLength);
  const copy={...v,buffer:0,byteOffset:total};
  outputViews.push(copy);parts.push({offset:total,data:slice});total+=slice.length;
 }
 for(const a of selectedAccessors)if(a.bufferView!==undefined)a.bufferView=vMap.get(a.bufferView);
 for(const im of doc.images||[])if(im.bufferView!==undefined)im.bufferView=vMap.get(im.bufferView);
 doc.accessors=selectedAccessors;doc.bufferViews=outputViews;
 doc.buffers=[{byteLength:total}];
 const outBin=Buffer.alloc(align4(total));
 for(const part of parts)part.data.copy(outBin,part.offset);
 const rawJson=Buffer.from(JSON.stringify(doc),'utf8');
 const outJson=Buffer.alloc(align4(rawJson.length),0x20);
 rawJson.copy(outJson);
 const length=12+8+outJson.length+8+outBin.length;
 const out=Buffer.alloc(length);
 out.write('glTF',0,'ascii');out.writeUInt32LE(2,4);out.writeUInt32LE(length,8);
 out.writeUInt32LE(outJson.length,12);out.writeUInt32LE(0x4e4f534a,16);
 outJson.copy(out,20);
 const o=20+outJson.length;
 out.writeUInt32LE(outBin.length,o);out.writeUInt32LE(0x004e4942,o+4);
 outBin.copy(out,o+8);
 return out;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const [input,output,...clips]=process.argv.slice(2);
 ensure(input&&output&&clips.length,'Usage: node compact-glb.mjs IN OUT ClipName...');
 const raw=fs.readFileSync(input),small=compactGlb(raw,clips);
 fs.writeFileSync(output,small);
 console.log(JSON.stringify({original:raw.length,compact:small.length,ratio:(small.length/raw.length).toFixed(3),clips}));
}
