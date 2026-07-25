import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const root=process.cwd(); const patchRoot=path.join(root,'logs/patch/1.0.16'); const applyRoot=path.join(patchRoot,'APPLY_TO_PROJECT_ROOT');
const fail=(message)=>{ console.error(`FAIL ${message}`); process.exitCode=1; };
if(!existsSync(path.join(patchRoot,'PATCH_MANIFEST.json'))) fail('patch manifest missing');
else {
 const manifest=JSON.parse(readFileSync(path.join(patchRoot,'PATCH_MANIFEST.json'),'utf8'));
 if(manifest.baseVersion!=='1.0.15'||manifest.targetVersion!=='1.0.16'||manifest.buildId!=='b24.16') fail('patch identity mismatch');
 if(manifest.counts?.deleted!==0) fail('unexpected delete count');
 for(const file of manifest.files||[]){ const absolute=path.join(applyRoot,file.path); if(!existsSync(absolute)||!statSync(absolute).isFile()){ fail(`missing ${file.path}`); continue; } const data=readFileSync(absolute); const digest=createHash('sha256').update(data).digest('hex'); if(data.length!==file.bytes||digest!==file.sha256) fail(`hash mismatch ${file.path}`); }
 if(!process.exitCode) console.log(`PASS v1.0.16 patch manifest and ${manifest.files.length} files verified`);
}
