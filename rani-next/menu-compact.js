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
 const small=document.createElement('small');small.textContent='실제 2.5D 왕국 건설 게임';
 const title=document.createElement('strong');
 const subtitle=document.createElement('p');
 desc.append(small,title,subtitle);feature.append(art,desc);
 const details=document.createElement('details');details.id='rani-map-picker';
 const summary=document.createElement('summary');
 summary.textContent='다른 실제 월드 지도 선택';
 summary.setAttribute('aria-label','지도 선택 목록 펼치기');
 details.append(summary);grid.before(feature,details);details.append(grid);
 const update=()=>{
   const selected=grid.querySelector('.map.on')||grid.querySelector('.map');
   const name=selected?.querySelector('h3')?.textContent||'왕국';
   title.textContent=name==='The Salt Coast'?'푸른 해안':name;
   subtitle.textContent=selected?.querySelector('p')?.textContent||
     '지도에 건물을 배치하고 실제 생산과 군사를 발전시키세요.';
 };
 update();
 grid.addEventListener('click',e=>{
   if(!e.target.closest('.map'))return;
   queueMicrotask(()=>{update();if(menu.isConnected)details.open=false;});
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

const watch=()=>{
 const menu=document.getElementById('menu');if(menu)enhance(menu);
 const ui=document.getElementById('ui');if(ui){enhanceGameHud(ui);attachApprovedArt(ui);}
};
// The title screen can be reopened after leaving the map editor.
watch();setInterval(watch,700);
