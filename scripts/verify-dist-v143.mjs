import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),dist=process.env.DIST_DIR?path.resolve(process.env.DIST_DIR):path.join(root,'dist');const collect=(dir,exts,out=[])=>{if(!fs.existsSync(dir))return out;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())collect(full,exts,out);else if(exts.some((ext)=>entry.name.endsWith(ext)))out.push(full)}return out};
if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('dist/index.html missing');const version=JSON.parse(fs.readFileSync(path.join(dist,'version.json'),'utf8'));if(version.releaseVersion!=='1.0.43'||version.buildId!=='b24.43')throw new Error('v1.0.43 dist identity mismatch');
const js=collect(dist,['.js']).map((file)=>fs.readFileSync(file,'utf8')).join('\n'),css=collect(dist,['.css']).map((file)=>fs.readFileSync(file,'utf8')).join('\n'),index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
if(!js.includes('DD-MOBILE-INPUT-RECOVERY-V143')||!js.includes('mobile-input-recovery-v143'))throw new Error('v143 mobile input recovery runtime missing');
if(!css.includes('summon-visibility-v143')||!css.includes('finger-occlusion safety'))throw new Error('v143 summon visibility CSS missing');
if(!index.includes('data-summon-visibility-v143="enhanced"'))throw new Error('v143 summon visibility markup missing');
if(index.includes('수호대를 전장으로 부르는 중...')||index.includes('loading-wrap'))throw new Error('legacy loading presentation returned');
console.log('PASS v1.0.43 dist contains mobile input recovery, summon finger-safety, and retired legacy loading');
