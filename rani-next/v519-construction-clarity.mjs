// v5.19: pure modular construction details; no game balance adjustments.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(rel,from,to){const p=path.join(root,rel),s=fs.readFileSync(p,'utf8');assert.equal(s.split(from).length,2,'v5.19 source drift '+rel+' '+from.slice(0,90));fs.writeFileSync(p,s.replace(from,to));}
fs.mkdirSync(path.join(root,'src/ui'),{recursive:true});
fs.writeFileSync(path.join(root,'src/ui/raniBuildExplain.ts'),fs.readFileSync(path.join(import.meta.dirname,'v519-build-explain.ts'),'utf8'));
edit('src/main.ts',"import { showPause } from './ui/pause';","import { showPause } from './ui/pause';\nimport { describeBuildingCost } from './ui/raniBuildExplain';");
edit('src/main.ts',
"      const label=document.createElement('span');label.textContent=def.label;\n      button.append(label);",
[
"      const label=document.createElement('span');label.textContent=def.label;",
"      label.className='rk-choice-name';",
"      const detail=describeBuildingCost(def,state.stock);",
"      const cost=document.createElement('small');",
"      cost.className='rk-choice-cost';",
"      cost.textContent=detail.cost;",
"      const footprint=document.createElement('small');",
"      footprint.className='rk-choice-size';footprint.textContent=detail.footprint;",
"      button.dataset.rkCost=detail.cost;",
"      button.dataset.rkFootprint=detail.footprint;",
"      button.setAttribute('aria-label',def.label+', '+detail.footprint+', '+detail.cost);",
"      button.append(label,footprint,cost);"
].join('\n'));
edit('src/main.ts',
"      button.addEventListener('click',()=>{\n        rkQuickCloseNow();\n        original.click();",
[
"      button.addEventListener('click',()=>{",
"        // Prices and occupied tiles may change while the picker is open.",
"        // Use native Placement.check immediately before selecting a build.",
"        const real=placement.check(name,tx,tz);",
"        if(!real.ok){",
"          rkQuickNote.textContent=def.label+' · 현재 설치 불가: '+real.reason;",
"          rkQuickNote.dataset.rkInvalid='true';",
"          const latest=describeBuildingCost(def,state.stock);",
"          cost.textContent=latest.cost;button.dataset.rkCost=latest.cost;",
"          return;",
"        }",
"        delete rkQuickNote.dataset.rkInvalid;",
"        rkQuickCloseNow();",
"        original.click();"
].join('\n'));
edit('src/ui/menu.ts',"version.textContent='v5.18';","version.textContent='v5.19';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.18';","rkBuildName.textContent='라니킹덤 · v5.19';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v519-build-cost.css'),'utf8'));
console.log('PASS v5.19 modular construction cost clarity and live placement revalidation');
