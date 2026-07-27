import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'); const name='DokkaebiLuckDefense3D_FULL_v1.0.40_AUDIT_ASSET_BOUNDARY_VERIFIED'; const out=path.join(root,'logs/package/1.0.40'); const stage=path.join(out,name);
const skip=(rel)=>['dist','node_modules','.git'].includes(rel.split('/')[0]) || (rel.startsWith('logs/') && rel!=='logs/README.md') || /\.(zip|z\d\d)$/i.test(rel);
function copy(src,dst,rel){if(skip(rel))return; const st=fs.statSync(src); if(st.isDirectory()){fs.mkdirSync(dst,{recursive:true}); for(const n of fs.readdirSync(src))copy(path.join(src,n),path.join(dst,n),rel?`${rel}/${n}`:n);}else{fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);}}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});for(const n of fs.readdirSync(root))copy(path.join(root,n),path.join(stage,n),n);console.log(stage);
