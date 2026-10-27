// v5.37 — real terrain placement feedback + precise touch release coordinates.
// Keeps native costs, collision, save schema, map generation and sprites unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(file,from,to){
 const p=path.join(root,file),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.37 source drift '+file+': '+from.slice(0,85));
 fs.writeFileSync(p,s.replace(from,to));
}
// Correct a subtle fast-tap failure: release must use the released tile, not a
// previous animation frame's position (especially on touchscreens).
edit('src/main.ts',
`    if (placement.selected && (!dragMoved || placement.dragFrom)) {
      const pending = placement.selected;
      const tiles = placement.run();`,
`    if (placement.selected && (!dragMoved || placement.dragFrom)) {
      const pending = placement.selected;
      // Exact pointer-up location is authoritative even before the next frame.
      const targetTile = pickTile(e.clientX, e.clientY);
      placement.moveTo(targetTile.x,targetTile.z);
      const tiles = placement.run();`);
// The frame also uses mouse coordinates for ghost/cost preview. Touch input
// must update these on press, rather than leaving the cursor on an old tile.
edit('src/main.ts',
`  canvas.addEventListener('pointerdown', e => {
    // Left button only.`,
`  canvas.addEventListener('pointerdown', e => {
    if(e.pointerType==='touch'){mouseX=e.clientX;mouseY=e.clientY;}
    // Left button only.`);
// One fixed, noninteractive placement banner avoids multiple floating tips.
edit('src/main.ts',
`  rkCancelPlacement.addEventListener('click',()=>{
    placement.cancel();refreshOverlay(true);
  });
  // --- sound ---------------------------------------------------------------`,
`  rkCancelPlacement.addEventListener('click',()=>{
    placement.cancel();refreshOverlay(true);
  });
  const rkPlacementState=document.createElement('div');
  rkPlacementState.id='rk-placement-state';
  rkPlacementState.hidden=true;
  rkPlacementState.setAttribute('role','status');
  rkPlacementState.setAttribute('aria-live','off');
  const rkPlacementName=document.createElement('strong');
  const rkPlacementVerdict=document.createElement('span');
  rkPlacementState.append(rkPlacementName,rkPlacementVerdict);
  document.body.appendChild(rkPlacementState);
  // --- sound ---------------------------------------------------------------`);
edit('src/main.ts',
`  function refreshOverlay(force = false): void {
    const sel = placement.selected;
    rkCancelPlacement.hidden=!sel;`,
`  function refreshOverlay(force = false): void {
    const sel = placement.selected;
    rkPlacementState.hidden=!sel;
    if(sel){
      rkPlacementName.textContent=(BUILDINGS[sel]?.label||'건물')+' 배치';
      rkPlacementVerdict.textContent='초록색 설치 가능 · 빨간색 설치 불가';
      rkPlacementState.dataset.rkValid='pending';
    }
    rkCancelPlacement.hidden=!sel;`);
// Use the game's source-of-truth placement checker. No duplicating terrain
// rules or misleading "can build" badges that ignore resources/territory.
edit('src/main.ts',
`      const ok = placement.moveTo(t.x, t.z);
      const def = BUILDINGS[placement.selected];`,
`      const ok = placement.moveTo(t.x, t.z);
      const def = BUILDINGS[placement.selected];
      const isLine=!!placement.dragFrom;
      const nextVerdict= isLine
        ? (ok?'연속 배치 중 · 손을 떼면 건설':'연속 배치: '+raniKoText(placement.lastCheck.reason||'설치 불가'))
        : (ok?'설치 가능 · 지도에서 클릭 또는 터치':'설치 불가 · '+raniKoText(placement.lastCheck.reason||'위치를 옮겨 주세요'));
      if(rkPlacementVerdict.textContent!==nextVerdict)rkPlacementVerdict.textContent=nextVerdict;
      rkPlacementState.dataset.rkValid=ok?'true':'false';`);
fs.appendFileSync(path.join(root,'public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v537-placement-feedback.css'),'utf8'));
console.log('PASS v5.37 fast touch placement, Korean fixed status, exact native build checks');
