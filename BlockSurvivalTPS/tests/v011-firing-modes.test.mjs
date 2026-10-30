import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,shoot,tick,setFireMode,FIRE_MODES,drainCombatEffects,reload} from '../src/sim.mjs';
const enemy=(hp=300)=>({id:1,x:0,z:-6,hp,type:'zombie',radius:0.65,speed:0,attackCD:10,hitTime:0,walk:0,deadTime:0});
const game=()=>{const s=newGame();start(s);s.waveLeft=0;s.nextWave=100;s.enemies=[enemy()];return s;};
test('precision is the default and mode changes produce exactly one authoritative event',()=>{
 const s=game();assert.equal(s.fireMode,'precision');
 assert.equal(setFireMode(s,'rapid'),true);
 assert.equal(setFireMode(s,'rapid'),false);
 assert.equal(s.fireMode,'rapid');
 assert.deepEqual(drainCombatEffects(s).map(x=>x.type),['mode']);
});
test('invalid modes and paused state cannot mutate or fabricate weapon state',()=>{
 const s=newGame();assert.equal(setFireMode(s,'rapid'),false);
 start(s);assert.equal(setFireMode(s,'__proto__'),false);
 assert.equal(setFireMode(s,'invalid'),false);
 assert.equal(s.fireMode,'precision');
 s.status='paused';assert.equal(setFireMode(s,'rapid'),false);
});
test('precision mode preserves the existing damage, shot interval and ammo behavior',()=>{
 const s=game();const fired=shoot(s,0,-1);
 assert.equal(fired.damage,FIRE_MODES.precision.damage);
 assert.equal(s.shotCooldown,0.19);assert.equal(s.ammo,11);
 assert.equal(shoot(s,0,-1).fired,false);
});
test('rapid mode fires faster but deals less damage and still consumes one cartridge',()=>{
 const s=game();setFireMode(s,'rapid');drainCombatEffects(s);
 const fire=shoot(s,0,-1);
 assert.equal(fire.damage,27);assert.equal(s.shotCooldown,0.105);
 assert.equal(s.ammo,11);
 tick(s,0.06);assert.equal(shoot(s,0,-1).fired,false);
 tick(s,0.06);assert.equal(shoot(s,0,-1).fired,true);
 assert.equal(s.ammo,10);
});
test('mode switching cannot skip cooldown, reload, or grant free ammo',()=>{
 const s=game();shoot(s,0,-1);
 setFireMode(s,'rapid');
 assert.equal(shoot(s,0,-1).fired,false);
 s.ammo=0;s.shotCooldown=0;
 assert.equal(shoot(s,0,-1).reason,'empty');
 assert.equal(reload(s),true);
 assert.equal(shoot(s,0,-1).fired,false);
 assert.equal(setFireMode(s,'precision'),true);
 assert.equal(shoot(s,0,-1).fired,false);
});
test('rapid mode requires two shots to destroy a barrel; precision only one',()=>{
 for(const mode of ['precision','rapid']){
  const s=newGame();start(s);s.waveLeft=0;s.nextWave=100;s.enemies=[];
  setFireMode(s,mode);
  const b=s.barrels[0],len=Math.hypot(b.x,b.z);
  const first=shoot(s,b.x/len,b.z/len);
  assert.equal(first.barrel,true);
  assert.equal(first.exploded,mode==='precision');
  if(mode==='rapid'){
   tick(s,0.06);tick(s,0.06);
   const second=shoot(s,b.x/len,b.z/len);
   assert.equal(second.exploded,true);
  }
 }
});
test('round-robin mode changes do not allocate extra per-shot data or exceed effect limit',()=>{
 const s=game();for(let i=0;i<80;i++)setFireMode(s,i%2?'precision':'rapid');
 assert.ok(s.effects.length<=32);assert.ok(drainCombatEffects(s).every(e=>e.type==='mode'));
});
