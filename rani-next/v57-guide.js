/* Guided real-game build route. Game state is read-only; clicks delegate to
   the original tested Fiefdom HUD. No fake quest or duplicated build system. */
(()=>{
 let panel=null,dismissed=false,lastText='';
 const phases=[
  {id:'hovel',name:'주택',text:'건설에서 주택을 선택하세요. 연두색은 건설 가능한 위치, 붉은색은 불가능한 위치입니다.'},
  {id:'woodcutter',name:'벌목장',text:'숲 가까이 벌목장을 세워 목재 생산을 늘리세요. 지형이 맞지 않으면 정확한 이유가 표시됩니다.'},
  {id:'wheat_farm',name:'밀 농장',text:'농장은 풀밭에 설치해 식량 생산의 기반을 마련하세요. 창고의 식량과 소비량을 함께 확인하세요.'},
  {id:'market',name:'시장',text:'시장을 건설하고 생산과 교역 수치를 확인하세요. 남는 자원은 다음 건설에 사용합니다.'}
 ];
 const ensure=()=>{
  const ui=document.getElementById('ui');
  const game=window.__game;
  if(!ui||!game?.state||!ui.isConnected||dismissed)return;
  if(panel&&panel.isConnected)return;
  panel=document.createElement('aside');panel.id='rk-first-steps';
  panel.setAttribute('aria-label','처음 시작 안내');
  panel.innerHTML='<div class="rk-step-head"><strong>왕국 첫걸음</strong><button type="button" class="rk-step-close" title="안내 접기" aria-label="안내 접기">×</button></div><p class="rk-step-progress"></p><p class="rk-step-help"></p><div class="rk-step-actions"><button type="button" class="rk-step-open">건설 메뉴 열기</button><button type="button" class="rk-step-dismiss">안내 완료</button></div>';
  panel.querySelector('.rk-step-close').addEventListener('click',()=>{dismissed=true;panel?.remove()});
  panel.querySelector('.rk-step-dismiss').addEventListener('click',()=>{dismissed=true;panel?.remove()});
  panel.querySelector('.rk-step-open').addEventListener('click',()=>{
    const toggle=document.getElementById('rani-build-toggle');
    if(toggle&& !ui.classList.contains('rani-build-open'))toggle.click();
    else if(!toggle)document.getElementById('buildbar')?.querySelector('button')?.click();
  });
  ui.appendChild(panel);
 };
 const tick=()=>{
  ensure();
  if(!panel?.isConnected||dismissed)return;
  const game=window.__game;if(!game?.state)return;
  const existing=new Set(game.state.buildings.map(x=>x.name));
  const idx=phases.findIndex(step=>!existing.has(step.id));
  const next=idx<0?null:phases[idx];
  const text=next?'다음 목표 · '+next.name:'기본 영지 준비 완료';
  const help=next?next.text:'왕국 정보를 확인하고 성벽으로 영토를 확장하세요. 건물마다 가능한 작업만 육각 메뉴에 나타납니다.';
  if(lastText!==text+'|'+help){
   panel.querySelector('.rk-step-progress').textContent=text;
   panel.querySelector('.rk-step-help').textContent=help;
   const action=panel.querySelector('.rk-step-open');
   action.textContent=next?'건설 메뉴 열기':'건설 메뉴 열기';
   panel.dataset.complete=String(!next);
   lastText=text+'|'+help;
  }
 };
 tick();setInterval(tick,850);
})();
