// v5.21 scoped visual quality patches; original game economy/saves untouched.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(rel,before,after){
 const name=path.join(root,rel),source=fs.readFileSync(name,'utf8');
 assert.equal(source.split(before).length,2,'v5.21 transform drift '+rel+' '+before.slice(0,95));
 fs.writeFileSync(name,source.replace(before,after));
}
fs.copyFileSync(path.join(import.meta.dirname,'v521-build-feedback.ts'),path.join(root,'src/ui/raniBuildFeedback.ts'));
{
 const name=path.join(root,'src/main.ts'),s=fs.readFileSync(name,'utf8');
 const entry="import { createRaniBuildFeedback } from './ui/raniBuildFeedback';\n";
 assert.ok(!s.includes(entry),'duplicate growth module');
 fs.writeFileSync(name,entry+s);
}
patch('src/main.ts',
"  function buildRun(name: string, tiles: { x: number; z: number }[],",
[
"  // Reuse the SAME native camera projection used by the placement grid.",
"  // The visual layer never mutates resources, world geometry or saved data.",
"  const rkGrowthFx=createRaniBuildFeedback((x,z)=>",
"    iso.worldToScreen(x,terrain.heightAt(x,z),z));",
"  function buildRun(name: string, tiles: { x: number; z: number }[],"
].join('\n'));
patch('src/main.ts',
"      if (BORDER_BUILDINGS.has(name)) border = true;\n      built++;",
[
"      if (BORDER_BUILDINGS.has(name)) border = true;",
"      rkGrowthFx.built(b.x+pw/2,b.z+pd/2,b.def.label);",
"      built++;"
].join('\n'));
patch('src/main.ts',
"      state.notify(b.def.label+' 강화 '+b.lvl+'단계 완료','info');",
"      rkGrowthFx.upgraded(b.x+b.def.footprint[0]/2,b.z+b.def.footprint[1]/2,b.def.label,b.lvl);\n      state.notify(b.def.label+' 강화 '+b.lvl+'단계 완료','info');");
// A successful upgrade should reveal its visual celebration instead of keeping
// the radial inspector over the newly levelled building. On failure, keep the
// inspector open with the existing specific resource error.
patch('src/ui/raniWheel.ts',
"    message.textContent=result.message;\n    message.dataset.rkManual='1';\n    update();",
"    if(result.ok && id==='upgrade'){closeMenu();return;}\n    message.textContent=result.message;\n    message.dataset.rkManual='1';\n    update();");
patch('src/ui/menu.ts',"version.textContent='v5.20';","version.textContent='v5.21';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.20';","rkBuildName.textContent='라니킹덤 · v5.21';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v521-scroll-hud.css'),'utf8'));
console.log('PASS v5.21 native build/upgrade effects, themed scrollbars and layout exclusions');
