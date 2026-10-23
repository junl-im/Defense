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
 // v5.32: five clear starting choices; the original twelve maps remain playable.
 // Only the picker presentation changes. Native card selection and save IDs stay intact.
 const nativeCards=[...grid.querySelectorAll(':scope > .map:not(.mine):not(.make)')];
 const featured=new Set([0,1,2,7,10]); // coast, wadi, valley, saltpan, reeds
 const more=document.createElement('button');
 more.type='button';more.id='rk-region-all';more.className='rk-region-all';
 more.setAttribute('aria-controls','rani-map-picker');
 more.setAttribute('aria-expanded','false');
 const countHidden=nativeCards.filter((_,i)=>!featured.has(i)).length;
 more.textContent='다른 지역 '+countHidden+'곳 보기 ＋';
 grid.before(more);
 more.addEventListener('click',()=>{
   const expanded=grid.classList.toggle('rk-region-expanded');
   more.setAttribute('aria-expanded',String(expanded));
   more.textContent=expanded?'추천 지역만 보기 −':'다른 지역 '+countHidden+'곳 보기 ＋';
 });
 nativeCards.forEach((card,i)=>{
   if(!featured.has(i))card.classList.add('rk-region-extra');
   const diff=card.querySelector('.diff');
   if(diff)diff.textContent=({Gentle:'쉬움',Fair:'보통',Harsh:'어려움'})[diff.textContent.trim()]||diff.textContent;
   const name=card.querySelector('h3');
   if(name){
     const hint=document.createElement('small');
     hint.className='rk-region-kind';
     hint.textContent=(i===1||i===2)?'처음 추천':i===0?'해안':'';
     if(hint.textContent)name.after(hint);
   }
   card.setAttribute('role','button');card.tabIndex=0;
   card.setAttribute('aria-pressed',String(card.classList.contains('on')));
   card.addEventListener('keydown',e=>{
     if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}
   });
 });
 const status=document.createElement('div');
 status.className='rk-region-explain';status.textContent='지역을 누른 뒤 영주와 시작 위치를 정하세요.';
 more.before(status);
 if(!document.getElementById('rk-v532-region-style')){
   const style=document.createElement('style');style.id='rk-v532-region-style';
   style.textContent=`
#menu.rk-choose-region #rani-map-picker{width:min(740px,96vw)!important;margin-inline:auto!important}
#menu.rk-choose-region #rani-map-picker .maps{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
#menu.rk-choose-region .map.rk-region-extra:not(.rk-region-force):not(.on){display:none!important}
#menu.rk-choose-region .maps.rk-region-expanded .map.rk-region-extra{display:flex!important}
#menu.rk-choose-region .map.rk-region-extra.on{display:flex!important}
#menu.rk-choose-region #rani-map-picker .map:not(.make){box-sizing:border-box!important;
 min-width:0!important;min-height:60px!important;padding:11px 12px!important;
 display:flex!important;flex-direction:column!important;align-items:flex-start!important;
 justify-content:center!important;gap:4px!important;cursor:pointer!important}
#menu.rk-choose-region #rani-map-picker .map:not(.make) h3{font:800 13px/1.35 'Malgun Gothic',sans-serif!important;
 margin:0!important;letter-spacing:0!important;color:#fff0cd!important}
#menu.rk-choose-region #rani-map-picker .map:not(.make) .diff{position:static!important;
 font:700 10px/1.2 'Malgun Gothic',sans-serif!important;opacity:.86!important}
#menu.rk-choose-region #rani-map-picker .map:not(.make)>p,
#menu.rk-choose-region #rani-map-picker .map .stat,
#menu.rk-choose-region #rani-map-picker .map .foe{display:none!important}
#menu.rk-choose-region #rani-map-picker .map.mine .own{display:flex!important}
#menu.rk-choose-region .rk-region-kind{font:700 9px/1.2 'Malgun Gothic',sans-serif;
 color:#ffe1a6;letter-spacing:0}
#menu.rk-choose-region #rani-start-hero{box-sizing:border-box!important;display:flex!important;
 width:min(740px,96vw)!important;min-height:86px!important;margin:0 auto 8px!important;
 padding:9px 15px!important;align-items:center!important;gap:12px!important}
#menu.rk-choose-region #rani-start-hero img{width:70px!important;height:64px!important;object-fit:contain!important}
#menu.rk-choose-region #rani-start-hero p{font-size:11px!important;line-height:1.45!important;
 margin:4px 0 0!important;word-break:keep-all!important}
#menu.rk-choose-region #rani-start-hero strong{font-size:17px!important}
#menu.rk-choose-region .rk-region-all{display:block;margin:6px auto 9px;min-height:38px;
 border:1px solid #bc9c69;border-radius:9px;color:#ffe2af;background:#17394d;
 font:700 12px 'Malgun Gothic',sans-serif;padding:8px 20px;cursor:pointer;touch-action:manipulation}
#menu.rk-choose-region .rk-region-all:active{transform:scale(.98)}
#menu.rk-choose-region .rk-region-explain{font:500 11px/1.5 'Malgun Gothic',sans-serif;
 text-align:center;color:#e9d6af;margin:5px auto 0;word-break:keep-all}
#menu.rk-choose-region .map:focus-visible{outline:2px solid #f8d18b!important;outline-offset:2px}
@media(max-width:700px){
 #menu.rk-choose-region #rani-map-picker .maps{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
 #menu.rk-choose-region #rani-map-picker .map:not(.make){padding:8px 9px!important;min-height:53px!important}
 #menu.rk-choose-region #rani-start-hero{display:flex!important;min-height:62px!important;
 padding:8px 10px!important}
 #menu.rk-choose-region #rani-start-hero img{display:none!important}
 #menu.rk-choose-region #rani-start-hero strong{font-size:14px!important}
 #menu.rk-choose-region #rani-start-hero p{font-size:10px!important}
 #menu.rk-choose-region .rk-region-explain{font-size:10px}
 #menu.rk-choose-region .rk-region-all{min-height:35px;font-size:11px;margin:4px auto 7px}
}
`;
   document.head.appendChild(style);
 }
 const update=()=>{
   const selected=grid.querySelector('.map.on')||grid.querySelector('.map');
   const name=selected?.querySelector('h3')?.textContent||'왕국';
   title.textContent=(name==='The Salt Coast'||name==='푸른 해안')?'푸른 해안':name;
   subtitle.textContent=(name==='The Salt Coast'||name==='푸른 해안')
    ? '바다와 초원이 만나는 땅. 영주성을 세우고 왕국을 발전시키세요.'
    : selected?.querySelector('p')?.textContent||'건설할 지역과 시작 위치를 정하세요.';
   nativeCards.forEach(card=>card.setAttribute('aria-pressed',String(card===selected)));
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
