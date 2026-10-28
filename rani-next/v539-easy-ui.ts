// v5.39 — fast display modes + a compact beginner build catalog.
// Presentation only; leave economy, save format, buildings and artwork intact.
import type { WebGLRenderer } from 'three';

export type RaniQuality = 'balanced' | 'saving' | 'sharp';
const QUALITY_KEY='rani.quality.v1';
const EASY_KEY='rani.easy-build.v1';
const ALLOWED:ReadonlyArray<RaniQuality>=['balanced','saving','sharp'];

function read(key:string):string|null {
  try{return localStorage.getItem(key);}catch{return null;}
}
function write(key:string,value:string):void {
  try{localStorage.setItem(key,value);}catch{/* privacy mode still works */}
}
function currentQuality():RaniQuality{
  const v=read(QUALITY_KEY);
  return v==='saving'||v==='sharp'?v:'balanced';
}
export function raniPixelRatio(mode:RaniQuality=currentQuality()):number {
  const native=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const mobile=window.innerWidth<=600 ||
    ((navigator.maxTouchPoints||0)>0 && Math.min(innerWidth,innerHeight)<=650);
  return mode==='saving'?1:mode==='sharp'?native:Math.min(native,mobile?1.25:1.5);
}
// The native phone HUD uses pointerup, not click: some touch UAs suppress
// click after a scrollable bottom-sheet gesture. De-dupe a synthetic click
// so a single tap never cycles two settings at once.
// A touch may emit pointer events AND a much later synthesized click.
// Act on its first down event, then discard that click without a timeout.
// Use one native touchend path for phones. preventDefault suppresses the
// browser's delayed synthetic click; mouse/keyboard remain normal click.
// One browser-native click = one action on mouse, touch or keyboard.
// Combining touchend/pointerup/click caused duplicated or swallowed taps
// depending on PWA base path and the browser's synthesized click timing.
function onActivate(button:HTMLButtonElement,action:()=>void):void{
  button.addEventListener('click',action);
}

const ESSENTIAL = new Set([
  // One screen of real, useful buildings per native category; never a fake build.
  'stockpile','granary','wall','gatehouse','barracks',
  'woodcutter','quarry','ox_tether','depot',
  'hunter','apple_orchard','wheat_farm','fishery',
  'mill','bakery','inn',
  'hovel','market','shrine','chapel',
  'armoury','poleturner','fletcher','blacksmith'
]);

export function installRaniEasyUi(renderer:WebGLRenderer):void{
  const controls=document.getElementById('controls');
  if(controls&&!document.getElementById('rk-quality-mode')){
    const row=document.createElement('div');row.id='rk-quality-row';
    const caption=document.createElement('span');caption.textContent='화질 설정';
    const button=document.createElement('button');button.id='rk-quality-mode';
    button.type='button';
    button.title='절전은 화면 선명도를 낮춰 GPU 부담을 줄입니다. 게임 규칙은 그대로입니다.';
    row.append(caption,button);controls.appendChild(row);
    let mode=currentQuality();
    const render=()=>{
      const ratio=raniPixelRatio(mode);
      renderer.setPixelRatio(ratio);
      button.textContent='화질: '+({balanced:'균형',saving:'절전',sharp:'선명'} as const)[mode];
      button.dataset.rkQuality=mode;
      button.dataset.rkDpr=ratio.toFixed(2);
      button.setAttribute('aria-label','현재 '+button.textContent+', 누르면 다음 화질');
    };
    onActivate(button,()=>{
      mode=ALLOWED[(ALLOWED.indexOf(mode)+1)%ALLOWED.length];
      write(QUALITY_KEY,mode);render();
    });
    render();
  }
  const guide=document.getElementById('rk-build-guide');
  const bar=document.getElementById('buildbar');
  const menu=document.getElementById('buildmenu');
  if(!guide||!bar||!menu||document.getElementById('rk-easy-toggle'))return;
  let easy=read(EASY_KEY)!=='all';
  guide.textContent='';
  const hint=document.createElement('span');hint.id='rk-easy-hint';
  const button=document.createElement('button');
  button.id='rk-easy-toggle';button.type='button';
  button.title='자주 쓰는 건물만 보거나 전체 건물 목록을 확인합니다.';
  guide.append(hint,button);
  const groups=Array.from(menu.querySelectorAll<HTMLElement>('.items[data-group]'));
  const apply=()=>{
    let shown=0,hidden=0;
    for(const group of groups){
      const all=Array.from(group.querySelectorAll<HTMLButtonElement>('button[data-name]'));
      const picks=all.filter(b=>ESSENTIAL.has(b.dataset.name||''));
      // Unknown/new categories must never become empty in easy mode.
      const selected=picks.length?picks:all.slice(0,4);
      for(const b of all){
        const shouldHide=easy&&!selected.includes(b);
        b.dataset.rkSimpleHide=String(shouldHide);
        if(shouldHide)hidden++;else shown++;
      }
    }
    hint.textContent=easy?'종류 선택 → 기본 건물 → 지도에 배치':'종류 선택 → 전체 건물 → 지도에 배치';
    button.textContent=easy?'전체 보기':'간편 보기';
    button.setAttribute('aria-pressed',String(!easy));
    button.dataset.rkEasy=String(easy);
    button.title=easy?`숨겨진 고급 건물 ${hidden}개 보기`:'초반에 필요한 건물만 보기';
    guide.dataset.rkEasy=String(easy);
  };
  onActivate(button,()=>{easy=!easy;write(EASY_KEY,easy?'easy':'all');apply();});
  apply();
}

/** Keep video quality visible even where legacy landscape skins collapse
 * #controls. HUD.enablePhoneLayout() creates #sheet-info before this runs. */
export function raniMountPhoneQuality():void{
  const host=document.querySelector<HTMLElement>('#sheet-info .sheet-body');
  const row=document.getElementById('rk-quality-row');
  if(host&&row){
    host.insertBefore(row,host.firstChild);
    row.classList.add('rk-phone-quality');
  }
}
