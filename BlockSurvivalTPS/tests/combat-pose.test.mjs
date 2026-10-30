import test from 'node:test';
import assert from 'node:assert/strict';
import {heroCombatPose,undeadCombatPose} from '../src/combat-pose.mjs';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
test('hero shot recoil decays and returns to an independent stable stance',()=>{
 const fired=heroCombatPose({shotFlash:0.13,shotUntil:2.32,elapsed:2});
 const gone=heroCombatPose({shotFlash:0,shotUntil:2.32,elapsed:3});
 assert.ok(fired.recoil>0.99);assert.ok(fired.gunPitch<0);
 close(gone.recoil,0);close(gone.gunPitch,0);
});
test('reload keeps a mid-cycle magazine dip with no false shot recoil',()=>{
 const mid=heroCombatPose({reloadTime:0.675});
 const done=heroCombatPose({reloadTime:0});
 assert.ok(mid.gunPitch>0.3);assert.ok(mid.gunRoll>0.18);
 close(done.gunRoll,0);
});
test('shooting and reloading guard against invalid inputs',()=>{
 const p=heroCombatPose({shotFlash:Infinity,reloadTime:NaN,elapsed:5,shotUntil:2});
 const values=Object.values(p);
 assert.ok(values.every(Number.isFinite));
 assert.ok(p.recoil===0);
});
test('modern zombie hit reaction occurs only while alive',()=>{
 const alive=undeadCombatPose({hp:12,hitTime:0.2,id:1});
 const recovered=undeadCombatPose({hp:12,hitTime:0,id:1});
 assert.ok(alive.hit>0.99);close(recovered.hit,0);
 assert.ok(Math.abs(alive.leanZ)>Math.abs(recovered.leanZ));
});
test('modern zombie fall smoothly approaches a fixed terminal pose',()=>{
 const first=undeadCombatPose({hp:0,deadTime:0,id:3});
 const middle=undeadCombatPose({hp:0,deadTime:0.29,id:3});
 const end=undeadCombatPose({hp:0,deadTime:10,id:3});
 close(first.fall,0);close(middle.fall,0.5);close(end.fall,1);
 assert.ok(end.leanX<first.leanX);close(end.fallY,-0.27);
 assert.equal(end.clip,'Idle');
});
test('undead attack lunge exists only inside melee range and stops on death',()=>{
 const far=undeadCombatPose({hp:10,distance:10,walk:0.13,id:2});
 const near=undeadCombatPose({hp:10,distance:1.2,walk:0.13,id:2,attackCD:0.4});
 const dead=undeadCombatPose({hp:0,distance:1.2,walk:0.13,id:2});
 assert.equal(far.clip,'Run');assert.equal(near.clip,'Idle');assert.equal(near.attack,true);
 assert.ok(near.lunge>0);close(dead.lunge,0);
});
