// v5.29: actual stage 1->2->3 visible changes on saved game buildings.
// Render source keeps the same 2.5D meshes/sprites, adds stage gold model tint,
// roof heraldry and footprint-aligned selected outline (all noninteractive).
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function edit(rel,from,to){
 const filename=f(rel),before=fs.readFileSync(filename,'utf8');
 assert.equal(before.split(from).length,2,'v5.29 source drift '+rel+': '+from.slice(0,95));
 fs.writeFileSync(filename,before.replace(from,to));
}
fs.copyFileSync(path.join(import.meta.dirname,'v529-stage-appearance.ts'),f('src/ui/raniStageAppearance.ts'));
edit('src/main.ts',
 "import { rkPickVisibleBuilding } from './ui/raniBuildingHit';",
 "import { rkPickVisibleBuilding } from './ui/raniBuildingHit';\nimport { createRaniStageAppearance } from './ui/raniStageAppearance';");
// Successful upgrade really updates the building mesh/sprite tint.
// Previously v5.3 pushed stage-specific tint only when static scenery rebuilt,
// so an upgrade was sometimes only a number until rotate/reload.
edit('src/main.ts',
 "rkSpend(cost);b.lvl=level+1;b.hp+=rkMaxHp(b)-before;",
 "rkSpend(cost);b.lvl=level+1;b.hp+=rkMaxHp(b)-before;\n      staticDirty=true;");
edit('src/main.ts',
 "b.lvl && b.lvl > 1 ? (b.lvl >= 3 ? [1.10,1.08,1.01] : [1.05,1.04,1.00]) : undefined, b.turn);",
 "b.lvl && b.lvl > 1 ? (b.lvl >= 3 ? [1.25,1.15,0.87] : [1.13,1.09,0.99]) : undefined, b.turn);");
// One world-aligned low-impact visual overlay. No save change, no mobile
// duplicate handlers, no sprite extraction, no extra WebGL raster assets.
edit('src/main.ts',
 "  function drawScene(): void {",
 [
 "  const rkAppearance=createRaniStageAppearance(",
 "    ()=>state.buildings,",
 "    ()=>rkWheel.target?.building??null,",
 "    (x,z)=>iso.worldToScreen(x,terrain.heightAt(x,z),z)",
 "  );",
 "  function drawScene(): void {"
 ].join('\n'));
edit('src/main.ts',
 "    renderer.render(scene, iso.camera);\n    hud.update();",
 "    renderer.render(scene, iso.camera);\n    rkAppearance.update();\n    hud.update();");
edit('src/main.ts',
 "raniWheel:rkWheel, rkOpenGroundBuild, rkMobileTapBuilding, rkHitWholeBuilding,",
 "raniWheel:rkWheel, rkOpenGroundBuild, rkMobileTapBuilding, rkHitWholeBuilding, rkAppearance,");
edit('src/ui/menu.ts',"version.textContent='v5.28';","version.textContent='v5.29';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.28';","rkBuildName.textContent='라니킹덤 · v5.29';");
fs.appendFileSync(f('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v529-stage-appearance.css'),'utf8'));
console.log('PASS v5.29 stage 2/3 actual sprite/model tint updates, heraldic roof ornaments, selected 4-edge footprint');
