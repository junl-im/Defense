import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const json=(file)=>JSON.parse(read(file));
const failures=[];const check=(value,label)=>{if(!value)failures.push(label);};
const pkg=json('package.json'), lock=json('package-lock.json'), version=json('public/version.json');
check(pkg.version==='1.0.50'&&pkg.dokkaebi?.buildId==='b24.50'&&pkg.dokkaebi?.cacheRevision==='1.0.50-b24.50','package identity');
check(lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version,'lock identity');
check(version.releaseVersion===pkg.version&&version.buildId==='b24.50','public identity');
const manifest=json('docs/generated/build-input-manifest-v150.json');
check(manifest.id==='DD-BUILD-INPUT-MANIFEST-V150'&&manifest.releaseVersion==='1.0.50'&&manifest.fileCount>2000,'v150 build input manifest');
const baseline=json('docs/PERFORMANCE_BASELINE_STATUS_v1.0.50.json');
check(baseline.status==='ci-capture-required'&&baseline.approvedBaselinePresent===false,'honest performance baseline status');
for(const file of [
  'src/runtime/atomic-save-snapshot-v150.js','src/runtime/persistent-reward-orchestrator-v150.js','src/runtime/production-error-boundary-v150.js',
  'scripts/capture-runtime-baseline-v150.mjs','scripts/promote-runtime-baseline-v150.mjs','scripts/verify-performance-baseline-v150.mjs',
  'docs/PATCH_NOTES_v1.0.50.md','docs/RELEASE_ASSURANCE_v1.0.50.md','docs/PATCH_APPLY_v1.0.50.md','docs/NEXT_UPDATE_v1.0.51.md',
  'docs/PATCH_PROVENANCE_v1.0.50.json','scripts/v150-patch-files.mjs'
]) check(fs.existsSync(path.join(root,file)),`contract ${file}`);
const workflow=read('.github/workflows/deploy.yml');
check(workflow.includes('logs/qa/v150')&&workflow.includes('capture:baseline:v150')&&workflow.includes('v1.0.50-runtime-baseline-candidate'),'CI v150 baseline evidence');
check(read('scripts/verify-dist-chain-v140.mjs').includes("'150'"),'dist chain includes v150');
for(const name of ['bootstrap:identity:v150','generate:identity:v150','verify:identity:v150','verify:atomic:v150','verify:rewards:v150','verify:error-boundary:v150','verify:performance-baseline:v150','verify:release:v150','verify:dist:v150','stage:package:v150','verify:package:v150','create:patch:v150','verify:patch:v150'])check(Boolean(pkg.scripts?.[name]),`package script ${name}`);
if(failures.length){failures.forEach((failure)=>console.error(`FAIL ${failure}`));process.exit(1);}
console.log('PASS v1.0.50 atomic persistence, extracted rewards, safe error boundary, honest performance capture, patch provenance, and release contracts');
