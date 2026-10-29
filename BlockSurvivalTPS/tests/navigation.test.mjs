import test from 'node:test';
import assert from 'node:assert/strict';
import {COVER,ARENA,newGame,start,spawn,tick,findPath,movementClear,assistedAim,shoot} from '../src/sim.mjs';

test('A* routes around an actual blocked building instead of standing against its wall',()=>{
 const from={x:-20,z:-9},to={x:0,z:-9};
 assert.equal(movementClear(from,to,0.63),false);
 const p=findPath(from,to,0.63);
 assert.ok(p.length>=2,'Expected waypoints around blocking wall');
 let previous=from;
 for(const pt of p){
  assert.equal(movementClear(previous,pt,0.63),true,'no segment can clip cover');
  assert.ok(Math.abs(pt.x)<ARENA&&Math.abs(pt.z)<ARENA);
  previous=pt;
 }
 assert.ok(Math.hypot(previous.x-to.x,previous.z-to.z)<0.8);
});
test('direct line of sight does not trigger unnecessary A* zigzags',()=>{
 const from={x:0,z:0},to={x:0,z:-14};
 const route=findPath(from,to,0.63);
 assert.equal(route.length,1);assert.deepEqual(route[0],to);
});
test('chasing enemy navigates to a moving player around a large cover',()=>{
 const s=newGame();start(s);
 s.x=-20;s.z=-9;
 s.enemies=[{id:3,type:'zombie',x:-6,z:-9,radius:0.63,hp:100,speed:2.4,attackCD:3,hitTime:0,deadTime:0,walk:0}];
 const original=s.enemies[0].z;
 let maxDetour=0;
 for(let t=0;t<250;t++){
  tick(s,0.06);
  maxDetour=Math.max(maxDetour,Math.abs(s.enemies[0].z-original));
 }
 const enemy=s.enemies[0];
 assert.ok(enemy,'enemy remains live');
 assert.ok(maxDetour>2,'enemy must actually take a side route around the blocking wall');
 assert.ok(!COVER.some(c=>Math.abs(enemy.x-c.x)<c.w/2-0.1&&Math.abs(enemy.z-c.z)<c.d/2-0.1));
});
test('aim correction prioritizes visible enemies and cannot shoot through cover',()=>{
 const s=newGame();start(s);
 s.enemies=[{id:1,x:0.8,z:-10,radius:0.6,hp:40,type:'zombie'}];
 const aim=assistedAim(s,0,-1);
 assert.equal(aim.targetId,1);
 assert.equal(shoot(s,0,-1).killed,true);
 const c=COVER[0];
 s.x=c.x-10;s.z=c.z;
 s.enemies=[{id:2,x:c.x+10,z:c.z,radius:0.7,hp:40,type:'zombie'}];
 const blocked=assistedAim(s,1,0);
 assert.equal(blocked.targetId,undefined);
});
test('moving target triggers path refresh and no NaN positions',()=>{
 const s=newGame();start(s);
 s.x=-20;s.z=-9;
 const e=spawn(s);assert.ok(e);
 for(let i=0;i<50;i++)tick(s,0.06);
 s.x=-20;s.z=10;
 for(let i=0;i<50;i++)tick(s,0.06);
 for(const mob of s.enemies){assert.ok(Number.isFinite(mob.x)&&Number.isFinite(mob.z));}
});
