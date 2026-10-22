import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const f=p=>path.join(root,p);
function replace(rel,a,b){
 const p=f(rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(a).length,2,'v5.28 source mismatch '+rel+' '+a.slice(0,95));
 fs.writeFileSync(p,s.replace(a,b));
}
fs.copyFileSync(path.join(import.meta.dirname,'v528-building-hit.ts'),f('src/ui/raniBuildingHit.ts'));
const main=f('src/main.ts');let source=fs.readFileSync(main,'utf8');
assert.ok(!source.includes("from './ui/raniBuildingHit'"));
source="import { rkPickVisibleBuilding } from './ui/raniBuildingHit';\n"+source;
const old=/  function rkMobileTapBuilding\(px:number,py:number,wx:number,wz:number\):boolean\{[\s\S]*?\n  \}/;
assert.ok(old.test(source),'v5.28 native touch picker missing');
const next=[
"  // Shared real-world projected silhouette for mouse and touch.",
"  const rkProjectBuilding=(x:number,z:number):[number,number]=>",
"    iso.worldToScreen(x,terrain.heightAt(x,z),z);",
"  function rkHitWholeBuilding(px:number,py:number,wx:number,wz:number,touch=false):PlacedBuilding|null{",
"    return buildingAt(Math.floor(wx),Math.floor(wz))",
"      || rkPickVisibleBuilding(px,py,state.buildings,rkProjectBuilding,touch);",
"  }",
"  function rkMobileTapBuilding(px:number,py:number,wx:number,wz:number):boolean{",
"    const target=rkHitWholeBuilding(px,py,wx,wz,true);",
"    if(!target)return false;",
"    rkWheel.toggle(rkTarget(target));",
"    return true;",
"  }"
].join('\n');
source=source.replace(old,next);
const sub=(a,b)=>{assert.equal(source.split(a).length,2,'v5.28 main drift '+a.slice(0,93));source=source.replace(a,b);};
sub("      const b = buildingAt(Math.floor(w.x), Math.floor(w.z));\n      if (b) {\n        demolish(b);",
    "      const b = rkHitWholeBuilding(e.clientX,e.clientY,w.x,w.z,e.pointerType==='touch');\n      if (b) {\n        demolish(b);");
sub("      if (clickBuildingAt(w.x, w.z)) return;\n      if (!e.shiftKey) army.clearSelection();",
    "      const pictured=rkHitWholeBuilding(e.clientX,e.clientY,w.x,w.z,false);\n      if(pictured){rkWheel.toggle(rkTarget(pictured));return;}\n      if (clickBuildingAt(w.x, w.z)) return;\n      if (!e.shiftKey) army.clearSelection();");
sub("      const what = describeAt(t.x, t.z);",
    "      const looked=buildingAt(t.x,t.z)||rkPickVisibleBuilding(mouseX,mouseY,state.buildings,rkProjectBuilding,false);\n      const what = looked?describeAt(looked.x,looked.z):describeAt(t.x,t.z);");
sub("raniWheel:rkWheel, rkOpenGroundBuild, rkMobileTapBuilding,",
    "raniWheel:rkWheel, rkOpenGroundBuild, rkMobileTapBuilding, rkHitWholeBuilding,");
fs.writeFileSync(main,source);
const fx=f('src/ui/raniBuildFeedback.ts');let effect=fs.readFileSync(fx,'utf8');
const fe=(a,b)=>{assert.equal(effect.split(a).length,2,'v5.28 growth drift '+a.slice(0,90));effect=effect.replace(a,b);};
fe("type Pulse={node:HTMLDivElement;x:number;z:number;expires:number};",
   "type Pulse={node:HTMLDivElement;x:number;z:number;width:number;depth:number;expires:number};");
fe("   entry.append(ring,scaffold,phases);",[
"   const outline=document.createElement('span');outline.className='rk-growth-outline';",
"   for(let side=0;side<4;side++){const edge=document.createElement('i');",
"     edge.className='rk-growth-edge';edge.dataset.rkEdge=String(side);outline.append(edge);}",
"   const wash=document.createElement('span');wash.className='rk-growth-wash';",
"   const tower=document.createElement('span');tower.className='rk-growth-tower';",
"   entry.append(wash,tower,ring,scaffold,outline,phases);"
].join('\n'));
fe("   const fx={node:entry,x,z,expires:performance.now()+ttl};",
   "   const fx={node:entry,x,z,width:w,depth:d,expires:performance.now()+ttl};");
fe("   if(visible){entry.node.style.left=x+'px';entry.node.style.top=y+'px';}",[
"   if(visible){",
"     entry.node.style.left=x+'px';entry.node.style.top=y+'px';",
"     const {width:w,depth:d}=entry;",
"     const corners=[[entry.x-w/2,entry.z-d/2],[entry.x+w/2,entry.z-d/2],",
"                    [entry.x+w/2,entry.z+d/2],[entry.x-w/2,entry.z+d/2]]",
"       .map(([wx,wz])=>project(wx,wz));",
"     const area=entry.node.querySelector<HTMLElement>('.rk-growth-outline');",
"     const wash=entry.node.querySelector<HTMLElement>('.rk-growth-wash');",
"     const tower=entry.node.querySelector<HTMLElement>('.rk-growth-tower');",
"     if(area&&wash&&tower&&corners.every(p=>p.every(Number.isFinite))){",
"       const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);",
"       const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);",
"       const ww=Math.max(2,maxX-minX),hh=Math.max(2,maxY-minY);",
"       const fill=(el:HTMLElement)=>{el.style.left=(minX-x)+'px';el.style.top=(minY-y)+'px';",
"         el.style.width=ww+'px';el.style.height=hh+'px';};",
"       fill(area);fill(wash);",
"       const polygon='polygon('+corners.map(([cx,cy])=>",
"         (((cx-minX)/ww)*100).toFixed(2)+'% '+(((cy-minY)/hh)*100).toFixed(2)+'%').join(',')+')';",
"       wash.style.clipPath=polygon;",
"       for(let i=0;i<4;i++){",
"         const el=area.children[i] as HTMLElement;",
"         const a=corners[i],b=corners[(i+1)%4];",
"         const dx=b[0]-a[0],dy=b[1]-a[1];",
"         el.style.left=(a[0]-minX)+'px';el.style.top=(a[1]-minY)+'px';",
"         el.style.width=Math.hypot(dx,dy)+'px';",
"         el.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';",
"       }",
"       const rise=Math.max(33,Math.min(130,hh*.76+Math.sqrt(w*d)*11));",
"       tower.style.left=(minX-x)+'px';tower.style.top=(minY-y-rise)+'px';",
"       tower.style.width=ww+'px';tower.style.height=(hh+rise)+'px';",
"       entry.node.dataset.rkProjectedWidth=String(Math.round(ww));",
"       entry.node.dataset.rkProjectedHeight=String(Math.round(hh));",
"       entry.node.dataset.rkFootprintCorners='4';",
"     }",
"   }"
].join('\n'));
fs.writeFileSync(fx,effect);
replace('src/ui/menu.ts',"version.textContent='v5.27';","version.textContent='v5.28';");
replace('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.27';","rkBuildName.textContent='라니킹덤 · v5.28';");
fs.appendFileSync(f('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v528-growth-perimeter.css'),'utf8'));
console.log('PASS v5.28 true building silhouette clicks, hover and projected 4-corner growth');
