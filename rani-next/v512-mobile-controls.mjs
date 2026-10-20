// Rani v5.12 — phone-first control and HUD repair, applied AFTER v5.11.
// Preserve upstream Fiefdom mechanics, actual screen picking and all sprite art.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=p=>path.join(root,p);
function replace(rel,from,to){
 const p=file(rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.12 source drift: '+rel+' '+from.slice(0,70));
 fs.writeFileSync(p,s.replace(from,to));
}
// Track each finger explicitly. The original main pointerup listener runs
// BEFORE attachPinch's pointerup listener, so pinching() alone is insufficient
// to suppress a phantom placement on the last released finger.
replace('src/main.ts',
"  canvas.addEventListener('pointerdown', e => {",
[
"  const rkFingers=new Set<number>();",
"  let rkGestureWasMulti=false;",
"  canvas.addEventListener('pointerdown', e => {",
"    if(e.pointerType==='touch'){",
"      rkFingers.add(e.pointerId);",
"      if(rkFingers.size>=2){rkGestureWasMulti=true;dragging=false;dragMoved=true;}",
"    }"
].join('\n'));
replace('src/main.ts',
"  canvas.addEventListener('pointerup', e => {\n    if (turning) {",
[
"  canvas.addEventListener('pointerup', e => {",
"    if(e.pointerType==='touch'){",
"      const wasMulti=rkGestureWasMulti;",
"      rkFingers.delete(e.pointerId);",
"      if(rkFingers.size===0)rkGestureWasMulti=false;",
"      if(wasMulti){",
"        dragging=false;dragMoved=false;boxing=false;placement.dragFrom=null;",
"        if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);",
"        return; // pinch zoom never builds, demolishes or selects a target",
"      }",
"    }",
"    if (turning) {"
].join('\n'));
replace('src/main.ts',
"  canvas.addEventListener('pointercancel', () => {\n    dragging = false;",
"  canvas.addEventListener('pointercancel', () => {\n    rkFingers.clear();rkGestureWasMulti=false;\n    dragging = false;");
replace('src/main.ts',
"        if (dbl && selectTypeAt(e.clientX, e.clientY, false)) return;",
[
"        // A finger on a building is a building inspector before troop pick.",
"        // Command-mode orders and explicit double-tap troop selection remain.",
"        if(!dbl && clickBuildingAt(w.x,w.z)){army.clearSelection();return;}",
"        if (dbl && selectTypeAt(e.clientX, e.clientY, false)) return;"
].join('\n'));
// Native mobile zoom controls: the original phone pad *hides* zoom +/-,
// despite the renderer already having genuine continuous pinch input.
replace('src/main.ts',
"    if (phone) hud.enablePhoneLayout();",
[
"    if (phone) hud.enablePhoneLayout();",
"    if(phone){",
"      const zoom=document.createElement('div');zoom.id='rk-phone-zoom';",
"      zoom.setAttribute('role','group');zoom.setAttribute('aria-label','지도 확대 축소');",
"      const add=(label:string,description:string,factor:number)=>{",
"        const b=document.createElement('button');b.type='button';",
"        b.textContent=label;b.setAttribute('aria-label',description);",
"        b.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();iso.zoomByFactor(factor);});",
"        zoom.appendChild(b);",
"      };",
"      add('+','지도 확대',1.28);add('−','지도 축소',1/1.28);",
"      document.body.appendChild(zoom);",
"    }"
].join('\n'));
replace('src/ui/menu.ts',"version.textContent='v5.11';","version.textContent='v5.12';");
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v512-mobile-hud.css'),'utf8'));
console.log('PASS v5.12 mobile pinch guard, one-tap hex inspector, native continuous zoom, compact HUD');
