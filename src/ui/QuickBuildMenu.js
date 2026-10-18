// One-tap blank-hex construction. The ORIGINAL RadialMenu is the ONLY picker.
// The actual placeTile / BuildingSystem / SaveSystem flows remain authoritative.
import { buildPlans } from './QuickBuildPlans.js';
import { events } from '../core/Events.js';

export class QuickBuildMenu {
  constructor(game) {
    this.game=game;
    this.current=null;
    events.on('selection:changed',({cell})=>{if(cell)this.close()});
    events.on('game:restart',()=>this.close());
    document.addEventListener('keydown',e=>{if(e.key==='Escape')this.close()});
  }
  open(q,r) {
    // Same empty hex is a one-tap open/close toggle.
    if(this.current?.q===q&&this.current?.r===r&&this.game.radialMenu?.empty){
      this.close();return true;
    }
    if(!buildPlans(this.game,q,r).length)return false;
    this.close();
    this.game.selection.clear();
    document.dispatchEvent(new Event('rani:map-focus'));
    this.current={q,r};
    if(!this.game.radialMenu.openEmpty(q,r)){this.current=null;return false;}
    return true;
  }
  applyPlan(q,r,id) {
    const plan=buildPlans(this.game,q,r).find(p=>p.id===id);
    if(!plan?.ok)return false;
    this.game.selectTileType(plan.type);
    // The existing land placement handles resources, random variants,
    // scores, ownership and the original save format.
    this.game.placeTile(q,r);
    const cell=this.game.grid.get(q,r);
    if(!cell)return false;
    if(plan.building){
      const started=this.game.buildingSystem.build(cell,plan.building);
      if(started){
        this.game.saveSystem.save(this.game);
        this.game.ui.toast('건설 중 · '+plan.label);
      }else{
        this.game.ui.toast('지형은 설치되었습니다. 건축 조건을 다시 확인하세요.');
      }
    }
    // Never open a second menu after construction: tap the hex again for info.
    this.game.selection.clear();
    this.close();
    document.dispatchEvent(new Event('rani:map-focus'));
    return true;
  }
  render(){this.game.radialMenu?.refreshEmpty();}
  close(){
    this.current=null;
    this.game.radialMenu?.closeEmpty();
  }
}
