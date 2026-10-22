// Package actual Fiefdom-based 2.5D playable Rani at the /Defense/ Pages root.
// Preserve the former complete v4 game intact at /Defense/legacy/.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const repo=path.resolve(import.meta.dirname,'..');
const input=path.resolve(process.argv[2] || 'engines/fiefdom/dist');
const output=path.resolve(process.argv[3] || 'pages-preview/Defense');
const prefix='/Defense/';
assert.ok(output.startsWith(repo+path.sep),'Output must be inside repository');
assert.notEqual(input,output);
assert.ok(fs.statSync(path.join(input,'index.html')).size>100);
assert.ok(fs.statSync(path.join(repo,'index.html')).size>100);
if(fs.existsSync(output))fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(input,output,{recursive:true});
const legacy=path.join(output,'legacy');
fs.mkdirSync(legacy,{recursive:true});
for(const name of ['index.html','src','css','assets']){
 const src=path.join(repo,name);
 assert.ok(fs.existsSync(src),'Missing v4 original: '+name);
 fs.cpSync(src,path.join(legacy,name),{recursive:true});
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
// Vite --base handles bundles but the original game references /assets/
// and approved art under /rani/. Fix absolute URLs without touching legacy.
let converted=0,files=0;
function patch(folder){
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  const p=path.join(folder,entry.name);
  if(p===legacy)continue;
  if(entry.isDirectory()){patch(p);continue;}
  if(!entry.isFile()||!/\.(?:js|css|html)$/.test(entry.name))continue;
  const s=fs.readFileSync(p,'utf8');
  const matches=s.match(/(?<!\/Defense)\/(?:assets|rani)\//g);
  if(!matches)continue;
  fs.writeFileSync(p,s.replace(/(?<!\/Defense)\/(assets|rani)\//g,prefix+'$1/'));
  converted+=matches.length;files++;
 }
}
patch(output);
// Manifest is JSON, not parsed by the HTML/JS/CSS project-path rewriter.
// Preview runs at /; published GitHub Pages must install into /Defense/ only.
const appManifest=path.join(output,'rani','manifest.webmanifest');
assert.ok(fs.existsSync(appManifest),'PWA manifest absent from package');
const pwa=JSON.parse(fs.readFileSync(appManifest,'utf8'));
assert.equal(pwa.start_url,'/');
assert.equal(pwa.scope,'/');
pwa.id=prefix;pwa.start_url=prefix;pwa.scope=prefix;
if(Array.isArray(pwa.shortcuts)){
 for(const shortcut of pwa.shortcuts)if(shortcut.url==='/')shortcut.url=prefix;
}
fs.writeFileSync(appManifest,JSON.stringify(pwa,null,2)+'\n');
for(const icon of ['icon-64.png','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','favicon.ico']){
 assert.ok(fs.statSync(path.join(output,'rani','icons',icon)).size>1000,'Missing packaged PWA icon '+icon);
}
assert.ok(fs.statSync(path.join(output,'rani-sw.js')).size>100,'Missing network-first service worker');
assert.ok(converted>3,'No project path references converted');
const site=fs.readFileSync(path.join(output,'index.html'),'utf8');
assert.ok(site.includes('/Defense/assets/'),'Vite project base missing');
assert.ok(site.includes('/Defense/rani/'),'Approved image base missing');
assert.ok(site.includes('라니킹덤'),'New root is not Rani 2.5D');
assert.ok(fs.readFileSync(path.join(legacy,'index.html'),'utf8').includes('src/main.js'));
const licenses=path.join(output,'licenses');
fs.mkdirSync(licenses,{recursive:true});
for(const [name,src] of [
 ['FIEFDOM-AGPL-3.0.txt','engines/fiefdom/LICENSE'],
 ['FIEFDOM-THIRD-PARTY.md','engines/fiefdom/docs/THIRD-PARTY.md'],
 ['0AD-CC-BY-SA-3.0.txt','engines/fiefdom/public/assets/sprites/0ad/LICENSE.txt']
]){
 const p=path.join(repo,src);
 assert.ok(fs.existsSync(p),'License unavailable: '+src);
 fs.copyFileSync(p,path.join(licenses,name));
}
fs.writeFileSync(path.join(output,'SOURCE-AND-ATTRIBUTION.txt'),[
 'Rani Kingdom Next: playable 2.5D kingdom (Fiefdom, AGPL-3.0-only)',
 'Upstream: https://github.com/halvar20000/fiefdom/tree/8bb66ceeb5a8ec1f77ec899130090061c25078b3',
 'Corresponding source and conversion scripts: https://github.com/junl-im/Defense/tree/main',
 'Third-party copyright and license texts are provided at /Defense/licenses/',
 'Approved original Rani raster art remains separately owned.',
 'Previous v4 game and its existing browser-local saves remain accessible at /Defense/legacy/',
 'Existing v4 saves are not silently migrated into Fiefdom saves.'
].join('\n')+'\n');
// License and legacy kept at separate URLs; no dev footer on player screen.
fs.writeFileSync(path.join(output,'index.html'),site);
function size(folder){return fs.readdirSync(folder,{withFileTypes:true}).reduce((n,e)=>{
 const p=path.join(folder,e.name);return n+(e.isDirectory()?size(p):e.isFile()?fs.statSync(p).size:0);},0);}
console.log(JSON.stringify({base:prefix,legacy:true,rewriteFiles:files,
 rewriteOccurrences:converted,totalBytes:size(output)},null,2));
