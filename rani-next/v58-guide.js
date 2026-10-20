/* v5.8 beginner route backed by actual buildings and original Fiefdom HUD.
   No duplicated build rules or fake placement. Selection delegates to native
   #buildmenu button, which calls placement.select + refreshOverlay. */
(()=>{
 const KEY='rani.guide.closed.v58';
 let hidden=false;
 try{hidden=localStorage.getItem(KEY)==='1';}catch{}
 let panel=null,toggle=null,last='';
 const phases=[
  {id:'hovel',name:'주택',tip:'주택을 더 지어 주민이 살 공간을 마련하세요. 건물 테두리가 초록색이면 설치할 수 있습니다.'},
  {id:'woodcutter',name:'벌목장',tip:'벌목장을 건설해 목재를 확보하세요. 빨간 테두리가 나오면 위치와 이유를 확인하세요.'},
  {id:'wheat_farm',name:'밀 농장',tip:'풀밭에 밀 농장을 지어 식량 생산을 늘리세요. 평평한 땅과 건설 가능 표시를 확인하세요.'},
  {id:'market',name:'시장',tip:'시장을 만들어 자원 거래와 왕국 경제를 발전시키세요.'}
 ];
 const node=(tag,cls,text)=>{
  const element=document.createElement(tag);
  element.className=cls;element.textContent=text;return element;
 };
 const saveClosed=()=>{try{localStorage.setItem(KEY,'1')}catch{}};
 const close=()=>{hidden=true;panel?.remove();panel=null;saveClosed();if(toggle)toggle.setAttribute('aria-expanded','false');};
 const open=()=>{
  hidden=false;
  try{localStorage.removeItem(KEY)}catch{}
  if(toggle)toggle.setAttribute('aria-expanded','true');
  ensure();
 };
 function ensure(){
  const ui=document.getElementById('ui'),game=window.__game;
  if(!ui?.isConnected||!game?.state)return;
  if(!toggle?.isConnected){
   toggle=node('button','rk-guide-toggle','도움말');toggle.id='rk-guide-toggle';
   toggle.type='button';toggle.setAttribute('aria-label','왕국 첫걸음 안내 열기');
   toggle.setAttribute('aria-expanded',String(!hidden));
   toggle.onclick=()=>hidden?open():close();
   ui.appendChild(toggle);
  }
  if(hidden||panel?.isConnected)return;
  panel=node('aside','','');panel.id='rk-first-steps';
  panel.setAttribute('aria-label','처음 시작 안내');
  const header=node('div','rk-step-head','');
  header.append(node('strong','','왕국 첫걸음'));
  const x=node('button','rk-step-close','×');
  x.type='button';x.setAttribute('aria-label','안내 접기');x.onclick=close;
  header.append(x);
  const progress=node('div','rk-step-count','');
  const title=node('p','rk-step-progress','');
  const help=node('p','rk-step-help','');
  const actions=node('div','rk-step-actions','');
  const choose=node('button','rk-step-select','목표 건물 선택');
  const catalog=node('button','rk-step-open','건설 메뉴');
  const finish=node('button','rk-step-dismiss','완료');
  choose.type='button';catalog.type='button';finish.type='button';
  choose.onclick=()=>{
   const g=window.__game;
   if(!g?.state)return;
   const present=new Set(g.state.buildings.map(b=>b.name));
   const next=phases.find(p=>!present.has(p.id));
   if(!next)return;
   const card=document.querySelector('#buildmenu button[data-name="'+next.id+'"]');
   if(!card){help.textContent=next.name+' 건물 버튼을 찾을 수 없습니다. 건설 메뉴에서 확인하세요.';return;}
   card.click(); // actual Fiefdom placement.select(name), no fake flag.
   const placement=g.placement;
   if(placement.selected===next.id){
    help.textContent=next.name+' 선택 완료. 지도에서 초록색 설치 가능 자리로 이동해 클릭하세요. 빨간색이면 정확한 이유가 표시됩니다.';
    panel.dataset.selected=next.id;
   }
  };
  catalog.onclick=()=>{
   const ui=document.getElementById('ui');
   const btn=document.getElementById('rani-build-toggle');
   if(btn&&ui&&!ui.classList.contains('rani-build-open'))btn.click();
   else if(!btn)document.querySelector('#buildbar button')?.click();
  };
  finish.onclick=close;
  actions.append(choose,catalog,finish);
  panel.append(header,progress,title,help,actions);
  ui.append(panel);
  last='';
 }
 function tick(){
  ensure();
  if(hidden||!panel?.isConnected)return;
  const game=window.__game;
  if(!game?.state)return;
  const have=new Set(game.state.buildings.map(b=>b.name));
  const finished=phases.filter(p=>have.has(p.id)).length;
  const missing=phases.find(p=>!have.has(p.id));
  const tag=finished+'|'+(missing?.id||'done');
  if(tag===last)return;
  last=tag;
  panel.dataset.complete=String(!missing);
  panel.querySelector('.rk-step-count').textContent='건설 기초 '+finished+' / '+phases.length+' 완료';
  panel.querySelector('.rk-step-progress').textContent=missing?'다음 목표 · '+missing.name:'왕국의 기본 생산 시설 준비 완료';
  panel.querySelector('.rk-step-help').textContent=missing?missing.tip:'이제 성벽과 방어탑으로 영지를 확장하세요. 건물을 누르면 실제로 가능한 관리 행동만 표시됩니다.';
  panel.querySelector('.rk-step-select').disabled=!missing;
 }
 tick();setInterval(tick,900);
})();