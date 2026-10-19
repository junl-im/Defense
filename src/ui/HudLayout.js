// Real draggable panels, independent of the kingdom save (v3).
// No scene geometry, construction jobs, resources or selection state touched.
const STORAGE_KEY='rani-hud-layout-v2';
const PANELS=[
  ['gameplay-hud','상단 자원 정보'],
  ['hud-top','점수판'],
  ['hud-right','영토 확장'],
  ['research-panel','연구 정보'],
  ['faction-panel','주변 세력'],
  ['construction-panel','진행 중인 작업'],
  ['hud-bottom','기능 메뉴'],
  ['rani-nav','마을·필드 관리'],
  ['slg-tutorial','주요 임무'],
  ['slg-mobile-dock','모바일 메뉴바'],
];
const isMobile=()=>matchMedia('(max-width:700px)').matches;
const scope=()=>isMobile()?'mobile':'desktop';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function installHudLayout() {
  if(document.body.dataset.raniLayoutReady==='true')return;
  document.body.dataset.raniLayoutReady='true';
  // Browser context menu and text dragging are hostile to in-game pointer UX.
  // Editable fields retain normal caret/selection for save names.
  document.addEventListener('contextmenu',e=>e.preventDefault(),true);
  document.addEventListener('dragstart',e=>{
    if(!(e.target instanceof HTMLElement && e.target.closest('input,textarea,[contenteditable="true"]')))
      e.preventDefault();
  },true);
  document.addEventListener('pointerdown',e=>{
    if(e.button!==2)return;
    e.preventDefault();e.stopImmediatePropagation();
  },true);
  document.addEventListener('pointermove',e=>{
    if((e.buttons&2)===0)return;
    e.preventDefault();e.stopImmediatePropagation();
  },true);

  let state={desktop:{},mobile:{}};
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved && typeof saved==='object'){
      state.desktop=saved.desktop && typeof saved.desktop==='object'?saved.desktop:{};
      state.mobile=saved.mobile && typeof saved.mobile==='object'?saved.mobile:{};
    }
  }catch{ /* invalid browser data must not block game startup */ }
  const persist=()=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}
  };
  const valid=entry=>entry && Number.isFinite(entry.x) &&
    Number.isFinite(entry.y) && entry.x>=0 && entry.x<=1 && entry.y>=0 && entry.y<=1;

  function size(el){
    const rect=el.getBoundingClientRect();
    return {width:rect.width,height:rect.height};
  }
  function apply(el,id) {
    const entry=state[scope()]?.[id];
    if(!valid(entry)){
      if(el.classList.contains('rani-positioned'))el.classList.remove('rani-positioned');
      el.style.removeProperty('--rani-pos-x');
      el.style.removeProperty('--rani-pos-y');
      return;
    }
    const box=size(el);
    // On the SAME screen size restore the exact dragged pixels. Panels can
    // change their height as research rows finish or CSS animation settles;
    // normalizing only by available room made reload jump downward.
    const exact=entry.viewportW===innerWidth && entry.viewportH===innerHeight &&
      Number.isFinite(entry.pixelX) && Number.isFinite(entry.pixelY);
    const x=clamp(exact?entry.pixelX:entry.x*Math.max(0,innerWidth-box.width),
      0,Math.max(0,innerWidth-box.width));
    const y=clamp(exact?entry.pixelY:entry.y*Math.max(0,innerHeight-box.height),
      0,Math.max(0,innerHeight-box.height));
    el.style.setProperty('--rani-pos-x',Math.round(x)+'px');
    el.style.setProperty('--rani-pos-y',Math.round(y)+'px');
    if(!el.classList.contains('rani-positioned'))el.classList.add('rani-positioned');
  }
  function savePixel(el,id,x,y) {
    const box=size(el);
    const maxX=Math.max(0,innerWidth-box.width),maxY=Math.max(0,innerHeight-box.height);
    const px=clamp(x,0,maxX),py=clamp(y,0,maxY);
    el.style.setProperty('--rani-pos-x',Math.round(px)+'px');
    el.style.setProperty('--rani-pos-y',Math.round(py)+'px');
    if(!el.classList.contains('rani-positioned'))el.classList.add('rani-positioned');
    state[scope()][id]={
      x:maxX?px/maxX:0,y:maxY?py/maxY:0,
      pixelX:px,pixelY:py,viewportW:innerWidth,viewportH:innerHeight
    };
    persist();
  }
  function reset(el,id){
    delete state[scope()][id];
    if(el.classList.contains('rani-positioned'))el.classList.remove('rani-positioned');
    el.style.removeProperty('--rani-pos-x');
    el.style.removeProperty('--rani-pos-y');
    persist();
  }
  for(const [id,label] of PANELS){
    const panel=document.getElementById(id);
    if(!panel)continue;
    // Handles alone initiate dragging, never the content; controls retain
    // their original normal tap/click/scroll and textfield semantics.
    const grip=document.createElement('button');
    grip.type='button';
    grip.className='rani-move-handle';
    grip.textContent='⠿';
    grip.setAttribute('aria-label',label+' 위치 이동 (두 번 누르면 초기화)');
    grip.title=label+' 위치 이동 · 두 번 누르면 초기 위치';
    panel.appendChild(grip);
    let drag=null;
    grip.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      e.preventDefault();e.stopPropagation();
      const rect=panel.getBoundingClientRect();
      drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:rect.left,y:rect.top,moved:false};
      grip.setPointerCapture(e.pointerId);
      panel.classList.add('rani-dragging');
    });
    grip.addEventListener('pointermove',e=>{
      if(!drag||drag.id!==e.pointerId)return;
      e.preventDefault();e.stopPropagation();
      if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>2)drag.moved=true;
      if(drag.moved)savePixel(panel,id,drag.x+(e.clientX-drag.sx),drag.y+(e.clientY-drag.sy));
    });
    const release=e=>{
      if(!drag||drag.id!==e.pointerId)return;
      e.preventDefault();e.stopPropagation();
      drag=null;
      panel.classList.remove('rani-dragging');
      if(grip.hasPointerCapture(e.pointerId))grip.releasePointerCapture(e.pointerId);
    };
    grip.addEventListener('pointerup',release);
    grip.addEventListener('pointercancel',release);
    grip.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
    grip.addEventListener('dblclick',e=>{
      e.preventDefault();e.stopPropagation();reset(panel,id);
    });
    grip.addEventListener('keydown',e=>{
      const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];
      if(!delta)return;
      e.preventDefault();e.stopPropagation();
      const rect=panel.getBoundingClientRect();
      savePixel(panel,id,rect.left+delta[0],rect.top+delta[1]);
    });
    apply(panel,id);
    // Hidden panels may report zero dimensions on startup. Re-clamp when
    // a mobile tab or a build queue makes the panel visible.
    if(id==='construction-panel'||id==='research-panel'||id==='faction-panel'){
      new MutationObserver(()=>{if(!panel.classList.contains('rani-dragging')&&panel.getBoundingClientRect().width)apply(panel,id)})
        .observe(panel,{attributes:true,attributeFilter:['class']});
    }
  }
  const footer=document.getElementById('hud-bottom');
  let resetButton=null;
  if(footer && !document.getElementById('rani-reset-ui')){
    const button=document.createElement('button');
    button.id='rani-reset-ui';button.type='button';button.className='ui-btn';
    button.textContent='↺ 배치 초기화';
    button.setAttribute('aria-label','모든 게임 메뉴 원래 위치로 되돌리기');
    button.addEventListener('click',()=>{
      state[scope()]={};persist();
      for(const [id] of PANELS){
        const el=document.getElementById(id);if(el)apply(el,id);
      }
    });
    resetButton=button;
    // A moved 320px research window can cover the footer. Lift only the
    // rescue control above movable panels; leave game menu order untouched.
    (isMobile()?document.body:footer).appendChild(button);
  }
  // Mobile panels toggle via body.dataset, not their own class. Recompute
  // geometry AFTER becoming visible; a hidden panel reports zero width and
  // must not be restored offscreen on reload.
  new MutationObserver(()=>{
    for(const [id] of PANELS){
      const el=document.getElementById(id);
      if(!el||el.classList.contains('rani-dragging'))continue;
      if(!state[scope()]?.[id]||!el.getBoundingClientRect().width)continue;
      apply(el,id);
    }
  }).observe(document.body,{attributes:true,attributeFilter:['data-active-slg-panel']});
  let lastScope=scope();
  window.addEventListener('resize',()=>{
    if(resetButton&&footer){
      const parent=isMobile()?document.body:footer;
      if(resetButton.parentElement!==parent)parent.appendChild(resetButton);
    }
    const next=scope();
    if(lastScope!==next)lastScope=next;
    for(const [id] of PANELS){
      const el=document.getElementById(id);
      if(el && !el.classList.contains('rani-dragging'))apply(el,id);
    }
  },{passive:true});
}
