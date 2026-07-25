import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const failures=[];
const check=(c,m)=>{ if(!c) failures.push(m); };
const pass=(m)=>console.log(`PASS ${m}`);
const text=(f)=>readFileSync(path.join(root,f),'utf8');
const json=(f)=>JSON.parse(text(f));
const versionAtLeast=(value, minimum)=>{
  const a=String(value).split('.').map(Number); const b=String(minimum).split('.').map(Number);
  for(let i=0;i<3;i+=1){ if((a[i]||0)>(b[i]||0)) return true; if((a[i]||0)<(b[i]||0)) return false; }
  return true;
};

const pkg=json('package.json');
const lock=json('package-lock.json');
const version=json('public/version.json');
const manifest=json('public/assets/visual-v117/asset-approval-manifest-v117.json');
const registry=json('public/assets/visual-v117/asset-approval-registry-v117.json');
const catalog=text('src/engine/asset-catalog.js');
const director=text('src/runtime/combat-visual-director-v112.js');
const polish=text('src/runtime/combat-art-polish-director-v114.js');
const approval=text('src/runtime/asset-approval-pipeline-v117.js');
const main=text('src/main.js');
const index=text('index.html');
const sw=text('public/sw.js');
const viewer=text('public/asset-approval-v117.html');

check(versionAtLeast(pkg.version,'1.0.17') && pkg.dokkaebi?.releaseVersion===pkg.version,'package identity must preserve v1.0.17 or later');
check(lock.version===pkg.version && lock.packages?.['']?.version===pkg.version && lock.packages?.['']?.dokkaebi?.buildId===pkg.dokkaebi?.buildId,'package lock identity mismatch');
check(version.releaseVersion===pkg.version && version.buildId===pkg.dokkaebi?.buildId,'public identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`),'runtime identity mismatch');
check(index.includes(`RELEASE_VERSION = '${pkg.version}'`) && index.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`),'boot identity mismatch');
if(!failures.length) pass(`v1.0.17 foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(manifest.version==='1.0.17' && manifest.build==='b24.17','asset manifest foundation identity mismatch');
check(manifest.summary?.directionalEntitiesApproved===1 && manifest.summary?.directionViewsApproved===11,'direction approval totals mismatch');
check(manifest.summary?.actionRowsProvisional===5,'provisional action row count mismatch');
check(manifest.summary?.citadelStatesApproved===4,'citadel approval count mismatch');
check(manifest.files?.length===16,'generated approved file count mismatch');
check(manifest.directional?.directionArt==='approved' && manifest.directional?.actionArt==='derived-provisional','direction/action approval boundary missing');
check(manifest.directional?.mirroringAllowed===false,'mirroring must remain disabled');
if(!failures.length) pass('one 11-direction golden sample and four citadel states retain explicit approval boundaries');

check(registry.summary?.approved===4,'registry approved total mismatch');
check(registry.summary?.directionApprovedActionProvisional===1,'registry directional provisional total mismatch');
check(registry.summary?.replacementPendingDirectional===20,'replacement queue total mismatch');
check(registry.summary?.quarantined===4,'quarantine total mismatch');
check(registry.entries?.length===29,'registry entry count mismatch');
check(registry.entries.filter((e)=>e.status==='quarantined').every((e)=>e.runtimeApplied===false),'quarantined prototypes are runtime enabled');
if(!failures.length) pass('asset registry keeps approved, provisional, replacement-pending and quarantined assets separated');

for(const token of ['APPROVED_DIRECTIONAL_ATLAS_IDS_V117',"role: 'approved-directional-guardian-v117'",'GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117',"role: 'guardian-citadel-state-v117'"]) check(catalog.includes(token),`catalog integration missing: ${token}`);
for(const token of ['isApprovedDirectionalAtlasV117','approvedDirectionalSelectionsV117','approved-directional-v117-action-provisional','directionArtApprovedV117','actionArtApprovedV117 = false']) check(director.includes(token),`directional runtime integration missing: ${token}`);
check(polish.includes('GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117') && polish.includes("'v117-approved'"),'v117 citadel state preference missing');
if(!failures.length) pass('approved Pupu directional atlas and v117 citadel states remain wired with safe fallbacks');

check(approval.includes("version: '1.0.17'") && approval.includes('derivedActionRowsMayRunProvisionally: true'),'approval policy missing');
check(approval.includes('derivedActionRowsCountAsFinalActionArt: false'),'provisional action art is counted as final');
check(approval.includes('oldP0PrototypeRuntimeAllowed: false'),'old P0 runtime quarantine missing');
check(main.includes('createAssetApprovalReportV117') && main.includes('__DOKKAEBI_ART_APPROVAL_V117__'),'runtime approval report missing');
if(!failures.length) pass('runtime reports direction approval without overstating provisional action rows');

check(index.includes('id="asset-approval-v117-btn"'),'asset management button missing');
check(viewer.includes('승인·교체 대기 큐') && viewer.includes('asset-approval-registry-v117.json'),'asset management viewer missing');
check(sw.includes("'./src/runtime/asset-approval-pipeline-v117.js'") && sw.includes("'./asset-approval-v117.html'"),'service worker approval resources missing');
check(pkg.scripts?.['verify:dist:v117']==='node scripts/verify-dist-v117.mjs','post-build v117 dist verifier missing');
for(const f of ['docs/PATCH_NOTES_v1.0.17.md','docs/PATCH_APPLY_v1.0.17.md','docs/ART_APPROVAL_REPORT_v1.0.17.md','production/reference-v117/pupu-guardian-concept-v117.png','production/reference-v117/guardian-citadel-concept-v117.png']) check(existsSync(path.join(root,f)),`missing ${f}`);
if(!failures.length) pass('approval viewer, source assets and post-build verification contract are installed');

if(failures.length){ for(const f of failures) console.error(`FAIL ${f}`); console.error(`\nv1.0.17 verification failed with ${failures.length} issue(s).`); process.exit(1); }
console.log('\nv1.0.17 Art Approval foundation verified without requiring a pre-existing dist directory.');
