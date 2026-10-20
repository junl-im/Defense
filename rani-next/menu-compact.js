/* No gameplay replacement: wrap the original selectable map cards
 * in a real, accessible disclosure so the first thing visible is a kingdom.
 * The ORIGINAL #menu .map onclick and #menu .go actions still run normally. */
function enhance(menu) {
 if(menu.dataset.raniCompact==='1')return;
 const grid=menu.querySelector('.maps');
 if(!grid||!menu.querySelector('.go'))return;
 menu.dataset.raniCompact='1';
 const feature=document.createElement('section');
 feature.id='rani-start-hero';
 feature.setAttribute('aria-label','선택한 게임 지도');
 const art=document.createElement('img');
 art.src='/rani/rk_house.webp';art.alt='보유 중인 중세 주택 원본 일러스트';
 art.draggable=false;
 const desc=document.createElement('div');desc.className='rani-start-copy';
 const small=document.createElement('small');small.textContent='나만의 왕국을 건설하세요';
 const title=document.createElement('strong');
 const subtitle=document.createElement('p');
 desc.append(small,title,subtitle);feature.append(art,desc);
 const details=document.createElement('details');details.id='rani-map-picker';
 const summary=document.createElement('summary');
 summary.textContent='다른 지역 선택';
 summary.setAttribute('aria-label','지도 선택 목록 펼치기');
 details.append(summary);grid.before(feature,details);details.append(grid);
 const update=()=>{
   const selected=grid.querySelector('.map.on')||grid.querySelector('.map');
   const name=selected?.querySelector('h3')?.textContent||'왕국';
   title.textContent=(name==='The Salt Coast'||name==='푸른 해안')?'푸른 해안':name;
   subtitle.textContent=(name==='The Salt Coast'||name==='푸른 해안')
    ? '푸른 해안에 성을 세우고 자원과 병력을 길러 왕국을 발전시키세요.'
    : selected?.querySelector('p')?.textContent||'지도에 건물을 배치하고 실제 생산과 군사를 발전시키세요.';
 };
 update();
 grid.addEventListener('click',e=>{
   if(!e.target.closest('.map'))return;
   queueMicrotask(()=>{update();if(menu.isConnected&&!menu.classList.contains('rk-choose-region'))details.open=false;});
 });
}
function enhanceGameHud(root){
 if(root.dataset.raniHud==='1')return;
 root.dataset.raniHud='1';
 const createToggle=(id,text,cls,tip)=>{
   const b=document.createElement('button');
   b.type='button';b.id=id;b.textContent=text;b.title=tip;
   b.setAttribute('aria-controls',cls==='rani-controls-open'?'controls':'rightpanel');
   b.setAttribute('aria-expanded','false');
   b.addEventListener('click',()=>{
     const opened=root.classList.toggle(cls);
     b.setAttribute('aria-expanded',String(opened));
     b.setAttribute('aria-pressed',String(opened));
     if(opened && cls==='rani-info-open')root.querySelector('#rightpanel')?.classList.remove('hidden');
   });
   root.appendChild(b);
 };
 // Only collapse real PC game panels. Native Fiefdom mobile drawers stay intact.
 createToggle('rani-info-toggle','왕국 정보','rani-info-open','식량·인구·병력·생산 현황');
 createToggle('rani-controls-toggle','설정','rani-controls-open','속도·세금·사운드·전체화면');
 const resources=document.createElement('button');
 resources.type='button';resources.id='rani-resource-toggle';
 resources.textContent='자원 +';resources.title='모든 실제 생산 자원 표시 또는 접기';
 resources.setAttribute('aria-controls','topbar');
 resources.setAttribute('aria-expanded','false');
 resources.addEventListener('click',()=>{
   const expanded=root.classList.toggle('rani-res-expanded');
   resources.setAttribute('aria-expanded',String(expanded));
   resources.textContent=expanded?'자원 −':'자원 +';
 });
 root.appendChild(resources);
 const build=document.createElement('button');
 build.type='button';build.id='rani-build-toggle';
 build.textContent='건설';build.title='실제 건축 메뉴 열기/닫기';
 build.setAttribute('aria-controls','buildwrap');
 build.setAttribute('aria-expanded','false');
 const setBuild=open=>{
   root.classList.toggle('rani-build-open',open);
   build.setAttribute('aria-expanded',String(open));
 };
 build.addEventListener('click',()=>setBuild(!root.classList.contains('rani-build-open')));
 // Native hotkeys 1-9 must remain useful even with the compact default view.
 document.addEventListener('keydown',e=>{
  if(!root.isConnected||! /^[1-9]$/.test(e.key))return;
  if(e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;
  if(e.target instanceof HTMLElement&&
      (e.target.isContentEditable||e.target.closest('input,textarea,select')))return;
  setBuild(true);
 },{capture:true});
 root.appendChild(build);
}
// Connect EXISTING individually painted WebP originals to the real game.
 // Building art below is a catalogue thumbnail, never a fake world building:
 // actual placed houses/markets still use native 4-angle atlas + simulation.
function attachApprovedArt(ui) {
 if(ui.dataset.raniAssets==='1')return;
 const btns=[
  ['hovel','/rani/rk_house.webp','주택 외형 미리보기'],
  ['market','/rani/rk_market.webp','시장 외형 미리보기']
 ];
 let done=0;
 for(const [id,source,label] of btns){
   const button=ui.querySelector('#buildmenu button[data-name="'+id+'"]');
   if(!button)continue;
   const original=button.querySelector('canvas');
   if(!original)continue;
   const art=document.createElement('img');
   art.className='rani-approved-building'; art.src=source;
   art.alt=label; art.loading='eager'; art.decoding='async';
   // A failed image must never remove Fiefdom's REAL model icon.
   art.addEventListener('error',()=>{art.remove();original.classList.remove('rani-hide-canvas');});
   art.addEventListener('load',()=>{if(art.naturalWidth)original.classList.add('rani-hide-canvas');});
   original.before(art);
   done++;
 }
 const panel=ui.querySelector('#rightpanel');
 if(panel){
   const head=panel.querySelector('.head');
   if(head){
     const img=document.createElement('img');
     img.id='rani-approved-royal-panel';img.src='/rani/rk_royal_panel.webp';
     img.alt='기존 개별 제작 왕실 정보 패널 원본';img.decoding='async';
     img.addEventListener('error',()=>img.remove());
     head.after(img);done++;
   }
 }
 const actualMarket=ui.querySelector('#market');
 if(actualMarket){
   const section=document.createElement('section');
   section.id='rani-market-art';section.setAttribute('aria-label','왕국 상업 일러스트');
   const img=document.createElement('img');img.src='/rani/rk_ship.webp';
   img.alt='향후 항구 개발용 무역선 이미지';img.loading='eager';
   img.addEventListener('error',()=>section.remove());
   const note=document.createElement('span');
   note.textContent='왕국 교역 · 아래 실제 시장 거래 기능 이용';
   section.append(img,note);actualMarket.prepend(section);done++;
 }
 ui.dataset.raniAssets='1';
 ui.dataset.raniAssetCount=String(done);
 if(done!==4)console.warn('[rani-next] Some source asset placement targets are absent',done);
}

function enhanceBuildDetails(ui){
 const wrap=ui.querySelector('#buildwrap'),bar=ui.querySelector('#buildbar');
 const build=ui.querySelector('#buildmenu');
 if(!wrap||!bar||!build||wrap.dataset.rkDetails==='1')return;
 wrap.dataset.rkDetails='1';
 const pane=document.createElement('aside');pane.id='rk-build-detail';
 pane.setAttribute('aria-label','건설 정보');pane.setAttribute('aria-live','polite');
 const head=document.createElement('strong'),cost=document.createElement('p');
 const desc=document.createElement('p'),status=document.createElement('p');
 cost.className='rk-cost';desc.className='rk-description';status.className='rk-state';
 pane.append(head,cost,desc,status);bar.after(pane);
 const ko=s=>(s||'').replace(/\bwood\b/gi,'목재').replace(/\bstone\b/gi,'석재')
  .replace(/\biron\b/gi,'철').replace(/\bfood\b/gi,'식량').replace(/\bwheat\b/gi,'밀')
  .replace(/\bgold\b/gi,'금').replace(/\bfree\b/gi,'무료').replace(/\bplanks\b/gi,'판자')
  .replace(/\bpitch\b/gi,'역청').replace(/\bbread\b/gi,'빵');
 const cards=[...build.querySelectorAll('button[data-name]')];
 const show=b=>{
  if(!b){head.textContent='건설 안내';cost.textContent='';desc.textContent='건물을 선택하면 정보와 자원 비용을 확인할 수 있습니다.';status.textContent='';return;}
  const lines=(b.title||'').split('\n'),price=b.querySelector('.c');
  head.textContent=b.querySelector('span:not(.n):not(.t):not(.c)')?.textContent||lines[0]?.split(' — ')[0]||'건물';
  cost.textContent='필요 자원 · '+ko(price?.textContent||lines[0]?.split(' — ')[1]||'');
  desc.textContent=lines.slice(1).filter(Boolean)[0]||'왕국을 발전시키는 건물입니다.';
  const poor=b.classList.contains('poor');
  status.textContent=poor?'보유 자원이 부족합니다.':'건설할 위치를 선택하세요.';
  status.classList.toggle('poor',poor);
 };
 show(null);
 for(const b of cards){
  const cost=b.querySelector('.c');if(cost)cost.textContent=ko(cost.textContent);
  b.addEventListener('pointerenter',()=>show(b));
  b.addEventListener('focus',()=>show(b));
  b.addEventListener('click',()=>show(b));
 }
 bar.addEventListener('click',()=>queueMicrotask(()=>{
  const first=[...build.querySelectorAll('.items')].find(x=>x.style.display!=='none')?.querySelector('button[data-name]');
  show(first||null);
 }));
}
const watch=()=>{
 const menu=document.getElementById('menu');if(menu)enhance(menu);
 const ui=document.getElementById('ui');if(ui){enhanceGameHud(ui);attachApprovedArt(ui);enhanceBuildDetails(ui);}
};
// The title screen can be reopened after leaving the map editor.
watch();setInterval(watch,700);
