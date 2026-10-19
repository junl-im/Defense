// Rani Kingdom v3.3 — explicit fullscreen + safe game navigation.
// Modern browsers forbid unprompted fullscreen/closing user-created tabs.
// This controller honors those restrictions and never claims they succeeded.
function button(label,action){
  const el=document.createElement('button');
  el.type='button';
  el.dataset.shellAction=action;
  el.textContent=label;
  return el;
}

export function installRaniGameShell(game){
  if(document.getElementById('rani-shell-menu'))return;
  const launcher=document.getElementById('rani-royal-launcher');
  if(!launcher)return;
  const toggle=button('☰ 메뉴','menu');
  toggle.id='rani-shell-menu-toggle';
  toggle.setAttribute('aria-label','전체화면 및 게임 나가기 메뉴');
  toggle.setAttribute('aria-haspopup','dialog');
  // Put navigation inside the EXISTING docks. A fixed floating button
  // covered the original #rani-field-shortcut on mobile.
  const label=document.createElement('span');
  label.className='royal-text';
  label.textContent='메뉴';
  const glyph=document.createElement('span');
  glyph.className='royal-icon';
  glyph.setAttribute('aria-hidden','true');
  glyph.textContent='☰';
  toggle.textContent='';
  toggle.append(glyph,label);
  launcher.appendChild(toggle);
  const mobileDock=document.getElementById('slg-mobile-dock');
  const mobileToggle=mobileDock?button('☰ 메뉴','menu'):null;
  if(mobileToggle){
    mobileToggle.id='rani-shell-menu-mobile-toggle';
    mobileToggle.setAttribute('aria-label','전체화면 및 게임 나가기 메뉴');
    mobileToggle.setAttribute('aria-haspopup','dialog');
    const mobileGlyph=document.createElement('span');
    mobileGlyph.textContent='☰';
    mobileGlyph.setAttribute('aria-hidden','true');
    const mobileText=document.createElement('small');
    mobileText.textContent='메뉴';
    mobileToggle.textContent='';
    mobileToggle.append(mobileGlyph,mobileText);
    mobileDock.appendChild(mobileToggle);
  }
  const root=document.createElement('div');
  root.id='rani-shell-menu';
  root.hidden=true;
  root.setAttribute('aria-hidden','true');
  const dialog=document.createElement('section');
  dialog.className='rani-shell-dialog';
  dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','rani-shell-title');
  const title=document.createElement('h2');
  title.id='rani-shell-title';
  title.textContent='라니킹덤';
  const subtitle=document.createElement('p');
  subtitle.className='rani-shell-description';
  const feedback=document.createElement('p');
  feedback.className='rani-shell-feedback';
  feedback.setAttribute('role','status');
  feedback.setAttribute('aria-live','polite');
  const controls=document.createElement('div');
  controls.className='rani-shell-actions';
  const resume=button('↶ 뒤로가기','back');
  const fullscreen=button('⛶ 전체화면','fullscreen');
  const leave=button('⌂ 나가기','leave');
  const quit=button('⏻ 종료하기','quit');
  controls.append(resume,fullscreen,leave,quit);
  dialog.append(title,subtitle,controls,feedback);
  root.appendChild(dialog);
  document.body.appendChild(root);
  document.body.classList.add('rani-shell-immersive');
  let view='game'; // game, menu, title. Never a second gameplay engine.
  let fullscreenAttempted=false;
  let guardArmed=false;
  let lastTrigger=toggle;
  const fullscreenSupported=()=>!!document.fullscreenEnabled&&
    typeof document.documentElement.requestFullscreen==='function';
  function updateButton(){
    fullscreen.textContent=document.fullscreenElement?'⛶ 전체화면 해제':'⛶ 전체화면';
    toggle.setAttribute('aria-expanded',String(!root.hidden));
    mobileToggle?.setAttribute('aria-expanded',String(!root.hidden));
  }
  const save=()=>{
    // SaveSystem already exists and owns the only canonical save key.
    try{
      if(game.saveSystem?.enabled)game.saveSystem.save(game);
      else feedback.textContent='자동 저장이 지원되지 않는 브라우저입니다.';
    }catch(e){
      console.warn('[RaniShell] Save before leave failed',e);
      feedback.textContent='저장 상태를 확인하세요.';
    }
  };
  function show(kind='menu'){
    view=kind;
    game.shellPaused=kind==='title';
    root.hidden=false;
    root.setAttribute('aria-hidden','false');
    document.body.classList.toggle('rani-shell-title-open',kind==='title');
    title.textContent=kind==='title'?'라니킹덤 — 시작 화면':'라니킹덤 — 게임 메뉴';
    subtitle.textContent=kind==='title'
      ?'왕국은 이 기기에 저장했습니다. 이어하기를 누르면 같은 왕국으로 돌아갑니다.'
      :'뒤로가기는 게임으로, 나가기는 시작 화면으로 이동합니다.';
    resume.textContent=kind==='title'?'▶ 게임 이어하기':'↶ 뒤로가기';
    leave.hidden=kind==='title';
    feedback.textContent='';
    updateButton();
    resume.focus();
  }
  function hide(){
    view='game';
    game.shellPaused=false;
    root.hidden=true;
    root.setAttribute('aria-hidden','true');
    document.body.classList.remove('rani-shell-title-open');
    updateButton();
    lastTrigger.focus();
  }
  async function enterFullscreen(){
    if(!fullscreenSupported())return false;
    if(document.fullscreenElement)return true;
    try{
      await document.documentElement.requestFullscreen({navigationUI:'hide'});
      updateButton();
      return !!document.fullscreenElement;
    }catch{
      // Browser permission/user-gesture restrictions are expected.
      return false;
    }
  }
  function back(){
    if(view==='title'||view==='menu'){hide();return;}
    const saveOverlay=document.getElementById('save-manager-overlay');
    if(saveOverlay&&!saveOverlay.hidden){
      saveOverlay.querySelector('.save-manager-close')?.click();
      return;
    }
    const mobilePanel=document.body.dataset.activeSlgPanel;
    if(matchMedia('(max-width:700px)').matches&&mobilePanel&&mobilePanel!=='map'){
      document.querySelector('#slg-mobile-dock [data-panel="'+mobilePanel+'"]')?.click();
      return;
    }
    if(document.body.classList.contains('royal-kingdom-open')){
      launcher.querySelector('[data-royal-action="kingdom"]')?.click();return;
    }
    if(game.mode==='world'){
      game.nativeVillageUI?.setMode('village');return;
    }
    show('menu');
  }
  for(const trigger of [toggle,mobileToggle].filter(Boolean)){
    trigger.addEventListener('click',()=>{
      lastTrigger=trigger;
      root.hidden?show('menu'):hide();
    });
  }
  root.addEventListener('click',e=>{
    if(e.target===root){hide();return;}
    const cmd=e.target.closest('button[data-shell-action]')?.dataset.shellAction;
    if(!cmd)return;
    if(cmd==='back'){back();return;}
    if(cmd==='leave'){save();show('title');return;}
    if(cmd==='fullscreen'){
      if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
      else void enterFullscreen().then(ok=>{
        if(!ok)feedback.textContent='브라우저가 전체화면을 허용하지 않았습니다. 설치형 앱에서 전체화면으로 실행하거나 화면을 직접 전환하세요.';
      });
      return;
    }
    if(cmd==='quit'){
      save();
      game.shellPaused=true;
      if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
      // Script-opened windows can close. Regular tabs generally cannot.
      window.close();
      feedback.textContent='이 브라우저에서 창 자동 종료가 제한되었습니다. 탭 또는 앱 창을 직접 닫아주세요. 왕국은 저장되어 있습니다.';
      title.textContent='라니킹덤 — 종료';
      show('title');
      feedback.textContent='이 브라우저에서 창 자동 종료가 제한되었습니다. 탭 또는 앱 창을 직접 닫아주세요. 왕국 저장을 시도했습니다.';
    }
  });
  window.addEventListener('keydown',e=>{
    if(e.key!=='Escape'&&e.key!=='Backspace')return;
    if(e.key==='Backspace'&&/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName||''))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // Preserve original Escape behavior: selected building/hex is deselected
    // before opening the global game menu.
    if(root.hidden && e.key==='Escape' && game.selection?.cell){
      game.selection.clear();
      return;
    }
    back();
  },true);
  // On Android browser Back the app receives popstate. Restore one
  // same-URL history sentinel and show our non-destructive leave menu.
  try{
    history.pushState({raniGameShell:true},'',location.href);
    guardArmed=true;
  }catch{/* History can be restricted in sandboxed frames. */}
  window.addEventListener('popstate',()=>{
    if(guardArmed){
      try{history.pushState({raniGameShell:true},'',location.href);}catch{}
    }
    back();
  });
  document.addEventListener('fullscreenchange',updateButton);
  // Attempt true fullscreen once after game initialization. On ordinary
  // browsers this normally fails without user activation. Then the *first*
  // real interaction can grant activation, with an explicit menu fallback.
  void enterFullscreen();
  const onFirstGesture=()=>{
    if(fullscreenAttempted)return;
    fullscreenAttempted=true;
    if(!document.fullscreenElement)void enterFullscreen();
  };
  document.addEventListener('pointerup',onFirstGesture,{once:true,capture:true});
  updateButton();
  game.raniShell={back,show,hide,enterFullscreen,get view(){return view;}};
}
