/** Rani Kingdom live 6-hex building inspector; real engine callbacks only.
 * No SVG, mock-ups or client-only upgrade promises.
 * All actions are routed to the original Fiefdom simulation.
 */
import type { PlacedBuilding } from '../game/state';
export type RaniTarget = { key: string; name: string; label: string; x: number; z: number; building?: PlacedBuilding; decorationIndex?: number };
export type RaniResult = { message: string; ok: boolean };
export type RaniStatus = {
  detail: string; level: number; hp: number; maxHp: number;
  workers: number; capacity: number; upgradeCost: string; repairCost: string;
  canUpgrade: boolean; canRepair: boolean; canManage: boolean;
  manageLabel: string; removable: boolean; reason: string;
};
export type RaniWheelCallbacks = {
  status: (t: RaniTarget) => RaniStatus;
  upgrade: (t: RaniTarget) => RaniResult;
  repair: (t: RaniTarget) => RaniResult;
  manage: (t: RaniTarget) => RaniResult;
  build: () => void;
  remove: (t: RaniTarget) => RaniResult;
  exists: (t: RaniTarget) => boolean;
  screen: (t: RaniTarget) => { x: number; y: number };
};

export function createRaniWheel(callbacks: RaniWheelCallbacks) {
  const host = document.createElement('section');
  host.id = 'rk-hex-menu';
  host.setAttribute('aria-label','건물 6각 관리 메뉴');
  host.setAttribute('role','group');
  host.hidden = true;
  const buttons = document.createElement('div');
  buttons.className = 'rk-hex-buttons';
  const core = document.createElement('button');
  core.type='button';core.className='rk-hex-core';
  core.title='같은 건물을 다시 선택하거나 이 버튼을 누르면 닫힙니다.';
  core.setAttribute('aria-label','건물 관리 닫기');
  const label=document.createElement('strong');
  const meta=document.createElement('span');
  core.append(label,meta);
  buttons.appendChild(core);
  const itemSpecs: {id:string;title:string;hint:string}[] = [
    {id:'info',title:'정보',hint:'건물 상세 현황'},
    {id:'upgrade',title:'강화',hint:'자원을 사용해 내구도 상한 강화'},
    {id:'repair',title:'수리',hint:'자원으로 손상된 건물 복구'},
    {id:'manage',title:'관리',hint:'성문 개폐·제작품 변경'},
    {id:'build',title:'건설',hint:'원래 건설 메뉴 열기'},
    {id:'remove',title:'철거',hint:'보호 건물 제외, 반드시 재확인'}
  ];
  const actionButtons=new Map<string,HTMLButtonElement>();
  for(const s of itemSpecs){
    const button=document.createElement('button');button.type='button';
    button.className='rk-hex-option rk-hex-'+s.id;
    button.textContent=s.title;button.title=s.hint;
    button.setAttribute('aria-label',s.hint);
    button.dataset.action=s.id;
    actionButtons.set(s.id,button);buttons.appendChild(button);
  }
  const info=document.createElement('aside');
  info.id='rk-hex-info';info.hidden=true;info.setAttribute('aria-live','polite');
  const message=document.createElement('p');
  message.className='rk-hex-message';message.setAttribute('role','status');
  const close=document.createElement('button');close.className='rk-hex-close';
  close.type='button';close.textContent='닫기';
  host.append(buttons,info,message,close);
  document.body.appendChild(host);
  let target:RaniTarget|null=null;
  let infoOpen=false;
  let modal:HTMLDivElement|null=null;

  function cleanModal(){
    if(modal){modal.remove();modal=null;}
  }
  function closeMenu(){
    cleanModal();target=null;infoOpen=false;
    info.hidden=true;host.hidden=true;message.textContent='';
  }
  function update(){
    if(!target)return;
    if(!callbacks.exists(target)){closeMenu();return;}
    const status=callbacks.status(target);
    label.textContent=target.label;
    meta.textContent=target.building ? 'Lv.'+status.level : '자연물';
    const upgrade=actionButtons.get('upgrade')!;
    upgrade.disabled=!status.canUpgrade;upgrade.title=status.canUpgrade
      ? '비용: '+status.upgradeCost : (target.building?'최고 단계 또는 강화 불가':'자연물은 강화할 수 없습니다.');
    const repair=actionButtons.get('repair')!;
    repair.disabled=!status.canRepair;repair.title=status.canRepair
      ? '비용: '+status.repairCost : '수리할 손상이 없습니다.';
    const manage=actionButtons.get('manage')!;
    manage.disabled=!status.canManage;manage.textContent=status.canManage ? status.manageLabel : '관리';
    const remove=actionButtons.get('remove')!;
    remove.disabled=!status.removable;
    remove.title=status.removable?'철거 전 확인':'철거 보호: '+status.reason;
    if(infoOpen){
      info.replaceChildren();
      const heading=document.createElement('strong');heading.textContent=target.label+' · 상세 정보';
      const detail=document.createElement('p');detail.textContent=status.detail;
      const hp=document.createElement('p');hp.textContent='내구도: '+Math.ceil(status.hp)+' / '+status.maxHp;
      const level=document.createElement('p');level.textContent='강화 단계: '+status.level+' / 3';
      const work=document.createElement('p');work.textContent='작업자: '+status.workers+' / '+status.capacity;
      const upgrades=document.createElement('p');upgrades.textContent='강화 비용: '+status.upgradeCost;
      const repairs=document.createElement('p');repairs.textContent='수리 비용: '+status.repairCost;
      info.append(heading,detail);
      if(target.building)info.append(hp,level,work,upgrades,repairs);
      if(!status.removable){const note=document.createElement('p');note.textContent=status.reason;info.append(note);}
    }
  }
  function place(){
    if(!target)return;
    // Keep the six actions centred over the actual projected building, not
    // a fixed HUD corner. Clamp to keep screen-edge buildings accessible.
    const p=callbacks.screen(target);
    const narrow=window.innerWidth<=700;
    const left=narrow?window.innerWidth/2:Math.max(165,Math.min(window.innerWidth-165,p.x));
    const top=narrow?window.innerHeight-160:Math.max(150,Math.min(window.innerHeight-165,p.y-32));
    host.style.left=left+'px';host.style.top=top+'px';
  }
  function show(t:RaniTarget) {
    if(target?.key===t.key){closeMenu();return;}
    cleanModal();target=t;infoOpen=false;info.hidden=true;
    host.hidden=false;message.textContent='';
    update();place();
  }
  function confirmRemoval(t:RaniTarget) {
    const status=callbacks.status(t);
    if(!status.removable){message.textContent=status.reason;return;}
    cleanModal();
    const scrim=document.createElement('div');
    scrim.id='rk-hex-confirm';scrim.setAttribute('role','presentation');
    const panel=document.createElement('div');
    panel.className='rk-hex-confirm-panel';panel.setAttribute('role','alertdialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','철거 재확인');
    const h=document.createElement('h3');h.textContent='정말 철거하시겠습니까?';
    const p=document.createElement('p');p.textContent=t.label+' · 철거하면 건물과 생산 기능이 사라집니다.';
    const actions=document.createElement('div');
    const cancel=document.createElement('button');cancel.type='button';
    cancel.textContent='취소';cancel.className='rk-hex-cancel';
    const yes=document.createElement('button');yes.type='button';
    yes.textContent='철거 확인';yes.className='rk-hex-danger';
    cancel.onclick=()=>cleanModal();
    yes.onclick=()=>{
      if(!callbacks.exists(t)){cleanModal();closeMenu();return;}
      const result=callbacks.remove(t);
      cleanModal();if(result.ok)closeMenu();
      else {message.textContent=result.message;update();}
    };
    scrim.addEventListener('pointerdown',ev=>{if(ev.target===scrim)cleanModal();});
    actions.append(cancel,yes);panel.append(h,p,actions);scrim.appendChild(panel);
    document.body.appendChild(scrim);modal=scrim;
    cancel.focus();
  }
  core.onclick=closeMenu;close.onclick=closeMenu;
  for(const [id,button] of actionButtons)button.onclick=()=>{
    const t=target;if(!t)return;
    if(id==='info'){infoOpen=!infoOpen;info.hidden=!infoOpen;update();return;}
    if(id==='remove'){confirmRemoval(t);return;}
    if(id==='build'){closeMenu();callbacks.build();return;}
    const result=id==='upgrade'?callbacks.upgrade(t)
      : id==='repair'?callbacks.repair(t):callbacks.manage(t);
    message.textContent=result.message;
    update();
  };
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(modal){e.stopPropagation();cleanModal();}
      else if(target)closeMenu();
    }
  },{capture:true});
  let raf=0;
  function track(){
    if(target){update();place();}
    raf=window.requestAnimationFrame(track);
  }
  // Show a live HP/staff readout as battles and staffing change. Updates
  // only while visible; the game itself still runs its original loop.
  raf=window.requestAnimationFrame(track);
  return {
    toggle:show,
    close:closeMenu,
    confirmRemoval,
    get target(){return target;},
    destroy(){window.cancelAnimationFrame(raf);closeMenu();host.remove();}
  };
}
