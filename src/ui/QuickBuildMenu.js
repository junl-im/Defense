// Direct construction from a real empty 3D land tap.
// Existing tile visuals, resource system, RNG, build queues and radial menu stay intact.
import { buildPlans } from './QuickBuildPlans.js';
import { fmtCost } from '../config/BuildingConfig.js';
import { events } from '../core/Events.js';
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export class QuickBuildMenu {
  constructor(game) {
    this.game=game;
    this.current=null;
    this.root=document.createElement('section');
    this.root.id='rani-quick-build';
    this.root.hidden=true;
    this.root.setAttribute('aria-label','빈 땅 바로 건설');
    this.root.innerHTML='<header class="rani-qb-head"><strong id="rani-qb-title">이 땅에 건설</strong>'+
      '<button type="button" id="rani-qb-close" aria-label="건설 메뉴 닫기">✕</button></header>'+
      '<p>추천 건물은 지형과 공사를 한 번에 시작합니다.</p>'+
      '<div id="rani-qb-options" class="rani-qb-options"></div>';
    document.body.appendChild(this.root);
    this.root.querySelector('#rani-qb-close').addEventListener('click',()=>this.close());
    this.root.querySelector('#rani-qb-options').addEventListener('click',e=>{
      const btn=e.target.closest('button[data-plan]');
      if(!btn || !this.current)return;
      const {q,r}=this.current;
      const plan=buildPlans(this.game,q,r).find(p=>p.id===btn.dataset.plan);
      if(!plan||!plan.ok){this.render();return;}
      this.game.selectTileType(plan.type);
      // Reuse the original placeTile flow and all of its scoring/save/resource rules.
      this.game.placeTile(q,r);
      const cell=this.game.grid.get(q,r);
      if(!cell){this.render();return;}
      this.close();
      if(plan.building) {
        const started=this.game.buildingSystem.build(cell,plan.building);
        if(started){
          this.game.saveSystem.save(this.game);
          this.game.ui.toast('건설 중 · '+plan.label);
        } else {
          this.game.ui.toast('지형은 설치되었습니다. 건축 조건을 다시 확인하세요.');
        }
      }
      // Construction stays in BuildingSystem's real timed queue. Closing the
      // picker must NOT immediately open a second radial/selection popup.
      // The player can tap this 3D hex again to inspect its progress.
      this.game.selection.clear();
      document.dispatchEvent(new Event('rani:map-focus'));
    });
    events.on('resources:changed',()=>this.render());
    events.on('progression:completed',()=>this.render());
    events.on('game:restart',()=>this.close());
    events.on('selection:changed',({cell})=>{if(cell)this.close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')this.close()});
  }
  open(q,r,clientX,clientY) {
    if(this.current?.q===q && this.current?.r===r && !this.root.hidden){
      this.close();return;
    }
    const plans=buildPlans(this.game,q,r);
    if(!plans.length)return false;
    this.game.selection.clear();
    document.dispatchEvent(new Event('rani:map-focus'));
    this.current={q,r};
    const left=Math.max(14,Math.min(window.innerWidth-350,clientX||window.innerWidth/2));
    const top=Math.max(72,Math.min(window.innerHeight-340,clientY||window.innerHeight/2));
    this.root.style.left=left+'px';this.root.style.top=top+'px';
    this.root.hidden=false;
    this.render();
    return true;
  }
  render(){
    if(!this.current||this.root.hidden)return;
    const {q,r}=this.current;
    this.root.querySelector('#rani-qb-title').textContent='빈 땅 건설 · '+q+', '+r;
    const plans=buildPlans(this.game,q,r);
    const combos=plans.filter(p=>p.building),tiles=plans.filter(p=>!p.building);
    const make=(p)=>'<button type="button" data-plan="'+esc(p.id)+'"'+(p.ok?'':' disabled')+
      '><strong>'+esc(p.label)+'</strong><small>'+esc(fmtCost(p.cost))+
      (p.reason?' · '+esc(p.reason):'')+'</small></button>';
    this.root.querySelector('#rani-qb-options').innerHTML=
      '<h3>추천 건설</h3><div class="rani-qb-grid">'+
      (combos.length?combos.map(make).join(''):'<span class="rani-qb-muted">연구 후 새로운 건물이 해금됩니다.</span>')+
      '</div><h3>지형만 설치</h3><div class="rani-qb-grid">'+tiles.map(make).join('')+'</div>';
  }
  close(){this.current=null;this.root.hidden=true;}
}
