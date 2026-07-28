import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'); const stage=path.join(root,'logs/package/1.0.46/DokkaebiLuckDefense3D_FULL_v1.0.46_DEVICE_UPGRADE_ASSURANCE_VERIFIED');
if(!fs.existsSync(stage)) throw new Error('v146 staged package missing');
for(const forbidden of ['dist','node_modules','.git']) if(fs.existsSync(path.join(stage,forbidden))) throw new Error(`forbidden staged path ${forbidden}`);
const pkg=JSON.parse(fs.readFileSync(path.join(stage,'package.json'),'utf8')); if(pkg.version!=='1.0.46'||pkg.dokkaebi?.buildId!=='b24.46') throw new Error('v146 staged identity mismatch');
for(const required of ['src/runtime/device-trace-assurance-v146.js','src/runtime/service-worker-upgrade-assurance-v146.js','src/runtime/failure-digest-v146.js','scripts/run-release-assurance-v146.mjs','docs/qa/device-viewport-traces-v146.json','docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json']) if(!fs.existsSync(path.join(stage,required))) throw new Error(`staged file missing ${required}`);
console.log('PASS v1.0.46 clean source package staging');
