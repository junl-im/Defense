// v5.22: reinforce ACTUAL successful construction with footprint-sized stage effects.
// This runs after v5.21; simulation, resources and save format are unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function change(rel,from,to){
 const f=path.join(root,rel),s=fs.readFileSync(f,'utf8');
 assert.equal(s.split(from).length,2,'v5.22 transform drift: '+rel+' '+from.slice(0,90));
 fs.writeFileSync(f,s.replace(from,to));
}
change('src/ui/raniBuildFeedback.ts',
 " const show=(kind:Kind,x:number,z:number,label:string,level?:number)=>{",
 " const show=(kind:Kind,x:number,z:number,label:string,level?:number,width=1,depth=1)=>{");
change('src/ui/raniBuildFeedback.ts',
 "   entry.setAttribute('aria-hidden','true');",
 [
 "   entry.setAttribute('aria-hidden','true');",
 "   // Use the actual blueprint footprint, never cosmetic guessed dimensions.",
 "   const w=Number.isFinite(width)?Math.max(1,Math.min(8,width)):1;",
 "   const d=Number.isFinite(depth)?Math.max(1,Math.min(8,depth)):1;",
 "   const area=Math.max(1,Math.min(16,w*d));",
 "   entry.dataset.rkArea=w+'×'+d;",
 "   entry.style.setProperty('--rk-area-scale',(1+Math.min(.58,(Math.sqrt(area)-1)*.19)).toFixed(2));"
 ].join('\n'));
change('src/ui/raniBuildFeedback.ts',
 "   title.textContent=kind==='upgrade'?label.slice(0,24)+' · 강화 '+(level||2)+'단계':'건설 완료 · '+label.slice(0,24);",
 "   title.textContent=kind==='upgrade'?label.slice(0,24)+' · '+Math.max(1,(level||2)-1)+' → '+(level||2)+'단계 강화':'건설 완료 · '+label.slice(0,24);");
change('src/ui/raniBuildFeedback.ts',
 "   entry.append(ring,scaffold);",
 [
 "   // Three short sequential visual beats; the structure is ALREADY built.",
 "   // These are a celebration, not a fake timed building queue.",
 "   const phases=document.createElement('span');phases.className='rk-growth-steps';",
 "   for(let i=0;i<3;i++){const mark=document.createElement('i');",
 "     mark.className='rk-growth-step';mark.style.setProperty('--rk-step',String(i));",
 "     phases.append(mark);}",
 "   entry.append(ring,scaffold,phases);"
 ].join('\n'));
change('src/ui/raniBuildFeedback.ts',
 "   built:(x:number,z:number,label:string)=>show('build',x,z,label),",
 "   built:(x:number,z:number,label:string,width=1,depth=1)=>show('build',x,z,label,undefined,width,depth),");
change('src/ui/raniBuildFeedback.ts',
 "   upgraded:(x:number,z:number,label:string,level:number)=>show('upgrade',x,z,label,level),",
 "   upgraded:(x:number,z:number,label:string,level:number,width=1,depth=1)=>show('upgrade',x,z,label,level,width,depth),");
change('src/main.ts',
 "      rkGrowthFx.built(b.x+pw/2,b.z+pd/2,b.def.label);",
 "      rkGrowthFx.built(b.x+pw/2,b.z+pd/2,b.def.label,pw,pd);");
change('src/main.ts',
 "      rkGrowthFx.upgraded(b.x+b.def.footprint[0]/2,b.z+b.def.footprint[1]/2,b.def.label,b.lvl);",
 "      rkGrowthFx.upgraded(b.x+b.def.footprint[0]/2,b.z+b.def.footprint[1]/2,b.def.label,b.lvl,b.def.footprint[0],b.def.footprint[1]);");
change('src/ui/menu.ts',"version.textContent='v5.21';","version.textContent='v5.22';");
change('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.21';","rkBuildName.textContent='라니킹덤 · v5.22';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v522-growth-stages.css'),'utf8'));
console.log('PASS v5.22 footprint-true world celebration, 3-step visual staging and real level transitions');
