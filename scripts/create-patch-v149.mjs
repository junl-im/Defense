import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V149_PATCH_FILES } from './v149-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.49');
const overlay = path.join(out, 'overlay');
const baseManifestPath = path.join(root, 'docs/PATCH_BASE_v1.0.49.json');
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
if (!V149_PATCH_FILES.length) throw new Error('v149 patch file list is empty');
if (!fs.existsSync(baseManifestPath)) throw new Error('v149 base hash manifest missing');
const baseManifest = JSON.parse(fs.readFileSync(baseManifestPath, 'utf8'));
const baseByPath = new Map((baseManifest.files || []).map((entry) => [entry.path, entry]));
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(overlay, { recursive: true });
const rows=[];
for(const file of V149_PATCH_FILES){const source=path.join(root,file);if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw new Error(`v149 patch source missing: ${file}`);const target=path.join(overlay,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);const data=fs.readFileSync(source);const base=baseByPath.get(file)||null;rows.push({path:file,bytes:data.length,sha256:sha256(data),baseSha256:base?.sha256||null,basePresent:Boolean(base)});}
const manifest={id:'DD-DIRECT-OVERLAY-PATCH-V149',baseVersion:'1.0.48',targetVersion:'1.0.49',buildId:'b24.49',applyMode:'direct-root-overlay',counts:{changed:rows.length,deleted:0},deletedPaths:[],baseAggregateSha256:baseManifest.aggregateSha256||null,files:rows};
fs.writeFileSync(path.join(out,'PATCH_MANIFEST.json'),`${JSON.stringify(manifest,null,2)}\n`);
console.log(JSON.stringify({patchRoot:out,overlay,changed:rows.length},null,2));
