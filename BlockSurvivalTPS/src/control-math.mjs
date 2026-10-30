// © 2026 곰같은여우 — conventional TPS look input shared by mouse and touch.
export const LOOK_SENSITIVITY=Object.freeze({mouseX:0.0021,mouseY:0.0017,touchX:0.005,touchY:0.0036});
const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function applyLookDelta(yaw,pitch,deltaX,deltaY,{horizontal=LOOK_SENSITIVITY.mouseX,vertical=LOOK_SENSITIVITY.mouseY}={}){
 const x=clamp(finite(deltaX),-120,120);
 const y=clamp(finite(deltaY),-120,120);
 // Mouse/finger right -> look right, up -> look up. Never invert horizontal by accident.
 return {
  yaw:finite(yaw)+x*finite(horizontal,LOOK_SENSITIVITY.mouseX),
  pitch:clamp(finite(pitch)-y*finite(vertical,LOOK_SENSITIVITY.mouseY),-0.58,0.60)
 };
}
