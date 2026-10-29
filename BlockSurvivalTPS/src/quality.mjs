// © 2026 곰같은여우 — adaptive WebGL raster budget (pure deterministic state).
// Change pixel ratio only after sustained pressure or sustained recovery;
// do not repeatedly flip between blurry/sharp from a single noisy FPS sample.
export function createQualityState({mobile=false,dpr=1}={}){
 const max= Math.min(mobile?1:1.4,Math.max(0.6,dpr));
 const min= Math.min(max,mobile?0.72:0.85);
 return {ratio:max,min,max,slow:0,fast:0,cooldown:0};
}
export function updateQuality(q,fps,{playing=true}={}){
 const next={...q};
 if(!playing||!Number.isFinite(fps)||fps<=0){
  next.slow=0;next.fast=0;return next;
 }
 if(next.cooldown>0)next.cooldown--;
 if(fps<29){
  next.slow++;next.fast=0;
 }else if(fps>53){
  next.fast++;next.slow=0;
 }else{
  next.fast=0;next.slow=0;
 }
 if(next.cooldown===0&&next.slow>=3&&next.ratio>next.min+0.001){
  next.ratio=Math.max(next.min,Math.round((next.ratio-0.1)*100)/100);
  next.slow=0;next.cooldown=2;
 }else if(next.cooldown===0&&next.fast>=5&&next.ratio<next.max-0.001){
  next.ratio=Math.min(next.max,Math.round((next.ratio+0.08)*100)/100);
  next.fast=0;next.cooldown=3;
 }
 return next;
}
