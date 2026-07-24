import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const version = '1.0.10';
const outputRoot = path.join(root,'logs/patch',version); const stagingRoot=path.join(outputRoot,'staging'); const metadataRoot=path.join(stagingRoot,'logs/patch',version);
const manifest=JSON.parse(readFileSync(path.join(outputRoot,'PATCH_MANIFEST.json'),'utf8')); const sha256=(buffer)=>createHash('sha256').update(buffer).digest('hex'); const failures=[];
for(const item of manifest.added){ for(const file of [path.join(root,item.path),path.join(stagingRoot,item.path)]) if(!existsSync(file)||sha256(readFileSync(file))!==item.sha256) failures.push(`added hash mismatch: ${item.path}`); }
for(const item of manifest.modified){ for(const file of [path.join(root,item.path),path.join(stagingRoot,item.path)]) if(!existsSync(file)||sha256(readFileSync(file))!==item.after.sha256) failures.push(`modified hash mismatch: ${item.path}`); }
for(const item of manifest.deleted) if(existsSync(path.join(root,item.path))) failures.push(`deleted path still exists: ${item.path}`);
const lines=readFileSync(path.join(metadataRoot,'PATCH_CONTENT_SHA256.txt'),'utf8').trim().split('\n').filter(Boolean);
for(const line of lines){ const match=/^([a-f0-9]{64})  (.+)$/.exec(line); if(!match){ failures.push(`invalid hash line: ${line}`); continue; } const file=path.join(stagingRoot,match[2]); if(!existsSync(file)||sha256(readFileSync(file))!==match[1]) failures.push(`patch content hash mismatch: ${match[2]}`); }
const changed=[...manifest.added.map(i=>i.path),...manifest.modified.map(i=>i.path)];
if(changed.some(f=>f.toLowerCase().endsWith('.svg'))) failures.push('SVG file included in patch');
const badArt=changed.filter(f=>(f.startsWith('src/assets/')||f.startsWith('dist/src/assets/')||f==='src/art-style-tokens.js'||f==='dist/src/art-style-tokens.js'||f==='docs/ABSOLUTE_ART_BIBLE_v2.0.md'||f.startsWith('public/assets/')||f.startsWith('dist/assets/')));
if(badArt.length) failures.push(`protected art changed: ${badArt.join(', ')}`);
for(const required of ['index.html','src/main.js','src/style.css','src/engine/asset-catalog.js','src/runtime/combat-visual-director-v110.js','src/ui-layout-manager.js','public/sw.js','scripts/verify-release-v110.mjs','logs/README.md']) if(!changed.includes(required)) failures.push(`required v1.0.10 file missing: ${required}`);
if(manifest.baseVersion!=='1.0.9'||manifest.targetVersion!=='1.0.10') failures.push('Patch version range mismatch');
if(failures.length){ for(const failure of failures) console.error(`FAIL ${failure}`); process.exit(1); }
console.log(`PASS patch v${version} files and SHA-256 hashes verified (${changed.length} changed, ${manifest.deleted.length} deleted)`);
