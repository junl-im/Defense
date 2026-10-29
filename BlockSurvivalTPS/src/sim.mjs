// © 2026 곰같은여우 — independent Block Survival TPS game simulation.
import {findGridPath,segmentWalkable} from './navigation.mjs';
export const ARENA = 27;
export const MAG_SIZE = 12;
export const MAX_ACTIVE = 12;
export const COVER = [
  {x:-12,z:-9,w:7,d:7,h:7},{x:12,z:-9,w:7,d:7,h:8},
  {x:-12,z:10,w:7,d:8,h:6},{x:12,z:10,w:7,d:8,h:7},
  {x:-4,z:-19,w:5,d:3,h:3},{x:6,z:18,w:4,d:3,h:4},
  {x:-8,z:2,w:2.5,d:1.5,h:1.6},{x:9,z:4,w:2.4,d:1.7,h:1.5}
];
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function circleHitsCover(x,z,r=0.52){
  return COVER.some(c=>{
    const dx=Math.max(Math.abs(x-c.x)-c.w/2,0);
    const dz=Math.max(Math.abs(z-c.z)-c.d/2,0);
    return dx*dx+dz*dz < r*r;
  });
}
export function clearPath(x1,z1,x2,z2){
  for(const c of COVER){
    if(c.h<1.25) continue;
    const dx=x2-x1,dz=z2-z1;
    let lo=0,hi=1;
    for(const [p,q] of [[-dx,x1-(c.x-c.w/2)],[dx,(c.x+c.w/2)-x1],[-dz,z1-(c.z-c.d/2)],[dz,(c.z+c.d/2)-z1]]){
      if(Math.abs(p)<1e-8){if(q<0){lo=2;break;}continue;}
      const t=q/p;
      if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
      if(lo>hi)break;
    }
    if(lo<=hi && hi>=0 && lo<=1)return false;
  }
  return true;
}
export function newGame(){
  return {status:"title",x:0,z:0,yaw:0,hp:100,maxHp:100,ammo:MAG_SIZE,
    reserve:72,reloadTime:0,shotCooldown:0,hitMarker:0,wave:1,waveLeft:5,spawnDelay:0.6,
    nextWave:0,kills:0,score:0,elapsed:0,hitFlash:0,shotFlash:0,seed:93461,
    enemies:[],nextId:1,toast:"중앙을 조준해 살아남으세요"};
}
export function random(s){
  s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;
  return s.seed/4294967296;
}
export function moveCircle(x,z,dx,dz,r=0.52){
  const bound=ARENA-r;
  let nx=clamp(x+dx,-bound,bound);
  if(circleHitsCover(nx,z,r)) nx=x;
  let nz=clamp(z+dz,-bound,bound);
  if(circleHitsCover(nx,nz,r)) nz=z;
  return {x:nx,z:nz};
}
// Radius-aware movement path (different from the bullet ray, which hits solid walls).
export function movementClear(from,to,radius=0.63){
 const blocked=(x,z)=>Math.abs(x)>ARENA-radius||Math.abs(z)>ARENA-radius||circleHitsCover(x,z,radius+0.06);
 return segmentWalkable(from,to,blocked);
}
export function findPath(from,to,radius=0.63){
 const blocked=(x,z)=>Math.abs(x)>ARENA-radius||Math.abs(z)>ARENA-radius||circleHitsCover(x,z,radius+0.06);
 return findGridPath(from,to,blocked);
}
// Reticle cone assistance is deliberately limited to unobstructed targets.
export function assistedAim(s,dx,dz,cone=0.065){
 const length=Math.hypot(dx,dz);if(length<0.001)return {dx:0,dz:-1};
 dx/=length;dz/=length;
 let candidate=null,score=Infinity;
 for(const e of s.enemies){
  if(e.hp<=0)continue;
  const rx=e.x-s.x,rz=e.z-s.z,d=Math.hypot(rx,rz);
  if(d<0.1||d>32||!clearPath(s.x,s.z,e.x,e.z))continue;
  const angular=Math.abs(rx*dz-rz*dx)/d;
  if(angular>cone+e.radius/d)continue;
  if(rx*dx+rz*dz<=0)continue;
  const rank=angular+(d/320);
  if(rank<score){score=rank;candidate=e;}
 }
 if(!candidate)return {dx,dz};
 const d=Math.hypot(candidate.x-s.x,candidate.z-s.z);
 return {dx:(candidate.x-s.x)/d,dz:(candidate.z-s.z)/d,targetId:candidate.id};
}
export function start(s){if(s.status==="title"||s.status==="paused")s.status="playing";return s;}
export function pause(s){if(s.status==="playing")s.status="paused";return s;}
export function reload(s){
  if(s.status!=="playing"||s.reloadTime>0||s.ammo===MAG_SIZE||s.reserve<=0)return false;
  s.reloadTime=1.35;s.toast="재장전 중";return true;
}
export function lineTarget(s,dx,dz){
  const len=Math.hypot(dx,dz);if(len<0.01)return null;dx/=len;dz/=len;
  let target=null,nearest=36;
  for(const e of s.enemies){
    if(e.hp<=0)continue;
    const rx=e.x-s.x,rz=e.z-s.z;
    const distance=rx*dx+rz*dz;
    if(distance<0||distance>nearest)continue;
    const off=Math.abs(rx*dz-rz*dx);
    if(off>e.radius+0.14)continue;
    if(!clearPath(s.x,s.z,e.x,e.z))continue;
    target=e;nearest=distance;
  }
  return target;
}
export function shoot(s,dx,dz){
  if(s.status!=="playing"||s.reloadTime>0||s.shotCooldown>0)return {fired:false,reason:"cooldown"};
  if(s.ammo===0)return {fired:false,reason:"empty"};
  s.ammo--;s.shotCooldown=0.19;s.shotFlash=0.13;
  const adjusted=assistedAim(s,dx,dz);
  const e=lineTarget(s,adjusted.dx,adjusted.dz);
  if(!e)return {fired:true,hit:false};
  e.hp-=e.type==="runner"?55:46;
  e.hitTime=0.2;s.hitMarker=0.22;
  const killed=e.hp<=0;
  if(killed){s.kills++;s.score+=e.type==="runner"?125:100;
    if(s.kills%5===0)s.hp=Math.min(s.maxHp,s.hp+16);
  }
  return {fired:true,hit:true,killed,id:e.id};
}
export function spawn(s){
  if(s.enemies.filter(e=>e.hp>0).length>=MAX_ACTIVE)return null;
  let p=null;
  for(let i=0;i<36;i++){
    const a=random(s)*Math.PI*2,d=14+random(s)*10;
    const x=clamp(s.x+Math.sin(a)*d,-ARENA+2,ARENA-2);
    const z=clamp(s.z+Math.cos(a)*d,-ARENA+2,ARENA-2);
    if(!circleHitsCover(x,z,0.8)&&Math.hypot(x-s.x,z-s.z)>9){p={x,z};break;}
  }
  if(!p)return null;
  const kind=random(s),type=kind<0.16?"runner":kind<0.27?"minion":"zombie";
  const e={...p,id:s.nextId++,type,radius:type==="minion"?0.78:0.63,
    hp:type==="runner"?52:76+Math.min(s.wave*6,60),speed:type==="runner"?3.2:type==="minion"?1.1:1.9,
    attackCD:0.6+random(s),hitTime:0,deadTime:0,walk:random(s)*10};
  s.enemies.push(e);
  return e;
}
export function tick(s,dt,controls={}){
  if(s.status!=="playing")return;
  dt=clamp(dt,0,0.06);
  s.elapsed+=dt;s.shotCooldown=Math.max(0,s.shotCooldown-dt);
  s.shotFlash=Math.max(0,s.shotFlash-dt);
  s.hitMarker=Math.max(0,s.hitMarker-dt);
  s.hitFlash=Math.max(0,s.hitFlash-dt);
  if(s.reloadTime>0){
    s.reloadTime-=dt;
    if(s.reloadTime<=0){
      const n=Math.min(MAG_SIZE-s.ammo,s.reserve);
      s.ammo+=n;s.reserve-=n;s.reloadTime=0;s.toast="재장전 완료";
    }
  }
  if(Number.isFinite(controls.yaw))s.yaw=controls.yaw;
  let dx=clamp(controls.x||0,-1,1),dz=clamp(controls.z||0,-1,1);
  const m=Math.hypot(dx,dz);
  if(m>1){dx/=m;dz/=m;}
  const speed=controls.sprint?7:5;
  const moved=moveCircle(s.x,s.z,dx*speed*dt,dz*speed*dt);
  s.x=moved.x;s.z=moved.z;
  for(const e of s.enemies){
    if(e.hp<=0){e.deadTime+=dt;continue;}
    e.hitTime=Math.max(0,e.hitTime-dt);
    e.walk+=dt;
    const ax=s.x-e.x,az=s.z-e.z,dist=Math.hypot(ax,az);
    e.attackCD=Math.max(0,e.attackCD-dt);
    if(dist>1.24||!clearPath(e.x,e.z,s.x,s.z)){
      let destination={x:s.x,z:s.z};
      const from={x:e.x,z:e.z};
      // Reuse the corridor briefly to limit expensive A* work on low-end phones.
      e.routeTimer=(e.routeTimer??0)-dt;
      const targetMoved=Math.hypot((e.routeTargetX??s.x)-s.x,(e.routeTargetZ??s.z)-s.z)>2.5;
      if(movementClear(from,destination,e.radius)){e.route=[];e.routeTimer=0.9;}
      else{
        if(!e.route?.length||e.routeTimer<=0||targetMoved){
          e.route=findPath(from,destination,e.radius);
          e.routeTargetX=s.x;e.routeTargetZ=s.z;e.routeTimer=0.85+(e.id%4)*0.12;
        }
        while(e.route?.length&&Math.hypot(e.route[0].x-e.x,e.route[0].z-e.z)<0.65)e.route.shift();
        if(e.route?.length)destination=e.route[0];
      }
      const deltaX=destination.x-e.x,deltaZ=destination.z-e.z,stepLength=Math.hypot(deltaX,deltaZ);
      if(stepLength>0.02){
        const mx=deltaX/stepLength,mz=deltaZ/stepLength;
        const step=moveCircle(e.x,e.z,mx*e.speed*dt,mz*e.speed*dt,e.radius);
        if(Math.hypot(step.x-e.x,step.z-e.z)<0.005&&dt>0.01){
          e.stuck=(e.stuck||0)+dt;
          if(e.stuck>0.45){e.routeTimer=0;e.route=[];e.stuck=0;}
        }else e.stuck=0;
        e.x=step.x;e.z=step.z;
      }
    }else if(e.attackCD===0){
      s.hp=Math.max(0,s.hp-(e.type==="runner"?9:12));
      s.hitFlash=0.24;e.attackCD=1.1;
      if(s.hp===0){s.status="gameover";s.toast="생존 실패 — 다시 도전하세요";}
    }
  }
  s.enemies=s.enemies.filter(e=>e.hp>0||e.deadTime<0.8);
  if(s.status!=="playing")return;
  if(s.waveLeft>0){
    s.spawnDelay-=dt;
    if(s.spawnDelay<=0 && s.enemies.filter(e=>e.hp>0).length<MAX_ACTIVE){
      if(spawn(s)){s.waveLeft--;s.spawnDelay=0.75+random(s)*0.5;}
      else s.spawnDelay=0.4;
    }
  }else if(!s.enemies.some(e=>e.hp>0)){
    if(s.nextWave===0){s.nextWave=3;s.toast="웨이브 "+s.wave+" 생존 성공";}
    s.nextWave-=dt;
    if(s.nextWave<=0){
      s.wave++;s.waveLeft=Math.min(4+s.wave*2,18);s.nextWave=0;
      s.spawnDelay=0.6;s.reserve+=20;s.hp=Math.min(100,s.hp+12);
      s.toast="웨이브 "+s.wave+" 시작";
    }
  }
}
