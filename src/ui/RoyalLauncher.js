import { iconHtml } from './GameIcons.js';
// v1.8 approved visual direction: a REAL desktop game launcher, not
// decorative links. All commands delegate to existing Three.js game systems.
const ACTIONS=[
  ['village','🏰','마을'],
  ['world','🌍','필드'],
  ['tiles','🧱','영토'],
  ['research','📜','연구'],
  ['factions','⚔️','세력'],
  ['kingdom','👑','왕국'],
  ['save','💾','저장'],
];
const VIEWS={
  tiles:{target:'hud-right',hidden:'royal-hide-tiles'},
  research:{target:'research-panel',hidden:'royal-hide-research'},
  factions:{target:'faction-panel',hidden:'royal-hide-factions'}
};

export function installRoyalLauncher(game){
  if(document.getElementById('rani-royal-launcher'))return;
  const nav=document.createElement('nav');
  nav.id='rani-royal-launcher';
  nav.setAttribute('aria-label','왕국 주요 메뉴');
  for(const [key,icon,label] of ACTIONS){
    const button=document.createElement('button');
    button.type='button';
    button.dataset.royalAction=key;
    button.setAttribute('aria-label',label);
    button.setAttribute('aria-pressed','false');
    const art=document.createElement('span');
    art.className='royal-icon';
    art.setAttribute('aria-hidden','true');
    if(key==='village')art.innerHTML=iconHtml('village','md');
    else art.textContent=icon;
    const name=document.createElement('span');
    name.className='royal-text';
    name.textContent=label;
    button.append(art,name);
    nav.appendChild(button);
  }
  document.body.appendChild(nav);
  const update=()=>{
    for(const button of nav.querySelectorAll('[data-royal-action]')){
      const key=button.dataset.royalAction;
      let selected;
      if(key==='village')selected=game.mode==='village';
      else if(key==='world')selected=game.mode==='world';
      else if(key==='kingdom')selected=document.body.classList.contains('royal-kingdom-open');
      else if(VIEWS[key])selected=game.mode==='village'&&!document.body.classList.contains(VIEWS[key].hidden);
      else selected=false;
      button.setAttribute('aria-pressed',String(Boolean(selected)));
    }
  };
  nav.addEventListener('click',e=>{
    const button=e.target.closest('button[data-royal-action]');
    if(!button)return;
    const action=button.dataset.royalAction;
    if(action==='village'){
      game.nativeVillageUI?.setMode('village');
      document.dispatchEvent(new Event('rani:map-focus'));
    }else if(action==='world'){
      game.nativeVillageUI?.setMode('world');
    }else if(action==='save'){
      document.getElementById('save-manager-btn')?.click();
    }else if(action==='kingdom'){
      if(game.mode!=='village')game.nativeVillageUI?.setMode('village');
      document.body.classList.toggle('royal-kingdom-open');
    }else if(VIEWS[action]){
      if(game.mode!=='village')game.nativeVillageUI?.setMode('village');
      const cfg=VIEWS[action];
      // The kingdom/faction/research panel is the EXISTING gameplay panel.
      // Re-click hides it, another click restores it without losing position.
      document.body.classList.toggle(cfg.hidden);
      if(!document.body.classList.contains(cfg.hidden)){
        document.getElementById(cfg.target)?.classList.remove('collapsed');
      }
    }
    update();
  });
  new MutationObserver(update).observe(document.body,{
    attributes:true,attributeFilter:['data-game-mode','class']
  });
  update();
}
