import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,tick,shoot,reload,pause,detonateBarrel,drainCombatEffects} from '../src/sim.mjs';
import {undeadCombatPose} from '../src/combat-pose.mjs';
const enemy=(x=0,z=1,hp=300)=>({id:71,x,z,hp,type:'zombie',radius:0.63,speed:0,
 attackCD:0,attackWindup:0,attackWindupTotal:0,attackPulse:0,
 hitTime:0,staggerCooldown:0,impactX:0,impactZ:0,walk:0,deadTime:0});
const game=()=>{const s=newGame();start(s);s.waveLeft=0;s.nextWave=100;s.enemies=[enemy()];return s;};
test('successful bullet stores authoritative direction for hit animation',()=>{
 const s=game(),e=s.enemies[0];const res=shoot(s,0,1);
 assert.equal(res.hit,true);assert.equal(e.impactX,0);assert.equal(e.impactZ,1);
 assert.ok(e.hitTime>0);
});
test('shooting during a real warning interrupts its single incoming strike',()=>{
 const s=game(),e=s.enemies[0];tick(s,0.06);
 assert.ok(e.attackWindup>0);
 const r=shoot(s,0,1);assert.equal(r.hit,true);
 assert.equal(e.attackWindup,0);assert.ok(e.attackCD>=0.48);
 assert.ok(e.staggerCooldown>1.3);
 const events=drainCombatEffects(s);
 assert.equal(events.filter(x=>x.type==='stagger').length,1);
 for(let i=0;i<7;i++)tick(s,0.06);
 assert.equal(s.hp,100,'interrupted attack must not inflict an old delayed hit');
});
test('stagger has immunity timer to prevent rapid-fire stun locking',()=>{
 const s=game(),e=s.enemies[0];tick(s,0.06);
 shoot(s,0,1);drainCombatEffects(s);
 e.attackWindup=0.36;e.attackCD=0;s.shotCooldown=0;
 shoot(s,0,1);
 assert.equal(e.attackWindup,0.36,'second hit is damage only during immunity');
 assert.equal(drainCombatEffects(s).filter(x=>x.type==='stagger').length,0);
});
test('stagger countdown and attack cannot progress during pause',()=>{
 const s=game();tick(s,0.06);shoot(s,0,1);
 const v=s.enemies[0].staggerCooldown;
 pause(s);for(let i=0;i<10;i++)tick(s,0.06);
 assert.equal(s.enemies[0].staggerCooldown,v);
});
test('blast pushes enemy impact direction outwards from the explosive origin',()=>{
 const s=game(),b=s.barrels[0];s.enemies=[enemy(b.x+1,b.z,200)];
 detonateBarrel(s,b);
 const e=s.enemies[0];
 assert.ok(e.impactX>0.99);assert.equal(e.impactZ,0);
 assert.ok(e.hitTime>0);
});
test('modern hit pose changes direction as the incoming shot rotates left to right',()=>{
 const left=undeadCombatPose({hp:40,hitTime:0.2,hitSide:-1,hitFront:0});
 const right=undeadCombatPose({hp:40,hitTime:0.2,hitSide:1,hitFront:0});
 assert.ok(right.leanZ-left.leanZ>0.4);
 const idle=undeadCombatPose({hp:40,hitTime:0,hitSide:1,hitFront:0});
 assert.ok(Math.abs(idle.leanZ)<0.01);
});
test('dry fire, reload cooldown and missed shot never invent an enemy flinch',()=>{
 const s=game(),e=s.enemies[0];
 s.reloadTime=1.2;assert.equal(shoot(s,0,1).fired,false);
 s.reloadTime=0;s.ammo=0;assert.equal(shoot(s,0,1).fired,false);
 assert.equal(e.hitTime,0);assert.equal(e.staggerCooldown,0);
 assert.equal(drainCombatEffects(s).filter(x=>x.type==='stagger').length,0);
});
