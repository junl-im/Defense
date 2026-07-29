import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const stage=path.join(root,'logs/package/1.0.47/DokkaebiLuckDefense3D_FULL_v1.0.47_OFFLINE_EVIDENCE_ASSURANCE_VERIFIED');
if(!fs.existsSync(stage))throw new Error('v147 staged package missing');for(const banned of ['dist','node_modules','.git'])if(fs.existsSync(path.join(stage,banned)))throw new Error(`v147 staged package contains ${banned}`);
const pkg=JSON.parse(fs.readFileSync(path.join(stage,'package.json'),'utf8'));if(pkg.version!=='1.0.47'||pkg.dokkaebi?.buildId!=='b24.47')throw new Error('v147 staged identity mismatch');
for(const file of ['scripts/run-offline-reconnect-v147.mjs','scripts/save-schema-fuzz-v147.mjs','scripts/device-trace-ingestion-v147.mjs','docs/qa/device-viewport-traces-v147.json'])if(!fs.existsSync(path.join(stage,file)))throw new Error(`v147 staged contract missing ${file}`);
console.log('PASS v1.0.47 clean source package staging');
