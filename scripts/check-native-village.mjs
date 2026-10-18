import assert from 'node:assert/strict';
import { NativeVillageProgress,villageBounds,villageAllowed,hallUpgradeCost,villageOwnedCount } from '../src/systems/NativeVillageProgress.js';
assert.deepEqual(villageBounds(1),{size:3,low:-1,high:1});
assert.deepEqual(villageBounds(2),{size:4,low:-1,high:2});
assert.deepEqual(villageBounds(3),{size:5,low:-2,high:2});
assert.deepEqual(villageBounds(4),{size:6,low:-2,high:3});
assert(villageAllowed(1,-1,1));
assert(!villageAllowed(1,2,0));
assert(!villageAllowed(1,Infinity,0));
assert.equal(hallUpgradeCost(1).wood,12);
const store={wood:70,stone:50,gold:40,food:50,influence:10};
const resourceSystem={
 canAfford(c){return Object.entries(c).every(([k,v])=>(store[k]||0)>=v);},
 spend(c){if(!this.canAfford(c))return false;Object.entries(c).forEach(([k,v])=>store[k]-=v);return true;},
 grant(c){Object.entries(c).forEach(([k,v])=>store[k]=(store[k]||0)+v);}
};
const game={resourceSystem};
const village=new NativeVillageProgress(game);
assert.equal(village.level,1);
assert.equal(village.allows(2,0),false);
const initial={...store};
assert(village.startUpgrade().ok);
assert.equal(store.wood,initial.wood-12);
assert.equal(village.cancelUpgrade(),true);
assert.equal(store.wood,initial.wood-12*0.2);
assert(village.startUpgrade().ok);
village.update(13);
assert.equal(village.level,2);
assert.equal(village.allows(2,0),true);
assert(!village.allows(3,0));
const save=village.serialize();
assert.equal(save.mode,'hex3d');
const restored=new NativeVillageProgress(game);
restored.restore(save);
assert.equal(restored.level,2);
assert.equal(restored.allows(2,0),true);
const legacy={level:2,plots:[{id:'hall',x:1,y:1}],hallUpgrade:null};
restored.restore(legacy);
assert.deepEqual(restored.serialize().legacy,legacy);
const cells=new Map([
 ['0,0',{q:0,r:0,owner:'player'}],
 ['1,0',{q:1,r:0,owner:'player'}],
 ['6,4',{q:6,r:4,owner:'enemy1'}],
]);
assert.equal(villageOwnedCount({cells}),2);
restored.reset();
assert.equal(restored.level,1);
console.log('PASS native 3D village: 3x3→4x4, real player ownership, costs, cancel, save, legacy backup');
