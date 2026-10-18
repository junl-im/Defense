// Rani Kingdom v0.7. The familiar original 3D build scene IS the village.
// The external world is a real faction overview driven by FactionSystem, not a
// new construction interface. World mode skips expensive 3D drawing.
import { hallUpgradeCost,villageBounds,villageOwnedCount,VILLAGE_MAX_LEVEL } from '../systems/NativeVillageProgress.js';
import { events } from '../core/Events.js';
import { fmtCost } from '../config/BuildingConfig.js';

const clean=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class NativeVillageUI {
  constructor(game){
    this.game=game;
    this.activeWorld=false;
    this.selectedId=null;
    this._lastRender=0;
    this._build();
    this._events();
    this.setMode('village');
  }
  _build(){
    const top=document.createElement('nav');
    top.id='rani-nav';
    top.setAttribute('aria-label','마을과 필드 이동');
    top.innerHTML='<div class="rani-nav-line"><span id="rani-nav-town">🏰 내 마을 · 3×3</span>'+
      '<button type="button" id="rani-native-upgrade">중심 건물 승격</button>'+
      '<button type="button" id="rani-native-cancel" hidden>승격 취소</button>'+
      '<button type="button" id="rani-native-world">🗺️ 필드 나가기</button></div>'+
      '<small id="rani-native-status">기존 3D 건설 화면에서 지형을 설치하고 시설을 세우세요.</small>';
    document.body.appendChild(top);
    const overlay=document.createElement('section');
    overlay.id='rani-world-overview';
    overlay.hidden=true;
    overlay.setAttribute('aria-label','라니킹덤 세계 지도');
    overlay.innerHTML='<header class="rani-world-head"><div><small>라니킹덤 · 외부 지역</small><h2>세계 지도</h2></div>'+
      '<button id="rani-native-home" type="button">🏠 내 마을 돌아가기</button></header>'+
      '<p class="rani-world-explain">외부 지도의 마을을 선택해 세력과 병력 정보를 확인하세요. 전투는 실제 병력이 있고 내 영토와 맞닿은 곳에서만 가능합니다.</p>'+
      '<div class="rani-world-layout"><div class="rani-world-map" id="rani-world-map" role="group" aria-label="세력별 월드 위치"></div>'+
      '<aside class="rani-world-detail" id="rani-world-detail" aria-live="polite">마을을 선택하세요.</aside></div>';
    document.body.appendChild(overlay);
    this.top=top;this.overlay=overlay;
    top.querySelector('#rani-native-world').addEventListener('click',()=>this.setMode('world'));
    overlay.querySelector('#rani-native-home').addEventListener('click',()=>this.setMode('village'));
    top.querySelector('#rani-native-upgrade').addEventListener('click',()=>{
      const result=this.game.nativeVillage.startUpgrade();
      this.game.ui.toast(result.reason);
      if(result.ok)this.game.saveSystem.save(this.game);
      this.refresh();
    });
    top.querySelector('#rani-native-cancel').addEventListener('click',()=>{
      if(!confirm('중심 건물 승격을 취소하고 자원 80%를 돌려받으시겠습니까?'))return;
      if(this.game.nativeVillage.cancelUpgrade())this.game.saveSystem.save(this.game);
      this.refresh();
    });
    overlay.querySelector('#rani-world-map').addEventListener('click',(event)=>{
      const btn=event.target.closest('button[data-faction-id]');
      if(!btn)return;this.selectedId=btn.dataset.factionId;this.refreshWorld();
    });
    overlay.querySelector('#rani-world-detail').addEventListener('click',(event)=>{
      if(!event.target.closest('button[data-rani-attack]'))return;
      const f=this.game.factionSystem.factions.find(f=>f.id===this.selectedId);
      const cell=f?this.game.grid.get(f.home.q,f.home.r):null;
      if(!cell||!this.game.armySystem.canAttack(cell).ok)return;
      if(!confirm('실제 병력을 사용해 이 적 영토를 공격하시겠습니까?'))return;
      this.game.armySystem.attack(cell);
      this.game.saveSystem.save(this.game);
      this.refreshWorld();
    });
    window.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&this.activeWorld)this.setMode('village');
    });
  }
  _events(){
    for(const name of ['native-village:changed','native-village:expanded','resources:changed','game:restart'])
      events.on(name,()=>this.refresh());
    events.on('native-village:expanded',()=>{
      this.game._refreshFrontier();
      this.game._updateHover();
      this.game.saveSystem.save(this.game);
      this.game.ui.toast('중심 건물 승격 완료! 마을 건설 구역이 확장되었습니다.');
    });
    for(const name of ['factions:tick','territory:changed','army:changed'])
      events.on(name,()=>{
        this.hideForeignCells();
        if(this.activeWorld)this.refreshWorld();
      });
  }
  hideForeignCells(){
    // Foreign settlements are world-map nodes, not rendered in my construction scene.
    for(const cell of this.game.grid.cells.values()){
      if(cell.group)cell.group.visible=(!cell.owner||cell.owner==='player');
    }
  }
  setMode(mode){
    this.activeWorld=mode==='world';
    this.game.mode=this.activeWorld?'world':'village';
    document.body.dataset.gameMode=this.game.mode;
    this.overlay.hidden=!this.activeWorld;
    this.top.hidden=this.activeWorld;
    this.hideForeignCells();
    if(this.activeWorld){
      this.game.selection.clear();
      this.game.tileFactory.hideGhost();
      this.refreshWorld();
    } else {
      this.game._refreshFrontier();
      this.game._updateHover();
    }
    this.refresh();
  }
  refresh(){
    if(!this.top)return;
    const state=this.game.nativeVillage;
    const owned=villageOwnedCount(this.game.grid);
    const {size}=villageBounds(state.level);
    this.top.querySelector('#rani-nav-town').textContent='🏰 내 마을 · '+size+'×'+size+' · 내 영토 '+owned+'칸';
    const up=this.top.querySelector('#rani-native-upgrade');
    const cancel=this.top.querySelector('#rani-native-cancel');
    const status=this.top.querySelector('#rani-native-status');
    if(state.upgrade) {
      up.hidden=true;cancel.hidden=false;
      status.textContent='중심 건물 승격 중 · 남은 시간 '+Math.ceil(state.upgrade.remaining)+'초';
    } else {
      const check=state.canUpgrade();
      up.hidden=state.level>=VILLAGE_MAX_LEVEL;
      up.disabled=!check.ok;
      up.textContent=state.level<VILLAGE_MAX_LEVEL?
        '중심 건물 '+(state.level+1)+'단계 · '+fmtCost(hallUpgradeCost(state.level)):'';
      cancel.hidden=true;
      status.textContent=state.level>=VILLAGE_MAX_LEVEL?
        '마을 건설 구역 최종 확장 완료 · '+size+'×'+size:
        (!check.ok?check.reason+' · ':'')+
        '지금 보이는 3D 건설 화면이 마을입니다. 현재 영역 '+size+'×'+size;
    }
  }
  refreshWorld(){
    if(!this.activeWorld)return;
    const all=this.game.factionSystem.factions;
    const parent=this.overlay.querySelector('#rani-world-map');
    // Position nodes directly from the faction homes in the existing Hexkingdom world.
    const entries=[{id:'player',label:'내 마을',q:0,r:0,icon:'🏰',hostile:false},
      ...all.map(f=>({id:f.id,label:f.label,q:f.home.q,r:f.home.r,icon:f.hostile?'⚔️':'🏘️',hostile:f.hostile}))];
    const max=Math.max(8,...entries.map(e=>Math.max(Math.abs(e.q),Math.abs(e.r))));
    const board=entries.map(e=>{
      const left=50+e.q/max*43,top=50+e.r/max*43;
      return '<button type="button" class="rani-world-node '+(e.id===this.selectedId?'selected ':'')+
        (e.id==='player'?'player':'')+'" data-faction-id="'+clean(e.id)+'" style="left:'+left+'%;top:'+top+'%" aria-label="'+clean(e.label)+'">'+
        '<span>'+e.icon+'</span><small>'+clean(e.label)+'</small></button>';
    }).join('');
    parent.innerHTML='<div class="rani-world-grid" aria-hidden="true"></div>'+board;
    const detail=this.overlay.querySelector('#rani-world-detail');
    if(!this.selectedId||this.selectedId==='player'){
      detail.innerHTML='<h3>내 마을</h3><p>기존 3D 건설 화면에서 마을을 키우고 병력을 모집하세요.</p>'+
        '<p>월드의 다른 세력은 현재 실제 데이터에서 표시됩니다.</p>';
      return;
    }
    const f=all.find(f=>f.id===this.selectedId);
    if(!f){detail.textContent='마을을 선택하세요.';return;}
    const cell=this.game.grid.get(f.home.q,f.home.r);
    const can=cell&&cell.owner!=='player'?this.game.armySystem.canAttack(cell):{ok:false,reason:'공격할 수 없는 마을입니다.'};
    const distance=Math.round((Math.abs(f.home.q)+Math.abs(f.home.r)+Math.abs(f.home.q+f.home.r))/2);
    detail.innerHTML='<h3>'+clean(f.label)+'</h3>'+
      '<p>관계: '+(f.hostile?'적대':'우호 또는 중립')+'</p>'+
      '<p>거리: '+distance+'칸 · 영토: '+f.territory.size+'칸</p>'+
      '<p>전투력: '+Math.round(f.strength)+' · 내 병력 '+this.game.armySystem.unitCount+'명</p>'+
      (can.ok?'<button data-rani-attack type="button">⚔️ 공격</button>':
      '<p class="rani-world-warning">공격 불가: '+clean(can.reason)+'</p>');
  }
  update(dt){
    if(!this.activeWorld&&this.game.nativeVillage.upgrade){
      this._lastRender+=dt;
      if(this._lastRender>0.7){this._lastRender=0;this.refresh();}
    }
  }
}
