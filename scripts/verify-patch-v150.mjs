import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V150_DELETED_PATHS, V150_PATCH_FILES } from './v150-patch-files.mjs';
const root=path.resolve(import.meta.dirname,'..'),patchRoot=path.join(root,'logs/patch/1.0.50'),overlay=path.join(patchRoot,'overlay');
const manifest=JSON.parse(fs.readFileSync(path.join(patchRoot,'PATCH_MANIFEST.json'),'utf8'));
if(manifest.id!=='DD-DIRECT-OVERLAY-PATCH-V150'||manifest.baseVersion!=='1.0.49'||manifest.targetVersion!=='1.0.50'||manifest.buildId!=='b24.50'||manifest.applyMode!=='direct-root-overlay')throw new Error('v150 patch identity mismatch');
if(!/^[a-f0-9]{64}$/.test(manifest.baseZipSha256||'')||!/^[a-f0-9]{64}$/.test(manifest.targetSourceTreeSha256||''))throw new Error('v150 provenance hashes missing');
if(manifest.targetFullZipSha256!=='PENDING_EXTERNAL_PACKAGE'&&!/^[a-f0-9]{64}$/.test(manifest.targetFullZipSha256||''))throw new Error('v150 target ZIP hash invalid');
const sha=(data)=>createHash('sha256').update(data).digest('hex'), paths=new Set();
for(const entry of manifest.files){if(paths.has(entry.path))throw new Error(`duplicate patch path ${entry.path}`);paths.add(entry.path);const file=path.join(overlay,entry.path);if(!fs.existsSync(file))throw new Error(`patch file missing ${entry.path}`);const data=fs.readFileSync(file);if(data.length!==entry.bytes||sha(data)!==entry.sha256)throw new Error(`patch hash mismatch ${entry.path}`);}
if(manifest.counts.changed!==manifest.files.length||manifest.counts.deleted!==V150_DELETED_PATHS.length||manifest.deletedPaths.length!==V150_DELETED_PATHS.length||V150_DELETED_PATHS.some((file)=>!manifest.deletedPaths.includes(file)))throw new Error('v150 patch count mismatch');
if(paths.size!==V150_PATCH_FILES.length||V150_PATCH_FILES.some((file)=>!paths.has(file)))throw new Error('v150 patch manifest differs from declared list');
for(const required of ['package.json','src/main.js','src/runtime/atomic-save-snapshot-v150.js','docs/PATCH_PROVENANCE_v1.0.50.json'])if(!paths.has(required))throw new Error(`v150 patch contract file missing ${required}`);
console.log(`PASS v1.0.50 direct-root overlay patch with SHA-256 provenance (${manifest.files.length} files)`);
