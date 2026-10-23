// v5.35 — construction catalog layout and selection affordances.
// Structural changes to the real HUD; never alter build rules, serialization, or art.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(file,from,to){
 const p=path.join(root,file),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.35 source drift '+file+': '+from.slice(0,75));
 fs.writeFileSync(p,s.replace(from,to));
}
// Categories should lead the catalog. The old order put the building cards
// ABOVE the category choices, causing a huge jump and invisible cards on phones.
edit('src/ui/hud.ts',
`    this.buildPanel = this.el('div', wrap, 'panel hidden', 'buildmenu');
    this.buildBar = this.el('div', wrap, 'panel', 'buildbar');`,
`    this.buildPanel = this.el('div', wrap, 'panel hidden', 'buildmenu');
    this.buildBar = this.el('div', wrap, 'panel', 'buildbar');
    wrap.insertBefore(this.buildBar, this.buildPanel);
    const rkGuide = this.el('div', wrap, '', 'rk-build-guide');
    rkGuide.textContent = '종류 선택 → 건물 선택 → 지도에 배치';
    rkGuide.setAttribute('role','note');
    wrap.insertBefore(rkGuide, this.buildPanel);`);
// Clicking an already active category must not silently close the entire list.
edit('src/ui/hud.ts',
`      cat.onclick = () => this.openCategory(gi === this.openGroup ? null : gi);`,
`      cat.onclick = () => this.openCategory(gi);`);
// Placement exit stays compact, but identify exactly which building is selected.
edit('src/main.ts',
`    if(sel)rkCancelPlacement.title=BUILDINGS[sel]?.label+' 배치 취소';
    else {`,
`    if(sel){
      rkCancelPlacement.title=BUILDINGS[sel]?.label+' 배치 취소';
      rkCancelPlacement.textContent='×  '+BUILDINGS[sel]?.label+' 취소';
    }else {
      rkCancelPlacement.textContent='×  배치 취소';`);
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+
 fs.readFileSync(path.join(import.meta.dirname,'v535-construction-catalog.css'),'utf8'));
console.log('PASS v5.35 category-first real HUD, persistent tabs, compact responsive cards and named cancel');
