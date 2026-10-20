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
   b.setAttribute('aria-controls',cls==='rani-controls-open'?'controls':'stats2');
   b.setAttribute('aria-expanded','false');
   b.addEventListener('click',()=>{
     const opened=root.classList.toggle(cls);
     b.setAttribute('aria-expanded',String(opened));
     b.setAttribute('aria-pressed',String(opened));
   });
   root.appendChild(b);
 };
 // Only collapse real PC game panels. Native Fiefdom mobile drawers stay intact.
 createToggle('rani-info-toggle','왕국 정보','rani-info-open','식량·인구·병력·생산 현황');
 createToggle('rani-controls-toggle','설정','rani-controls-open','속도·세금·사운드·전체화면');
}
const watch=()=>{
 const menu=document.getElementById('menu');if(menu)enhance(menu);
 const ui=document.getElementById('ui');if(ui)enhanceGameHud(ui);
};
// The title screen can be reopened after leaving the map editor.
watch();setInterval(watch,700);
