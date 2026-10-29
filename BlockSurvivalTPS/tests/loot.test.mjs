import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,tick,dropPickup,shoot,MAX_ACTIVE} from '../src/sim.mjs';

test('collects nearby ammo automatically, but not distant drops',()=>{
 const s=newGame();start(s);
 const distant=dropPickup(s,6,6,'ammo');
 assert.ok(distant);tick(s,0.06);
 assert.equal(s.reserve,72);
 dropPickup(s,0.3,0.4,'ammo');
 tick(s,0.06);
 assert.equal(s.reserve,90);
 assert.equal(s.pickups.length,1);
 assert.ok(s.pickupFlash>0);
});
test('medkits heal by at most 24 and do not vanish at full health',()=>{
 const s=newGame();start(s);
 s.hp=100;dropPickup(s,0,0,'medkit');tick(s,0.06);
 assert.equal(s.pickups.length,1,'full health players can collect later');
 s.hp=83;tick(s,0.06);
 assert.equal(s.hp,100);assert.equal(s.pickups.length,0);
});
test('loot is bounded to 12 objects and expires',()=>{
 const s=newGame();start(s);
 for(let i=0;i<18;i++)dropPickup(s,i+3,18,'ammo');
 assert.equal(s.pickups.length,12);
 for(let i=0;i<305;i++)tick(s,0.06);
 assert.equal(s.pickups.length,0);
});
test('every third kill drops ammo and fifth kill drops a medkit',()=>{
 const s=newGame();start(s);
 for(let i=0;i<5;i++){
  s.enemies=[{id:i+1,x:0,z:-6,radius:0.6,hp:40,type:'zombie',
   attackCD:3,hitTime:0,deadTime:0,walk:0,speed:0}];
  const res=shoot(s,0,-1);
  assert.ok(res.hit&&res.killed);
  tick(s,0.22);
 }
 assert.equal(s.kills,5);
 assert.deepEqual(s.pickups.map(x=>x.kind).sort(),['ammo','medkit']);
});
test('pickup effect never changes paused state',()=>{
 const s=newGame();dropPickup(s,0,0,'ammo');
 tick(s,0.06);
 assert.equal(s.reserve,72);assert.equal(s.pickups[0].ttl,18);
});
