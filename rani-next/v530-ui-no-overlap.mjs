// v5.30 targeted UI architecture repairs. NO game sim/save changes, NO SVG.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function edit(rel,a,b){
 const file=f(rel),s=fs.readFileSync(file,'utf8');
 assert.equal(s.split(a).length,2,'v5.30 source drift '+rel+' '+a.slice(0,110));
 fs.writeFileSync(file,s.replace(a,b));
}
// The original 5.1 title/bottom-left build FAB still exists, while v5.23
// created a SECOND construction control. Retire the stale visible/focusable
// legacy FAB. Keep the original building catalog and 5.23 handlers intact.
edit('src/main.ts',
 "      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);",
 [
 "      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);",
 "      const oldFab=document.querySelector<HTMLElement>('#rani-build-toggle');",
 "      if(oldFab){oldFab.hidden=true;oldFab.tabIndex=-1;oldFab.setAttribute('aria-hidden','true');}",
 "      // Reserve true bottom space for the dock, even on resized short screens.",
 "      const syncDock=()=>{",
 "        const stats=document.querySelector<HTMLElement>('#stats');",
 "        const bottom=stats?Math.ceil(stats.getBoundingClientRect().bottom):140;",
 "        const rowH=Math.ceil(row.getBoundingClientRect().height)||58;",
 "        dock.style.setProperty('--rk530-stat-bottom',String(Math.max(85,bottom))+'px');",
 "        dock.style.setProperty('--rk530-build-limit',String(Math.max(58,innerHeight-bottom-rowH-29))+'px');",
 "        dock.dataset.rkLayout='stable';",
 "      };",
 "      requestAnimationFrame(syncDock);",
 "      window.addEventListener('resize',syncDock,{passive:true});",
 "      window.addEventListener('rk-dock-layout',()=>requestAnimationFrame(syncDock));",
 "      if('ResizeObserver'in window){",
 "        const ro=new ResizeObserver(()=>requestAnimationFrame(syncDock));",
 "        const stats=document.querySelector('#stats');if(stats)ro.observe(stats);",
 "      }"
 ].join('\n')
);
edit('src/ui/hud.ts',
 "    if(rkDock){rkDock.dataset.open=String(gi!==null);rkDock.querySelector('#rk-build-toggle')?.setAttribute('aria-expanded',String(gi!==null));}",
 "    if(rkDock){rkDock.dataset.open=String(gi!==null);rkDock.querySelector('#rk-build-toggle')?.setAttribute('aria-expanded',String(gi!==null));window.dispatchEvent(new Event('rk-dock-layout'));}"
);
// Replace the initial static bottom bias (phone y=h-160) with an adaptive
// wheel position where the entire six hexes and expanded inspector stay
// INSIDE the playable rectangle above the real native #pad.
const oldPlace=[
 "  function place(){",
 "    if(!target)return;",
 "    // Keep the six actions centred over the actual projected building, not",
 "    // a fixed HUD corner. Clamp to keep screen-edge buildings accessible.",
 "    const p=callbacks.screen(target);",
 "    const narrow=window.innerWidth<=700;",
 "    const left=narrow?window.innerWidth/2:Math.max(165,Math.min(window.innerWidth-165,p.x));",
 "    const top=narrow?window.innerHeight-160:Math.max(150,Math.min(window.innerHeight-165,p.y-32));",
 "    host.style.left=left+'px';host.style.top=top+'px';",
 "  }"
].join('\n');
const newPlace=[
 "  function place(){",
 "    if(!target)return;",
 "    const p=callbacks.screen(target);",
 "    const w=window.innerWidth,h=window.innerHeight;",
 "    const phone=document.documentElement.classList.contains('phone')||w<=700;",
 "    const nativePad=phone?document.querySelector<HTMLElement>('#pad'):null;",
 "    const padTop=nativePad?.getBoundingClientRect().top??h;",
 "    const hudTop=phone?(h<=450?48:76):20;",
 "    let scale=1;",
 "    if(phone){",
 "      const usable=Math.max(190,padTop-hudTop-20);",
 "      scale=Math.max(.52,Math.min(.87,(usable-(infoOpen?Math.min(116,h*.19):0))/266));",
 "    }",
 "    buttons.style.setProperty('--rk-wheel-scale',String(scale));",
 "    host.style.setProperty('--rk-wheel-scale',String(scale));",
 "    const wheelH=266*scale;",
 "    const infoHeight=infoOpen?Math.max(40,Math.min(phone?116:155,h*.19)):0;",
 "    host.style.setProperty('--rk530-info-height',infoHeight+'px');",
 "    const minTop=hudTop+wheelH/2+6;",
 "    const maxTop=Math.max(minTop,padTop-wheelH/2-infoHeight-15);",
 "    let left=phone?w/2:Math.max(165,Math.min(w-165,p.x));",
 "    let top=Math.max(minTop,Math.min(maxTop,p.y-32));",
 "    const dock=!phone?document.querySelector<HTMLElement>('#rk-actions'):null;",
 "    if(dock){",
 "      const dr=dock.getBoundingClientRect();",
 "      if(top+wheelH/2>dr.top-10&&left-157<dr.right+8)",
 "        left=Math.min(w-165,Math.max(left,dr.right+170));",
 "    }",
 "    host.style.left=left+'px';host.style.top=top+'px';",
 "    // A scaled wheel host and its absolute details can have different CSS",
 "    // geometry on phone landscape. Use the REAL rectangle to finish fitting.",
 "    if(phone&&infoOpen&&!info.hidden){",
 "      const detail=info.getBoundingClientRect();",
 "      if(detail.bottom>padTop-8){",
 "        const shift=detail.bottom-(padTop-8);",
 "        host.style.top=(top-shift)+'px';",
 "      }",
 "    }",
 "    host.dataset.rkViewportFit='true';",
 "  }"
].join('\n');
// Previous UI patches may have adjusted comments/spacing inside place().
// Match the entire one function and preserve all neighbouring wheel handlers.
const wheelFile=f('src/ui/raniWheel.ts');
const wheelSource=fs.readFileSync(wheelFile,'utf8');
const placePattern=/  function place\(\)\{[\s\S]*?\n  \}\n  function show\(/;
assert.ok(placePattern.test(wheelSource),'v5.30 dynamic native wheel place() not found');
fs.writeFileSync(wheelFile,wheelSource.replace(placePattern,newPlace+'\n  function show('));
edit('src/ui/raniWheel.ts',
 "if(id==='info'){infoOpen=!infoOpen;lastInfo='';info.hidden=!infoOpen;update();return;}",
 "if(id==='info'){infoOpen=!infoOpen;lastInfo='';info.hidden=!infoOpen;update();place();return;}"
);
edit('src/ui/raniWheel.ts',
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade",
 "    upgrade.disabled=!status.canUpgrade;upgrade.dataset.rkState=status.canUpgrade?'ready':'unavailable';upgrade.title=status.canUpgrade"
);
edit('src/ui/raniWheel.ts',
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair",
 "    repair.disabled=!status.canRepair;repair.dataset.rkState=status.canRepair?'ready':'unavailable';repair.title=status.canRepair"
);
edit('src/ui/raniWheel.ts',
 "    manage.disabled=!status.canManage;manage.textContent=status.canManage ? status.manageLabel : '관리';",
 "    manage.disabled=!status.canManage;manage.dataset.rkState=status.canManage?'ready':'unavailable';manage.textContent=status.canManage ? status.manageLabel : '관리';"
);
edit('src/ui/raniWheel.ts',
 "    remove.disabled=!status.removable;",
 "    remove.disabled=!status.removable;remove.dataset.rkState=status.removable?'ready':'unavailable';"
);
// Phone/radial overlay logic still receives all original callbacks unchanged.
edit('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
fs.appendFileSync(f('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-ui-layout.css'),'utf8'));
console.log('PASS v5.30 single native desktop dock, six real hex actions, mobile pad overlap layout');
