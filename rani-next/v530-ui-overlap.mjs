// v5.30 - remove duplicate desktop construction CTA and refine the NATIVE
// Rani 6-hex action callbacks, positioning and states. Save/economy untouched.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function patch(rel,from,to){
 const file=f(rel),s=fs.readFileSync(file,'utf8');
 assert.equal(s.split(from).length,2,'v5.30 source drift '+rel+': '+from.slice(0,125));
 fs.writeFileSync(file,s.replace(from,to));
}
patch('src/ui/raniWheel.ts',
 "    button.dataset.action=s.id;",
 "    button.dataset.action=s.id;\n"+
 "    button.dataset.rkIcon=({info:'ⓘ',upgrade:'↟',repair:'✚',manage:'⚙',build:'▦',remove:'×'} as Record<string,string>)[s.id];"
);
patch('src/ui/raniWheel.ts',
 "    info.hidden=true;host.hidden=true;message.textContent='';",
 "    info.hidden=true;host.hidden=true;host.dataset.rkInfoOpen='false';message.textContent='';"
);
patch('src/ui/raniWheel.ts',
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade",
 "    upgrade.disabled=!status.canUpgrade;\n"+
 "    upgrade.dataset.rkDisabled=String(!status.canUpgrade);\n"+
 "    upgrade.title=status.canUpgrade"
);
patch('src/ui/raniWheel.ts',
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair",
 "    repair.disabled=!status.canRepair;\n"+
 "    repair.dataset.rkDisabled=String(!status.canRepair);\n"+
 "    repair.title=status.canRepair"
);
patch('src/ui/raniWheel.ts',
 "    manage.disabled=!status.canManage;manage.textContent=status.canManage ? status.manageLabel : '관리';",
 "    manage.disabled=!status.canManage;manage.dataset.rkDisabled=String(!status.canManage);\n"+
 "    manage.textContent=status.canManage ? status.manageLabel : '관리';"
);
patch('src/ui/raniWheel.ts',
 "    remove.disabled=!status.removable;",
 "    remove.disabled=!status.removable;remove.dataset.rkDisabled=String(!status.removable);"
);
const a=[
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
const b=[
 "  function place(){",
 "    if(!target)return;",
 "    const p=callbacks.screen(target);",
 "    const phone=document.documentElement.classList.contains('phone');",
 "    const width=window.innerWidth,height=window.innerHeight;",
 "    const clamp=(value:number,min:number,max:number)=>",
 "      Math.max(min,Math.min(Math.max(min,max),value));",
 "    let left:number,top:number;",
 "    if(phone){",
 "      const pad=document.querySelector<HTMLElement>('#pad');",
 "      const dockTop=pad&&getComputedStyle(pad).display!=='none'",
 "        ? pad.getBoundingClientRect().top:height-65;",
 "      // Host height is 266px. The menu AND its clickable hex shapes end",
 "      // above the actual mobile dock, including landscape and safe-area phones.",
 "      left=width/2;",
 "      top=clamp(dockTop-145,136,Math.max(136,dockTop-145));",
 "    }else{",
 "      const dock=document.querySelector<HTMLElement>('#rk-actions');",
 "      const stat=document.querySelector<HTMLElement>('#stats');",
 "      const dockRect=dock?.getBoundingClientRect();",
 "      const dockBoundary=dockRect&&dockRect.width>0",
 "        ? dockRect.right+174:174;",
 "      const safeLeft=clamp(dockBoundary,166,width-166);",
 "      left=clamp(p.x,safeLeft,width-168);",
 "      // Expanded inspector has a real card below the 266px hexes.",
 "      // Reserve this height so the inspector stays inside the viewport.",
 "      const lastCentre=height-(infoOpen?282:147);",
 "      top=clamp(p.y-32,146,lastCentre);",
 "      if(stat&&!infoOpen){",
 "        const stats=stat.getBoundingClientRect();",
 "        if(left<stats.right+168&&top<stats.bottom+139){",
 "          top=clamp(stats.bottom+148,146,lastCentre);",
 "        }",
 "      }",
 "    }",
 "    const lx=Math.round(left)+'px',ty=Math.round(top)+'px';",
 "    if(host.style.left!==lx)host.style.left=lx;",
 "    if(host.style.top!==ty)host.style.top=ty;",
 "  }"
].join('\n');
patch('src/ui/raniWheel.ts',a,b);
patch('src/ui/raniWheel.ts',
 "    cleanModal();target=t;infoOpen=false;lastInfo='';info.hidden=true;",
 "    cleanModal();target=t;infoOpen=false;lastInfo='';info.hidden=true;host.dataset.rkInfoOpen='false';"
);
patch('src/ui/raniWheel.ts',
 "    if(id==='info'){infoOpen=!infoOpen;lastInfo='';info.hidden=!infoOpen;update();return;}",
 "    if(id==='info'){infoOpen=!infoOpen;lastInfo='';info.hidden=!infoOpen;\n"+
 "      host.dataset.rkInfoOpen=String(infoOpen);update();place();return;}"
);
patch('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
fs.appendFileSync(f('public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-dock-layout.css'),'utf8')
 +'\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-hex-royal.css'),'utf8'));
console.log('PASS v5.30 one visible desktop construction CTA, royal functional 6-hex, real phone dock collision clamp');
