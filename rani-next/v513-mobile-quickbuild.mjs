// v5.13: mobile-only screen-space picking and native terrain-aware quick build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=p=>path.join(root,p);
function edit(rel,from,to){
 const p=file(rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.13 source drift: '+rel+' '+from.slice(0,80));
 fs.writeFileSync(p,s.replace(from,to));
}
const extra=String.raw`
  // The picker delegates to existing building cards and Placement.check.
  // No new stock, building or placement rules are introduced.
  const rkQuickRoot=document.createElement('section');
  rkQuickRoot.id='rk-quick-build';
  rkQuickRoot.hidden=true;
  rkQuickRoot.setAttribute('aria-label','빈 땅 바로 건설');
  const rkQuickTitle=document.createElement('strong');
  rkQuickTitle.textContent='이 땅에 건설';
  const rkQuickClose=document.createElement('button');
  rkQuickClose.type='button';rkQuickClose.textContent='닫기';
  rkQuickClose.className='rk-quick-close';
  rkQuickClose.addEventListener('click',()=>{rkQuickRoot.hidden=true;});
  const rkQuickHead=document.createElement('div');
  rkQuickHead.className='rk-quick-head';rkQuickHead.append(rkQuickTitle,rkQuickClose);
  const rkQuickNote=document.createElement('p');
  rkQuickNote.className='rk-quick-note';
  const rkQuickChoices=document.createElement('div');
  rkQuickChoices.className='rk-quick-choices';
  const rkQuickAll=document.createElement('button');
  rkQuickAll.type='button';rkQuickAll.className='rk-quick-all';
  rkQuickAll.textContent='전체 건설 목록';
  rkQuickAll.addEventListener('click',()=>{rkQuickRoot.hidden=true;hud.openDrawer('build');});
  rkQuickRoot.append(rkQuickHead,rkQuickNote,rkQuickChoices,rkQuickAll);
  document.body.appendChild(rkQuickRoot);
  const rkQuickCloseNow=()=>{rkQuickRoot.hidden=true;};
  function rkOpenGroundBuild(wx:number,wz:number):boolean{
    if(!document.documentElement.classList.contains('phone')||placement.selected||hud.demolishing)return false;
    const tx=Math.floor(wx),tz=Math.floor(wz);
    if(tx<0||tz<0||tx>=MAP_W||tz>=MAP_H)return false;
    const priority=['hovel','woodcutter','wheat_farm','granary','stockpile','market'];
    const candidates=Array.from(document.querySelectorAll<HTMLButtonElement>('#buildmenu button[data-name]'))
      .filter(b=>!!b.dataset.name&&placement.check(b.dataset.name,tx,tz).ok)
      .sort((a,b)=>{
        const i=priority.indexOf(a.dataset.name||''),j=priority.indexOf(b.dataset.name||'');
        return (i<0?999:i)-(j<0?999:j);
      });
    rkQuickRoot.dataset.origin=tx+','+tz;
    rkQuickChoices.replaceChildren();
    rkQuickNote.textContent=candidates.length
      ? '이 위치에서 건설할 수 있는 건물입니다.'
      : '바로 지을 수 있는 건물이 없습니다. 주택 기준: '+placement.check('hovel',tx,tz).reason;
    for(const original of candidates.slice(0,4)){
      const name=original.dataset.name!;
      const def=BUILDINGS[name];
      const button=document.createElement('button');
      button.type='button';button.className='rk-quick-choice';
      button.dataset.name=name;
      const icon=original.querySelector<HTMLImageElement>('img.rani-approved-building');
      if(icon){
        const image=document.createElement('img');image.src=icon.src;image.alt='';
        button.append(image);
      }
      const label=document.createElement('span');label.textContent=def.label;
      button.append(label);
      button.addEventListener('click',()=>{
        rkQuickCloseNow();
        original.click();
        if(placement.selected===name){placement.moveTo(tx,tz);refreshOverlay();}
      });
      rkQuickChoices.append(button);
    }
    rkQuickRoot.hidden=false;
    rkWheel.close();
    return true;
  }
  function rkMobileTapBuilding(px:number,py:number,wx:number,wz:number):boolean{
    const direct=buildingAt(Math.floor(wx),Math.floor(wz));
    if(direct){rkWheel.toggle(rkTarget(direct));return true;}
    let nearest:PlacedBuilding|null=null,score=Infinity;
    for(const b of state.buildings){
      const [w,d]=b.def.footprint;
      const corners=[[b.x,b.z],[b.x+w,b.z],[b.x+w,b.z+d],[b.x,b.z+d]];
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      for(const [x,z] of corners){
        const [sx,sy]=iso.worldToScreen(x,terrain.heightAt(x,z),z);
        minX=Math.min(minX,sx);maxX=Math.max(maxX,sx);
        minY=Math.min(minY,sy);maxY=Math.max(maxY,sy);
      }
      if(px<minX-11||px>maxX+11||py<minY-42||py>maxY+12)continue;
      const cx=(minX+maxX)/2,cy=(minY+maxY)/2-12;
      const d2=(px-cx)**2+(py-cy)**2;
      if(d2<score){score=d2;nearest=b;}
    }
    if(!nearest)return false;
    rkWheel.toggle(rkTarget(nearest));
    return true;
  }
`;
edit('src/main.ts',"  const canvas = renderer.domElement;",
  "  const canvas = renderer.domElement;\n"+extra);
edit('src/main.ts',
  "        if(!dbl && clickBuildingAt(w.x,w.z)){army.clearSelection();return;}",
  "        if(!dbl && rkMobileTapBuilding(e.clientX,e.clientY,w.x,w.z)){\n"+
  "          rkQuickCloseNow();army.clearSelection();return;\n        }");
edit('src/main.ts',
  "        if (clickBuildingAt(w.x, w.z)) return;\n        army.clearSelection();\n        return;",
  "        if (clickBuildingAt(w.x, w.z)) return;\n        army.clearSelection();\n        if(!dbl)rkOpenGroundBuild(w.x,w.z);\n        return;");
edit('src/main.ts',
  "  canvas.addEventListener('pointerdown', e => {\n    if(e.pointerType==='touch'){",
  "  canvas.addEventListener('pointerdown', e => {\n    if(e.pointerType==='touch')rkQuickCloseNow();\n    if(e.pointerType==='touch'){");
edit('src/main.ts',
  "  canvas.addEventListener('pointercancel', () => {\n    rkFingers.clear();",
  "  canvas.addEventListener('pointercancel', () => {\n    rkQuickCloseNow();\n    rkFingers.clear();");
edit('src/main.ts',"raniWheel:rkWheel,","raniWheel:rkWheel, rkOpenGroundBuild, rkMobileTapBuilding,");
edit('src/main.ts',
  "  rkHarborPanel.id='rk-harbor-panel';",
  "  rkHarborPanel.id='rk-harbor-panel';\n  rkHarborPanel.dataset.hasHarbor='false';");
edit('src/main.ts',
  "    rkToggle.textContent=state.hasHarbor?'항구 · 교역선':'항구 · 건설';",
  "    rkHarborPanel.dataset.hasHarbor=String(state.hasHarbor);\n    rkToggle.textContent=state.hasHarbor?'항구 · 교역선':'항구 · 건설';");
const guidePath=file('public/rani/v57-guide.js'),guide=fs.readFileSync(guidePath,'utf8');
assert.equal(guide.split('  header.append(x);').length,2,'v5.13 guide header drift');
fs.writeFileSync(guidePath,guide.replace('  header.append(x);',[
"  const more=node('button','rk-step-more','자세히');",
"  more.type='button';more.setAttribute('aria-label','초보자 안내 자세히 펼치기');",
"  const compact=window.matchMedia('(max-width:700px)').matches||document.documentElement.classList.contains('phone');",
"  panel.dataset.rkCompact=String(compact);",
"  more.setAttribute('aria-expanded',String(!compact));",
"  more.onclick=()=>{",
"    const folded=panel.dataset.rkCompact==='true';",
"    panel.dataset.rkCompact=String(!folded);",
"    more.textContent=folded?'간단히':'자세히';",
"    more.setAttribute('aria-expanded',String(folded));",
"  };",
"  header.append(more,x);"
].join('\n')));
edit('src/ui/menu.ts',"version.textContent='v5.12';","version.textContent='v5.13';");
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v513-touch-build.css'),'utf8'));
console.log('PASS v5.13 roof touch, legal build cards, compact guide, harbor HUD gate');