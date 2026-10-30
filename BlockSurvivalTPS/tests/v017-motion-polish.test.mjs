import test from 'node:test';
import assert from 'node:assert/strict';
import {heroStridePose,heroDodgePose,undeadCombatPose} from '../src/combat-pose.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('v0.17 backward movement reverses the leg drive with lower forward lean',()=>{
 const front=heroStridePose({phase:Math.PI/2,blend:1,sprint:true,forward:1});
 const back=heroStridePose({phase:Math.PI/2,blend:1,sprint:true,forward:-1});
 assert.ok(front.leftThigh>0.35);assert.ok(back.leftThigh<-0.2);
 assert.ok(front.lean>0);assert.ok(back.lean<0);assert.ok(back.braking>0);
});
test('v0.17 lateral strafe pivots skinned body and leans into direction',()=>{
 const right=heroStridePose({phase:0,blend:1,strafe:1});
 const left=heroStridePose({phase:0,blend:1,strafe:-1});
 near(right.pivotYaw,0.18);near(left.pivotYaw,-0.18);
 assert.ok(right.lateralLean>0.08);assert.ok(left.lateralLean<-0.08);
 const stopped=heroStridePose({phase:0,blend:0,strafe:1});near(stopped.pivotYaw,0);
});
test('v0.17 visual dodge has bounded hop/roll/tuck and settles at finish',()=>{
 const start=heroDodgePose({dodgeTime:0.25});
 const mid=heroDodgePose({dodgeTime:0.125});
 const end=heroDodgePose({dodgeTime:0});
 assert.equal(start.airborne,true);assert.equal(mid.airborne,true);assert.equal(end.airborne,false);
 assert.ok(mid.hop>0.17);assert.ok(mid.roll>0.23);assert.ok(mid.tuck>0.31);
 near(end.hop,0);near(end.tuck,0);
});
test('v0.17 landing compression recovers without fake airborne state',()=>{
 const hit=heroDodgePose({landingTime:0.1});
 const clear=heroDodgePose({landingTime:0});
 assert.ok(hit.hop<0);assert.ok(hit.crouch>0);assert.ok(hit.landingPulse>0.99);
 near(clear.crouch,0);near(clear.landingPulse,0);
});
test('v0.17 zombie melee raises both real claws, lunges and resets on death',()=>{
 const start=undeadCombatPose({hp:12,attackWindup:0.35,attackWindupTotal:0.36,distance:1});
 const strike=undeadCombatPose({hp:12,attackWindup:0.07,attackWindupTotal:0.36,attackPulse:0.2,distance:1});
 const dead=undeadCombatPose({hp:0,attackWindup:0.07,attackPulse:0.2,distance:1});
 assert.ok(start.clawRaise>0.2);assert.ok(strike.clawRaise>start.clawRaise);
 assert.ok(strike.clawReach>0.3);assert.ok(strike.lunge>0.1);
 near(dead.clawRaise,0);near(dead.clawSwipe,0);near(dead.clawReach,0);
});
test('v0.17 new motion values stay finite when inputs are non-finite',()=>{
 for(const pose of [
  heroStridePose({phase:Infinity,blend:NaN,sprint:true,strafe:Infinity,forward:-Infinity}),
  heroDodgePose({dodgeTime:Infinity,duration:NaN,landingTime:NaN}),
  undeadCombatPose({hp:2,attackWindup:Infinity,attackPulse:NaN,attackWindupTotal:NaN})
 ])assert.ok(Object.values(pose).filter(x=>typeof x==='number').every(Number.isFinite));
});
