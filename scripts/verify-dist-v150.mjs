import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertReachableBundleMarkers } from './lib/dist-bundle-markers.mjs';
const root=path.resolve(import.meta.dirname,'..');
const dist=process.env.DIST_DIR?path.resolve(process.env.DIST_DIR):path.join(root,'dist');
const reportDir=path.join(root,'logs/qa/v150');
const versionPath=path.join(dist,'version.json');
if(!fs.existsSync(versionPath))throw new Error('v150 dist/version.json missing');
const version=JSON.parse(fs.readFileSync(versionPath,'utf8'));
const patchRevision=Number(String(version.releaseVersion||'').split('.')[2]);
if(!Number.isInteger(patchRevision)||patchRevision<50||version.buildId!==`b24.${patchRevision}`||version.cacheRevision!==`${version.releaseVersion}-${version.buildId}`)throw new Error('v1.0.50+ dist identity mismatch');
for(const required of ['index.html','assets/game.js','assets/game.css','sw.js','release-identity.generated.js'])if(!fs.existsSync(path.join(dist,required)))throw new Error(`v150 complete Vite dist missing: ${required}`);
if(fs.existsSync(path.join(dist,'src'))||fs.existsSync(path.join(dist,'STATIC_BUILD_NOTICE.txt')))throw new Error('v150 requires bundled Vite output, not static fallback');
const bundle=assertReachableBundleMarkers(dist,['DD-ATOMIC-SAVE-SNAPSHOT-V150','DD-PERSISTENT-REWARD-ORCHESTRATOR-V150','DD-PRODUCTION-ERROR-BOUNDARY-V150','DD-TRANSACTIONAL-PERSISTENCE-V149'],{label:'v150 bundled runtime'});
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
if(!html.includes('runtime-error-v150')||html.includes('게임 모듈 로딩 오류: ${reason}'))throw new Error('v150 production error boundary missing or exposes raw detail');
const files=[];const sha=(data)=>createHash('sha256').update(data).digest('hex');
function walk(directory,relative=''){for(const name of fs.readdirSync(directory).sort()){const absolute=path.join(directory,name);const rel=relative?`${relative}/${name}`:name;const stat=fs.statSync(absolute);if(stat.isDirectory())walk(absolute,rel);else if(stat.isFile()){const data=fs.readFileSync(absolute);files.push({path:rel,bytes:data.length,sha256:sha(data)});}}}
walk(dist);files.sort((a,b)=>a.path.localeCompare(b.path));
const report={id:'DD-VITE-DIST-MANIFEST-V150',releaseVersion:version.releaseVersion,buildId:version.buildId,fileCount:files.length,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),aggregateSha256:sha(Buffer.from(files.map((file)=>`${file.path}\0${file.bytes}\0${file.sha256}`).join('\n'))),files};
fs.mkdirSync(reportDir,{recursive:true});fs.writeFileSync(path.join(reportDir,'dist-build-manifest.json'),`${JSON.stringify(report,null,2)}\n`);
const tasks=['scripts/verify-atomic-save-snapshot-v150.mjs','scripts/verify-persistent-rewards-v150.mjs','scripts/verify-production-error-boundary-v150.mjs','scripts/verify-performance-baseline-v150.mjs','scripts/verify-responsibility-extraction-v150.mjs','scripts/verify-v150-foundation-v151.mjs'];
for(const script of tasks){const run=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,env:process.env,encoding:'utf8',timeout:120000,maxBuffer:32*1024*1024});process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');if(run.error||run.status!==0)throw new Error(`v150 dist sub-verifier failed: ${script} (${run.error?.code||run.status})`);}
console.log(`PASS v1.0.50 foundation on forward-compatible Vite dist (${report.fileCount} files, ${bundle.files.length} reachable JS files)`);
