/** Rani v5.20 mobile shell. No game-rule, asset, or save-format changes. */
type ExitHandler=()=>string|null;
type FullscreenRoot=HTMLElement & {webkitRequestFullscreen?:()=>Promise<void>|void};
type FullscreenDoc=Document & {webkitFullscreenElement?:Element|null};
let installed=false;
let exitHandler:ExitHandler|null=null;
const mobile=()=>window.matchMedia('(pointer: coarse)').matches||
  /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const activeFullscreen=()=>!!((document as FullscreenDoc).fullscreenElement||
  (document as FullscreenDoc).webkitFullscreenElement);
const isEditing=(t:EventTarget|null)=>t instanceof HTMLElement&&
 (t.isContentEditable||!!t.closest('input,textarea,select,[contenteditable="true"]'));
export function setRaniExitHandler(handler:ExitHandler|null){exitHandler=handler;}
export function installRaniMobileShell(){
 if(installed)return;
 installed=true;
 const root=document.documentElement;
 const overlay=document.createElement('section');
 overlay.id='rk-exit-dialog';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-labelledby','rk-exit-heading');
 const panel=document.createElement('div');panel.className='rk-exit-panel';
 const header=document.createElement('div');header.className='rk-exit-header';
 const crest=document.createElement('span');crest.className='rk-exit-crest';crest.textContent='♜';crest.setAttribute('aria-hidden','true');
 const heading=document.createElement('strong');heading.id='rk-exit-heading';heading.textContent='왕국을 떠나시겠습니까?';
 header.append(crest,heading);
 const body=document.createElement('p');body.className='rk-exit-copy';
 body.textContent='현재 진행 상황을 자동 저장하고 첫 화면으로 돌아갑니다.';
 const notice=document.createElement('p');notice.id='rk-exit-error';notice.hidden=true;
 const actions=document.createElement('div');actions.className='rk-exit-actions';
 const stay=document.createElement('button');stay.type='button';stay.id='rk-exit-stay';stay.textContent='계속 플레이';
 const leave=document.createElement('button');leave.type='button';leave.id='rk-exit-confirm';leave.textContent='게임 종료';
 actions.append(stay,leave);panel.append(header,body,notice,actions);overlay.appendChild(panel);
 document.body.appendChild(overlay);
 let lastFocus:Element|null=null;
 const close=()=>{overlay.hidden=true;notice.hidden=true;notice.textContent='';
   (lastFocus instanceof HTMLElement?lastFocus:null)?.focus({preventScroll:true});
 };
 const open=()=>{
   if(!overlay.hidden)return;
   lastFocus=document.activeElement;overlay.hidden=false;
   body.textContent=exitHandler
     ?'진행 상황을 자동 저장한 뒤 첫 화면으로 돌아갑니다.'
     :'왕국 시작 화면을 닫으시겠습니까?';
   leave.textContent=exitHandler?'저장 후 종료':'나가기';
   notice.hidden=true;leave.disabled=false;stay.focus({preventScroll:true});
 };
 stay.addEventListener('click',close);
 leave.addEventListener('click',()=>{
   if(exitHandler){
     try{
       const error=exitHandler();
       if(error){notice.textContent='저장 실패: '+error+' · 진행 중인 왕국을 유지합니다.';
         notice.hidden=false;return;}
     }catch(e){notice.textContent='종료 중 오류: '+String(e);
       notice.hidden=false;return;}
     // Exit handler reloads to native title after a verified auto-save.
     return;
   }
   // A browser tab opened from outside this game can leave via the original entry.
   // If no prior page exists, stay on the game title rather than navigating blank.
   close();
   if(history.length>2)history.go(-2);
 });
 overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close();});
 // Prevent native context menus AND native image/link drag, but keep legitimate
 // left-button camera pan, tap-to-place and pinch interactions.
 document.addEventListener('contextmenu',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
 document.addEventListener('dragstart',e=>{
   if(!isEditing(e.target)){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 document.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button===2){e.preventDefault();e.stopPropagation();}
 },true);
 document.addEventListener('pointermove',e=>{
   if(e.pointerType==='mouse'&&(e.buttons&2)!==0){e.preventDefault();e.stopPropagation();}
 },true);
 let armed=false;
 const armBack=()=>{
   if(!mobile()||armed)return;
   try{history.pushState({rkBackGuard:true},'',location.href);armed=true;}catch{}
 };
 armBack();
 window.addEventListener('popstate',()=>{
   if(!mobile())return;
   try{history.pushState({rkBackGuard:true},'',location.href);}catch{}
   open();
 });
 window.addEventListener('keydown',e=>{
   if(!overlay.hidden){
     if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();close();}
     return;
   }
   if(e.key==='Backspace'&&!isEditing(e.target)){
     e.preventDefault();e.stopImmediatePropagation();open();
   }
 },true);
 const requestMobileFullscreen=()=>{
   if(!mobile()||activeFullscreen())return;
   const el=root as FullscreenRoot;
   const req=el.requestFullscreen||el.webkitRequestFullscreen;
   if(!req){root.dataset.rkFullscreen='unsupported';return;}
   try{
     const promise=el.requestFullscreen?el.requestFullscreen({navigationUI:'hide'}):el.webkitRequestFullscreen?.();
     void Promise.resolve(promise).then(()=>{root.dataset.rkFullscreen=activeFullscreen()?'active':'rejected';})
       .catch(()=>{root.dataset.rkFullscreen='rejected';});
   }catch{root.dataset.rkFullscreen='rejected';}
 };
 // Before async region/lord selection; Chrome requires real user activation.
 document.addEventListener('click',e=>{
   const target=e.target instanceof Element?e.target:null;
   if(target?.closest('#rk-start-now,.rk-manual-start,#rk-enter-fullscreen'))requestMobileFullscreen();
 },true);
 const retry=document.createElement('button');retry.id='rk-enter-fullscreen';retry.type='button';
 retry.textContent='전체화면';retry.setAttribute('aria-label','게임 전체화면으로 전환');
 retry.addEventListener('click',requestMobileFullscreen);
 document.body.append(retry);
 const sync=()=>{root.dataset.rkFullscreen=activeFullscreen()?'active':(root.dataset.rkFullscreen||'window');
   const top=document.querySelector('#topbar');
   root.style.setProperty('--rk-v520-hud-bottom',Math.ceil(Math.max(0,top?.getBoundingClientRect().bottom||0))+'px');
   const playing=!!document.querySelector('#rk-strategy-toggle');
   retry.hidden=!playing||!mobile()||activeFullscreen()||!Boolean((root as FullscreenRoot).requestFullscreen||(root as FullscreenRoot).webkitRequestFullscreen);
   retry.setAttribute('aria-hidden',String(retry.hidden));
   if(!overlay.hidden)retry.hidden=true;
 };
 document.addEventListener('fullscreenchange',sync);
 document.addEventListener('webkitfullscreenchange',sync);
 window.addEventListener('resize',sync,{passive:true});
 new MutationObserver(sync).observe(document.body,{childList:true});
 sync();
}
