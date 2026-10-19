// Rani Kingdom v2.9 — functional live main-screen command rail.
// Every action calls existing RoyalLauncher or toggles the *existing* mission.
// No duplicate research/army/economy implementation or synthetic world menu.
const COMMANDS=Object.freeze([
  {key:'tiles',icon:'⚒️',label:'건설'},
  {key:'research',icon:'📜',label:'연구'},
  {key:'factions',icon:'⚔️',label:'세력'},
  {key:'missions',icon:'📋',label:'임무'},
  {key:'kingdom',icon:'👑',label:'왕국'},
]);

export function installProductionCommandRail(game){
  if(document.getElementById('rani-production-command-rail'))return;
  const original=document.getElementById('rani-royal-launcher');
  if(!original)return; // original game navigation always remains authoritative
  const rail=document.createElement('nav');
  rail.id='rani-production-command-rail';
  rail.setAttribute('aria-label','왕국 명령 빠른 메뉴');
  const buttons=new Map();
  for(const entry of COMMANDS){
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.productionAction=entry.key;
    btn.setAttribute('aria-label',entry.label+' 메뉴 열기 또는 닫기');
    btn.setAttribute('aria-pressed','false');
    btn.title=entry.label+' 열기·닫기';
    const badge=document.createElement('span');
    badge.className='rani-production-command-icon';
    badge.setAttribute('aria-hidden','true');
    badge.textContent=entry.icon; // temporary pictogram, NOT a fake PNG
    const caption=document.createElement('span');
    caption.className='rani-production-command-label';
    caption.textContent=entry.label;
    btn.append(badge,caption);
    rail.appendChild(btn);
    buttons.set(entry.key,btn);
  }
  document.body.appendChild(rail);
  document.body.classList.add('rani-production-v29');
  const visible=id=>{
    const panel=document.getElementById(id);
    if(!panel||panel.classList.contains('collapsed'))return false;
    return getComputedStyle(panel).display!=='none';
  };
  function update(){
    const village=game.mode==='village';
    const pressed={
      tiles:village&&visible('hud-right'),
      research:village&&visible('research-panel'),
      factions:village&&visible('faction-panel'),
      missions:village&&!document.body.classList.contains('royal-hide-missions')&&visible('slg-tutorial'),
      kingdom:village&&document.body.classList.contains('royal-kingdom-open')&&visible('hud-kingdom-panel'),
    };
    for(const [key,btn] of buttons){
      btn.setAttribute('aria-pressed',String(Boolean(pressed[key])));
    }
  }
  rail.addEventListener('click',e=>{
    const key=e.target.closest('button[data-production-action]')?.dataset.productionAction;
    if(!key)return;
    if(game.mode!=='village')game.nativeVillageUI?.setMode('village');
    if(key==='missions'){
      // TutorialMissions remains the single original source of quest progress.
      document.body.classList.toggle('royal-hide-missions');
    }else{
      // Delegate to the original click listener — no two UX state machines.
      original.querySelector('[data-royal-action="'+key+'"]')?.click();
    }
    update();
  });
  new MutationObserver(update).observe(document.body,{
    attributes:true,attributeFilter:['class','data-game-mode']
  });
  for(const id of ['hud-right','research-panel','faction-panel','slg-tutorial','hud-kingdom-panel']){
    const panel=document.getElementById(id);
    if(panel)new MutationObserver(update).observe(panel,{
      attributes:true,attributeFilter:['class','hidden','style']
    });
  }
  update();
}
