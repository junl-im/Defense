// v5.30 — fix actual UI docking collisions; native game rules and saves untouched.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function replace(rel,from,to){
 const filename=f(rel),old=fs.readFileSync(filename,'utf8');
 assert.equal(old.split(from).length,2,'v5.30 source drift '+rel+' '+from.slice(0,99));
 fs.writeFileSync(filename,old.replace(from,to));
}
fs.copyFileSync(path.join(import.meta.dirname,'v530-ui-layout.ts'),f('src/ui/raniUiLayout.ts'));
replace('src/main.ts',
 "import { createRaniStageAppearance } from './ui/raniStageAppearance';",
 "import { createRaniStageAppearance } from './ui/raniStageAppearance';\nimport { installRaniDockLayout } from './ui/raniUiLayout';");
replace('src/main.ts',
 "      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);",
 "      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);\n      installRaniDockLayout(dock);");
const wheelFile=f('src/ui/raniWheel.ts');
let wheel=fs.readFileSync(wheelFile,'utf8');
const start=wheel.indexOf("    const narrow=window.innerWidth<=700||document.documentElement.classList.contains('phone');");
const marker="    host.style.setProperty('--rk-anchor-top',top+'px');";
const finish=wheel.indexOf(marker,start);
assert.ok(start>=0&&finish>start,'v5.30 original v5.12 responsive wheel anchor missing');
const before=wheel.slice(start,finish+marker.length);
const after=[
 "    const narrow=window.innerWidth<=700||document.documentElement.classList.contains('phone');",
 "    const vw=window.visualViewport?.width??window.innerWidth;",
 "    const vh=window.visualViewport?.height??window.innerHeight;",
 "    const pad=document.querySelector<HTMLElement>('#pad');",
 "    const bottomLimit=narrow&&pad?pad.getBoundingClientRect().top-10:vh-16;",
 "    const compact=narrow&&vh<580;",
 "    const halfHeight=compact?103:133;",
 "    const topLimit=compact?Math.max(120,Math.min(bottomLimit-halfHeight,155))",
 "      :Math.max(148,Math.min(bottomLimit-halfHeight-(infoOpen?50:0),vh-150));",
 "    const left=narrow?vw/2:Math.max(165,Math.min(vw-165,p.x));",
 "    const desired=narrow?Math.max(146,Math.min(bottomLimit-halfHeight-12,p.y-32))",
 "      :Math.max(150,Math.min(vh-166,p.y-32));",
 "    const top=narrow?Math.max(compact?120:148,Math.min(topLimit,desired)):desired;",
 "    host.dataset.rkCompact=String(compact);",
 "    host.style.setProperty('--rk-anchor-left',left+'px');",
 "    host.style.setProperty('--rk-anchor-top',top+'px');",
 "    host.style.left=left+'px';host.style.top=top+'px';"
].join('\n');
assert.equal(wheel.split(before).length,2,'v5.30 wheel clamp drift');
wheel=wheel.replace(before,after);
const upgradeBefore="    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade";
assert.equal(wheel.split(upgradeBefore).length,2,'v5.30 upgrade status drift');
wheel=wheel.replace(upgradeBefore,
 "    upgrade.disabled=!status.canUpgrade;upgrade.dataset.rkAvailability=status.canUpgrade?'ready':'locked';upgrade.title=status.canUpgrade");
const infoBefore="    const signature=JSON.stringify(status);";
assert.equal(wheel.split(infoBefore).length,2,'v5.30 wheel info drift');
wheel=wheel.replace(infoBefore,
 "    const infoButton=actionButtons.get('info')!;\n    infoButton.setAttribute('aria-expanded',String(infoOpen));\n    const signature=JSON.stringify(status);");
fs.writeFileSync(wheelFile,wheel);
replace('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
replace('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
fs.appendFileSync(f('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-ui-polish.css'),'utf8'));
console.log('PASS v5.30 single native dock overlap fix and hex viewport polish');