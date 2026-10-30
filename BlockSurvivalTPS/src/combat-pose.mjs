// © 2026 곰같은여우. Pure, frame-rate-independent combat pose math.
// Kenney Animated Characters Survivors provides Idle/Run/Jump only;
// these procedural layers are ORIGINAL game motion, not claimed source clips.
export const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export function heroCombatPose({shotFlash=0,reloadTime=0,elapsed=0,shotUntil=0,moving=false,sprint=false}={}){
 const shot=clamp01(shotFlash/0.13);
 const reloadProgress=clamp01(1-reloadTime/1.35);
 const reloadDip=reloadTime>0?Math.sin(Math.PI*reloadProgress):0;
 const sustain=elapsed<shotUntil?clamp01((shotUntil-elapsed)/0.32):0;
 return {
  aim:reloadTime>0?0.55:1,
  recoil:Math.max(shot,sustain*0.34),
  gunPitch:-0.28*shot+0.40*reloadDip,
  gunRoll:0.05*shot+0.24*reloadDip,
  gunYaw:0.22*reloadDip,
  gunSlide:0.075*shot+0.065*reloadDip,
  gunLower:0.12*reloadDip,
  shoulderLift:0.14+0.24*shot-0.18*reloadDip,
  supportLift:0.17+0.11*shot-0.20*reloadDip,
  torsoKick:-0.085*shot+0.07*reloadDip,
  torsoRoll:0.045*shot+0.075*(reloadTime>0?Math.sin(2*Math.PI*reloadProgress):0),
  reloadDip,stance: moving?(sprint?1:0.64):0
 };
}
export function undeadCombatPose({hp=1,hitTime=0,deadTime=0,walk=0,id=0,type='zombie',attackWindup=0,attackWindupTotal=0.36,attackPulse=0,hitSide=0,hitFront=0,distance=99}={}){
 const dead=hp<=0;
 const fall=dead?clamp01(deadTime/0.58):0;
 const hit=dead?0:clamp01(hitTime/0.2);
 // The damaging frame occurs when the 0.36s warning reaches zero.
 const windup=dead?0:attackWindup>0?clamp01(1-attackWindup/Math.max(0.1,attackWindupTotal)):0;
 const impact=dead?0:clamp01(attackPulse/0.26);
 const attack=!dead&&(attackWindup>0||attackPulse>0);
 const t=windup*windup*(3-2*windup);
 const multiplier=type==='runner'?1.3:type==='minion'?0.75:1;
 const lunge=attack?(0.22*t+0.10*impact)*multiplier:0;
 const sign=id%2===0?1:-1;
 return {
  clip:dead?'Idle':attack||distance<1.35?'Idle':'Run',
  hit,fall,lunge,windup,impact,
  hitGlow:0.65*hit,
  headSnap:0.26*hit*(0.5+0.5*Math.max(-1,Math.min(1,hitSide))),
  clawRaise:attack?(0.24+0.26*t+0.14*impact)*multiplier:0,
  clawReach:attack?(0.16+0.20*t+0.16*impact)*multiplier:0,
  clawSwipe:attack?Math.sin(t*Math.PI)*0.17*multiplier:0,
  leanX:-1.32*fall+(0.1+0.14*Math.max(-1,Math.min(1,hitFront)))*hit-(attack?(0.37*t+0.2*impact)*multiplier:0),
  leanZ:sign*(0.22*fall+0.035*hit+0.06*t)+Math.max(-1,Math.min(1,hitSide))*0.24*hit,
  offsetZ:lunge-0.10*hit,
  fallY:-0.27*fall,
  attack
 };
}

// Frame-rate-independent ORIGINAL locomotion overlay on top of Kenney's Idle/Run clips.
// A subtle weight transfer is visible even if a source action has very little leg travel.
export function heroStridePose({phase=0,blend=0,sprint=false,strafe=0,forward=1}={}){
 const weight=clamp01(blend);
 const p=Number.isFinite(phase)?phase:0;
 const side=Math.max(-1,Math.min(1,Number.isFinite(strafe)?strafe:0));
 const fore=Math.max(-1,Math.min(1,Number.isFinite(forward)?forward:0));
 const backing=fore<-0.1;
 const run=(sprint?1.27:1)*(backing?0.76:1);
 const wave=Math.sin(p)*weight*run*(backing?-1:1);
 return {
  leftThigh:0.32*wave,
  rightThigh:-0.32*wave,
  leftShin:0.12*Math.max(0,-wave),
  rightShin:0.12*Math.max(0,wave),
  bob:weight*(0.025+0.042*(1-Math.cos(p*2))*0.5),
  lean:weight*(sprint?0.12:0.065)*(backing?-0.65:1),
  sway:weight*(Math.sin(p)*0.022+side*0.055),
  pivotYaw:side*weight*0.18,
  lateralLean:side*weight*0.09,
  braking:backing?weight*0.04:0
 };
}


// Lightweight roll/hop and impact compression on top of the official Kenney Jump clip.
// A dodge stays a ground-plane movement mechanically; the visible hop is only a rig overlay.
export function heroDodgePose({dodgeTime=0,duration=0.25,landingTime=0}={}){
 const safeDuration=Number.isFinite(duration)&&duration>0?duration:0.25;
 const remaining=clamp01(dodgeTime/safeDuration);
 const phase=remaining>0?1-remaining:0;
 const arc=Math.sin(Math.PI*phase)*Number(remaining>0);
 const settle=clamp01(landingTime/0.20);
 return {
  airborne:remaining>0,
  hop:0.18*arc-0.085*Math.sin(Math.PI*settle),
  roll:0.24*arc,
  crouch:0.13*settle,
  tuck:0.32*arc,
  landingPulse:settle>0?Math.sin(Math.PI*settle):0
 };
}

// Trigger one subtle shoe-contact response per half-stride, never while idle.
export function footstepCrossed({previousPhase=0,phase=0,blend=0,moving=false}={}){
 if(!moving||clamp01(blend)<0.6||!Number.isFinite(previousPhase)||!Number.isFinite(phase)||phase<=previousPhase)return false;
 return Math.floor(phase/Math.PI)>Math.floor(previousPhase/Math.PI);
}
