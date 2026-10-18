import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestLane, makeBossAttack, hitsHero, bossCasualties, BOSS_PATTERN_NAMES} from '../src/boss-combat.js';

test('targeted lane follows snapshot position, not live position',()=>{
 const attack=makeBossAttack(1,0,-4.7,9);
 assert.equal(attack.type,'lane');
 assert.equal(attack.lane,-3.1);
 assert.equal(hitsHero(attack,-3.1),true);
 assert.equal(hitsHero(attack,3.1),false);
 assert.ok(attack.executeAt>attack.createdAt);
 assert.ok(attack.nextAttackAt>attack.executeAt);
});
test('phase 2 and phase 3 progress through different patterns',()=>{
 assert.equal(makeBossAttack(2,0,2,1).type,'lane');
 assert.equal(makeBossAttack(2,1,2,1).type,'sweep');
 assert.deepEqual([0,1,2].map(i=>makeBossAttack(3,i,0,1).type),['lane','sweep','pulse']);
 assert.equal(makeBossAttack(3,2,0,1).title,BOSS_PATTERN_NAMES.pulse);
});
test('sweep avoids center, pulse avoids edges',()=>{
 const sweep=makeBossAttack(2,1,0,0),pulse=makeBossAttack(3,2,0,0);
 assert.equal(hitsHero(sweep,0),false);assert.equal(hitsHero(sweep,4),true);
 assert.equal(hitsHero(pulse,0),true);assert.equal(hitsHero(pulse,-4),false);
});
test('casualties are bounded and input validated',()=>{
 assert.equal(bossCasualties(0,makeBossAttack(3,0,0,0)),0);
 assert.ok(bossCasualties(99,makeBossAttack(3,2,0,0))<=99);
 assert.equal(nearestLane(0),0);
 assert.throws(()=>makeBossAttack(0,0,0,0));
 assert.throws(()=>makeBossAttack(1,0,NaN,0));
});
