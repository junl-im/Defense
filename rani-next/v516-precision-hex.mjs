// v5.16 targeted fixes applied after v5.15. All game logic remains upstream.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(rel,from,to){
 const filename=path.join(root,rel),s=fs.readFileSync(filename,'utf8');
 assert.equal(s.split(from).length,2,'v5.16 changed anchor '+rel+' '+from.slice(0,85));
 fs.writeFileSync(filename,s.replace(from,to));
}
// Six native hex buttons ONLY: no decorative table, no automatic message box.
// The user can still open '정보' for unavailable reasons and exact live costs.
edit('src/ui/raniWheel.ts',
"      message.textContent=why.length?why.join('  ·  '):'이 건물의 가능한 행동을 선택하세요.';",
"      message.textContent='';");
edit('src/ui/raniWheel.ts',
"      if(!status.removable){const note=document.createElement('p');note.textContent=status.reason;info.append(note);}",
"      if(why.length){const note=document.createElement('p');note.className='rk-hex-unavailable';note.textContent='현재 불가능: '+why.join(' · ');info.append(note);}");
// A projected quadrilateral is much less ambiguous than the former oversized
// axis-aligned screen-space rectangle, especially in dense castle streets.
edit('src/main.ts',
"  function rkMobileTapBuilding(px:number,py:number,wx:number,wz:number):boolean{",
[
"  function rkInProjectedFootprint(px:number,py:number,corners:{x:number;y:number}[],padding=9):boolean{",
"    let positive=false,negative=false;",
"    for(let i=0;i<corners.length;i++){",
"      const a=corners[i],b=corners[(i+1)%corners.length];",
"      const cross=(b.x-a.x)*(py-a.y)-(b.y-a.y)*(px-a.x);",
"      if(cross>0.01)positive=true;else if(cross<-.01)negative=true;",
"      const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;",
"      const t=len?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/len)):0;",
"      if(Math.hypot(px-a.x-t*dx,py-a.y-t*dy)<=padding)return true;",
"    }",
"    return !(positive&&negative);",
"  }",
"  function rkMobileTapBuilding(px:number,py:number,wx:number,wz:number):boolean{"
].join('\n'));
edit('src/main.ts',
"      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;",
"      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;\\n      const projected:{x:number;y:number}[]=[];".replace('\\n','\n'));
edit('src/main.ts',
"        const [sx,sy]=iso.worldToScreen(x,terrain.heightAt(x,z),z);\\n        minX=Math.min(minX,sx);maxX=Math.max(maxX,sx);".replace('\\n','\n'),
"        const [sx,sy]=iso.worldToScreen(x,terrain.heightAt(x,z),z);\\n        projected.push({x:sx,y:sy});\\n        minX=Math.min(minX,sx);maxX=Math.max(maxX,sx);".replaceAll('\\n','\n'));
edit('src/main.ts',
"      if(px<minX-11||px>maxX+11||py<minY-42||py>maxY+12)continue;",
[
"      if(px<minX-9||px>maxX+9||py<minY-36||py>maxY+9)continue;",
"      // The roof is projected above the exact ground footprint, never the",
"      // oversized rectangular target that stole taps from nearby buildings.",
"      if(!rkInProjectedFootprint(px,py,projected,9)&&",
"         !rkInProjectedFootprint(px,py+22,projected,9))continue;"
].join('\n'));
// Native, localized reason list is opt-in rather than a permanently exposed panel.
edit('src/main.ts',
"  rkQuickRoot.append(rkQuickHead,rkQuickNote,rkQuickChoices,rkQuickAll);",
[
"  const rkQuickReasons=document.createElement('details');",
"  rkQuickReasons.className='rk-quick-reasons';",
"  rkQuickRoot.append(rkQuickHead,rkQuickNote,rkQuickChoices,rkQuickReasons,rkQuickAll);"
].join('\n'));
edit('src/main.ts',
"    rkQuickChoices.replaceChildren();",
[
"    rkQuickChoices.replaceChildren();",
"    rkQuickReasons.replaceChildren();",
"    const rejected=priority.filter(name=>BUILDINGS[name]&&",
"      document.querySelector('#buildmenu button[data-name=\"'+name+'\"]')&&",
"      !placement.check(name,tx,tz).ok);",
"    if(rejected.length){",
"      const heading=document.createElement('summary');",
"      heading.textContent='다른 건물이 불가능한 이유 ('+rejected.length+')';",
"      const list=document.createElement('ul');",
"      for(const name of rejected.slice(0,5)){",
"        const item=document.createElement('li');",
"        item.textContent=BUILDINGS[name].label+' · '+placement.check(name,tx,tz).reason;",
"        list.append(item);",
"      }",
"      rkQuickReasons.append(heading,list);",
"    }"
].join('\n'));
// The original tile outline was already accurate, but no persistent reason
// stayed on-screen. Add a noninteractive 1-line phone hint synchronized to
// the SAME Placement.check() that commits each building.
edit('src/main.ts',
"  const rkQuickRoot=document.createElement('section');",
[
"  const rkPlacementHint=document.createElement('div');",
"  rkPlacementHint.id='rk-placement-hint';",
"  rkPlacementHint.hidden=true;",
"  rkPlacementHint.setAttribute('role','status');",
"  document.body.appendChild(rkPlacementHint);",
"  const rkQuickRoot=document.createElement('section');"
].join('\n'));
edit('src/main.ts',
"    if(!selected||!hover){rkFootprint.dataset.rkOrigin='';rkFootprint.dataset.rkLegal='';return;}",
"    if(!selected||!hover){rkFootprint.dataset.rkOrigin='';rkFootprint.dataset.rkLegal='';rkPlacementHint.hidden=true;return;}");
edit('src/main.ts',
"    const legal=placement.check(selected,x,z).ok;",
"    const rkCheck=placement.check(selected,x,z);const legal=rkCheck.ok;");
edit('src/main.ts',
"    rkFootprint.dataset.rkLegal=String(legal);",
[
"    rkFootprint.dataset.rkLegal=String(legal);",
"    const label=legal?'설치 가능 · 화면을 한 번 더 누르면 건설':'설치 불가 · '+rkCheck.reason;",
"    if(rkPlacementHint.textContent!==label)rkPlacementHint.textContent=label;",
"    rkPlacementHint.dataset.ready=String(legal);",
"    rkPlacementHint.hidden=!document.documentElement.classList.contains('phone');"
].join('\n'));
// Preserve all v5.15 behavior, old saves, atlas selection and title screen.
edit('src/ui/menu.ts',"version.textContent='v5.15';","version.textContent='v5.16';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.15';","rkBuildName.textContent='라니킹덤 · v5.16';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v516-clean-hex.css'),'utf8'));
console.log('PASS v5.16 clean 6-hex, accurate roof polygon and exact construction reasons');
