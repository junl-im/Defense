import { BUILDINGS, fmtCost } from '../config/BuildingConfig.js';
import { events } from '../core/Events.js';
import { VILLAGE_BUILD_IDS, STARTER_FREE_IDS, hallCost, HALL_MAX_LEVEL } from '../systems/VillageState.js';
const emoji={hall:'🏰',lumber_mill:'🪵',farm:'🌾',mine:'⛏️',market:'🛍️',barracks:'⚔️',garrison:'🛡️'};

export class VillageView {
  constructor(game) {
    this.game=game;
    this.active=false;
    this.selected=null;
    this._progressT=0;
    // Original isolated browser game test pages lack the app's primary HUD.
    if (!document.getElementById('game-title')) return;
    const root=document.createElement('main');
    root.id='rani-village-screen';
    root.className='rani-village-screen';
    root.setAttribute('aria-label','라니킹덤 마을 건설 화면');
    root.innerHTML=[
      '<header class="rani-village-header"><div><small>나만의 첫 마을</small><h1>라니킹덤</h1></div>',
      '<div class="rani-village-actions"><button type="button" id="rani-help">게임 방법</button>',
      '<button type="button" id="rani-open-save">💾 저장 관리</button>',
      '<button type="button" id="rani-go-world">🌍 필드 나가기</button></div></header>',
      '<div id="rani-village-res" class="rani-village-res" aria-label="자원 현황"></div>',
      '<section class="rani-starter-box" aria-label="초보자 마을 건설 안내">',
      '<div class="rani-starter-heading"><div><small>처음 오셨나요?</small><strong>첫 건설 2개 무료 · 즉시 완공!</strong></div>',
      '<span id="rani-starter-count">0 / 2 완성</span></div>',
      '<p id="rani-starter-guide">벌목장과 농장을 먼저 건설해 목재와 식량을 확보하세요.</p>',
      '<div id="rani-starter-actions" class="rani-starter-actions"></div>',
      '</section>',
      '<div class="rani-village-layout"><section class="rani-village-main">',
      '<div class="rani-village-meta"><strong id="rani-village-level"></strong>',
      '<span id="rani-village-size"></span></div>',
      '<div id="rani-village-grid" class="rani-village-grid" aria-label="마을 건설 격자"></div>',
      '<div id="rani-hall-panel" class="rani-hall-panel"></div></section>',
      '<aside id="rani-village-sidebar" class="rani-village-sidebar"><h2>건설 관리</h2>',
      '<p id="rani-village-guide">빈 칸을 선택해 건설하세요.</p>',
      '<div id="rani-village-options"></div></aside></div>',
      '<div class="rani-village-footer">마을 건설과 필드 행군을 분리했습니다. 월드에서는 다른 세력을 만나고 전투할 수 있습니다.</div>'
    ].join('');
    document.body.appendChild(root);
    this.root=root;
    this.grid=root.querySelector('#rani-village-grid');
    this.options=root.querySelector('#rani-village-options');
    this.hallPanel=root.querySelector('#rani-hall-panel');
    this.starterActions=root.querySelector('#rani-starter-actions');
    this.starterActions.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-starter-build]');
      if(!btn)return;
      const id=btn.dataset.starterBuild;
      const result=this.game.villageState.quickBuild(id);
      if(result.ok){
        this.selected={x:result.x,y:result.y};
        this.game.saveSystem.save(this.game);
      }
      this.game.ui.toast(result.reason||'건설할 수 없습니다.');
      this.render();
    });
    this.worldButton=document.createElement('button');
    this.worldButton.id='rani-return-village';
    this.worldButton.type='button';
    this.worldButton.textContent='🏠 내 마을';
    this.worldButton.setAttribute('aria-label','내 마을로 돌아가기');
    document.body.appendChild(this.worldButton);
    root.querySelector('#rani-go-world').addEventListener('click',()=>this.setMode('world'));
    root.querySelector('#rani-open-save').addEventListener('click',()=>this.game.saveManager?.open());
    this.worldButton.addEventListener('click',()=>this.setMode('village'));
    root.querySelector('#rani-help').addEventListener('click',()=>document.querySelector('#help-btn')?.click());
    this.grid.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-village-x]');
      if(!btn)return;
      this.selected={x:Number(btn.dataset.villageX),y:Number(btn.dataset.villageY)};
      this.render();
    });
    this.options.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-village-build]');
      if(!btn||!this.selected)return;
      const v=this.game.villageState;
      if(btn.dataset.villageBuild==='cancel'){
        if(!window.confirm('건설을 취소하고 사용 자원의 80%를 돌려받으시겠습니까?'))return;
        if(v.cancel(this.selected.x,this.selected.y))this.game.ui.toast('건설을 취소했습니다.');
      }else{
        const result=v.build(this.selected.x,this.selected.y,btn.dataset.villageBuild);
        this.game.ui.toast(result.reason||'건설 시작');
      }
      this.game.saveSystem.save(this.game);
      this.render();
    });
    this.hallPanel.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-hall-action]');
      if(!btn)return;
      const v=this.game.villageState;
      if(btn.dataset.hallAction==='cancel') {
        if(!window.confirm('중심 건물 승격을 취소하시겠습니까?'))return;
        if(v.cancelHallUpgrade())this.game.ui.toast('승격을 취소했습니다.');
      }else{
        const result=v.upgradeHall();
        this.game.ui.toast(result.reason||'중심 건물 승격 시작');
      }
      this.game.saveSystem.save(this.game);
      this.render();
    });
    events.on('village:changed',()=>this.render());
    events.on('research:completed',()=>this.render());
    events.on('resources:changed',()=>this.renderResources());
    this.setMode('village');
  }
  setMode(mode) {
    this.active=mode==='village';
    this.game.mode=this.active?'village':'world';
    document.body.dataset.gameMode=this.game.mode;
    if(this.root) {
      this.root.hidden=!this.active;
      this.worldButton.hidden=this.active;
    }
    if(this.active) {
      this.game.selection?.clear();
      this.render();
    }
    // Keep the active game data intact. Only the viewport switches.
    events.emit('game:mode',{mode:this.game.mode});
  }
  renderResources() {
    if(!this.active||!this.root)return;
    const r=this.game.resourceSystem.resources;
    const icons={wood:'🪵',stone:'🪨',food:'🌾',gold:'🪙',influence:'⭐'};
    const names={wood:'목재',stone:'석재',food:'식량',gold:'금화',influence:'영향력'};
    this.root.querySelector('#rani-village-res').innerHTML=
      Object.keys(icons).map(id=>'<div><small>'+icons[id]+' '+names[id]+'</small><b>'+Math.floor(r[id]||0)+'</b></div>').join('');
  }
  render() {
    if(!this.active||!this.root)return;
    const v=this.game.villageState;
    this.renderResources();
    const size=v.size;
    this.renderStarter();
    this.root.querySelector('#rani-village-level').textContent='중심 건물 '+v.hallLevel+'단계';
    this.root.querySelector('#rani-village-size').textContent='건설 구역 '+size+'×'+size+' · '+(size*size)+'칸';
    this.grid.style.gridTemplateColumns='repeat('+size+', minmax(0,1fr))';
    const tiles=[];
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
      const p=v.getPlot(x,y);
      const selected=this.selected?.x===x&&this.selected?.y===y;
      const label=p?(p.id==='hall'?'중심 건물':BUILDINGS[p.id]?.name||'시설'):'빈 건설 칸';
      const state=p?(p.done?'완료':p.id==='hall'?'':'건설 중'):'건설 가능';
      tiles.push('<button type="button" class="rani-village-tile'+(selected?' selected':'')+
        (p?' occupied':' empty')+'" data-village-x="'+x+'" data-village-y="'+y+'">'+
        '<span class="rani-tile-emoji">'+(p?emoji[p.id]||'🏡':'＋')+'</span>'+
        '<strong>'+label+'</strong><small>'+state+'</small></button>');
    }
    this.grid.innerHTML=tiles.join('');
    const hall=v.hallUpgrade;
    if(hall) {
      const remaining=Math.ceil(hall.remaining);
      this.hallPanel.innerHTML='<strong>🏰 중심 건물 승격 중</strong><span>남은 시간 '+remaining+'초 · 완료 시 '+(size+1)+'×'+(size+1)+'칸</span>'+
        '<button data-hall-action="cancel" type="button">승격 취소</button>';
    }else if(v.hallLevel<HALL_MAX_LEVEL) {
      const check=v.canUpgradeHall(),price=fmtCost(hallCost(v.hallLevel));
      this.hallPanel.innerHTML='<strong>🏰 중심 건물 승격</strong><span>다음: '+(size+1)+'×'+(size+1)+'칸 · '+price+'</span>'+
        '<button data-hall-action="upgrade" type="button"'+(check.ok?'':' disabled')+'>승격 시작</button>'+
        (check.ok?'':'<small>'+check.reason+'</small>');
    }else this.hallPanel.innerHTML='<strong>🏰 최고 단계 도달</strong><span>마을 전체 '+size+'×'+size+'칸 개방</span>';
    this.renderOptions();
  }
  renderStarter() {
    const v=this.game.villageState;
    const progress=v.getStarterProgress();
    this.root.querySelector('#rani-starter-count').textContent=
      progress.completed+' / '+progress.total+' 완성';
    if(progress.next) {
      this.root.querySelector('#rani-starter-guide').textContent=
        progress.completed===0
          ? '아래 버튼만 누르면 벌목장과 농장이 무료로 바로 완성됩니다.'
          : '좋아요! 남은 무료 건설까지 완료하고 마을을 넓혀보세요.';
    } else {
      this.root.querySelector('#rani-starter-guide').textContent=
        '초기 생산 시설 준비 완료! 중심 건물을 승격하면 건설 구역이 늘어납니다.';
    }
    const labels={lumber_mill:'🪵 벌목장 무료 건설',farm:'🌾 농장 무료 건설'};
    this.starterActions.innerHTML=STARTER_FREE_IDS.map(id=>{
      const claimed=v.starterClaims.includes(id);
      return '<button type="button" class="rani-starter-button" data-starter-build="'+id+
        '"'+(claimed?' disabled':'')+'>'+ (claimed?'✓ '+BUILDINGS[id].name+' 완료':labels[id])+
        (claimed?'':'<small>0원 · 바로 완공</small>')+'</button>';
    }).join('');
  }

  renderOptions() {
    const v=this.game.villageState;
    const p=this.selected&&v.getPlot(this.selected.x,this.selected.y);
    if(!this.selected){this.options.innerHTML='<p>빈 칸을 눌러 원하는 건물을 선택하세요.</p>';return;}
    if(p) {
      if(p.id==='hall'){this.options.innerHTML='<p>중심 건물의 단계가 높아질수록 마을이 확장됩니다.</p>';return;}
      const def=BUILDINGS[p.id];
      this.options.innerHTML='<div class="rani-selected-building"><b>'+emoji[p.id]+' '+def.name+'</b><p>'+
        (p.done?'건설 완료 · '+def.desc:'건설 중 · 남은 시간 '+Math.ceil(p.remaining)+'초')+'</p>'+
        (p.done?'':'<button type="button" data-village-build="cancel">건설 취소 · 자원 80% 반환</button>')+'</div>';
      return;
    }
    this.options.innerHTML=VILLAGE_BUILD_IDS.map(id=>{
      const def=BUILDINGS[id],check=v.canBuild(this.selected.x,this.selected.y,id);
      const price=check.starter?'무료 · 즉시 완공':fmtCost(def.cost);
      return '<button type="button" class="rani-build-choice" data-village-build="'+id+'"'+(check.ok?'':' disabled')+'>'+
        '<span>'+emoji[id]+'</span><strong>'+def.name+'</strong><small>'+price+'</small>'+
        (check.ok?'':'<em>'+check.reason+'</em>')+'</button>';
    }).join('');
  }
  refreshProgress(dt) {
    if(!this.active)return;
    this._progressT+=dt;
    if(this._progressT>=0.9){
      this._progressT=0;
      if(this.game.villageState.hallUpgrade||this.game.villageState.plots.some(p=>!p.done))this.render();
    }
  }
}
