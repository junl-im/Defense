import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const reportDir = path.join(root, 'logs/qa/v149');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v149 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
if (version.releaseVersion !== '1.0.49' || version.buildId !== 'b24.49' || version.cacheRevision !== '1.0.49-b24.49') throw new Error('v1.0.49 dist identity mismatch');
for (const required of ['index.html','assets/game.js','assets/game.css','sw.js','release-identity.generated.js']) if (!fs.existsSync(path.join(dist, required))) throw new Error(`v149 complete Vite dist missing: ${required}`);
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v149 requires bundled Vite output, not static fallback');
const gameJs = fs.readFileSync(path.join(dist, 'assets/game.js'), 'utf8');
for (const marker of ['DD-TRANSACTIONAL-PERSISTENCE-V149','DD-RECOVERY-STATE-V149','DD-RUN-STATE-COORDINATOR-V149','DD-FEATURE-EXPOSURE-POLICY-V149','DD-RUN-RESULT-PRESENTER-V149','__DOKKAEBI_PUBLIC_API__']) if (!gameJs.includes(marker)) throw new Error(`v149 bundled runtime marker missing: ${marker}`);
const files=[]; const sha=(data)=>createHash('sha256').update(data).digest('hex');
function walk(directory,relative=''){for(const name of fs.readdirSync(directory).sort()){const absolute=path.join(directory,name);const rel=relative?`${relative}/${name}`:name;const stat=fs.statSync(absolute);if(stat.isDirectory())walk(absolute,rel);else if(stat.isFile()){const data=fs.readFileSync(absolute);files.push({path:rel,bytes:data.length,sha256:sha(data)});}}}
walk(dist); files.sort((a,b)=>a.path.localeCompare(b.path));
const report={id:'DD-VITE-DIST-MANIFEST-V149',releaseVersion:version.releaseVersion,buildId:version.buildId,fileCount:files.length,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),aggregateSha256:sha(Buffer.from(files.map((file)=>`${file.path}\0${file.bytes}\0${file.sha256}`).join('\n'))),files};
fs.mkdirSync(reportDir,{recursive:true});fs.writeFileSync(path.join(reportDir,'dist-build-manifest.json'),`${JSON.stringify(report,null,2)}\n`);
const tasks=[
  ['scripts/verify-release-identity-v149.mjs',30000,[]],
  ['scripts/generate-build-input-manifest-v149.mjs',120000,['--check']],
  ['scripts/verify-transactional-persistence-v149.mjs',30000,[]],
  ['scripts/verify-recovery-state-v149.mjs',30000,[]],
  ['scripts/verify-feature-exposure-v149.mjs',30000,[]],
  ['scripts/verify-result-presenter-v149.mjs',30000,[]],
  ['scripts/verify-responsibility-extraction-v149.mjs',30000,[]],
  ['scripts/verify-performance-reproducibility-v149.mjs',30000,[]],
  ['scripts/verify-release-v149.mjs',30000,[]],
  ['scripts/run-feature-exposure-v149.mjs',240000,[]]
];
for(const [script,timeout,args] of tasks){const run=spawnSync(process.execPath,[path.join(root,script),...args],{cwd:root,env:process.env,encoding:'utf8',timeout,maxBuffer:32*1024*1024});process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');if(run.error||run.status!==0)throw new Error(`v149 dist sub-verifier failed: ${script} (${run.error?.code||run.status})`);}
console.log(`PASS v1.0.49 complete Vite dist, deterministic dist manifest, and production/QA exposure browser boundary (${report.fileCount} files)`);
