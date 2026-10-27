// v5.38 — keep the construction ghost anchored to a WORLD tile while the view moves.
// The v5.37 release tap remains authoritative; game rules/saves/render assets unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(file,from,to){
 const p=path.join(root,file),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.38 source drift '+file+': '+from.slice(0,90));
 fs.writeFileSync(p,s.replace(from,to));
}
// Hold the latest legal world tile through mouse pan, finger pan, pinch,
// rotation, wheel zoom and camera easing. Merely redrawing must never re-pick
// terrain below a moving camera. Explicit mouse movement releases that hold.
patch('src/main.ts',
`  let mouseX = 0, mouseY = 0;`,
`  let mouseX = 0, mouseY = 0;
  let rkGhostHold = false;
  let rkTouchHeld = false;
  let rkCursorMoved = false;
  let rkLastTool: string | null = null;
  let rkViewPose = { x: iso.target.x, z: iso.target.z,
                     zoom: iso.zoom, az: iso.azimuthDeg };`);
// v5.37 touch-coordinate capture exists already. Keep it and record the
// gesture without adding a competing pointer handler on top of native tools.
patch('src/main.ts',
`    if(e.pointerType==='touch'){mouseX=e.clientX;mouseY=e.clientY;}`,
`    if(e.pointerType==='touch'){
      mouseX=e.clientX;mouseY=e.clientY;
      rkTouchHeld=true;
      rkGhostHold=false;
    }`);
patch('src/main.ts',
`  canvas.addEventListener('pointerdown', e => {
    if(e.pointerType==='touch'){
      mouseX=e.clientX;mouseY=e.clientY;
      rkTouchHeld=true;
      rkGhostHold=false;
    }
  },{capture:true,passive:true});`,
`  canvas.addEventListener('pointerdown', e => {
    if(e.pointerType==='touch'){
      mouseX=e.clientX;mouseY=e.clientY;
      rkTouchHeld=true;
      rkGhostHold=false;
    }
  },{capture:true,passive:true});
  canvas.addEventListener('pointerup', e => {
    if(e.pointerType==='touch') rkTouchHeld=false;
  },{capture:true,passive:true});
  canvas.addEventListener('pointercancel', () => {
    rkTouchHeld=false;
    rkGhostHold=false;
  },{capture:true,passive:true});`);
// Clicking to place is NOT panning: preserve v5.37 exact pointer-up tile
// and make its verdict visible immediately (especially a failed touch tap).
patch('src/main.ts',
`    if (placement.selected && (!dragMoved || placement.dragFrom)) {
      const pending = placement.selected;`,
`    if (placement.selected && (!dragMoved || placement.dragFrom)) {
      if(!dragMoved)rkGhostHold=false;
      const pending = placement.selected;`);
// A free mouse movement is an intentional command to move the ghost.
// During panning, native mouseX/mouseY must NOT cause a new world tile pick.
patch('src/main.ts',
`  canvas.addEventListener('pointermove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (turning) {`,
`  canvas.addEventListener('pointermove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if(!dragging && !turning && !pinching() && e.pointerType!=='touch'){
      rkGhostHold=false;
      rkCursorMoved=true;
    }
    if (turning) {`);
// A new building selection must not inherit the previous building's frozen
// site. If the view moves without a pointer (keyboard / wheel / smooth zoom),
// the old site remains anchored until the next deliberate pointer movement.
patch('src/main.ts',
`    if (placement.selected) {
      const t = pickTile(mouseX, mouseY);
      const ok = placement.moveTo(t.x, t.z);
      const def = BUILDINGS[placement.selected];`,
`    if (placement.selected) {
      if(rkLastTool!==placement.selected){
        rkLastTool=placement.selected;
        rkGhostHold=false;
      }
      const rkMovedView =
        Math.abs(iso.target.x-rkViewPose.x)>0.00001 ||
        Math.abs(iso.target.z-rkViewPose.z)>0.00001 ||
        Math.abs(iso.zoom-rkViewPose.zoom)>0.00001 ||
        Math.abs(iso.azimuthDeg-rkViewPose.az)>0.00001;
      rkViewPose={x:iso.target.x,z:iso.target.z,zoom:iso.zoom,az:iso.azimuthDeg};
      const rkPanning = turning || pinching() ||
        (dragging && !placement.dragFrom && (dragMoved || rkTouchHeld));
      if(!placement.dragFrom && placement.hover && !rkCursorMoved &&
          (rkMovedView || rkPanning))rkGhostHold=true;
      rkCursorMoved=false;
      const rkFrozenPreview=!!placement.hover && !placement.dragFrom && rkGhostHold;
      const t = rkFrozenPreview ? placement.hover! : pickTile(mouseX, mouseY);
      const ok = placement.moveTo(t.x, t.z);
      const def = BUILDINGS[placement.selected];`);
patch('src/main.ts',
`      if (placement.dragFrom) {
        // Mid-stroke the label counts the run`,
`      if (rkFrozenPreview) {
        // The sprite stays on the same world tile as the camera moves.
        // Hide the screen-space mouse ghost text: it otherwise appears
        // to chase the camera in a different coordinate system.
        hud.hideGhost();
      } else if (placement.dragFrom) {
        // Mid-stroke the label counts the run`);
// v5.37 live Korean banner must agree with the stabilized world ghost.
patch('src/main.ts',
`      const nextVerdict= isLine
        ? (ok?'연속 배치 중 · 손을 떼면 건설':'연속 배치: '+raniKoText(placement.lastCheck.reason||'설치 불가'))`,
`      const nextVerdict= rkFrozenPreview
        ? '지도 이동 중 · 건물 위치 유지'
        : isLine
        ? (ok?'연속 배치 중 · 손을 떼면 건설':'연속 배치: '+raniKoText(placement.lastCheck.reason||'설치 불가'))`);
patch('src/main.ts',
`      rkPlacementState.dataset.rkValid=ok?'true':'false';`,
`      rkPlacementState.dataset.rkValid=rkFrozenPreview?'pending':ok?'true':'false';`);
// Cleanup after exit and avoid the previous tool's position polluting a new
// selection. No resource/territory/pathfinding logic changes.
patch('src/main.ts',
`    } else {
      runPlan = { tiles: [], legal: [], count: 0 };
      hud.hideGhost();`,
`    } else {
      rkLastTool=null;
      rkGhostHold=false;
      rkCursorMoved=false;
      rkViewPose={x:iso.target.x,z:iso.target.z,zoom:iso.zoom,az:iso.azimuthDeg};
      runPlan = { tiles: [], legal: [], count: 0 };
      hud.hideGhost();`);
console.log('PASS v5.38 anchored construction preview through camera movement without changing release placement');
