// Rani Kingdom village construction state, independent of the existing world hex grid.
// The existing v3 world save is preserved; village is an optional, additive field.
import { BUILDINGS, fmtCost } from '../config/BuildingConfig.js';
import { events } from '../core/Events.js';
export const HALL_MAX_LEVEL = 4;
export const HALL_NAME = '중심 건물';
export const VILLAGE_BUILD_IDS = Object.freeze(['lumber_mill','farm','mine','market','barracks','garrison']);
export const VILLAGE_COST_REFUND = 0.8;
export function villageSize(level) { return Math.min(HALL_MAX_LEVEL, Math.max(1,level)) + 2; }
export function hallCost(level) {
  return { wood:40*level, stone:20*level, gold:10*level };
}
function refund(cost) {
  return Object.fromEntries(Object.entries(cost).map(([key,value])=>[key,Math.round(value*VILLAGE_COST_REFUND*100)/100]));
}
export class VillageState {
  constructor(game) {
    this.game=game;
    this.reset();
  }
  reset() {
    this.hallLevel=1;
    this.hallUpgrade=null;
    this.plots=[{x:1,y:1,id:'hall',done:true,remaining:0,total:0}];
    this._tick=0;
    events.emit('village:changed',{});
  }
  get size() { return villageSize(this.hallLevel); }
  getPlot(x,y) {return this.plots.find(p=>p.x===x&&p.y===y) || null;}
  canBuild(x,y,id) {
    if (!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=this.size||y>=this.size)
      return {ok:false,reason:'마을 범위 밖입니다.'};
    if (this.getPlot(x,y)) return {ok:false,reason:'이미 건물이 있는 칸입니다.'};
    const def=BUILDINGS[id];
    if(!VILLAGE_BUILD_IDS.includes(id)||!def) return {ok:false,reason:'건설할 수 없는 시설입니다.'};
    if(def.research&&!this.game.researchSystem.isCompleted(def.research))
      return {ok:false,reason:this.game.researchSystem.nameOf(def.research)+' 연구가 필요합니다.'};
    if(!this.game.resourceSystem.canAfford(def.cost))
      return {ok:false,reason:'자원이 부족합니다. '+fmtCost(def.cost)};
    return {ok:true,reason:''};
  }
  build(x,y,id) {
    const check=this.canBuild(x,y,id);
    if(!check.ok) return check;
    const def=BUILDINGS[id];
    if(!this.game.resourceSystem.spend(def.cost,def.name+' 건설')) return {ok:false,reason:'자원이 부족합니다.'};
    const time=def.buildTime*(this.game.researchSystem?.buildTimeMult||1);
    this.plots.push({x,y,id,done:false,remaining:time,total:time});
    events.emit('village:changed',{});
    return {ok:true,reason:def.name+' 건설 중'};
  }
  cancel(x,y) {
    const p=this.getPlot(x,y);
    if(!p||p.id==='hall'||p.done) return false;
    const def=BUILDINGS[p.id];
    this.plots=this.plots.filter(v=>v!==p);
    this.game.resourceSystem.grant(refund(def.cost),'마을 건설 취소');
    events.emit('village:changed',{});
    return true;
  }
  canUpgradeHall() {
    if(this.hallLevel>=HALL_MAX_LEVEL) return {ok:false,reason:'최대 확장 단계입니다.'};
    if(this.hallUpgrade) return {ok:false,reason:'중심 건물 승격 중입니다.'};
    if(!this.game.resourceSystem.canAfford(hallCost(this.hallLevel)))
      return {ok:false,reason:'승격 자원이 부족합니다. '+fmtCost(hallCost(this.hallLevel))};
    return {ok:true,reason:''};
  }
  upgradeHall() {
    const check=this.canUpgradeHall();
    if(!check.ok)return check;
    const level=this.hallLevel;
    if(!this.game.resourceSystem.spend(hallCost(level),'중심 건물 승격'))
      return {ok:false,reason:'자원이 부족합니다.'};
    this.hallUpgrade={remaining:20*level,total:20*level};
    events.emit('village:changed',{});
    return {ok:true,reason:'중심 건물 승격 중'};
  }
  cancelHallUpgrade() {
    if(!this.hallUpgrade)return false;
    this.hallUpgrade=null;
    this.game.resourceSystem.grant(refund(hallCost(this.hallLevel)),'중심 건물 승격 취소');
    events.emit('village:changed',{});
    return true;
  }
  update(dt) {
    let changed=false;
    for(const p of this.plots) {
      if(p.done||p.id==='hall')continue;
      p.remaining=Math.max(0,p.remaining-dt);
      if(p.remaining<=0){p.done=true;changed=true;}
    }
    if(this.hallUpgrade) {
      this.hallUpgrade.remaining=Math.max(0,this.hallUpgrade.remaining-dt);
      if(this.hallUpgrade.remaining<=0) {
        this.hallLevel=Math.min(HALL_MAX_LEVEL,this.hallLevel+1);
        this.hallUpgrade=null;
        changed=true;
      }
    }
    // Village production is independent from external field tiles.
    this._tick+=dt;
    if(this._tick>=1) {
      const step=this._tick;
      this._tick=0;
      const gains={};
      for(const p of this.plots) {
        if(!p.done||p.id==='hall')continue;
        const prod=BUILDINGS[p.id]?.production||{};
        for(const [key,value] of Object.entries(prod)) {
          gains[key]=(gains[key]||0)+value*(this.game.researchSystem?.resourceMult(key)||1)*step;
        }
      }
      if(Object.keys(gains).length)this.game.resourceSystem.grant(gains,'마을 생산');
    }
    if(changed)events.emit('village:changed',{});
  }
  serialize() {
    return {
      level:this.hallLevel,
      plots:this.plots.map(({x,y,id,done,remaining,total})=>({x,y,id,done,remaining:Math.round(remaining*10)/10,total:Math.round(total*10)/10})),
      hallUpgrade:this.hallUpgrade?{...this.hallUpgrade}:null,
    };
  }
  restore(data) {
    if(!data||!Number.isInteger(data.level)||data.level<1||data.level>HALL_MAX_LEVEL||
       !Array.isArray(data.plots))return;
    const coords=new Set();
    const valid=[];
    let hasHall=false;
    for(const p of data.plots) {
      if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<0||p.y<0||
         p.x>=villageSize(data.level)||p.y>=villageSize(data.level)||
         ![...VILLAGE_BUILD_IDS,'hall'].includes(p.id))continue;
      const key=p.x+','+p.y;
      if(coords.has(key))continue;
      coords.add(key);
      if(p.id==='hall'){
        if(p.x!==1||p.y!==1)continue;
        hasHall=true;
      }
      valid.push({x:p.x,y:p.y,id:p.id,done:!!p.done,remaining:Math.max(0,Math.min(500,Number(p.remaining)||0)),
        total:Math.max(0,Math.min(500,Number(p.total)||0))});
    }
    if(!hasHall)return;
    this.hallLevel=data.level;
    this.plots=valid;
    this.hallUpgrade=data.hallUpgrade&&data.level<HALL_MAX_LEVEL&&Number(data.hallUpgrade.remaining)>0?
      {remaining:Math.min(500,Math.max(0,Number(data.hallUpgrade.remaining))),
       total:Math.min(500,Math.max(0,Number(data.hallUpgrade.total)||20))}:null;
    events.emit('village:changed',{});
  }
}
