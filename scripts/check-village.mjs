import assert from 'node:assert/strict';
import { VillageState, villageSize, hallCost, HALL_MAX_LEVEL } from '../src/systems/VillageState.js';
assert.equal(villageSize(1),3);
assert.equal(villageSize(2),4);
assert.equal(villageSize(3),5);
assert.equal(villageSize(4),6);
assert.equal(HALL_MAX_LEVEL,4);
assert.equal(hallCost(1).wood,40);
const game={
  researchSystem:{isCompleted:()=>true,buildTimeMult:1,resourceMult:()=>1},
  resourceSystem:{
    resources:{wood:200,stone:200,food:200,gold:200,influence:10},
    canAfford(cost){return Object.entries(cost).every(([k,v])=>this.resources[k]>=v);},
    spend(cost){if(!this.canAfford(cost))return false;for(const [k,v] of Object.entries(cost))this.resources[k]-=v;return true;},
    grant(g){for(const [k,v] of Object.entries(g))this.resources[k]=(this.resources[k]||0)+v;}
  }
};
const village=new VillageState(game);
assert.equal(village.size,3);
assert.equal(village.plots.length,1);
assert.equal(village.getPlot(1,1).id,'hall');
assert.equal(village.canBuild(1,1,'lumber_mill').ok,false);
assert.equal(village.canBuild(3,0,'lumber_mill').ok,false);
assert.equal(village.canBuild(0,0,'road').ok,false);
assert.equal(village.build(0,0,'lumber_mill').ok,true);
assert.equal(village.getPlot(0,0).done,false);
assert.equal(village.cancel(0,0),true);
assert.equal(village.getPlot(0,0),null);
assert.equal(village.build(0,0,'lumber_mill').ok,true);
village.update(30);
assert.equal(village.getPlot(0,0).done,true);
assert.equal(village.upgradeHall().ok,true);
assert.equal(village.hallLevel,1);
village.update(30);
assert.equal(village.hallLevel,2);
assert.equal(village.size,4);
assert.equal(village.canBuild(3,3,'lumber_mill').ok,true);
const save=village.serialize();
const restored=new VillageState(game);
restored.restore(save);
assert.equal(restored.size,4);
assert.equal(restored.getPlot(0,0).id,'lumber_mill');
assert.equal(restored.getPlot(1,1).id,'hall');
assert.equal(restored.getPlot(3,3),null);
restored.reset();
assert.equal(restored.size,3);
assert.equal(restored.plots.length,1);
console.log('PASS 라니킹덤 village state: expansion 3x3→4x4, buildings, cancellation, restore and reset');
