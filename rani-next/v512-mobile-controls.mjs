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
// Keep the selected building as the anchor of its hex inspector on phones.
// The existing v5.5 wheel pins the phone panel to a constant .43 screen height;
// bind the real Fiefdom projection instead, clamped between HUD and thumb pad.
replace('src/ui/raniWheel.ts',
"    const narrow=window.innerWidth<=700;",
"    const narrow=window.innerWidth<=700||document.documentElement.classList.contains('phone');");
replace('src/ui/raniWheel.ts',
"    const left=narrow?window.innerWidth/2:Math.max(165,Math.min(window.innerWidth-165,p.x));",
"    const edge=Math.min(window.innerWidth/2,157);"+
"\n    const left=narrow?Math.max(edge,Math.min(window.innerWidth-edge,p.x))"+
":Math.max(165,Math.min(window.innerWidth-165,p.x));");
replace('src/ui/raniWheel.ts',
"    const top=narrow?Math.max(155,Math.min(window.innerHeight-180,window.innerHeight*.43))\n      :Math.max(150,Math.min(window.innerHeight-165,p.y-32));",
[
"    const phone=document.documentElement.classList.contains('phone');",
"    const half=Math.max(92,host.getBoundingClientRect().height/2);",
"    const upper=52+half;",
"    const lower=window.innerHeight-(phone?72:15)-half;",
"    const top=narrow?",
"      (lower<upper?window.innerHeight/2:Math.max(upper,Math.min(lower,p.y-20))):",
"      Math.max(150,Math.min(window.innerHeight-165,p.y-32));"
].join('\n'));
replace('src/ui/raniWheel.ts',
"    host.style.left=left+'px';host.style.top=top+'px';",
"    host.style.left=left+'px';host.style.top=top+'px';"+
"\n    host.style.setProperty('--rk-anchor-left',left+'px');"+
"\n    host.style.setProperty('--rk-anchor-top',top+'px');");
// Use meaningful native button labels rather than English in the phone pad.
replace('src/ui/touch.ts',
"    mapBtn = btn('Map', () => hooks.openMap?.());",
"    mapBtn = btn('지도', () => hooks.openMap?.());");
replace('src/ui/touch.ts',
"    infoBtn = btn('Info', () => hooks.openInfo?.());",
"    infoBtn = btn('정보', () => hooks.openInfo?.());");
{
 const p=file('src/ui/touch.ts'),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split("cmd = btn('Move'").length,3,'native touch command drift');
 assert.equal(s.split("buildBtn = btn('Build'").length,3,'native build label drift');
 fs.writeFileSync(p,s.replaceAll("cmd = btn('Move'","cmd = btn('선택'")
  .replaceAll("buildBtn = btn('Build'","buildBtn = btn('건설'")
  .replace("cmd.textContent = m === 'command' ? 'Ordering' : 'Move';",
           "cmd.textContent = m === 'command' ? '이동 지시' : '선택';"));
}

replace('src/ui/menu.ts',"version.textContent='v5.11';","version.textContent='v5.12';");
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v512-mobile-hud.css'),'utf8'));
console.log('PASS v5.12 mobile pinch guard, one-tap hex inspector, native continuous zoom, compact HUD');
