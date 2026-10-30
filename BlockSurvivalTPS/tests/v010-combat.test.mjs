import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,tick,shoot,ENEMY_ATTACK,BARREL_PLACEMENTS,
 detonateBarrel,BLAST_RADIUS,drainCombatEffects,clearPath,MAX_ACTIVE} from '../src/sim.mjs';
import {undeadCombatPose} from '../src/combat-pose.mjs';
const makeEnemy=(id,x,z,type='zombie')=>({id,x,z,type,radius:type==='minion'?0.78:0.63,
 hp:80,speed:0,attackCD:0,attackWindup:0,attackWindupTotal:0,attackPulse:0,
 hitTime:0,deadTime:0,walk:0});
const ready=()=>{const s=newGame();start(s);s.waveLeft=0;s.nextWave=1000;s.spawnDelay=100;return s;};
test('each enemy has meaningfully distinct attack windup, damage and recovery',()=>{
 assert.ok(ENEMY_ATTACK.runner.windup<ENEMY_ATTACK.zombie.windup);
 assert.ok(ENEMY_ATTACK.zombie.windup<ENEMY_ATTACK.minion.windup);
 assert.ok(ENEMY_ATTACK.runner.damage<ENEMY_ATTACK.zombie.damage);
 assert.ok(ENEMY_ATTACK.zombie.damage<ENEMY_ATTACK.minion.damage);
 assert.ok(ENEMY_ATTACK.runner.recover<ENEMY_ATTACK.minion.recover);
 for(const type of Object.keys(ENEMY_ATTACK)){
  const s=ready(),spec=ENEMY_ATTACK[type];
  s.enemies=[makeEnemy(3,0,spec.start*0.80,type)];
  tick(s,0.06);assert.equal(s.enemies[0].attackWindup,spec.windup);
  assert.equal(s.enemies[0].attackWindupTotal,spec.windup);
  let count=0;while(s.enemies[0].attackWindup>0&&count++<18)tick(s,0.06);
  assert.ok(count<18,'no zombie can remain stuck winding up');
  assert.equal(s.hp,100-spec.damage);
  assert.equal(s.enemies[0].attackCD,spec.recover);
  assert.equal(drainCombatEffects(s).filter(e=>e.type==='damage').length,1);
 }
});
test('animation telegraph is tied to actual per-type windup, not fixed 0.36 sec',()=>{
 for(const type of ['runner','zombie','minion']){
  const w=ENEMY_ATTACK[type].windup;
  const atStart=undeadCombatPose({type,hp:80,attackWindup:w,attackWindupTotal:w});
  const atEnd=undeadCombatPose({type,hp:80,attackWindup:0.04,attackWindupTotal:w});
  assert.equal(atStart.attack,true);
  assert.ok(atEnd.lunge>atStart.lunge);
 }
});
test('restart restores all three original destructible barrels',()=>{
 const s=ready();assert.equal(s.barrels.length,3);
 assert.deepEqual(s.barrels.map(b=>[b.x,b.z]),BARREL_PLACEMENTS.map(b=>[b.x,b.z]));
 s.barrels[0].exploded=true;
 assert.equal(newGame().barrels.filter(b=>b.exploded).length,0);
});
test('shooting directly at an unobstructed barrel triggers one explosion',()=>{
 const s=ready(),b=s.barrels[0];
 const d=Math.hypot(b.x-s.x,b.z-s.z);
 const hit=shoot(s,b.x/d,b.z/d);
 assert.equal(hit.fired,true);assert.equal(hit.barrel,true);
 assert.equal(hit.exploded,true);assert.equal(b.exploded,true);
 assert.equal(s.ammo,11);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='explosion').length,1);
 for(let i=0;i<4;i++)tick(s,0.06);
 const again=shoot(s,b.x/d,b.z/d);
 assert.equal(again.barrel,undefined,'spent barrel cannot explode a second time');
});
test('barrel blast damages mobs inside range, awards combo and spares distant mobs',()=>{
 const s=ready(),b=s.barrels[0];
 s.x=0;s.z=0;
 s.enemies=[makeEnemy(1,b.x+0.5,b.z),makeEnemy(2,b.x+1.0,b.z+0.2),makeEnemy(3,b.x+9,b.z)];
 s.enemies[2].hp=100;
 const result=detonateBarrel(s,b);
 assert.equal(result.exploded,1);assert.equal(result.kills,2);
 assert.equal(s.kills,2);assert.equal(s.combo,2);
 assert.equal(s.enemies[2].hp,100);
 assert.ok(s.score>=220);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='kill').length,2);
});
test('explosions apply falloff to nearby player, do not damage behind solid cover',()=>{
 const s=ready(),b=s.barrels[0];s.x=b.x+1;s.z=b.z;
 const before=s.hp;detonateBarrel(s,b);assert.ok(s.hp<before);
 const s2=ready();s2.x=-12;s2.z=-9;
 detonateBarrel(s2,s2.barrels[0]);
 assert.equal(s2.hp,100);
});
test('a chain reaction cannot re-explode props or recurse infinitely',()=>{
 const s=ready();s.barrels[1].x=s.barrels[0].x+1;s.barrels[1].z=s.barrels[0].z+1;
 const first=detonateBarrel(s,s.barrels[0]);
 assert.equal(first.exploded,2);
 const second=detonateBarrel(s,s.barrels[0]);
 assert.equal(second.exploded,0);
 assert.equal(drainCombatEffects(s).filter(e=>e.type==='explosion').length,2);
});
test('paused and gameover players cannot fire explosive props',()=>{
 const s=newGame(),b=s.barrels[0];const d=Math.hypot(b.x,b.z);
 assert.equal(shoot(s,b.x/d,b.z/d).fired,false);assert.equal(b.exploded,false);
 s.status='gameover';assert.equal(shoot(s,b.x/d,b.z/d).fired,false);
});
