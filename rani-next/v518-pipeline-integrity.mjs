// v5.18 build/Pages parity guard. Catch skipped or reordered patches BEFORE
// producing a build that looks correct but ships a different set of features.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const build=fs.readFileSync('.github/workflows/build-rani-next-2p5d.yml','utf8');
const deploy=fs.readFileSync('.github/workflows/deploy-slg.yml','utf8');
const from=(s,re)=>[...s.matchAll(re)].map(m=>m[1]);
const transforms=s=>from(s,/^\s+node (rani-next\/(?:prepare|koreanize|ko-world|ko-hud|no-svg-chart|v[\w-]+|check|verify-art)\.mjs) engines\/fiefdom\s*$/gm);
const qa=s=>from(s,/^\s+node (?:\.\.\/\.\.\/)?(rani-next\/qa-[\w-]+\.mjs) http/gm);
const assetBuild=s=>from(s,/^\s+python (rani-next\/[\w-]+\.py) engines\/fiefdom\/public\//gm);
const a=transforms(build),b=transforms(deploy);
assert.deepEqual(b,a,'Preview transform list drifted from the public deploy (order matters)');
assert.ok(a.length>=26&&a.includes('rani-next/v518-save-durability.mjs'));
assert.equal(new Set(a).size,a.length,'Source patch applied twice');
for(const file of a)assert.ok(fs.existsSync(file),'Missing engine patch '+file);
const q1=qa(build),q2=qa(deploy);
const first=q1.slice(0,q2.length);
assert.deepEqual(first,q2,'Game test order drifted between preview and Pages build');
assert.equal(new Set(q2).size,q2.length,'Duplicate release QA');
assert.ok(q2.includes('rani-next/qa-v518-save.mjs'));
for(const file of q2)assert.ok(fs.existsSync(file),'Missing QA '+file);
const py1=assetBuild(build),py2=assetBuild(deploy);
assert.deepEqual(py1,py2,'Original-art asset pipeline drifted');
for(const file of py1)assert.ok(fs.existsSync(file),'Missing graphics generation '+file);
assert.match(build,/feat\/rani-v518-save-durability/,'New branch is not CI protected');
console.log('PASS v5.18 release integrity:',a.length,'engine steps,',q2.length,'ordered Chromium QAs,',py2.length,'art transforms identical in preview and Pages.');
