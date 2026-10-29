// © 2026 곰같은여우. Curated upstream CC0 asset intake for Block Survival TPS.
// Does not alter Rani Kingdom or the website. Directly downloads only pinned
// upstream commits, verifies each license, then stages selected models only.
// node BlockSurvivalTPS/tools/acquire-open-assets.mjs [--check|--acquire] [dest]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const registry=JSON.parse(fs.readFileSync(path.join(base,'research','source-lock.json'),'utf8'));
function ensure(ok,msg){if(!ok)throw Error(msg);}
function safeRelative(p){
 ensure(typeof p==='string' && p.length>0 && !p.startsWith('/') && !p.includes('\\') &&
  p.split('/').every(s=>s && s!=='.' && s!=='..'),'Unsafe source path: '+p);
 ensure(!/\.svg$/i.test(p),'No SVG in the project');
 return p;
}
function sha256(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function shell(args,cwd){
 const r=spawnSync('git',args,{cwd,encoding:'utf8',timeout:180000,stdio:'pipe'});
 if(r.error || r.status!==0) throw Error('git '+args.slice(0,2).join(' ')+' failed: '+(r.stderr||r.error||'').slice(-500));
 return (r.stdout||'').trim();
}
export function validateRegistry(data=registry){
 const ids=new Set();
 ensure(data.schema==='block-survival-tps-asset-intake/v1','Wrong registry schema');
 ensure(data.protected_archive==='archive/rani-kingdom-v539-20261029','Rani archive must remain protected');
 ensure(Array.isArray(data.packs)&&data.packs.length===4,'Expected 4 audited source repositories');
 let count=0;
 for(const pack of data.packs){
  ensure(!ids.has(pack.id),'Duplicate pack '+pack.id);ids.add(pack.id);
  ensure(/^KayKit-Game-Assets\/[A-Za-z0-9-]+$/.test(pack.repository),'Unapproved source '+pack.repository);
  ensure(/^[a-f0-9]{40}$/.test(pack.commit),'Source must have a fixed 40-character commit');
  ensure(pack.license==='CC0-1.0' && pack.licenseFile==='LICENSE.txt','Non-CC0 pack rejected');
  safeRelative(pack.prefix.replace(/\/$/,''));
  ensure(Array.isArray(pack.files)&&pack.files.length,'Empty source '+pack.id);
  const uniq=new Set();
  for(const file of pack.files){
   safeRelative(file);
   ensure(/\.(glb|gltf|bin|png|webp)$/i.test(file),'Unapproved asset type '+file);
   ensure(!uniq.has(file),'Duplicate file '+file);uniq.add(file);count++;
  }
  for(const file of pack.files.filter(f=>f.endsWith('.gltf'))){
   ensure(pack.files.includes(file.slice(0,-5)+'.bin'),'Missing glTF BIN sibling: '+file);
  }
 }
 return {repositories:data.packs.length,selectedFiles:count,license:'CC0-1.0',protectedArchive:data.protected_archive};
}
function acquire(dest){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'block-survival-intake-'));
 const report={version:1,verifiedOn:new Date().toISOString(),licensePolicy:'CC0-1.0 only; pack-specific full license in each source folder',sources:[],files:[]};
 try{
  fs.mkdirSync(dest,{recursive:true});
  for(const pack of registry.packs){
   const folder=path.join(temp,pack.id);
   fs.mkdirSync(folder);
   shell(['init','-q'],folder);
   shell(['remote','add','origin','https://github.com/'+pack.repository+'.git'],folder);
   shell(['-c','protocol.version=2','fetch','-q','--depth','1','origin',pack.commit],folder);
   shell(['checkout','-q','--detach','FETCH_HEAD'],folder);
   const actual=shell(['rev-parse','HEAD'],folder);
   ensure(actual===pack.commit,'Upstream commit differs: '+pack.id);
   const licensePath=path.join(folder,pack.licenseFile);
   ensure(fs.existsSync(licensePath)&&/Creative Commons Zero|CC0/i.test(fs.readFileSync(licensePath,'utf8')),
    'License document missing or not CC0: '+pack.id);
   const out=path.join(dest,pack.id);
   fs.mkdirSync(out,{recursive:true});
   fs.copyFileSync(licensePath,path.join(out,'LICENSE.txt'));
   report.sources.push({id:pack.id,source:'https://github.com/'+pack.repository,commit:actual,
    license:'CC0-1.0',licenseSha256:sha256(licensePath)});
   for(const file of pack.files){
    const source=path.resolve(folder,pack.prefix,file);
    ensure(source.startsWith(folder+path.sep)&&fs.existsSync(source),'Source missing: '+file);
    const stat=fs.lstatSync(source);
    ensure(stat.isFile()&&!stat.isSymbolicLink(),'Unsafe asset: '+file);
    ensure(stat.size>0&&stat.size<12*1024*1024,'Oversized/broken source: '+file);
    const target=path.join(out,path.basename(file));
    ensure(!fs.existsSync(target),'Output name collision: '+file);
    fs.copyFileSync(source,target);
    report.files.push({pack:pack.id,name:path.basename(file),bytes:stat.size,sha256:sha256(target),
      origin:pack.prefix+file});
   }
   console.log('OK '+pack.id+': '+pack.files.length+' selected files at '+actual.slice(0,12));
  }
  fs.writeFileSync(path.join(dest,'PROVENANCE.json'),JSON.stringify(report,null,2)+'\n');
  console.log('INTAKE_OK '+report.files.length+' files; verified CC0; no SVG; no game source changes');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
const mode=process.argv[2]||'--check';
if(mode==='--check') console.log(JSON.stringify(validateRegistry(),null,2));
else if(mode==='--acquire') { validateRegistry(); acquire(path.resolve(process.argv[3]||path.join(base,'research','acquired'))); }
else throw Error('Usage: node BlockSurvivalTPS/tools/acquire-open-assets.mjs --check|--acquire [output]');
