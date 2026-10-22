// v5.30: source-level native dock and 6 actual hex action buttons.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(rel,from,to){
 const file=path.join(root,rel),s=fs.readFileSync(file,'utf8');
 assert.equal(s.split(from).length,2,'v5.30 source drift '+rel+' '+from.slice(0,96));
 fs.writeFileSync(file,s.replace(from,to));
}
const wheelFile=path.join(root,'src/ui/raniWheel.ts');
const wheelText=fs.readFileSync(wheelFile,'utf8');
const marker="    const narrow=window.innerWidth<=700||document.documentElement.classList.contains('phone');";
const tail="    host.style.setProperty('--rk-anchor-top',top+'px');";
const a0=wheelText.indexOf(marker),b0=wheelText.indexOf(tail,a0);
assert.ok(a0>=0&&b0>a0,'v5.30 cannot locate actual v5.12 wheel positioning');
const oldPlace=wheelText.slice(a0,b0+tail.length);
const newPlace=[
 "    const narrow=window.innerWidth<=700 || document.documentElement.classList.contains('phone');",
 "    const pad=document.querySelector<HTMLElement>('#pad');",
 "    const padRect=pad?.getBoundingClientRect();",
 "    const padTop=padRect && padRect.height>0 ? padRect.top : window.innerHeight;",
 "    const left=narrow?window.innerWidth/2:Math.max(165,Math.min(window.innerWidth-165,p.x));",
 "    // Keep actions clear of the physical bottom bar, including safe-area insets.",
 "    const maxTop=narrow?Math.max(140,padTop-143):Math.max(148,window.innerHeight-148);",
 "    let top=Math.max(140,Math.min(maxTop,p.y-32));",
 "    if(narrow){",
 "      top=Math.min(maxTop,Math.max(140,Math.min(p.y,window.innerHeight/2)));",
 "    }else{",
 "      const dock=document.querySelector<HTMLElement>('#rk-actions');",
 "      if(dock){",
 "        const d=dock.getBoundingClientRect();",
 "        if(d.width&&d.height&&left<d.right+145&&top>d.top-120){",
 "          const alternative=d.right+165;",
 "          if(alternative<=window.innerWidth-165)host.style.left=alternative+'px';",
 "          else {top=Math.max(146,d.top-148);host.style.left=left+'px';}",
 "        }else host.style.left=left+'px';",
 "      }else host.style.left=left+'px';",
 "    }",
 "    if(narrow)host.style.left=left+'px';",
 "    host.style.top=top+'px';",
 "    host.style.setProperty('--rk-anchor-left',host.style.left);",
 "    host.style.setProperty('--rk-anchor-top',host.style.top);",
 "    host.dataset.rkInfoPlacement=narrow&&window.innerHeight<540?'compact':'above';"
].join('\n');
patch('src/ui/raniWheel.ts',oldPlace,newPlace);
patch('src/ui/raniWheel.ts',
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade\n      ? '비용: '+status.upgradeCost : (target.building?'최고 단계 또는 강화 불가':'자연물은 강화할 수 없습니다.');",
 "    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade\n      ? '강화 비용: '+status.upgradeCost : (status.level>=3?'최고 강화 단계입니다.':'강화할 수 없습니다. 정보에서 이유를 확인하세요.');");
patch('src/ui/raniWheel.ts',
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair\n      ? '비용: '+status.repairCost : '수리할 손상이 없습니다.';",
 "    repair.disabled=!status.canRepair;repair.title=status.canRepair\n      ? '수리 비용: '+status.repairCost : '수리 불가 · 정보에서 손상/자원을 확인하세요.';");
patch('src/ui/raniWheel.ts',
 "    manage.disabled=!status.canManage;manage.textContent=status.canManage ? status.manageLabel : '관리';",
 "    manage.disabled=!status.canManage;manage.textContent=status.canManage ? status.manageLabel : '관리';\n    manage.title=status.canManage?'건물 생산·성문 관리':'이 건물에는 관리 동작이 없습니다.';");
patch('src/ui/menu.ts',"version.textContent='v5.29';","version.textContent='v5.30';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.29';","rkBuildName.textContent='라니킹덤 · v5.30';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v530-dock-hex.css'),'utf8'));
console.log('PASS v5.30 real dock and native six-hex responsive redesign');
