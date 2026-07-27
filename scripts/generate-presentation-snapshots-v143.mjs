import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const root=process.cwd(),checkMode=process.argv.includes('--check'),index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const normalize=(value)=>value.replace(/\?rev=[^"']+/g,'?rev=CACHE').replace(/\?v=[^"']+/g,'?v=CACHE').replace(/\s+/g,' ').trim();
const section=(id)=>{const pattern=new RegExp(`<([a-z]+)[^>]*id=["']${id}["'][\\s\\S]*?<\\/\\1>`,'i');return normalize(index.match(pattern)?.[0]||'')};
const hash=(value)=>createHash('sha256').update(value).digest('hex');
const loading=section('loading'),title=section('title-screen'),dock=section('action-dock');
const report={id:'DD-PRESENTATION-SNAPSHOTS-V143',surfaces:{loading:{sha256:hash(loading),bytes:Buffer.byteLength(loading),hidden:/hidden aria-hidden=["']true["']/.test(loading),legacyArtwork:/(loading-wrap|loading-mascot|수호대를 전장으로 부르는 중)/.test(loading)},title:{sha256:hash(title),bytes:Buffer.byteLength(title),hasCurrentTitle:title.includes('도깨비 럭 디펜스 3D')},combatDock:{sha256:hash(dock),bytes:Buffer.byteLength(dock),hasSummonV143:dock.includes('data-summon-visibility-v143="enhanced"'),hasWaveButton:dock.includes('id="wave-btn"')}}};
const target=path.join(root,'docs/generated/presentation-surface-snapshots-v143.json'),text=JSON.stringify(report,null,2)+'\n';
if(checkMode){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==text){console.error('FAIL stale v1.0.43 presentation snapshot');process.exit(1)}if(!report.surfaces.loading.hidden||report.surfaces.loading.legacyArtwork||!report.surfaces.title.hasCurrentTitle||!report.surfaces.combatDock.hasSummonV143){console.error('FAIL v1.0.43 presentation surface contract');process.exit(1)}console.log('PASS v1.0.43 boot/title/combat DOM presentation snapshots and legacy-loading exclusion');process.exit(0)}
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);console.log('WROTE '+path.relative(root,target));
