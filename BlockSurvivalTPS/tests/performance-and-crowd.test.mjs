import test from 'node:test';
import assert from 'node:assert/strict';
import {createQualityState,updateQuality} from '../src/quality.mjs';
import {newGame,start,separateEnemies,circleHitsCover,tick,MAX_ACTIVE,ARENA} from '../src/sim.mjs';

const zombie=(id,x,z,radius=0.63)=>({id,x,z,radius,hp:120,type:'zombie',
 speed:1.9,attackCD:2,hitTime:0,deadTime:0,walk:0});

test('overlapping mobs separate deterministically and respect solid cover',()=>{
 const s=newGame();start(s);s.x=0;s.z=-15;
 s.waveLeft=0;
 s.enemies=[zombie(1,1,9),zombie(2,1,9)];
 for(let i=0;i<8;i++)separateEnemies(s,2);
 const [a,b]=s.enemies;
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>1.0,'crowd overlap should visibly resolve');
 for(const mob of s.enemies){
  assert.equal(circleHitsCover(mob.x,mob.z,mob.radius),false);
  assert.ok(Math.abs(mob.x)<ARENA&&Math.abs(mob.z)<ARENA);
 }
});
test('up to twelve enemies separate over multiple frames without generating NaN or crossing buildings',()=>{
 const s=newGame();start(s);s.x=0;s.z=-17;s.waveLeft=0;s.spawnDelay=30;
 for(let i=0;i<MAX_ACTIVE;i++){
  const x=10+(i%4)*0.09,z=19+Math.floor(i/4)*0.1;
  s.enemies.push(zombie(i+1,x,z));
 }
 for(let frame=0;frame<80;frame++){
  tick(s,0.06);
  for(const mob of s.enemies){
   assert.ok(Number.isFinite(mob.x)&&Number.isFinite(mob.z));
   assert.equal(circleHitsCover(mob.x,mob.z,mob.radius),false);
  }
 }
 // A dense group spreads without permitting them all to share the same centroid.
 const unique=new Set(s.enemies.map(e=>Math.round(e.x*10)+','+Math.round(e.z*10)));
 assert.ok(unique.size>8,'mob swarm should visibly disperse');
});
test('dead mobs do not push living mobs during separation',()=>{
 const s=newGame();start(s);
 const live=zombie(1,1,8),dead=zombie(2,1,8);dead.hp=0;
 s.enemies=[live,dead];separateEnemies(s);
 assert.equal(live.x,1);assert.equal(live.z,8);
});
test('sustained low FPS lowers mobile rendering scale but keeps safe minimum',()=>{
 let q=createQualityState({mobile:true,dpr:3});
 for(let i=0;i<60;i++)q=updateQuality(q,19);
 assert.equal(q.ratio,q.min);assert.equal(q.min,0.72);
});
test('stable high FPS restores desktop rendering quality without exceeding device cap',()=>{
 let q=createQualityState({mobile:false,dpr:1.4});
 for(let i=0;i<35;i++)q=updateQuality(q,21);
 assert.ok(q.ratio<1.4);
 for(let i=0;i<110;i++)q=updateQuality(q,58);
 assert.equal(q.ratio,1.4);
});
test('normal FPS and paused state do not cause oscillation',()=>{
 let q=createQualityState({mobile:true,dpr:1});
 for(let i=0;i<20;i++)q=updateQuality(q,36);
 assert.equal(q.ratio,1);
 for(let i=0;i<20;i++)q=updateQuality(q,18,{playing:false});
 assert.equal(q.ratio,1);
});
