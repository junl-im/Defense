import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const failures=[];
const check=(condition,message)=>{ if(!condition) failures.push(message); };
const text=(f)=>readFileSync(path.join(root,f),'utf8');
const json=(f)=>JSON.parse(text(f));
const pkg=json('package.json');
const lock=json('package-lock.json');
const version=json('public/version.json');
const main=text('src/main.js');
const index=text('index.html');
const sw=text('public/sw.js');
const bootstrap=text('public/static-bootstrap.js');
const v117=text('scripts/verify-release-v117.mjs');
const staticBuilder=text('scripts/build-static-fallback.mjs');
const workflow=text('.github/workflows/deploy.yml');
const gate=text('src/runtime/static-deployment-gate-v118.js');

check(pkg.version==='1.0.18' && pkg.dokkaebi?.releaseVersion==='1.0.18' && pkg.dokkaebi?.buildId==='b24.18','package identity mismatch');
check(lock.version===pkg.version && lock.packages?.['']?.version===pkg.version && lock.packages?.['']?.dokkaebi?.buildId==='b24.18','package-lock identity mismatch');
check(version.releaseVersion==='1.0.18' && version.buildId==='b24.18' && version.cacheRevision==='1.0.18-b24.18','public version identity mismatch');
check(main.includes("const GAME_VERSION = '1.0.18'") && main.includes('createStaticDeploymentGateReportV118'),'runtime v1.0.18 integration missing');
check(index.includes("RELEASE_VERSION = '1.0.18'") && index.includes("BUILD_ID = 'b24.18'") && index.includes('1.0.18-b24.18'),'boot identity mismatch');
check(sw.includes("RELEASE_VERSION = '1.0.18'") && sw.includes("BUILD_ID = 'b24.18'"),'service worker identity mismatch');
check(bootstrap.includes("RELEASE_VERSION = '1.0.18'") && bootstrap.includes("BUILD_ID = 'b24.18'"),'static bootstrap identity mismatch');

check(!v117.includes("'dist/asset-approval-v117.html'") && !v117.includes('static deployment missing'),'v117 source verifier still requires dist');
check(pkg.scripts?.['verify:dist:v117']==='node scripts/verify-dist-v117.mjs','v117 dist verifier script missing');
check(pkg.scripts?.['verify:dist:v118']==='node scripts/verify-dist-v118.mjs','v118 dist verifier script missing');
check(pkg.scripts?.verify?.includes('verify:release:v118'),'full source verification chain omits v118');
check(staticBuilder.includes("const packageJson = JSON.parse") && !staticBuilder.includes("const version = '1.0.17'"),'static fallback builder still hardcodes release identity');

const buildIndex=workflow.indexOf('- name: Build');
const distIndex=workflow.indexOf('- name: Verify approved asset static deployment');
check(buildIndex>=0 && distIndex>buildIndex,'post-build approved asset verification is not after Build');
check(workflow.includes('npm run verify:dist:v117') && workflow.includes('npm run verify:dist:v118'),'workflow omits post-build dist verifier');
check(gate.includes("sourceVerificationRequiresDist: false") && gate.includes('postBuildVerificationRequired: true'),'deployment gate policy mismatch');
check(sw.includes("'./src/runtime/static-deployment-gate-v118.js'"),'deployment gate not cached');
for(const f of ['scripts/verify-dist-v117.mjs','scripts/verify-dist-v118.mjs','docs/PATCH_NOTES_v1.0.18.md','docs/PATCH_APPLY_v1.0.18.md','docs/CI_STATIC_DEPLOYMENT_FIX_v1.0.18.md']) check(existsSync(path.join(root,f)),`missing ${f}`);

if(failures.length){ failures.forEach((f)=>console.error(`FAIL ${f}`)); console.error(`\nv1.0.18 verification failed with ${failures.length} issue(s).`); process.exit(1); }
console.log('PASS v1.0.18 identity and runtime deployment gate');
console.log('PASS source verification no longer requires dist before build');
console.log('PASS v1.0.17 approved assets are verified only after build');
console.log('PASS workflow ordering and dynamic static builder are locked');
console.log('\nv1.0.18 CI Approval Deployment Gate verified.');
