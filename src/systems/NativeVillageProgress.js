// 3D village limits for the ORIGINAL, complete MIT-licensed Hexkingdom scene.
// No extra DOM grid, duplicate economy or starter buildings.
import { events } from '../core/Events.js';
export const VILLAGE_MAX_LEVEL = 4;
export const VILLAGE_REFUND_RATE = 0.8;
export function villageSide(level) { return Math.max(3,Math.min(VILLAGE_MAX_LEVEL,level)+2); }
export function villageBounds(level) {
  const size=villageSide(level);
  const low=-Math.floor((size-1)/2);
  return {size,low,high:low+size-1};
}
export function villageAllowed(level,q,r) {
  if(!Number.isInteger(q)||!Number.isInteger(r))return false;
  const {low,high}=villageBounds(level);
  return q>=low&&q<=high&&r>=low&&r<=high;
}
export function hallUpgradeCost(level) {
  if (level<1||level>=VILLAGE_MAX_LEVEL) return {};
  return {wood:12*level,stone:8*level,gold:4*level};
}
export function villageOwnedCount(grid) {
  let count=0;
  for(const c of grid.cells.values())if(!c.owner||c.owner==='player')count++;
  return count;
}
export class NativeVillageProgress {
  constructor(game) {this.game=game;this.reset();}
  reset() {this.level=1;this.upgrade=null;this.legacyVillage=null;events.emit('native-village:changed',{});}
  get size(){return villageSide(this.level);}
  allows(q,r){return villageAllowed(this.level,q,r);}
  canUpgrade() {
    if(this.level>=VILLAGE_MAX_LEVEL)return {ok:false,reason:'중심 건물이 최대 단계입니다.'};
    if(this.upgrade)return {ok:false,reason:'중심 건물이 승격 중입니다.'};
    const cost=hallUpgradeCost(this.level);
    if(!this.game.resourceSystem.canAfford(cost))return {ok:false,reason:'중심 건물 승격 자원이 부족합니다.'};
    return {ok:true,reason:''};
  }
  startUpgrade() {
    const check=this.canUpgrade();if(!check.ok)return check;
    const cost=hallUpgradeCost(this.level);
    if(!this.game.resourceSystem.spend(cost,'중심 건물 승격'))return {ok:false,reason:'자원이 부족합니다.'};
    const duration=12*this.level;
    this.upgrade={remaining:duration,total:duration};
    events.emit('native-village:changed',{});
    return {ok:true,reason:'중심 건물 승격 중'};
  }
  cancelUpgrade() {
    if(!this.upgrade)return false;
    this.upgrade=null;
    const cost=hallUpgradeCost(this.level);
    this.game.resourceSystem.grant(Object.fromEntries(Object.entries(cost).map(([k,v])=>[k,Math.round(v*VILLAGE_REFUND_RATE*100)/100])),'중심 건물 승격 취소');
    events.emit('native-village:changed',{});
    return true;
  }
  update(dt){
    if(!this.upgrade)return;
    this.upgrade.remaining=Math.max(0,this.upgrade.remaining-Math.max(0,dt));
    if(this.upgrade.remaining<=0){
      this.level=Math.min(VILLAGE_MAX_LEVEL,this.level+1);
      this.upgrade=null;
      events.emit('native-village:expanded',{size:this.size,level:this.level});
    }
    events.emit('native-village:changed',{});
  }
  serialize(){
    return {mode:'hex3d',level:this.level,upgrade:this.upgrade?{...this.upgrade}:null,
      ...(this.legacyVillage?{legacy:this.legacyVillage}:{})};
  }
  restore(data){
    if(!data||typeof data!=='object')return;
    // A former v0.5 DOM-village save is preserved losslessly for export/recovery;
    // do not pretend its unrelated slot records are 3D meshes.
    this.legacyVillage=data.mode==='hex3d'?(data.legacy||null):data;
    if(Number.isInteger(data.level)&&data.level>=1&&data.level<=VILLAGE_MAX_LEVEL)this.level=data.level;
    const u=data.mode==='hex3d'&&data.upgrade;
    this.upgrade=u&&Number.isFinite(u.remaining)&&u.remaining>0&&Number.isFinite(u.total)&&
      u.total>0&&u.total<=600?{remaining:Math.min(600,u.remaining),total:Math.min(600,u.total)}:null;
    events.emit('native-village:changed',{});
  }
}
