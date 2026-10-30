import test from 'node:test';
import assert from 'node:assert/strict';
import {ARENA,DODGE_DURATION,DODGE_COOLDOWN,DODGE_INVULNERABLE,
 newGame,start,pause,tick,tryDodge,shoot,detonateBarrel,drainCombatEffects} from '../src/sim.mjs';

const game=()=>{const s=newGame();start(s);s.waveLeft=0;s.nextWave=100;return s;};
const enemy=(x=1.5,z=0)=>({id:77,x,z,hp:100,type:'zombie',radius:0.63,speed:0,
 attackCD:0,attackWindup:0.02,attackWindupTotal:0.36,attackPulse:0,
 hitTime:0,staggerCooldown:0,impactX:0,impactZ:0,walk:0,deadTime:0});

test('dodge cannot run in title or pause, and captures a normalized direction',()=>{
 const s=newGame();
 assert.equal(tryDodge(s,1,0),false);
 start(s);assert.equal(tryDodge(s,50,0),true);
 assert.equal(s.dodgeX,1);assert.equal(s.dodgeZ,0);
 assert.equal(s.dodgeTime,DODGE_DURATION);
 assert.equal(s.dodgeCooldown,DODGE_COOLDOWN);
 assert.equal(s.dodgeInvuln,DODGE_INVULNERABLE);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='dodge').length,1);
 pause(s);assert.equal(tryDodge(s,0,1),false);
});
test('timed movement respects cover and cannot tunnel through arena edge',()=>{
 const s=game();s.x=ARENA-0.52;
 assert.equal(tryDodge(s,1,0),false,'wall press must not burn cooldown');
 assert.equal(s.dodgeCooldown,0);
 assert.equal(tryDodge(s,-1,0),true);
 for(let i=0;i<6;i++)tick(s,0.05,{x:0,z:0,sprint:true});
 assert.ok(s.x<ARENA-1,'real displacement takes place');
 assert.equal(s.dodgeTime,0);
 assert.ok(s.x<=ARENA-0.52);
});
test('dodge covers same distance at different legal frame steps',()=>{
 const a=game(),b=game();
 assert.equal(tryDodge(a,1,0),true);assert.equal(tryDodge(b,1,0),true);
 for(let i=0;i<5;i++)tick(a,0.05,{});
 for(let i=0;i<13;i++)tick(b,0.02,{});
 assert.ok(a.x>3.4&&a.x<3.8);
 assert.ok(Math.abs(a.x-b.x)<0.001);
});
test('one evade avoids a telegraphed zombie strike without phantom hit events',()=>{
 const s=game();s.enemies=[enemy()];
 assert.equal(tryDodge(s,1,0),true);
 tick(s,0.06,{});
 assert.equal(s.hp,100);
 assert.ok(s.enemies[0].attackCD>0);
 const effects=drainCombatEffects(s);
 assert.equal(effects.filter(e=>e.type==='evade').length,1);
 assert.equal(effects.filter(e=>e.type==='damage').length,0);
});
test('invulnerability ends before cooldown: subsequent zombie hit damages normally',()=>{
 const s=game();s.enemies=[enemy()];
 tryDodge(s,1,0);
 for(let i=0;i<5;i++)tick(s,0.05,{});
 assert.equal(s.dodgeInvuln,0);
 s.x=0;s.z=0;
 const e=s.enemies[0];e.x=1;e.z=0;e.attackWindup=0.02;e.attackCD=0;
 tick(s,0.05,{});
 assert.equal(s.hp,88);
});
test('dodge shields against a nearby exposed barrel blast only during evade window',()=>{
 const s=game(),b=s.barrels[0];
 s.x=b.x+1;s.z=b.z;
 assert.equal(tryDodge(s,1,0),true);
 detonateBarrel(s,b);
 assert.equal(s.hp,100);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='evade').length,1);
 const t=game(),barrel=t.barrels[0];t.x=barrel.x+1;t.z=barrel.z;
 detonateBarrel(t,barrel);
 assert.ok(t.hp<100,'regular blast damage must still work');
});
test('shooting cannot cancel the dodge lockout and cooldown prevents spam',()=>{
 const s=game();tryDodge(s,1,0);
 const r=shoot(s,1,0);
 assert.equal(r.fired,false);assert.equal(r.reason,'dodge');assert.equal(s.ammo,12);
 for(let i=0;i<5;i++)tick(s,0.05,{});
 assert.equal(tryDodge(s,1,0),false,'ready only when 3.2 second cooldown elapses');
 for(let i=0;i<60;i++)tick(s,0.05,{});
 assert.equal(s.dodgeCooldown,0);
 assert.equal(tryDodge(s,0,1),true);
});
test('pause freezes the dodge timers and movement',()=>{
 const s=game();tryDodge(s,1,0);pause(s);
 const snapshot=[s.x,s.z,s.dodgeTime,s.dodgeCooldown,s.dodgeInvuln];
 tick(s,0.06,{x:1,z:0});
 assert.deepEqual([s.x,s.z,s.dodgeTime,s.dodgeCooldown,s.dodgeInvuln],snapshot);
});
