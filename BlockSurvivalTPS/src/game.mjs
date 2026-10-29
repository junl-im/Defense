// © 2026 곰같은여우 — Block Survival TPS isolated 3D vertical slice.
// Three.js MIT. Third-party models: see research/source-lock.json, loaded lazily and optionally.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';
import {ARENA,COVER,clamp,newGame,start,pause,reload,shoot,tick} from './sim.mjs';
import {populateRuinedCity} from './world-detail.mjs';
import {createQualityState,updateQuality} from './quality.mjs';

const $=id=>document.getElementById(id);
const shell=$('shell'),canvas=$('stage'),overlay=$('overlay');
const mobile=window.matchMedia('(pointer:coarse)').matches;
const keys=new Set();
let state=newGame(),yaw=0,pitch=0,fireHeld=false,sprintHeld=false;
let joystick={x:0,z:0},stickPointer=null,lookPointer=null,lastLook=null;
let renderer,scene,camera,clock,player,playerParts,world,raycaster;
let heroRig=null,heroMixer=null,heroAnimation='',heroGun=null,heroGunTemplate=null,muzzleEffect=null,tracer=null,impactSpark=null,fxExpires=0,heroShotUntil=0;
const pickupVisual=new Map();
const heroClips=new Map();
let quality=createQualityState({mobile,dpr:window.devicePixelRatio||1});
const cameraShotVector=new THREE.Vector3();
let lastFrame=performance.now(),fpsCount=0,fpsStart=lastFrame,fps=60,uiAt=0,modelStarted=false,nowFrameDt=0.016;
let lastToast='',toastUntil=0;
const enemiesVisual=new Map(),assetCache=new Map(),collisionMeshes=[],modelLoader=new GLTFLoader();
const named={minion:'minion-a01.glb',bat:'Bat.glb',gun:'blaster.glb'};
const assetURLs={
 minion:'https://raw.githubusercontent.com/Ariescar/gobkit-free-assets/4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b/minion/minion-a01.glb',
 bat:'https://raw.githubusercontent.com/Ariescar/gobkit-free-assets/4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b/animal/Bat.glb',
 gun:'https://raw.githubusercontent.com/KenneyNL/Starter-Kit-FPS/185fd2326d74a5cf858cffc616f87cf9696f9cc0/models/blaster.glb',
 ruin:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07/addons/kaykit_dungeon_remastered/Assets/gltf/wall_broken.gltf.glb',
 chest:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07/addons/kaykit_dungeon_remastered/Assets/gltf/chest.glb',
 barrel:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07/addons/kaykit_dungeon_remastered/Assets/gltf/barrel_large.gltf.glb',
 crates:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07/addons/kaykit_dungeon_remastered/Assets/gltf/crates_stacked.gltf.glb',
 hero:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventurers-1.0/672074b73ba276876a19e8816ecdc5241817ab47/Characters/gltf/Knight.glb',
 undead:'https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Skeletons-1.0/15b62b9bad122f72926c10fb14d622c73819fa54/Characters/gltf/Skeleton_Minion.glb'
};
const colors={ground:0x345044,road:0x26333c,roadLine:0xe1c07c,building:0x697a7f,brick:0x735f59,crate:0x8e7650,skin:0x9fc58b};
const materials=new Map(),sharedBox=new THREE.BoxGeometry(1,1,1);
function mat(color,extra=''){const key=color+':'+extra;if(!materials.has(key))materials.set(key,new THREE.MeshLambertMaterial({color,emissive:extra==='glow'?color:0x000000,emissiveIntensity:extra==='glow'?0.35:0}));return materials.get(key);}
function box(parent,x,y,z,w,h,d,color,extra=''){
 const m=new THREE.Mesh(sharedBox,mat(color,extra));
 m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
}
function size(){
 if(!renderer)return;
 const w=Math.max(1,window.innerWidth),h=Math.max(1,window.innerHeight);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function init3D(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(quality.ratio);
  shell.dataset.dynamicResolution='enabled';
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x536c73);
 }catch(err){$('fatal').hidden=false;console.error(err);return false;}
 scene=new THREE.Scene();scene.background=new THREE.Color(0x60747c);scene.fog=new THREE.FogExp2(0x60747c,0.018);
 camera=new THREE.PerspectiveCamera(70,1,0.1,105);
 scene.add(new THREE.HemisphereLight(0xb7dbe5,0x28342e,2.15));
 const sun=new THREE.DirectionalLight(0xffd7a2,1.75);sun.position.set(-25,48,-30);scene.add(sun);
 world=new THREE.Group();scene.add(world);raycaster=new THREE.Raycaster();
 constructWorld();
 const detail=populateRuinedCity(THREE,world,COVER,ARENA,{mobile});
 shell.dataset.urbanDetails=String(detail.rubble+detail.roadDamage+detail.vegetation);
 player=makePlayer();scene.add(player);
 muzzleEffect=box(player,0.35,1.5,-1.05,0.3,0.3,0.5,0xffd16e,'glow');
 muzzleEffect.userData.fx=true;muzzleEffect.visible=false;
 const tracerGeometry=new THREE.BufferGeometry();
 tracerGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
 tracer=new THREE.Line(tracerGeometry,new THREE.LineBasicMaterial({color:0xffdf99,transparent:true,opacity:0.88,depthWrite:false}));
 tracer.visible=false;scene.add(tracer);
 impactSpark=new THREE.Mesh(new THREE.OctahedronGeometry(0.22,0),new THREE.MeshBasicMaterial({color:0xe6ffc1,transparent:true,opacity:0.9,depthWrite:false}));
 impactSpark.visible=false;scene.add(impactSpark);
 size();window.addEventListener('resize',size,{passive:true});
 canvas.addEventListener('webglcontextlost',evt=>{evt.preventDefault();pauseGame('그래픽 연결이 중단됐습니다');});
 canvas.addEventListener('webglcontextrestored',()=>location.reload());
 clock=new THREE.Clock();requestAnimationFrame(frame);
 return true;
}
function constructWorld(){
 box(world,0,-0.5,0,ARENA*2+4,1,ARENA*2+4,colors.ground);
 box(world,0,0.015,0,8.5,0.08,ARENA*2,colors.road);
 box(world,0,0.018,0,ARENA*2,0.08,8.5,colors.road);
 for(let v=-24;v<25;v+=6){
  box(world,0,0.067,v,0.13,0.012,2.6,colors.roadLine);
  box(world,v,0.067,0,2.6,0.012,0.13,colors.roadLine);
 }
 for(let k=-1;k<=1;k+=2){
  for(let v=-22;v<=22;v+=4){
   box(world,k*4.55,0.12,v,0.35,0.2,3.7,0x858c81);
   box(world,v,0.12,k*4.55,3.7,0.2,0.35,0x858c81);
  }
 }
 COVER.forEach((c,i)=>{
  const tall=c.h>=3.5;
  const wall=box(world,c.x,c.h/2,c.z,c.w,c.h,c.d,tall?(i%2?colors.brick:colors.building):colors.crate);
  collisionMeshes.push(wall);
  if(tall){
   box(world,c.x,c.h+0.16,c.z,c.w+0.55,0.3,c.d+0.55,0x313b40);
   for(let floor=1;floor<c.h-0.5;floor+=1.85){
    for(let k=-1;k<=1;k++){
     let wx=c.x+(k*0.27*c.w);
     box(world,wx,floor,c.z+c.d/2+0.012,0.65,0.65,0.05,0x9eb5b7);
     box(world,wx,floor,c.z-c.d/2-0.012,0.65,0.65,0.05,0x9eb5b7);
    }
   }
  }else{
   box(world,c.x,c.h+0.04,c.z,c.w+0.12,0.08,c.d+0.12,0x494c4b);
   for(let k=-1;k<=1;k++)box(world,c.x+k*c.w*0.25,c.h/2,c.z+c.d/2+0.035,0.06,c.h*0.75,0.07,0x4a453b);
  }
 });
 for(let k=0;k<13;k++){
  const side=k%2?1:-1,x=side*(15+(k*7)%9),z=-25+(k*17)%50;
  if(!COVER.some(c=>Math.abs(c.x-x)<c.w/2+2&&Math.abs(c.z-z)<c.d/2+2)){
   box(world,x,1,z,0.35,2,0.35,0x756755);
   for(let p=0;p<3;p++)box(world,x,2.1+p*.65,z,2-p*.35,1.3,2-p*.35,0x38665b);
  }
 }
 for(let s of [-1,1])for(let z of [-17,17]){
  const x=s*4.5;
  box(world,x,2.25,z,0.14,4.5,0.14,0x454e56);
  box(world,x-s*0.45,4.32,z,0.9,0.12,0.14,0x454e56);
  box(world,x-s*0.84,4.25,z,0.25,0.18,0.36,0xf4d899,'glow');
 }
 // Broken barriers and police car are optional geometry; game never needs network models.
 box(world,10,0.35,4,3.6,0.7,1.65,0x3f5864);
 box(world,10,0.95,4,1.8,0.58,1.48,0x65788a);
 for(const zz of [3.15,4.85])for(const xx of [8.8,11.2])box(world,xx,0.35,zz,0.65,0.7,0.2,0x20272d);
 for(let j=0;j<8;j++){
  const xx=-23+(j*13)%46,zz=-23+(j*19)%46;
  if(Math.abs(xx)<6||Math.abs(zz)<6||COVER.some(c=>Math.abs(c.x-xx)<c.w/2+2&&Math.abs(c.z-zz)<c.d/2+2))continue;
  box(world,xx,0.8,zz,0.65,1.6,0.65,0x706a59);
  box(world,xx,1.55,zz,1.2,0.3,1.2,0x54715f);
 }
}
function makePlayer(){
 const root=new THREE.Group();
 const torso=box(root,0,1.22,0,0.77,1.07,0.45,0x466779);
 const head=box(root,0,2,0,0.54,0.52,0.53,0xe1b98a);
 box(root,0,2.3,0,0.61,0.2,0.61,0x445057);
 const leftArm=new THREE.Group();leftArm.position.set(-0.52,1.57,0);root.add(leftArm);
 box(leftArm,0,-0.36,0,0.29,0.78,0.32,0x45616e);
 const rightArm=new THREE.Group();rightArm.position.set(0.52,1.57,0);root.add(rightArm);
 box(rightArm,0,-0.36,0,0.29,0.78,0.32,0x45616e);
 const legs=[];
 for(const x of [-0.2,0.2]){let leg=new THREE.Group();leg.position.set(x,0.73,0);root.add(leg);box(leg,0,-0.36,0,0.31,0.73,0.36,0x293b4a);legs.push(leg);}
 const gun=new THREE.Group();gun.position.set(0.41,-0.4,-0.45);rightArm.add(gun);
 box(gun,0,0,-0.35,0.24,0.22,0.85,0x353941);
 box(gun,0,0.11,-0.13,0.19,0.12,0.32,0x8d9b9c);
 root.userData={legs,leftArm,rightArm,gun,head,torso};
 return root;
}
function makeZombie(type){
 const root=new THREE.Group(),runner=type==='runner';
 const skin=runner?0xbaae81:0x8aaf88,coat=runner?0x7f4146:0x6d6f58;
 const torso=box(root,0,1.26,0,0.77,1.08,0.48,coat);
 const head=box(root,0,2.02,-0.04,0.6,0.59,0.58,skin);
 for(const x of [-0.16,0.16])box(root,x,2.1,-0.34,0.09,0.09,0.06,0xf0e3ce);
 const legs=[],arms=[];
 for(const x of [-0.21,0.21]){
  const leg=new THREE.Group();leg.position.set(x,0.76,0);root.add(leg);
  box(leg,0,-0.36,0,0.31,0.73,0.34,0x3c4844);legs.push(leg);
  const arm=new THREE.Group();arm.position.set(Math.sign(x)*0.52,1.68,-0.08);root.add(arm);
  box(arm,0,-0.42,-0.13,0.3,0.82,0.3,skin);arms.push(arm);
 }
 root.userData={legs,arms,torso,head};
 return root;
}
async function loadOptional(){
 if(modelStarted)return;modelStarted=true;
 for(const kind of ['minion','bat','gun','ruin','chest','barrel','crates','hero','undead']){
  // Production assets ship beside the bundled game; the pinned official source is a dev fallback.
  const local='./assets/'+kind+'.glb';
  modelLoader.loadAsync(local).catch(()=>modelLoader.loadAsync(assetURLs[kind])).then(gltf=>{
   assetCache.set(kind,gltf);
   if(kind==='hero'||kind==='undead')shell.dataset[kind+'Asset']='loaded';
   if(kind==='gun'){
    heroGunTemplate=gltf.scene;
    attachHeroGun();
   }
   if(kind==='hero')installHero(gltf);
   if(['ruin','chest','barrel','crates'].includes(kind)){
    const config={ruin:[-12,-9,2.9],chest:[18,-3,0.9],barrel:[-8,2,1.25],crates:[9,4,1.4]}[kind];
    const clone=gltf.scene.clone(true);normalize(clone,config[2]);
    clone.position.set(config[0],0.06,config[1]);world.add(clone);
   }
   if(kind==='minion'||kind==='undead'){
    for(const [id,visual] of [...enemiesVisual]){
     const e=state.enemies.find(enemy=>enemy.id===id && (kind==='minion'?enemy.type==='minion':enemy.type!=='minion') && enemy.hp>0);
     if(!e || visual.mixer)continue;
     scene.remove(visual.root);enemiesVisual.delete(id);
     enemiesVisual.set(id,makeEnemyVisual(e));
    }
   }
  }).catch(e=>console.warn('선택 모델 실패, 기본 3D 모델 유지:',kind,e.message));
 }
}
function normalize(model,targetHeight){
 const bounds=new THREE.Box3().setFromObject(model);
 const d=bounds.getSize(new THREE.Vector3());
 if(!(d.y>0))return model;
 const scale=targetHeight/d.y;
 model.scale.multiplyScalar(scale);
 const b=new THREE.Box3().setFromObject(model);
 const c=b.getCenter(new THREE.Vector3());
 model.position.x-=c.x;model.position.z-=c.z;model.position.y-=b.min.y;
 return model;
}
function playRigClip(visual,name,fade=0.16){
 if(!visual.mixer||visual.lastAnimation===name)return;
 const clip=visual.clips?.get(name);
 if(!clip)return;
 const action=visual.mixer.clipAction(clip);
 if(visual.activeAction){visual.activeAction.fadeOut(fade);}
 action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(fade).play();
 visual.activeAction=action;visual.lastAnimation=name;
 if(name==='Death_A'){action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;}
}
function installHero(gltf){
 if(!player||heroRig)return;
 heroRig=cloneSkinned(gltf.scene);
 let skinnedParts=0;
 heroRig.traverse(child=>{
  if(child.isSkinnedMesh){child.frustumCulled=false;skinnedParts++;}
  if(/Sword|Shield|Cape/i.test(child.name))child.visible=false;
  // Work toward an urban-survivor palette without altering the original CC0 source GLB.
  if(child.isMesh&&/Knight_(Body|Arm|Leg|Helmet)/.test(child.name)){
   child.material=Array.isArray(child.material)?child.material.map(m=>m.clone()):child.material.clone();
   const tint=/Helmet/.test(child.name)?0x748f77:/Body/.test(child.name)?0x76917c:0x929e8e;
   for(const m of (Array.isArray(child.material)?child.material:[child.material]))m.color.multiply(new THREE.Color(tint));
  }
 });
 normalize(heroRig,2.1);
 // KayKit animated rigs face +Z, while our TPS camera assumes the hero faces -Z.
 heroRig.rotation.y=Math.PI;
 // Keep primitive fallback only until this correctly rigged hero is loaded.
 for(const c of player.children)if(!c.userData.fx)c.visible=false;
 player.add(heroRig);heroMixer=new THREE.AnimationMixer(heroRig);
 for(const clip of gltf.animations)heroClips.set(clip.name,clip);
 heroAnimation='';
 if(skinnedParts>0&&heroClips.size===6)shell.dataset.heroRig='loaded';
 attachHeroGun();
}
function attachHeroGun(){
 if(!heroGunTemplate||!player)return;
 if(heroRig){
  if(heroGun){heroGun.parent?.remove(heroGun);heroGun=null;}
  let socket=null;
  heroRig.traverse(o=>{if(o.name==='handslot.r')socket=o;});
  if(socket){
   const gun=heroGunTemplate.clone(true);
   gun.position.set(0,0,0);gun.rotation.set(0,Math.PI/2,0);
   // Inherit hand-bone transform from the imported walking/shooting animation.
   gun.scale.setScalar(0.9);
   socket.add(gun);heroGun=gun;
  }
 }else{
  const placeholder=player.userData.gun;
  if(!placeholder.userData.modelAttached){
   const gun=heroGunTemplate.clone(true);normalize(gun,0.5);
   gun.position.set(0,-0.05,-0.4);placeholder.add(gun);
   placeholder.userData.modelAttached=true;
  }
 }
}
function playHeroClip(name){
 if(!heroMixer||heroAnimation===name||!heroClips.has(name))return;
 const visual={mixer:heroMixer,clips:heroClips,lastAnimation:heroAnimation,activeAction:playHeroClip.previous};
 playRigClip(visual,name,0.14);
 playHeroClip.previous=visual.activeAction;
 heroAnimation=visual.lastAnimation;
 shell.dataset.heroAnimation=heroAnimation;
}
function makeEnemyVisual(e){
 const root=new THREE.Group();scene.add(root);root.position.set(e.x,0,e.z);
 const visual={root,model:null,mixer:null,clip:null,lastAnimation:''};
 const kind=e.type==='minion'?'minion':'undead';
 if(kind&&assetCache.has(kind)){
  const gltf=assetCache.get(kind);
  const model=cloneSkinned(gltf.scene);
  normalize(model,1.8);
  model.traverse(child=>{if(child.isSkinnedMesh)child.frustumCulled=false;});
  root.add(model);visual.model=model;
  if(gltf.animations.length){
   visual.mixer=new THREE.AnimationMixer(model);
   visual.rigKind=kind;visual.clips=new Map(gltf.animations.map(clip=>[clip.name,clip]));
   if(kind==='undead')shell.dataset.undeadRig='loaded';
   if(kind==='minion'){
    visual.clip=visual.mixer.clipAction(gltf.animations[0]);visual.clip.play();
   }else playRigClip(visual,'Walking_D_Skeletons');
  }
 }else{
  const model=makeZombie(e.type);root.add(model);visual.model=model;
 }
 return visual;
}
function syncEnemies(t){
 for(const e of state.enemies){
  let v=enemiesVisual.get(e.id);
  if(!v){v=makeEnemyVisual(e);enemiesVisual.set(e.id,v);}
  const root=v.root;
  root.position.set(e.x,e.hp<=0?0:e.hitTime>0?0.06:0,e.z);
  const a=Math.atan2(state.x-e.x,state.z-e.z);
  root.rotation.y=(v.rigKind==='undead'?a:v.mixer?a:a+Math.PI);
  if(e.hp<=0){
   if(v.rigKind==='undead'){
    playRigClip(v,'Death_A',0.08);
    v.mixer.update(Math.min(0.06,nowFrameDt));
   }else{
    root.rotation.z=Math.min(1.25,e.deadTime*4);
    if(v.mixer)v.mixer.setTime(60/24+Math.min(e.deadTime,(89-60)/24));
   }
  }else if(v.rigKind==='undead'){
   const attack=Math.hypot(e.x-state.x,e.z-state.z)<1.6;
   const desired=e.hitTime>0?'Hit_A':attack?'Unarmed_Melee_Attack_Punch_A':e.type==='runner'?'Running_A':'Walking_D_Skeletons';
   playRigClip(v,desired);
   v.mixer.update(Math.min(0.06,Math.max(0,nowFrameDt)));
  }else if(v.mixer){
   const attack=Math.hypot(e.x-state.x,e.z-state.z)<1.6;
   const from=attack?30:0,len=29/24;
   v.mixer.setTime(from/24+(e.walk%len));
  }else{
   const parts=v.model.userData,phase=e.walk*e.speed*3;
   parts.legs?.forEach((p,i)=>p.rotation.x=Math.sin(phase+i*Math.PI)*0.45);
   parts.arms?.forEach((p,i)=>p.rotation.x=-0.85+Math.sin(phase+i*Math.PI)*0.2);
   parts.torso.rotation.z=Math.sin(phase)*0.025;
   parts.head.rotation.z=e.hitTime>0?0.18:0;
  }
 }
 for(const [id,v] of enemiesVisual)if(!state.enemies.some(e=>e.id===id)){
  if(v.mixer){v.mixer.stopAllAction();v.mixer.uncacheRoot(v.model);}
  scene.remove(v.root);enemiesVisual.delete(id);
  // Shared GLB geometry/textures remain in cache; only per-enemy mixers are cleared.
 }
}
function makePickupVisual(p){
 const root=new THREE.Group();world.add(root);
 const ammo=p.kind==='ammo';
 box(root,0,0,0,0.64,0.5,0.5,ammo?0xc7a66b:0xd9dad0);
 if(ammo){
  for(let x of [-0.15,0,0.15])box(root,x,0.26,0,0.1,0.22,0.13,0xe8d17c);
 }else{
  box(root,0,0,0.27,0.36,0.13,0.04,0x9f4445);
  box(root,0,0,0.28,0.13,0.36,0.04,0x9f4445);
 }
 return root;
}
function syncPickups(t){
 for(const p of state.pickups){
  if(!pickupVisual.has(p.id))pickupVisual.set(p.id,makePickupVisual(p));
  const v=pickupVisual.get(p.id);
  v.position.set(p.x,0.5+Math.sin(t*3+p.id)*0.14,p.z);
  v.rotation.y=t*0.8;
 }
 for(const [id,v] of pickupVisual){
  if(state.pickups.some(p=>p.id===id))continue;
  world.remove(v);pickupVisual.delete(id);
 }
}
function syncPlayer(t,moving){
 player.position.set(state.x,0,state.z);player.rotation.y=yaw;
 if(heroMixer){
  const name=state.reloadTime>0?'1H_Ranged_Reload':state.status==='playing'&&state.elapsed<heroShotUntil?'1H_Ranged_Shoot':moving?(keys.has('shift')||sprintHeld?'Running_A':'Walking_A'):'Idle';
  playHeroClip(name);
  heroMixer.update(Math.min(0.06,nowFrameDt));
  return;
 }
 const parts=player.userData;
 const bob=moving?Math.sin(t*11)*0.05:Math.sin(t*2.5)*0.012;
 parts.legs.forEach((p,i)=>p.rotation.x=moving?Math.sin(t*11+i*Math.PI)*0.58:0);
 parts.leftArm.rotation.x=-0.3+Math.sin(t*4)*0.05;
 parts.rightArm.rotation.x=-0.72-state.shotFlash*0.65;
 parts.torso.position.y=1.22+bob;
}
function updateCamera(dt){
 const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
 const focus=new THREE.Vector3(state.x,1.64,state.z);
 const desired=focus.clone().addScaledVector(forward,-5.2);
 desired.x+=Math.cos(yaw)*0.75;desired.z+=Math.sin(yaw)*0.75;
 desired.y+=2.0;
 const dir=desired.clone().sub(focus),dist=dir.length();
 raycaster.set(focus,dir.normalize());raycaster.far=dist;
 const hits=raycaster.intersectObjects(collisionMeshes,false);
 if(hits.length)desired.copy(focus).addScaledVector(dir,Math.max(0.75,hits[0].distance-0.45));
 camera.position.lerp(desired,Math.min(1,dt*12));
 const look=focus.clone().addScaledVector(forward,9);
 look.y+=pitch*6;
 camera.lookAt(look);
}
function pauseGame(message='일시정지'){
 if(state.status!=='playing')return;
 pause(state);showMenu(message,'게임으로 돌아가기',true);
 try{document.exitPointerLock?.();}catch{}
 fireHeld=false;
}
function showMenu(title,button,secondary){
 overlay.hidden=false;$('menuTitle').textContent=title;
 $('menuDesc').textContent=state.status==='gameover'?'처치 '+state.kills+'마리 · 점수 '+state.score:state.status==='paused'?'게임이 일시정지됐습니다.':'폐허 도시에 몰려드는 적을 막아 살아남으세요.';
 $('primary').textContent=button;
 $('secondary').hidden=!secondary;
}
function toggleHUD(on){
 $('hud').hidden=!on;$('reticle').hidden=!on;$('message').hidden=!on;$('fps').hidden=!on;
 $('mobileControls').hidden=!(on&&mobile);
}
function begin(reset=false){
 if(reset||state.status==='gameover'){state=newGame();heroShotUntil=0;for(const v of pickupVisual.values())world.remove(v);pickupVisual.clear();}
 state.status='playing';start(state);overlay.hidden=true;toggleHUD(true);
 yaw=state.yaw;fireHeld=false;updateHUD();
 if(mobile){
  if(!document.fullscreenElement&&shell.requestFullscreen) shell.requestFullscreen().catch(()=>{});
  if(!history.state?.blockSurvivalTPS)history.pushState({blockSurvivalTPS:true},'',location.href);
 }else canvas.requestPointerLock?.();
 loadOptional();
}
function updateHUD(){
 $('healthFill').style.width=state.hp+'%';
 $('healthText').textContent=state.hp+' / 100';
 $('wave').textContent=state.wave;$('kills').textContent=state.kills;$('score').textContent=state.score;
 $('ammo').innerHTML=state.ammo+' <small>/ '+state.reserve+'</small>';
 $('hitScreen').style.opacity=Math.min(0.16,state.hitFlash*0.65);
 $('reticle').classList.toggle('hit',state.hitMarker>0);
 $('fps').textContent='FPS '+fps+' · '+(renderer?.getPixelRatio()?.toFixed(2)||'1')+'x';
 if(lastToast!==state.toast){
  lastToast=state.toast;toastUntil=performance.now()+3000;
 }
 $('message').textContent=state.toast;
 $('message').style.opacity=performance.now()<toastUntil?'1':'0';
 $('message').style.pointerEvents='none';
}
function localSound(hit=false){
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const ctx=localSound.ctx=localSound.ctx||new Ctx();
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  // Synthesized percussive blast, not a music file or third-party audio asset.
  if(!localSound.noise){
   const length=Math.floor(ctx.sampleRate*0.18),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
   let seed=1986127;
   for(let i=0;i<length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const decay=Math.pow(1-i/length,5);
    data[i]=((seed/4294967296)*2-1)*decay;
   }
   localSound.noise=buffer;
  }
  const now=ctx.currentTime,src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
  src.buffer=localSound.noise;filter.type='lowpass';filter.frequency.value=hit?2200:1700;
  gain.gain.setValueAtTime(0.12,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.17);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(now);src.stop(now+0.18);
  if(hit){
   const osc=ctx.createOscillator(),click=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(650,now);
   osc.frequency.exponentialRampToValueAtTime(300,now+0.06);
   click.gain.setValueAtTime(0.025,now);
   click.gain.exponentialRampToValueAtTime(0.001,now+0.07);
   osc.connect(click).connect(ctx.destination);
   osc.start(now);osc.stop(now+0.07);
  }
 }catch{}
}
function getShotDirection(){
 // Project the camera's real center reticle onto enemy mid-body height.
 camera.getWorldDirection(cameraShotVector);
 const targetHeight=1.3;
 const travel=cameraShotVector.y < -0.03
  ? clamp((targetHeight-camera.position.y)/cameraShotVector.y,4,34):28;
 const targetX=camera.position.x+cameraShotVector.x*travel;
 const targetZ=camera.position.z+cameraShotVector.z*travel;
 const dx=targetX-state.x,dz=targetZ-state.z;
 const length=Math.hypot(dx,dz);
 if(length<0.001)return {dx:Math.sin(yaw),dz:-Math.cos(yaw)};
 return {dx:dx/length,dz:dz/length};
}
function doFire(){
 if(state.status!=='playing')return;
 const aim=getShotDirection();
 const result=shoot(state,aim.dx,aim.dz);
 if(result.fired){
  heroShotUntil=state.elapsed+0.32;
  const startPoint=new THREE.Vector3(state.x+Math.sin(yaw)*0.5,1.45,state.z-Math.cos(yaw)*0.5);
  const endpoint=new THREE.Vector3(startPoint.x+aim.dx*34,1.45,startPoint.z+aim.dz*34);
  if(result.hit){
   const e=state.enemies.find(x=>x.id===result.id);
   if(e)endpoint.set(e.x,1.45,e.z);
  }
  // Occlusion clamping prevents tracer rays passing visually through solid buildings.
  const delta=endpoint.clone().sub(startPoint),length=delta.length();
  if(length>0.001){
   raycaster.set(startPoint,delta.normalize());raycaster.far=length;
   const hits=raycaster.intersectObjects(collisionMeshes,false);
   if(hits.length)endpoint.copy(hits[0].point);
  }
  const positions=tracer.geometry.getAttribute('position');
  positions.setXYZ(0,startPoint.x,startPoint.y,startPoint.z);
  positions.setXYZ(1,endpoint.x,endpoint.y,endpoint.z);positions.needsUpdate=true;
  tracer.geometry.computeBoundingSphere();tracer.visible=true;
  impactSpark.visible=!!result.hit;
  if(result.hit)impactSpark.position.copy(endpoint);
  fxExpires=performance.now()+105;
 }
 if(result.fired)localSound(result.hit);
 if(!result.fired&&result.reason==='empty')reload(state);
}
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(0.06,(now-lastFrame)/1000||0.016);lastFrame=now;nowFrameDt=dt;
 if(state.status==='playing'){
  const f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.z;
  const strafe=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;
  const ahead=Math.sin(yaw),side=Math.cos(yaw);
  const dx=ahead*f+side*strafe,dz=-side*f+ahead*strafe;
  const mv=Math.min(1,Math.hypot(dx,dz));
  tick(state,dt,{x:dx,z:dz,yaw,sprint:keys.has('shift')||sprintHeld});
  if(fireHeld&&state.shotCooldown<=0)doFire();
  syncPlayer(now/1000,mv>0.02);syncEnemies(now/1000);syncPickups(now/1000);
  if(state.status==='gameover'){fireHeld=false;showMenu('생존 실패','다시 도전',true);}
  const moved=mv>0.02;
  updateCamera(dt);
 }else{
  syncPlayer(now/1000,false);
  updateCamera(dt);
  syncPickups(now/1000);
 }
 if(tracer&&now>fxExpires){tracer.visible=false;impactSpark.visible=false;}
 if(muzzleEffect)muzzleEffect.visible=state.status==='playing'&&state.shotFlash>0;
 if(renderer&&scene)renderer.render(scene,camera);
 fpsCount++;
 if(now-fpsStart>1500){
  fps=Math.round(fpsCount*1000/(now-fpsStart));
  fpsCount=0;fpsStart=now;
  // Symmetric adaptive resolution: sustained slow frames reduce GPU raster work,
  // while stable recovery restores sharpness; never exceed the device-safe cap.
  const proposed=updateQuality(quality,fps,{playing:state.status==='playing'});
  if(Math.abs(proposed.ratio-quality.ratio)>0.001){
   renderer.setPixelRatio(proposed.ratio);size();
  }
  quality=proposed;
 }
 if(now-uiAt>110){uiAt=now;if(state.status==='playing')updateHUD();}
}
function initInputs(){
 document.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('dragstart',e=>e.preventDefault());
 document.addEventListener('selectstart',e=>{if(e.target.closest('#shell'))e.preventDefault();});
 document.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();
  if(key==='escape'){e.preventDefault();if(state.status==='playing')pauseGame();return;}
  keys.add(key);
  if(key==='r'){reload(state);}
 });
 document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>pauseGame('일시정지'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame('일시정지');});
 document.addEventListener('pointerlockchange',()=>{
  if(!mobile&&!document.pointerLockElement&&state.status==='playing')pauseGame();
 });
 document.addEventListener('mousemove',e=>{
  if(document.pointerLockElement===canvas&&state.status==='playing'){
   yaw-=e.movementX*0.0027;pitch=clamp(pitch-e.movementY*0.0018,-0.58,0.6);
  }
 });
 canvas.addEventListener('pointerdown',e=>{
  if(mobile||state.status!=='playing'||e.button!==0)return;
  fireHeld=true;doFire();
 });
 window.addEventListener('pointerup',e=>{if(!mobile)fireHeld=false;});
 $('pause').addEventListener('click',()=>pauseGame());
 $('primary').addEventListener('click',()=>{
  const restart=state.status==='gameover'||state.status==='title';
  begin(restart);
 });
 $('secondary').addEventListener('click',()=>begin(true));
 $('reload').addEventListener('click',()=>reload(state));
 $('fire').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();$('fire').classList.add('pressed');fireHeld=true;doFire();
  $('fire').setPointerCapture(e.pointerId);
 });
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])
  $('fire').addEventListener(ev,()=>{fireHeld=false;$('fire').classList.remove('pressed');});
 $('sprint').addEventListener('pointerdown',e=>{sprintHeld=true;$('sprint').classList.add('pressed');$('sprint').setPointerCapture(e.pointerId);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])
  $('sprint').addEventListener(ev,()=>{sprintHeld=false;$('sprint').classList.remove('pressed');});
 const zone=$('stickZone'),nub=$('stickNub');
 zone.addEventListener('pointerdown',e=>{if(state.status!=='playing')return;stickPointer=e.pointerId;zone.setPointerCapture(e.pointerId);dragStick(e);});
 zone.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)dragStick(e);});
 function dragStick(e){
  const rect=$('stickBase').getBoundingClientRect();
  const x=(e.clientX-(rect.left+rect.width/2))/(rect.width*0.4);
  const z=(e.clientY-(rect.top+rect.height/2))/(rect.height*0.4);
  const mag=Math.max(1,Math.hypot(x,z));joystick.x=x/mag;joystick.z=z/mag;
  nub.style.transform='translate('+(joystick.x*38)+'px,'+(joystick.z*38)+'px)';
 }
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(ev,e=>{
  if(stickPointer!==e.pointerId)return;
  stickPointer=null;joystick={x:0,z:0};nub.style.transform='';
 });
 const look=$('lookZone');
 look.addEventListener('pointerdown',e=>{if(state.status!=='playing')return;lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};look.setPointerCapture(e.pointerId);});
 look.addEventListener('pointermove',e=>{
  if(lookPointer!==e.pointerId||!lastLook)return;
  yaw-=(e.clientX-lastLook.x)*0.007;
  pitch=clamp(pitch-(e.clientY-lastLook.y)*0.005,-0.58,0.6);
  lastLook={x:e.clientX,y:e.clientY};
 });
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(ev,e=>{if(lookPointer===e.pointerId){lookPointer=null;lastLook=null;}});
 window.addEventListener('popstate',()=>{
  if(state.status==='playing')pauseGame('게임을 종료하시겠습니까?');
  if(mobile)history.pushState({blockSurvivalTPS:true},'',location.href);
 });
}
initInputs();
if(!init3D()){$('overlay').hidden=true;}
