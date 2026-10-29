/**
 * TPS asset intake v0.1 — SHA-pinned, license-audited CC0 seed.
 * node tps-next/tools/acquire-seed.mjs --fetch  (network, verified download)
 * node tps-next/tools/acquire-seed.mjs --verify (offline, no mutations)
 *
 * Fetch ONLY small official KayKit Halloween source assets. Do not substitute
 * GitHub API "raw" responses or unverified third-party mirrors.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import https from 'node:https';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
export const projectRoot=path.resolve(here,'../');
export const target=path.join(projectRoot,'assets/third_party/kaykit-halloween-1.0');
export const source=Object.freeze({
 owner:'KayKit-Game-Assets',
 repo:'KayKit-Halloween-Bits-1.0',
 commit:'6dc69bf6b2fa766a985754f35ec6a0324090e6c6',
 home:'https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0',
 license:'CC0-1.0',
 author:'Kay Lousberg',
});
const part='addons/kaykit_halloween_bits/Assets/gltf/';
export const seedFiles=Object.freeze([
 {from:'LICENSE.txt',to:'LICENSE.txt',sha:'1c10d234eb090aa374f7fb3c23a7da71e74197e3',size:877},
 {from:part+'gravestone.gltf',to:'gravestone.gltf',sha:'7dd75f961293be878d6396873ece88801b8b5dd6',size:3066},
 {from:part+'gravestone.bin',to:'gravestone.bin',sha:'f033d9beb2bd56a80474ce2fd1987d650633506e',size:12316},
 {from:part+'fence.gltf',to:'fence.gltf',sha:'0dafdc846c869b195e5143f0751f566e0d074c21',size:2976},
 {from:part+'fence.bin',to:'fence.bin',sha:'6624621a9bf11eb5b2530014872dec2c09f1c523',size:26728},
 {from:part+'tree_dead_small.gltf',to:'tree_dead_small.gltf',sha:'8e39cea461e19e7267ea8758ae6497beebeadd1d',size:3076},
 {from:part+'tree_dead_small.bin',to:'tree_dead_small.bin',sha:'2869cc05c3fa15d376c0188df5aa9e43801f1619',size:5072},
 {from:part+'halloweenbits_texture.png',to:'halloweenbits_texture.png',sha:'82313b530486a944133d4aaacfeaf099f07218c3',size:15093},
]);
export function blobHash(bytes){
 return crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
}
export function safeExternalURI(uri){
 return typeof uri==='string' && !uri.includes('/') && !uri.includes('\\') &&
        !uri.includes('..') && !uri.includes(':') && uri.length>0;
}
export function verifyFile(record,bytes){
 if(bytes.length!==record.size)throw Error('size mismatch: '+record.to);
 const actual=blobHash(bytes);
 if(actual!==record.sha)throw Error('origin SHA mismatch: '+record.to+' '+actual);
 return actual;
}
function readURL(url,maxBytes){
 return new Promise((resolve,reject)=>{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||parsed.hostname!=='raw.githubusercontent.com')throw Error('source host not approved');
  const req=https.get(parsed,{timeout:20000,headers:{'User-Agent':'RaniTPS-Audit/1.0'}},res=>{
   if(res.statusCode!==200){res.resume();reject(Error('HTTP '+res.statusCode+' '+parsed.pathname));return;}
   const parts=[];let size=0;
   res.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){req.destroy(Error('file too large'));return;}parts.push(chunk);});
   res.on('end',()=>resolve(Buffer.concat(parts)));
   res.on('error',reject);
  });
  req.on('timeout',()=>req.destroy(Error('timeout')));
  req.on('error',reject);
 });
}
export async function fetchSeed(dest=target){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rani-tps-seed-'));
 try{
  for(const rec of seedFiles){
   const url='https://raw.githubusercontent.com/'+source.owner+'/'+source.repo+'/'+source.commit+'/'+rec.from;
   const bytes=await readURL(url,Math.min(rec.size+8192,2*1024*1024));
   verifyFile(rec,bytes);
   fs.writeFileSync(path.join(tmp,rec.to),bytes,{flag:'wx'});
  }
  const report=auditSeed(tmp);
  if(!report.ok)throw Error('seed audit failed: '+report.issues.join('; '));
  fs.mkdirSync(dest,{recursive:true});
  for(const rec of seedFiles){
   const out=path.join(dest,rec.to);
   if(fs.existsSync(out)){
    verifyFile(rec,fs.readFileSync(out));
    continue;
   }
   fs.copyFileSync(path.join(tmp,rec.to),out,fs.constants.COPYFILE_EXCL);
  }
  fs.writeFileSync(path.join(dest,'PROVENANCE.json'),JSON.stringify({
   source,files:seedFiles,verified_at:new Date().toISOString(),
   note:'CC0 original source, preserve author and license. NOT YET APPROVED for final game visual style.',
  },null,2)+'\n');
  return auditSeed(dest);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
export function auditSeed(dir=target){
 const issues=[];
 const names=new Set(seedFiles.map(r=>r.to));
 for(const rec of seedFiles){
  const filename=path.join(dir,rec.to);
  if(!fs.existsSync(filename)){issues.push('missing: '+rec.to);continue;}
  try{
   if(!fs.statSync(filename).isFile())throw Error('not a file');
   const data=fs.readFileSync(filename);
   verifyFile(rec,data);
   if(rec.to==='LICENSE.txt'&&!data.toString('utf8').includes('Creative Commons Zero'))throw Error('CC0 license text absent');
   if(rec.to.endsWith('.gltf')){
    const doc=JSON.parse(data.toString('utf8'));
    if(doc.asset?.version!=='2.0'||!Array.isArray(doc.meshes)||!doc.meshes.length)throw Error('invalid glTF');
    const uris=[...(doc.buffers||[]).map(x=>x.uri),...(doc.images||[]).map(x=>x.uri)];
    for(const uri of uris){
     if(!safeExternalURI(uri)||!names.has(uri))throw Error('external/unlisted resource: '+uri);
     if(!fs.existsSync(path.join(dir,uri)))throw Error('dependency missing: '+uri);
    }
   }
  }catch(e){issues.push(rec.to+': '+e.message);}
 }
 const extra=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>!names.has(x)&&x!=='PROVENANCE.json'):[];
 return {ok:issues.length===0,files:seedFiles.length,bytes:seedFiles.reduce((s,x)=>s+x.size,0),issues,extra,license:source.license};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const action=process.argv[2];
 try{
  let result;
  if(action==='--fetch')result=await fetchSeed();
  else if(action==='--verify')result=auditSeed();
  else throw Error('Usage: node tps-next/tools/acquire-seed.mjs --fetch|--verify');
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
 }catch(e){console.error('FAIL seed intake:',e.message);process.exitCode=1;}
}
