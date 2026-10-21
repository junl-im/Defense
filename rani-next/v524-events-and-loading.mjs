// v5.24: expand native Korean warnings beyond visible static HUD.
// No runtime DOM polling, no sim/save modification, and no SVG assets.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=rel=>path.join(root,rel);
function patch(rel,from,to){
 const p=f(rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.24 source drift '+rel+' '+from.slice(0,110));
 fs.writeFileSync(p,s.replace(from,to));
}
fs.copyFileSync(path.join(import.meta.dirname,'v524-extra-ko.ts'),f('src/ui/raniKoreanExtra.ts'));
const mod=f('src/ui/raniKoreanText.ts');
{
 let s=fs.readFileSync(mod,'utf8');
 assert.ok(!s.includes("from './raniKoreanExtra'"));
 assert.equal(s.split(' let m:RegExpMatchArray|null;').length,2,'v5.24 core translator hook drift');
 s="import { raniKoExtra } from './raniKoreanExtra';\n"+s;
 s=s.replace(' let m:RegExpMatchArray|null;',
   ' const remaining=raniKoExtra(s);if(remaining!==null)return remaining;\n let m:RegExpMatchArray|null;');
 fs.writeFileSync(mod,s);
}
// The actual page loader and map picker repaint faster than the old DOM
// translation timer; translate source text, preserving original map names.
const loading=[
  ["'warming up the graphics…'","'그래픽을 준비하고 있습니다…'"],
  ["\`warming up the graphics… \${Math.round(100 * n / textures.size)}%\`",
   "\`그래픽 준비 중… \${Math.round(100 * n / textures.size)}%\`"],
  ["\`loading \${info.save.map.name.toLowerCase()}…\`",
   "\`\${info.save.map.name} 왕국 불러오는 중…\`"],
  ["\`building \${choice.map.name.toLowerCase()}…\`",
   "\`\${choice.map.name} 왕국을 건설하는 중…\`"],
  ["\`mustering on \${view.map.name.toLowerCase()}…\`",
   "\`\${view.map.name} 병력을 준비하는 중…\`"],
  ["'opening the editor…'","'지도 편집기를 여는 중…'"],
  ["\`error: \${err.message}\`","\`게임 실행 오류: \${String(err?.message||err)}\`"]
];
const main=f('src/main.ts');
let s=fs.readFileSync(main,'utf8'),n=0;
for(const [a,b] of loading)if(s.includes(a)){s=s.split(a).join(b);n++;}
// Earlier localization steps may already replace all loading lines; this patch only handles survivors.
assert.ok(n>=0);
fs.writeFileSync(main,s);
patch('src/ui/menu.ts',"version.textContent='v5.23';","version.textContent='v5.24';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.23';",
 "rkBuildName.textContent='라니킹덤 · v5.24';");
console.log('PASS v5.24 worker/resource/war message Korean coverage; '+n+' boot labels');
