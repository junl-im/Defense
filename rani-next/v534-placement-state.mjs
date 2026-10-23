// v5.34 — resolve the native construction panel / placement-tool state split.
// Applies after v5.33. Reuses original game placement, saves and raster art.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(file, from, to) {
  const name=path.join(root,file), old=fs.readFileSync(name,'utf8');
  assert.equal(old.split(from).length,2,'v5.34 source drift: '+file+' '+from.slice(0,90));
  fs.writeFileSync(name,old.replace(from,to));
}
// The desktop 'Build' button must be driven by the HUD category state, not
// by a second mutable dataset flag. Clicking it while placing means cancel
// the ghost and reopen actual construction choices.
patch('src/main.ts',
`      construct.onclick=()=>{const open=dock.dataset.open!=='true';
        if(open){dock.dataset.open='true';construct.setAttribute('aria-expanded','true');hud.toggleBuild();}
        else shut();
      };`,
`      construct.onclick=()=>{
        rkWheel.close();
        if(placement.selected){
          placement.cancel();refreshOverlay(true);
          hud.openCategory(0);
        }else hud.toggleBuild();
      };`);
// The legacy compact skin also gates #buildwrap on #ui.rani-build-open.
// Synchronize it from the same HUD category state as the new visible dock.
patch('src/ui/hud.ts',
`    this.buildPanel.classList.toggle('hidden', gi === null);
    const rkDock=document.querySelector<HTMLElement>('#rk-actions');`,
`    this.buildPanel.classList.toggle('hidden', gi === null);
    const rkShell=document.getElementById('ui');
    rkShell?.classList.toggle('rani-build-open',gi!==null);
    rkShell?.querySelector('#rani-build-toggle')?.setAttribute('aria-expanded',String(gi!==null));
    const rkDock=document.querySelector<HTMLElement>('#rk-actions');`);
// The hex 'Build' command was opening the obsolete hidden legacy trigger;
// remove that double-toggle and open the real HUD on desktop and phone.
patch('src/main.ts',
`    build(){
      const ui=document.getElementById('ui');
      const native=document.getElementById('rani-build-toggle') as HTMLButtonElement|null;
      if(native&&ui&&!ui.classList.contains('rani-build-open'))native.click();
      // Only open a hidden native category; a second toggle would close it.
      const panel=document.getElementById('buildmenu');
      if(panel?.classList.contains('hidden'))hud.toggleBuild();
    },`,
`    build(){
      if(placement.selected){placement.cancel();refreshOverlay(true);}
      hud.openCategory(0);
      if(document.documentElement.classList.contains('phone')
          &&hud.openDrawerName()!=='build')hud.openDrawer('build');
    },`);
// Mobile Build first tap reveals usable building items. When a building is
// already attached to the cursor, the same button cancels it and reopens.
patch('src/main.ts',
`      toggleBuild: () => phone ? hud.openDrawer('build') : hud.toggleBuild(),`,
`      toggleBuild: () => {
        rkWheel.close();
        const wasPlacing=!!placement.selected;
        if(wasPlacing){placement.cancel();refreshOverlay(true);}
        if(phone){
          if(hud.openDrawerName()==='build'&&!wasPlacing)hud.openDrawer('build');
          else {
            if(document.getElementById('buildmenu')?.classList.contains('hidden'))
              hud.openCategory(0);
            if(hud.openDrawerName()!=='build')hud.openDrawer('build');
          }
        }else if(wasPlacing)hud.openCategory(0);
        else hud.toggleBuild();
      },`);
// One completed gesture (even a paintable yard, wall or path) releases the
// tool. Shift-click explicitly keeps it selected for repeat placement.
patch('src/main.ts',
`    if (built === 0 || keepTool || def.paintable) refreshOverlay(true);
    else placement.cancel();`,
`    if (built === 0 || keepTool) refreshOverlay(true);
    else placement.cancel();`);
// A discoverable cancel control must be available without Esc / right-click,
// including touch screens that have no keyboard.
patch('src/main.ts',
`  // --- sound ---------------------------------------------------------------`,
`  const rkCancelPlacement=document.createElement('button');
  rkCancelPlacement.id='rk-placement-cancel';
  rkCancelPlacement.type='button';
  rkCancelPlacement.hidden=true;
  rkCancelPlacement.textContent='×  배치 취소';
  rkCancelPlacement.setAttribute('aria-label','선택한 건물의 배치를 취소');
  rkCancelPlacement.setAttribute('aria-keyshortcuts','Escape');
  const rkHost=document.getElementById('rk-actions');
  const rkActionRow=rkHost?.querySelector('.rk-action-row');
  if(rkHost&&rkActionRow)rkHost.insertBefore(rkCancelPlacement,rkActionRow);
  else document.body.appendChild(rkCancelPlacement);
  rkCancelPlacement.addEventListener('click',()=>{
    placement.cancel();refreshOverlay(true);
  });
  // --- sound ---------------------------------------------------------------`);
patch('src/main.ts',
`  function refreshOverlay(force = false): void {
    if (debugBlocked) return;
    const sel = placement.selected;`,
`  function refreshOverlay(force = false): void {
    const sel = placement.selected;
    rkCancelPlacement.hidden=!sel;
    if(sel)rkCancelPlacement.title=BUILDINGS[sel]?.label+' 배치 취소';
    else {
      const rkHint=document.getElementById('rk-placement-hint');
      if(rkHint)rkHint.hidden=true;
    }
    if (debugBlocked) return;`);
fs.appendFileSync(path.join(root,'public/rani/skin.css'),
  '\n'+fs.readFileSync(path.join(import.meta.dirname,'v534-placement-controls.css'),'utf8'));
console.log('PASS v5.34 native build toggle, hex entry, phone sheet, ghost cancel and one-shot placement');