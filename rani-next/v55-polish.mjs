// Rani v5.5: clean start, correct canvas drag, polished real game inspector.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(rel,oldText,newText){
 const p=path.join(root,rel),txt=fs.readFileSync(p,'utf8');
 assert.equal(txt.split(oldText).length,2,'Upstream changed '+rel);
 fs.writeFileSync(p,txt.replace(oldText,newText));
}
edit('src/ui/menu.ts',"import { versionButton, VERSION_CSS } from './whatsnew';","import { VERSION_CSS } from './whatsnew';");
edit('src/ui/menu.ts',"import { bugReportLink } from './bugreport';\n",'');
edit('src/ui/menu.ts',
 "    ver.appendChild(versionButton());\n    ver.appendChild(bugReportLink(() => ({ mode: 'Menu' })));",
 "    const version=document.createElement('span');\n    version.className='rk-public-version';\n    version.textContent='v5.5';\n    ver.appendChild(version);");
const menuFile=path.join(root,'src/ui/menu.ts');
let menu=fs.readFileSync(menuFile,'utf8');
const note=/    const note = document.createElement\('div'\);\n    note.className = 'note';\n    note.textContent = [\s\S]*?\n    root.appendChild\(note\);/g;
assert.equal([...menu.matchAll(note)].length,1,'Title guide changed');
menu=menu.replace(note,'');
fs.writeFileSync(menuFile,menu);
edit('src/main.ts',
 'if (!placement.dragFrom) iso.panByPixels(-(e.clientX - lastX), (e.clientY - lastY));',
 '// Follow the visible ground while dragging, not the camera target.\n      if (!placement.dragFrom) iso.panByPixels(-(e.clientX - lastX), -(e.clientY - lastY));');
edit('src/ui/raniWheel.ts',
 '      if(target.building)info.append(hp,level,work,upgrades,repairs);',
 "      if(target.building){\n        const meter=document.createElement('div');meter.className='rk-health-meter';\n        meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','건물 내구도');\n        meter.setAttribute('aria-valuemin','0');\n        meter.setAttribute('aria-valuemax',String(Math.ceil(status.maxHp)));\n        meter.setAttribute('aria-valuenow',String(Math.ceil(Math.max(0,status.hp))));\n        const bar=document.createElement('span');\n        bar.style.width=(status.maxHp>0?Math.max(0,Math.min(100,status.hp/status.maxHp*100)):0)+'%';\n        meter.append(bar);info.append(hp,meter,level,work,upgrades,repairs);\n      }");
edit('src/ui/raniWheel.ts',
 '    const top=narrow?window.innerHeight-160:Math.max(150,Math.min(window.innerHeight-165,p.y-32));',
 "    const top=narrow?Math.max(155,Math.min(window.innerHeight-180,window.innerHeight*.43))\n      :Math.max(150,Math.min(window.innerHeight-165,p.y-32));\n    host.classList.toggle('rk-info-left',!narrow&&left>window.innerWidth-500);");
edit('src/ui/pause.ts',
 '  box.appendChild(ver);\n\n  const say =',
 "  box.appendChild(ver);\n  const more=document.createElement('details');more.className='rk-game-legal';\n  const heading=document.createElement('summary');heading.textContent='게임 정보';\n  const links=document.createElement('div');\n  const legal=document.createElement('a');legal.textContent='원본·라이선스';\n  legal.href='/Defense/SOURCE-AND-ATTRIBUTION.txt';legal.target='_blank';legal.rel='noopener noreferrer';\n  const previous=document.createElement('a');previous.textContent='이전 게임';\n  previous.href='/Defense/legacy/';previous.target='_blank';previous.rel='noopener noreferrer';\n  links.append(legal,previous);more.append(heading,links);box.append(more);\n\n  const say =");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v55-polish.css'),'utf8'));
console.log('PASS v5.5 player launch, drag direction, live-wheel, accessible licenses');