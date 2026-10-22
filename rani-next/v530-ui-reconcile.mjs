// v5.30: eliminate legacy duplicate bottom-left Build, connect the real Guide
// button to the new dock and clamp the original six-hex inspector inside UI room.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const filename=part=>path.join(root,part);
function patch(p,oldText,newText){
 const f=filename(p),src=fs.readFileSync(f,'utf8');
 assert.equal(src.split(oldText).length,2,'v5.30 source drift '+p+' : '+oldText.slice(0,110));
 fs.writeFileSync(f,src.replace(oldText,newText));
}
patch('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
patch('public/rani/v57-guide.js',
 '   ui.appendChild(toggle);',
 [
 "   // Move the ORIGINAL wired Guide to the shared desktop bottom dock.",
 "   const row=document.querySelector('#rk-actions .rk-action-row');",
 "   if(row&&!document.documentElement.classList.contains('phone'))row.append(toggle);",
 "   else ui.append(toggle);"
 ].join('\n'));
patch('src/main.ts',
 '      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);',
 [
 '      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);',
 "      // Keep the legacy hidden Build key handler for original game QA;",
 "      // do not display a second floating Build button over this dock.",
 "      const legacy=document.querySelector<HTMLButtonElement>('#rani-build-toggle');",
 "      if(legacy){",
 "        legacy.tabIndex=-1;legacy.setAttribute('aria-hidden','true');",
 "        legacy.addEventListener('click',()=>queueMicrotask(()=>{",
 "          const opened=document.querySelector('#ui')?.classList.contains('rani-build-open')===true;",
 "          dock.dataset.open=String(opened);",
 "          construct.setAttribute('aria-expanded',String(opened));",
 "        }));",
 "      }"
 ].join('\n'));
const oldPlace=[
 "    const narrow=window.innerWidth<=700||document.documentElement.classList.contains('phone');",
 "    const edge=Math.min(window.innerWidth/2,157);",
 "    const left=narrow?Math.max(edge,Math.min(window.innerWidth-edge,p.x)):Math.max(165,Math.min(window.innerWidth-165,p.x));",
 "    const phone=document.documentElement.classList.contains('phone');",
 "    const half=Math.max(92,host.getBoundingClientRect().height/2);",
 "    const upper=52+half;",
 "    const lower=window.innerHeight-(phone?72:15)-half;",
 "    const top=narrow?",
 "      (lower<upper?window.innerHeight/2:Math.max(upper,Math.min(lower,p.y-20))):",
 "      Math.max(150,Math.min(window.innerHeight-165,p.y-32));",
 "    host.style.left=left+'px';host.style.top=top+'px';",
 "    host.style.setProperty('--rk-anchor-left',left+'px');",
 "    host.style.setProperty('--rk-anchor-top',top+'px');"
].join('\n');
const newPlace=[
 "    const phone=document.documentElement.classList.contains('phone');",
 "    const narrow=phone||window.innerWidth<=700;",
 "    const vw=window.innerWidth,vh=window.innerHeight;",
 "    const topHud=document.querySelector('#topbar')?.getBoundingClientRect();",
 "    const menuPad=document.querySelector('#pad')?.getBoundingClientRect();",
 "    const leftCol=document.querySelector('#leftcol')?.getBoundingClientRect();",
 "    const rightCol=document.querySelector('#rightcol')?.getBoundingClientRect();",
 "    // Desktop: avoid stats/build dock and right panels; phone: avoid thumb bar.",
 "    const sideLeft=narrow?8:Math.min(vw*.36,(leftCol?.right??0)+6);",
 "    const sideRight=narrow?vw-8:Math.max(vw*.64,(rightCol?.left??vw)-6);",
 "    const halfWidth=narrow?Math.min(147,(vw-18)/2):161;",
 "    const minLeft=sideLeft+halfWidth,maxLeft=sideRight-halfWidth;",
 "    const left=narrow?vw/2:Math.max(minLeft,Math.min(maxLeft,p.x));",
 "    const padTop=phone&&(menuPad?.height??0)>0?(menuPad?.top??vh):vh;",
 "    const availableTop=Math.max(40,(topHud?.bottom??0)+8);",
 "    const availableBottom=phone?padTop-6:vh-14;",
 "    const room=Math.max(70,availableBottom-availableTop);",
 "    const halfHeight=narrow?Math.min(119,room/2-5):137;",
 "    const mid=(availableTop+availableBottom)/2;",
 "    const preferred=phone?mid:p.y-32;",
 "    const top=Math.max(availableTop+halfHeight,Math.min(availableBottom-halfHeight,preferred));",
 "    host.style.left=left+'px';host.style.top=top+'px';",
 "    host.dataset.rkViewportSafe='true';
    host.style.setProperty('--rk-anchor-left',left+'px');
    host.style.setProperty('--rk-anchor-top',top+'px');"
].join('\n');
patch('src/ui/raniWheel.ts',oldPlace,newPlace);
patch('src/ui/raniWheel.ts',
 [
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade",
 "      ? '비용: '+status.upgradeCost : (target.building?'최고 단계 또는 강화 불가':'자연물은 강화할 수 없습니다.');"
 ].join('\n'),
 [
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade",
 "      ? '강화 비용: '+status.upgradeCost",
 "      : (status.upgradeReason||(target.building?'최고 단계 또는 강화 불가':'자연물은 강화할 수 없습니다.'));",
 "    upgrade.dataset.rkUnavailable=upgrade.disabled?upgrade.title:'';",
 "    upgrade.setAttribute('aria-label',upgrade.disabled?'강화 불가 · '+upgrade.title:'강화 · 비용 '+status.upgradeCost);"
 ].join('\n'));
patch('src/ui/raniWheel.ts',
 [
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair",
 "      ? '비용: '+status.repairCost : '수리할 손상이 없습니다.';"
 ].join('\n'),
 [
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair",
 "      ? '수리 비용: '+status.repairCost",
 "      : (status.repairReason||'수리할 손상이 없습니다.');",
 "    repair.dataset.rkUnavailable=repair.disabled?repair.title:'';",
 "    repair.setAttribute('aria-label',repair.disabled?'수리 불가 · '+repair.title:'수리 · 비용 '+status.repairCost);"
 ].join('\n'));
patch('src/ui/raniWheel.ts',
 [
 "    remove.disabled=!status.removable;",
 "    remove.title=status.removable?'철거 전 확인':'철거 보호: '+status.reason;"
 ].join('\n'),
 [
 "    remove.disabled=!status.removable;",
 "    remove.title=status.removable?'철거 전 확인':'철거 보호: '+status.reason;",
 "    remove.dataset.rkUnavailable=remove.disabled?remove.title:'';",
 "    remove.setAttribute('aria-label',remove.disabled?'철거 불가 · '+status.reason:'철거 · 확인 필요');"
 ].join('\n'));
fs.appendFileSync(filename('public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-royal-controls.css'),'utf8'));
console.log('PASS v5.30 one REAL bottom Build dock, moved wired Guide and viewport-safe hex');
