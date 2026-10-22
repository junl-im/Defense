// v5.30: one genuine build/menu dock; the context wheel obeys measured safe viewport.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function patch(rel,old,next){
 const filename=f(rel),s=fs.readFileSync(filename,'utf8');
 assert.equal(s.split(old).length,2,'v5.30 source drift '+rel+' '+old.slice(0,105));
 fs.writeFileSync(filename,s.replace(old,next));
}
patch('src/main.ts',
 "row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);",
 "row.append(construct,menu);dock.append(buildWrap,row);document.querySelector<HTMLElement>('#ui')!.append(dock);");
const filename=f('src/ui/raniWheel.ts');
let s=fs.readFileSync(filename,'utf8');
const start=s.indexOf('  function place(){');
const end=s.indexOf('  function show(',start);
assert.ok(start>0&&end>start,'v5.30 wheel native place boundary changed');
s=s.slice(0,start)+fs.readFileSync(path.join(import.meta.dirname,'v530-wheel-position.ts'),'utf8')+s.slice(end);
fs.writeFileSync(filename,s);
patch('src/ui/raniWheel.ts',
 "    button.dataset.action=s.id;",
 "    button.dataset.action=s.id;\n    button.dataset.rkGlyph=({info:'ⓘ',upgrade:'✦',repair:'✚',manage:'⚙',build:'⌂',remove:'×'} as Record<string,string>)[s.id]||'';");
patch('src/ui/raniWheel.ts',
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade",
 "    upgrade.disabled=!status.canUpgrade;upgrade.setAttribute('aria-label',status.canUpgrade?'강화: '+status.upgradeCost:'강화 불가 · '+(status.level>=3?'최고 단계':'자원 또는 건물 조건 부족'));upgrade.title=status.canUpgrade");
patch('src/ui/raniWheel.ts',
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair",
 "    repair.disabled=!status.canRepair;repair.setAttribute('aria-label',status.canRepair?'수리: '+status.repairCost:'수리할 손상이 없습니다.');repair.title=status.canRepair");
patch('src/ui/raniWheel.ts',
 "    remove.disabled=!status.removable;",
 "    remove.disabled=!status.removable;\n    remove.setAttribute('aria-label',status.removable?'건물 철거 · 재확인 필요':'철거 불가 · '+status.reason);");
patch('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
fs.appendFileSync(f('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-ux.css'),'utf8'));
console.log('PASS v5.30 single bottom dock, viewport-based wheel position and royal buttons');
