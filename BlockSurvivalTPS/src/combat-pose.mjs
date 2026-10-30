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
  gunPitch:-0.22*shot+0.34*reloadDip,
  gunRoll:0.19*reloadDip,
  shoulderLift:0.14+0.13*shot,
  supportLift:0.17-0.11*reloadDip,
  stance: moving?(sprint?1:0.64):0
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
  leanX:-1.32*fall+(0.1+0.14*Math.max(-1,Math.min(1,hitFront)))*hit-(attack?(0.37*t+0.2*impact)*multiplier:0),
  leanZ:sign*(0.22*fall+0.035*hit+0.06*t)+Math.max(-1,Math.min(1,hitSide))*0.24*hit,
  offsetZ:lunge-0.10*hit,
  fallY:-0.27*fall,
  attack
 };
}
