import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const failures=[];
const check=(c,m)=>{ if(!c) failures.push(m); };
const pass=(m)=>console.log(`PASS ${m}`);
const text=(f)=>readFileSync(path.join(root,f),'utf8');
const json=(f)=>JSON.parse(text(f));

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

check(pkg.version==='1.0.17' && pkg.dokkaebi?.releaseVersion==='1.0.17' && pkg.dokkaebi?.buildId==='b24.17','package identity mismatch');
check(lock.version===pkg.version && lock.packages?.['']?.version===pkg.version && lock.packages?.['']?.dokkaebi?.buildId==='b24.17','package lock identity mismatch');
check(version.releaseVersion===pkg.version && version.buildId==='b24.17' && version.cacheRevision==='1.0.17-b24.17','public identity mismatch');
check(main.includes("const GAME_VERSION = '1.0.17'"),'runtime identity mismatch');
check(index.includes("RELEASE_VERSION = '1.0.17'") && index.includes("BUILD_ID = 'b24.17'"),'boot identity mismatch');
if(!failures.length) pass('v1.0.17 / b24.17 identity is synchronized');

check(manifest.version==='1.0.17' && manifest.build==='b24.17','asset manifest identity mismatch');
check(manifest.summary?.directionalEntitiesApproved===1 && manifest.summary?.directionViewsApproved===11,'direction approval totals mismatch');
check(manifest.summary?.actionRowsProvisional===5,'provisional action row count mismatch');
check(manifest.summary?.citadelStatesApproved===4,'citadel approval count mismatch');
check(manifest.files?.length===16,'generated approved file count mismatch');
check(manifest.directional?.directionArt==='approved' && manifest.directional?.actionArt==='derived-provisional','direction/action approval boundary missing');
check(manifest.directional?.mirroringAllowed===false,'mirroring must remain disabled');
if(!failures.length) pass('one 11-direction golden sample and four citadel states have explicit approval boundaries');

check(registry.summary?.approved===4,'registry approved total mismatch');
check(registry.summary?.directionApprovedActionProvisional===1,'registry directional provisional total mismatch');
check(registry.summary?.replacementPendingDirectional===20,'replacement queue total mismatch');
check(registry.summary?.quarantined===4,'quarantine total mismatch');
check(registry.entries?.length===29,'registry entry count mismatch');
check(registry.entries.filter((e)=>e.status==='quarantined').every((e)=>e.runtimeApplied===false),'quarantined prototypes are runtime enabled');
if(!failures.length) pass('asset management registry separates approved, provisional, replacement-pending and quarantined assets');

for(const token of [
  'APPROVED_DIRECTIONAL_ATLAS_IDS_V117',
  "role: 'approved-directional-guardian-v117'",
  'GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117',
  "role: 'guardian-citadel-state-v117'"
]) check(catalog.includes(token),`catalog integration missing: ${token}`);
for(const token of [
  'isApprovedDirectionalAtlasV117',
  'approvedDirectionalSelectionsV117',
  'approved-directional-v117-action-provisional',
  'directionArtApprovedV117',
  'actionArtApprovedV117 = false'
]) check(director.includes(token),`directional runtime integration missing: ${token}`);
check(polish.includes('GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117') && polish.includes("'v117-approved'"),'v117 citadel state preference missing');
if(!failures.length) pass('approved Pupu directional atlas and v117 citadel states are wired with safe fallbacks');

check(approval.includes("version: '1.0.17'") && approval.includes('derivedActionRowsMayRunProvisionally: true'),'approval policy missing');
check(approval.includes('derivedActionRowsCountAsFinalActionArt: false'),'provisional action art is counted as final');
check(approval.includes('oldP0PrototypeRuntimeAllowed: false'),'old P0 runtime quarantine missing');
check(main.includes('createAssetApprovalReportV117') && main.includes('__DOKKAEBI_ART_APPROVAL_V117__'),'runtime approval report missing');
if(!failures.length) pass('runtime reports direction approval without overstating provisional action rows');

check(index.includes('id="asset-approval-v117-btn"'),'asset management button missing');
check(viewer.includes('승인·교체 대기 큐') && viewer.includes('asset-approval-registry-v117.json'),'asset management viewer missing');
check(sw.includes("'./src/runtime/asset-approval-pipeline-v117.js'") && sw.includes("'./asset-approval-v117.html'"),'service worker approval resources missing');
for(const f of [
  'dist/asset-approval-v117.html',
  'dist/assets/visual-v117/asset-approval-manifest-v117.json',
  'dist/assets/visual-v117/asset-approval-registry-v117.json',
  'dist/assets/visual-v117/directional/guardian-ember-pupu-atlas-low-v117.webp',
  'dist/assets/visual-v117/citadel/guardian-citadel-critical-low-v117.webp',
  'dist/src/runtime/asset-approval-pipeline-v117.js'
]) check(existsSync(path.join(root,f)),`static deployment missing ${f}`);
if(existsSync(path.join(root,'dist/version.json'))){
  const distVersion=json('dist/version.json');
  check(distVersion.releaseVersion==='1.0.17' && distVersion.buildId==='b24.17','static deployment identity mismatch');
}
check(pkg.scripts?.verify?.includes('verify:release:v117'),'full verification chain omits v117');
for(const f of [
  'docs/PATCH_NOTES_v1.0.17.md','docs/PATCH_APPLY_v1.0.17.md','docs/ART_APPROVAL_REPORT_v1.0.17.md',
  'production/reference-v117/pupu-guardian-concept-v117.png','production/reference-v117/guardian-citadel-concept-v117.png'
]) check(existsSync(path.join(root,f)),`missing ${f}`);
if(!failures.length) pass('approval viewer, production references and release documents are installed');

if(failures.length){ for(const f of failures) console.error(`FAIL ${f}`); console.error(`\nv1.0.17 verification failed with ${failures.length} issue(s).`); process.exit(1); }
console.log('\nv1.0.17 Art Approval and Directional Golden Sample verified.');
