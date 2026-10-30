import test from 'node:test';
import assert from 'node:assert/strict';
import {heroCombatPose,undeadCombatPose} from '../src/combat-pose.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('v0.16 shot visibly moves weapon, shoulder and torso at the same time',()=>{
 const shot=heroCombatPose({shotFlash:0.13,shotUntil:1.32,elapsed:1});
 const idle=heroCombatPose({elapsed:2});
 assert.ok(shot.gunPitch<idle.gunPitch);
 assert.ok(shot.gunSlide>idle.gunSlide+0.07);
 assert.ok(shot.shoulderLift>idle.shoulderLift+0.20);
 assert.ok(shot.torsoKick<-0.08);
 assert.ok(shot.gunRoll>idle.gunRoll);
});
test('v0.16 reload tilts, drops and slides gun with separate support-arm pose',()=>{
 const active=heroCombatPose({reloadTime:0.675});
 const idle=heroCombatPose({reloadTime:0});
 assert.ok(active.reloadDip>0.99);
 assert.ok(active.gunPitch>0.35);
 assert.ok(active.gunYaw>0.20);
 assert.ok(active.gunLower>0.11);
 assert.ok(active.gunSlide>0.06);
 assert.ok(active.supportLift<idle.supportLift-0.19);
 assert.ok(active.torsoKick>0.06);
 near(idle.reloadDip,0);
 near(idle.gunYaw,0);
 near(idle.gunLower,0);
});
test('v0.16 zombie hit gives bounded flash and head snap, clears on death',()=>{
 const alive=undeadCombatPose({hp:14,hitTime:0.2,hitSide:1,id:2});
 const other=undeadCombatPose({hp:14,hitTime:0,hitSide:1,id:2});
 const dead=undeadCombatPose({hp:0,hitTime:0.2,hitSide:1,id:2});
 assert.ok(alive.hitGlow>0.6);
 assert.ok(alive.headSnap>0.25);
 near(other.hitGlow,0);
 near(other.headSnap,0);
 near(dead.hitGlow,0);
 near(dead.headSnap,0);
});
test('v0.16 pose layers never yield non-finite numbers on malformed inputs',()=>{
 for(const data of [
  heroCombatPose({shotFlash:Infinity,reloadTime:NaN,elapsed:NaN,shotUntil:Infinity}),
  undeadCombatPose({hp:12,hitTime:Infinity,hitSide:Infinity,id:9}),
 ]){
  assert.ok(Object.entries(data).filter(([,value])=>typeof value==='number').every(([,value])=>Number.isFinite(value)));
 }
});
