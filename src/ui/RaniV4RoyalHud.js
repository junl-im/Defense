// Rani Kingdom v4.0 — data-driven royal HUD based on the user's reference.
// Original game systems & controls remain the only source of truth. Every
// enabled control delegates to an existing live action; unfinished features
// are explicitly disabled rather than faked.
import { events } from '../core/Events.js';
import { RANI_RESOURCE_ICONS, RANI_PREPARED_ASSETS } from './RaniAssetRegistry.js';

const LEFT=Object.freeze([
  ['build','⚒','건설'],['research','⚗','연구'],
  ['train','⚔','훈련'],['army','♜','부대'],['alliance','♧','동맹']
]);
const RIGHT=Object.freeze([
  ['events','♜','이벤트'],['rewards','▣','보상'],
  ['quests','▤','임무'],['ranking','♕','랭킹']
]);
const BOTTOM=Object.freeze([
  ['map','🗺','월드맵'],['field','🧭','필드'],
  ['village','🏰','마을'],['army','⚔','군사'],
  ['bag','🎒','가방'],['achievements','✦','업적'],
  ['shop','🏪','상점'],['harbor','⚓','항구'],['explore','✧','탐험']
]);
const NOT_IMPLEMENTED=new Set(['rewards','ranking','bag','achievements']);
function button(key,glyph,label){
  const el=document.createElement('button');el.type='button';
  el.dataset.v4Action=key;el.title=label;el.setAttribute('aria-label',label);
  const i=document.createElement('span');i.className='rani-v4-symbol';
  i.setAttribute('aria-hidden','true');
  const approvedArt={village:RANI_PREPARED_ASSETS.houseA,
    shop:RANI_PREPARED_ASSETS.market,harbor:RANI_PREPARED_ASSETS.tradeShip}[key];
  if(approvedArt){
    const img=document.createElement('img');
    img.className='rani-v4-menu-art';
    img.alt='';img.draggable=false;img.decoding='async';
    const fallback=document.createElement('span');
    fallback.className='rani-v4-menu-fallback';
    fallback.textContent=glyph;
    fallback.hidden=true;
    img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;},{once:true});
    img.src=approvedArt;
    i.append(img,fallback);
  }else i.textContent=glyph;
  const t=document.createElement('span');t.className='rani-v4-label';t.textContent=label;
  el.append(i,t);
  if(NOT_IMPLEMENTED.has(key)){
    el.disabled=true;
    el.title=label+' · 아직 연결된 게임 기능이 없습니다';
    el.setAttribute('aria-label',label+' 기능 준비 중');
  }
  return el;
}
function makeRail(id,items){
  const nav=document.createElement('nav');nav.id=id;
  nav.className='rani-v4-rail';nav.setAttribute('aria-label',id.includes('left')?'주요 기능':'왕국 소식');
  for(const [key,icon,label] of items)nav.appendChild(button(key,icon,label));
  return nav;
}
function queueCell(icon,key){
  const li=document.createElement('div');li.className='rani-v4-queue-item';
  li.dataset.queue=key;
  const badge=document.createElement('span');badge.className='rani-v4-queue-symbol';
  badge.textContent=icon;badge.setAttribute('aria-hidden','true');
  const info=document.createElement('span');info.className='rani-v4-queue-copy';
  const label=document.createElement('b');label.textContent='없음';
  const time=document.createElement('small');time.textContent='대기 중';
  info.append(label,time);
  const open=button(key==='construction'?'build':key==='research'?'research':'army','❯','보기');
  open.className='rani-v4-queue-open';
  li.append(badge,info,open);
  return li;
}
function seconds(value){
  if(!Number.isFinite(value)||value<=0)return '00:00';
  const v=Math.ceil(value),h=Math.floor(v/3600),m=Math.floor(v%3600/60),s=v%60;
  return (h?h.toString().padStart(2,'0')+':':'')+
    String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
export function installRaniV4RoyalHud(game){
  if(game.raniV4Hud)return game.raniV4Hud;
  const frame=document.createElement('div');frame.id='rani-v4-shell';
  frame.setAttribute('aria-label','라니킹덤 왕국 인터페이스');
  const profile=document.createElement('button');
  profile.id='rani-v4-profile';profile.type='button';
  profile.dataset.v4Action='kingdom';
  profile.setAttribute('aria-label','왕국 정보');
  const portrait=document.createElement('span');
  portrait.className='rani-v4-ruler-crest';portrait.textContent='♛';
  portrait.setAttribute('aria-hidden','true');
  const desc=document.createElement('span');desc.className='rani-v4-ruler-desc';
  const name=document.createElement('strong');name.textContent='라니킹덤';
  const level=document.createElement('small');level.id='rani-v4-level';level.textContent='왕국 준비 중';
  const rank=document.createElement('span');rank.id='rani-v4-power';rank.textContent='전투력 —';
  desc.append(name,level,rank);profile.append(portrait,desc);
  const top=document.createElement('div');top.id='rani-v4-top';
  const controls=document.createElement('div');controls.id='rani-v4-top-actions';
  for(const entry of [['kingdom','♛','왕국'],['save','▣','저장'],['settings','⚙','설정'],['menu','☰','메뉴']]){
    controls.appendChild(button(...entry));
  }
  top.append(profile,controls);
  const left=makeRail('rani-v4-left',LEFT);
  const right=makeRail('rani-v4-right',RIGHT);
  const queues=document.createElement('aside');queues.id='rani-v4-queues';
  queues.setAttribute('aria-label','실제 왕국 진행 현황');
  queues.append(queueCell('⚒','construction'),queueCell('⚗','research'),queueCell('⚔','army'));
  const bottom=makeRail('rani-v4-bottom',BOTTOM);
  bottom.classList.add('rani-v4-bottom');
  frame.append(top,left,right,queues,bottom);
  document.body.appendChild(frame);
  document.body.classList.add('rani-v4-active');
  const byId=(id)=>document.getElementById(id);
  const trigger=(action)=>{
    const original=byId('rani-royal-launcher')?.
      querySelector('[data-royal-action="'+action+'"]');
    if(original)original.click();
    return Boolean(original);
  };
  // The hidden legacy MobileDock still owns the actual mobile panel state.
  // Clicking the desktop-only RoyalLauncher cannot display panels on mobile
  // because responsive CSS keys visibility to data-active-slg-panel.
  const panel=(name)=>{
    if(matchMedia('(max-width:700px)').matches){
      if(game.mode!=='village')game.nativeVillageUI?.setMode('village');
      const mobile=document.querySelector('#slg-mobile-dock [data-panel="'+name+'"]');
      if(mobile){
        // Any desktop hidden class must not override a real mobile panel.
        document.body.classList.remove('royal-hide-'+name);
        mobile.click(); // original MobileDock controls open/toggle/close
        return;
      }
    }
    const desktop={tiles:'tiles',research:'research',factions:'factions',info:'kingdom'};
    trigger(desktop[name]||name);
  };
  const toast=(message)=>game.ui?.toast(message);
  const showInfo=(kind)=>{
    for(const cell of game.grid.cells.values()){
      if(cell.owner&&cell.owner!=='player')continue;
      const present=game.buildingSystem.buildingsOn(cell).some(b=>b.id===kind&&b.done);
      if(present){
        game.nativeVillageUI?.showVillageInfo(cell);return true;
      }
    }
    return false;
  };
  const commands={
    build(){panel('tiles');},
    research(){panel('research');},
    train(){if(!showInfo('barracks')){panel('tiles');toast('병영을 먼저 건설하면 실제 병사 모집이 열립니다');}},
    army(){panel('factions');},
    alliance(){panel('factions');},
    events(){game.nativeVillageUI?.setMode('world');toast('실제 필드에서 발생하는 세력과 사건을 확인하세요');},
    quests(){
      document.body.classList.toggle('royal-hide-missions');
      if(document.body.classList.contains('royal-hide-missions'))toast('임무 목록 숨김');
    },
    map(){game.nativeVillageUI?.setMode('world');},
    field(){game.nativeVillageUI?.setMode('world');},
    village(){game.nativeVillageUI?.setMode('village');document.dispatchEvent(new Event('rani:map-focus'));},
    shop(){panel('tiles');},
    harbor(){
      if(!showInfo('port')){panel('tiles');toast('항구를 건설하면 여기에서 선택할 수 있습니다');}
    },
    explore(){game.nativeVillageUI?.setMode('world');},
    kingdom(){trigger('kingdom');},
    save(){trigger('save');},
    settings(){byId('save-manager-btn')?.click();},
    menu(){
      const id=matchMedia('(max-width:700px)').matches?
        'rani-shell-menu-mobile-toggle':'rani-shell-menu-toggle';
      byId(id)?.click();
    }
  };
  frame.addEventListener('click',e=>{
    const b=e.target.closest('button[data-v4-action]');
    if(!b||b.disabled)return;
    commands[b.dataset.v4Action]?.();
    update();
  });
  function update(){
    const lvl=game.progressionSystem?.current;
    level.textContent=lvl?.name || '왕국';
    rank.textContent='전투력 '+Math.round(game.armySystem?.strength||0).toLocaleString('ko-KR');
    const building=(()=>{
      for(const rows of game.buildingSystem.byCell.values()){
        const next=rows.find(r=>!r.done&&r.remaining>0);
        if(next)return next;
      }
      return null;
    })();
    const research=game.researchSystem?.active;
    const army=game.armySystem;
    for(const cell of queues.querySelectorAll('.rani-v4-queue-item')){
      const key=cell.dataset.queue;
      const label=cell.querySelector('b');
      const time=cell.querySelector('small');
      if(key==='construction'){
        label.textContent=building?'건설 진행 중':'건설 대기';
        time.textContent=building?seconds(building.remaining):'완공 대기 없음';
      }else if(key==='research'){
        label.textContent=research?'연구 진행 중':'연구 대기';
        time.textContent=research?seconds(research.remaining):'진행 중인 연구 없음';
      }else{
        label.textContent='보유 병력 '+(army?.unitCount||0);
        time.textContent='전투력 '+Math.round(army?.strength||0);
      }
    }
    for(const b of bottom.querySelectorAll('button[data-v4-action]')){
      b.setAttribute('aria-pressed',String(
        (b.dataset.v4Action==='village'&&game.mode==='village')||
        (b.dataset.v4Action==='field'&&game.mode==='world')
      ));
    }
  }
  const unsub=[
    events.on('buildings:changed',update),events.on('army:changed',update),
    events.on('research:started',update),events.on('research:completed',update),
    events.on('progression:completed',update),events.on('game:restart',update)
  ];
  const timer=setInterval(update,900);
  update();
  const api={update,dispose(){
    clearInterval(timer);for(const off of unsub)off();
    frame.remove();document.body.classList.remove('rani-v4-active');
    if(game.raniV4Hud===api)delete game.raniV4Hud;
  }};
  game.raniV4Hud=api;
  return api;
}
