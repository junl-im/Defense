import assert from 'node:assert/strict';
import { buildPlans,QUICK_COMBOS } from '../src/ui/QuickBuildPlans.js';
assert.equal(QUICK_COMBOS.length,3);
let affordable=true;
const game={
 grid:{has:()=>false,canPlace:()=>true},
 nativeVillage:{allows:(q,r)=>q>=-1&&q<=1&&r>=-1&&r<=1},
 progressionSystem:{underTileCap:()=>true,isUnlocked:type=>['forest','field','meadow','hills'].includes(type)},
 resourceSystem:{canAfford:()=>affordable},
 researchSystem:{isCompleted:()=>false},
 tilesPlaced:1,
};
const plans=buildPlans(game,1,0);
assert(plans.some(p=>p.id==='combo:lumber_mill'&&p.ok));
assert(!plans.some(p=>p.id==='combo:farm'));
assert(plans.some(p=>p.id==='tile:forest'&&p.ok));
assert(plans.every(p=>!p.id.includes('road')));
affordable=false;
assert(buildPlans(game,1,0).every(p=>!p.ok));
assert.equal(buildPlans(game,3,0).length,0);
game.grid.has=()=>true;
assert.equal(buildPlans(game,1,0).length,0);
console.log('PASS contextual construction: genuine frontier, unlocked types, researched combos, cost gate');
