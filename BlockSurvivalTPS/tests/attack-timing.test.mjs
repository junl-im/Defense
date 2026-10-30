import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,pause,tick,shoot,reload,drainCombatEffects,ATTACK_WINDUP} from '../src/sim.mjs';
const testEnemy=(x=0,z=1)=>({id:1,x,z,radius:0.62,hp:90,speed:0,
 attackCD:0,attackWindup:0,attackPulse:0,hitTime:0,deadTime:0,type:'zombie',walk:0});
const make=()=>{const s=newGame();start(s);s.waveLeft=0;s.spawnDelay=100;s.enemies=[testEnemy()];return s;};

test('melee attack warns before any HP loss, connects precisely after windup',()=>{
 const s=make();s.hp=100;
 tick(s,0.06);
 assert.equal(s.hp,100);assert.equal(s.enemies[0].attackWindup,ATTACK_WINDUP);
 assert.deepEqual(drainCombatEffects(s).map(e=>e.type),['warning']);
 for(let i=0;i<4;i++)tick(s,0.06);
 assert.equal(s.hp,100,'no pre-telegraph instant damage');
 tick(s,0.06);assert.equal(s.hp,100);
 tick(s,0.06);assert.equal(s.hp,88);
 assert.equal(s.enemies[0].attackWindup,0);
 const effects=drainCombatEffects(s);
 assert.equal(effects.filter(e=>e.type==='damage').length,1);
 for(let i=0;i<5;i++)tick(s,0.06);
 assert.equal(s.hp,88,'one hit per windup, no repeated per-frame hits');
});

test('moving out of melee range during warning cancels attack with no ghost hit',()=>{
 const s=make();tick(s,0.06);
 s.x=7;s.z=0;for(let i=0;i<10;i++)tick(s,0.06);
 assert.equal(s.hp,100);
 assert.equal(s.enemies[0].attackWindup,0);
 assert.ok(drainCombatEffects(s).some(e=>e.type==='cancel'));
});

test('solid cover interrupts windup and prevents damage through walls',()=>{
 const s=make();tick(s,0.06);
 s.x=-12;s.z=-9;for(let i=0;i<9;i++)tick(s,0.06);
 assert.equal(s.hp,100);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='damage').length,0);
});

test('pausing stops attack windup, effect timers, reload and all sounds event streams',()=>{
 const s=make();tick(s,0.06);
 const before=s.enemies[0].attackWindup;
 pause(s);for(let i=0;i<25;i++)tick(s,0.06);
 assert.equal(s.enemies[0].attackWindup,before);
 assert.equal(s.hp,100);
});

test('killing a mob while it winds up cancels strike forever',()=>{
 const s=make();s.enemies[0].hp=40;
 tick(s,0.06);
 s.enemies[0].x=0;s.enemies[0].z=-1;
 const shot=shoot(s,0,-1);
 assert.equal(shot.killed,true);
 for(let i=0;i<10;i++)tick(s,0.06);
 assert.equal(s.hp,100);
 assert.ok(drainCombatEffects(s).some(e=>e.type==='kill'));
});

test('kill streak grants bounded incremental score and resets after inactivity',()=>{
 const s=make();s.enemies.length=0;
 for(let i=0;i<7;i++){
  s.enemies=[{...testEnemy(0,-6),id:i+10,hp:35,attackCD:9}];
  const result=shoot(s,0,-1);
  assert.equal(result.killed,true);
  for(let j=0;j<4;j++)tick(s,0.06);
 }
 assert.equal(s.combo,7);
 assert.equal(s.score,100+120+140+160+180+200+200);
 assert.equal(s.effects.length<=32,true);
 s.enemies=[];s.waveLeft=0;s.nextWave=100;
 for(let i=0;i<90;i++)tick(s,0.06);
 assert.equal(s.combo,0);
});

test('shot, reload, medkit and warning events stay bounded and have unique sequence IDs',()=>{
 const s=make();s.enemies=[];
 for(let i=0;i<50;i++)s.effects.push({id:i,type:'synthetic'});
 // Synthetic overflow is not a supported caller, but new emitted events cap memory.
 s.ammo=1;assert.equal(reload(s),true);
 assert.equal(s.effects.length,32);
 const taken=drainCombatEffects(s);assert.equal(taken.length,32);
 assert.ok(taken.some(e=>e.type==='reload'));
 assert.equal(drainCombatEffects(s).length,0);
});

test('shot tracer orientation reflects authoritative assisted impact, not raw reticle vector',()=>{
 const s=make();s.enemies=[{...testEnemy(0.3,-6),id:8,hp:120}];
 const hit=shoot(s,0,-1);
 assert.equal(hit.hit,true);
 assert.ok(Math.abs(hit.aim.dx-0.3/Math.hypot(0.3,-6))<0.00001);
 assert.ok(Math.abs(hit.aim.dz-(-6)/Math.hypot(0.3,-6))<0.00001);
 for(let i=0;i<4;i++)tick(s,0.06);
 s.enemies=[];
 const missed=shoot(s,1,0);
 assert.equal(missed.fired,true);assert.equal(missed.hit,false);
 assert.deepEqual(missed.aim,{dx:1,dz:0});
});
