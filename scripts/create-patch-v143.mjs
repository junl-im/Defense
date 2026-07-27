import {createHash} from 'node:crypto';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'logs/patch/1.0.43'),overlay=path.join(out,'overlay');
const files=[
'.github/workflows/deploy.yml','README.md','PROJECT_HANDOFF.md','package.json','package-lock.json','index.html',
'src/main.js','src/style.css','src/version-policy.js','src/runtime/mobile-input-recovery-v143.js',
'public/version.json','public/sw.js','public/static-bootstrap.js','public/assets/system-v135/runtime-module-shell-v135.json',
'scripts/generate-runtime-asset-reachability-v143.mjs','scripts/generate-presentation-snapshots-v143.mjs','scripts/verify-mobile-input-recovery-v143.mjs','scripts/run-browser-mobile-recovery-v143.mjs','scripts/fixtures/mobile-browser-recovery-v143.html',
'scripts/verify-release-v142.mjs','scripts/verify-dist-v142.mjs','scripts/verify-dist-chain-v140.mjs','scripts/verify-release-v143.mjs','scripts/verify-dist-v143.mjs','scripts/stage-clean-package-v143.mjs','scripts/verify-clean-package-v143.mjs','scripts/create-patch-v143.mjs','scripts/verify-patch-v143.mjs',
'docs/MOBILE_INPUT_RECOVERY_v1.0.43.md','docs/PATCH_NOTES_v1.0.43.md','docs/PATCH_APPLY_v1.0.43.md','docs/NEXT_UPDATE_v1.0.44.md','docs/generated/runtime-asset-reachability-v143.json','docs/generated/runtime-asset-reachability-v143.md','docs/generated/presentation-surface-snapshots-v143.json'
];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(overlay,{recursive:true});const hash=(buffer)=>createHash('sha256').update(buffer).digest('hex'),rows=[];
for(const file of files){const source=path.join(root,file),target=path.join(overlay,file);if(!fs.existsSync(source))throw new Error('missing '+file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);const data=fs.readFileSync(source);rows.push({path:file,bytes:data.length,sha256:hash(data)})}
fs.writeFileSync(path.join(out,'PATCH_MANIFEST.json'),JSON.stringify({baseVersion:'1.0.42',targetVersion:'1.0.43',buildId:'b24.43',counts:{changed:rows.length,deleted:0},deletedPaths:[],files:rows},null,2)+'\n');console.log(JSON.stringify({overlay,changed:rows.length},null,2));
