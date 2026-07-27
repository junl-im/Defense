import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),stage=path.join(root,'logs/package/1.0.43/DokkaebiLuckDefense3D_FULL_v1.0.43_MOBILE_INPUT_RECOVERY_VERIFIED');if(!fs.existsSync(stage))throw new Error('v143 staged package missing');
for(const forbidden of ['dist','node_modules','.git'])if(fs.existsSync(path.join(stage,forbidden)))throw new Error(`forbidden staged path ${forbidden}`);
const pkg=JSON.parse(fs.readFileSync(path.join(stage,'package.json'),'utf8'));if(pkg.version!=='1.0.43'||pkg.dokkaebi?.buildId!=='b24.43')throw new Error('staged identity mismatch');
for(const required of ['src/runtime/mobile-input-recovery-v143.js','scripts/verify-release-v143.mjs','docs/generated/runtime-asset-reachability-v143.json','docs/generated/presentation-surface-snapshots-v143.json'])if(!fs.existsSync(path.join(stage,required)))throw new Error(`staged file missing ${required}`);
console.log('PASS v1.0.43 clean source package staging');
