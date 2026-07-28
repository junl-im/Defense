import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),stage=path.join(root,'logs/package/1.0.44/DokkaebiLuckDefense3D_FULL_v1.0.44_RELEASE_ASSURANCE_VERIFIED');if(!fs.existsSync(stage))throw new Error('v144 staged package missing');
for(const forbidden of ['dist','node_modules','.git'])if(fs.existsSync(path.join(stage,forbidden)))throw new Error(`forbidden staged path ${forbidden}`);
const pkg=JSON.parse(fs.readFileSync(path.join(stage,'package.json'),'utf8'));if(pkg.version!=='1.0.44'||pkg.dokkaebi?.buildId!=='b24.44')throw new Error('staged identity mismatch');
for(const required of ['scripts/run-built-game-mobile-matrix-v144.mjs','scripts/verify-dist-budget-v144.mjs','scripts/verify-release-v144.mjs','docs/generated/asset-review-v144.json','docs/DIST_BUDGETS_v1.0.44.json'])if(!fs.existsSync(path.join(stage,required)))throw new Error(`staged file missing ${required}`);
console.log('PASS v1.0.44 clean source package staging');
