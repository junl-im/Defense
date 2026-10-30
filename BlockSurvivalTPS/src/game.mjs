// © 2026 곰같은여우 — Block Survival TPS isolated 3D vertical slice.
// Three.js MIT. Third-party models: see research/source-lock.json, loaded lazily and optionally.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';
import {ARENA,COVER,clamp,newGame,start,pause,reload,shoot,tick,drainCombatEffects,ENEMY_ATTACK,BLAST_RADIUS,FIRE_MODES,setFireMode,tryDodge,DODGE_DURATION} from './sim.mjs';
import {populateRuinedCity} from './world-detail.mjs';
import {createQualityState,updateQuality} from './quality.mjs';
import {heroCombatPose,undeadCombatPose,heroStridePose,footstepCrossed} from './combat-pose.mjs';
import {applyLookDelta,LOOK_SENSITIVITY} from './control-math.mjs';

const $=id=>document.getElementById(id);
const shell=$('shell'),canvas=$('stage'),overlay=$('overlay');
const mobile=window.matchMedia('(pointer:coarse)').matches;
const keys=new Set();
let state=newGame(),yaw=0,pitch=0,fireHeld=false,sprintHeld=false;
let joystick={x:0,z:0},stickPointer=null,lookPointer=null,lastLook=null;
let renderer,scene,camera,clock,player,playerParts,world,raycaster;
let heroRig=null,heroMixer=null,heroAnimation='',heroGun=null,heroGunTemplate=null,muzzleEffect=null,tracer=null,impactSpark=null,fxExpires=0,heroShotUntil=0,heroModern=false;
const pickupVisual=new Map(),barrelVisual=new Map(),blastVisual=[],shockVisual=[];
const casingPool=[],dustPool=[];let casingCursor=0,dustCursor=0,shotSerial=0;
const heroClips=new Map();
let heroLegBones=null,heroMotionBlend=0,heroStridePhase=0,heroRestHeight=0,heroPreviousLegX=null;
let currentStrafe=0,footstepCount=0;
let quality=createQualityState({mobile,dpr:window.devicePixelRatio||1});
const cameraShotVector=new THREE.Vector3();
const enemyHitTint=new THREE.Color(0xff562e);
let lastFrame=performance.now(),fpsCount=0,fpsStart=lastFrame,fps=60,uiAt=0,modelStarted=false,nowFrameDt=0.016;
let lastToast='',toastUntil=0,combatPopupUntil=0,fxCursor=0,lastWarningCue=0,cameraKick=0;
const impactPool=[];
let fragmentStone,fragmentGold;
let attackRingGeometry,attackRingMaterials,blastGeometry,shockRingGeometry,barrelBodyGeometry,barrelBandGeometry,barrelTopGeometry;
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
 // Shared attack marker geometry avoids per-mob geometry creation.
 attackRingGeometry=new THREE.RingGeometry(0.77,0.89,20);
 attackRingMaterials={
  zombie:new THREE.MeshBasicMaterial({color:0xeab86b,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false}),
  runner:new THREE.MeshBasicMaterial({color:0xff9663,transparent:true,opacity:0.75,side:THREE.DoubleSide,depthWrite:false}),
  minion:new THREE.MeshBasicMaterial({color:0xd16b82,transparent:true,opacity:0.72,side:THREE.DoubleSide,depthWrite:false})
 };
 barrelBodyGeometry=new THREE.CylinderGeometry(0.47,0.49,1.1,9);
 barrelBandGeometry=new THREE.CylinderGeometry(0.51,0.51,0.12,9);
 barrelTopGeometry=new THREE.CylinderGeometry(0.32,0.32,0.045,9);
 shockRingGeometry=new THREE.RingGeometry(0.82,1,24);
 const shockMaterial=new THREE.MeshBasicMaterial({color:0xf2b77a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
 for(let i=0;i<3;i++){
  const mesh=new THREE.Mesh(shockRingGeometry,shockMaterial.clone());
  mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.position.y=0.10;scene.add(mesh);
  shockVisual.push({mesh,ttl:0,total:0.46});
 }
 shell.dataset.shockwaveFx='ready';
 blastGeometry=new THREE.SphereGeometry(1,12,8);
 for(let i=0;i<3;i++){
  const mesh=new THREE.Mesh(blastGeometry,new THREE.MeshBasicMaterial({color:0xffb65d,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  mesh.visible=false;scene.add(mesh);blastVisual.push({mesh,ttl:0,total:0.38});
 }
 shell.dataset.explosionFx='ready';
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
 // Twelve pooled impact fragments: no per-shot geometry creation, no SVG, no textures.
 const fragmentGeometry=new THREE.OctahedronGeometry(0.065,0);
 const fragmentMaterials=[new THREE.MeshBasicMaterial({color:0xdccdb5,depthWrite:false}),
  new THREE.MeshBasicMaterial({color:0xffd274,depthWrite:false})];
 [fragmentStone,fragmentGold]=fragmentMaterials;
 for(let i=0;i<12;i++){
  const mesh=new THREE.Mesh(fragmentGeometry,fragmentMaterials[0]);
  mesh.visible=false;scene.add(mesh);
  impactPool.push({mesh,ttl:0,vx:0,vy:0,vz:0});
 }
 // Original, tiny low-poly particles: fixed reusable pools, no textures or SVG.
 const brassGeo=new THREE.CylinderGeometry(0.035,0.035,0.16,6);
 const dustGeo=new THREE.IcosahedronGeometry(0.115,0);
 const brassMat=new THREE.MeshLambertMaterial({color:0xe5bf72});
 const dustMats=[0x879093,0x6a716c,0x968470].map(color=>new THREE.MeshLambertMaterial({color}));
 for(let i=0;i<12;i++){
  const mesh=new THREE.Mesh(brassGeo,brassMat);mesh.visible=false;scene.add(mesh);
  casingPool.push({mesh,ttl:0,vx:0,vy:0,vz:0,bounced:false});
 }
 for(let i=0;i<24;i++){
  const mesh=new THREE.Mesh(dustGeo,dustMats[i%3]);mesh.visible=false;scene.add(mesh);
  dustPool.push({mesh,ttl:0,vx:0,vy:0,vz:0});
 }
 shell.dataset.combatFx='ready';
 shell.dataset.casingFx='ready';
 shell.dataset.dustFx='ready';
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
 for(const kind of ['minion','bat','gun','ruin','chest','barrel','crates','hero','undead','modernHero','modernZombie','modernRunner']){
  // Production assets ship beside the bundled game; the pinned official source is a dev fallback.
  const local='./assets/'+kind+'.glb';
  const modern=kind.startsWith('modern');
  (modern?modelLoader.loadAsync(local):modelLoader.loadAsync(local).catch(()=>modelLoader.loadAsync(assetURLs[kind]))).then(gltf=>{
   assetCache.set(kind,gltf);
   if(kind==='hero'||kind==='undead')shell.dataset[kind+'Asset']='loaded';
   if(modern)shell.dataset[kind]='loaded';
   if(kind==='gun'){
    heroGunTemplate=gltf.scene;
    attachHeroGun();
   }
   if(kind==='hero')installHero(gltf,false);
   if(kind==='modernHero')installHero(gltf,true);
   if(['ruin','chest','barrel','crates'].includes(kind)){
    const config={ruin:[-12,-9,2.9],chest:[18,-3,0.9],barrel:[-8,2,1.25],crates:[9,4,1.4]}[kind];
    const clone=gltf.scene.clone(true);normalize(clone,config[2]);
    clone.position.set(config[0],0.06,config[1]);world.add(clone);
   }
   if(['minion','undead','modernZombie','modernRunner'].includes(kind)){
    for(const [id,visual] of [...enemiesVisual]){
     const e=state.enemies.find(enemy=>enemy.id===id && enemy.hp>0);
     if(!e)continue;
     const applies=kind==='minion'?e.type==='minion':
       kind==='modernZombie'?e.type==='zombie':kind==='modernRunner'?e.type==='runner':e.type!=='minion';
     if(!applies)continue;
     // Never downgrade an already loaded modern model back to the previous CC0 fallback.
     if(kind==='undead'&&visual.rigKind?.startsWith('modern'))continue;
     if(kind==='undead'&&visual.mixer)continue;
     visual.mixer?.stopAllAction();
     if(visual.mixer)visual.mixer.uncacheRoot(visual.model);
     disposeEnemyHitVisual(visual);
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
// Solve the upper-arm direction after FBX skeletal clip sampling. This prevents
// mismatched FBX rig rest orientation from rendering a permanent "hands up" pose.
// Keep hands attached to the real 58-bone skeleton; no fake separate arms or SVG.
const aimFrom=new THREE.Vector3(),aimTo=new THREE.Vector3(),aimDesired=new THREE.Vector3();
const aimDelta=new THREE.Quaternion(),aimParent=new THREE.Quaternion(),aimRoot=new THREE.Quaternion();
function alignArm(rig,side,mode,pose=null){
 const arm=rig.getObjectByName(side+'Arm'),hand=rig.getObjectByName(side+'Hand');
 if(!arm||!hand)return;
 rig.updateWorldMatrix(true,true);
 arm.getWorldPosition(aimFrom);hand.getWorldPosition(aimTo);
 aimTo.sub(aimFrom);
 if(aimTo.lengthSq()<1e-5)return;
 if(mode==='survivor'){
  // Keep the weapon arm forward, with the support hand following the barrel.
  // The blend values are sampled AFTER imported Kenney FBX/GLB animation.
  if(side==='Right')aimDesired.set(-0.13,-0.46+(pose?.shoulderLift||0),0.86);
  else aimDesired.set(0.16,-0.55+(pose?.supportLift||0),0.78);
 }else{
  aimDesired.set(side==='Right'?-0.12:0.12,-0.48,0.76);
 }
 rig.getWorldQuaternion(aimRoot);
 aimDesired.applyQuaternion(aimRoot).normalize();
 aimDelta.setFromUnitVectors(aimTo.normalize(),aimDesired);
 arm.parent.getWorldQuaternion(aimParent);
 aimRoot.copy(aimParent);
 aimParent.invert().multiply(aimDelta).multiply(aimRoot);
 arm.quaternion.premultiply(aimParent);
 arm.updateWorldMatrix(false,true);
}
function correctModernPose(rig,mode,pose=null){
 alignArm(rig,'Left',mode,pose);
 alignArm(rig,'Right',mode,pose);
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
function findModernLegBone(root,side,part){
 let match=null;
 root.traverse(o=>{
  if(match||!o.isBone)return;
  const n=o.name.replace(/[^a-z\d]/gi,'').toLowerCase();
  const isSide=n.includes(side);
  const isThigh=/(upleg|upperleg|thigh|hip)/.test(n);
  const isShin=/(lowleg|lowerleg|calf|shin)/.test(n);
  if(isSide&&(part==='thigh'?isThigh:isShin))match=o;
 });
 return match;
}
function installHero(gltf,modern=false){
 if(!player||heroModern||(!modern&&heroRig))return;
 if(modern&&heroRig){
  heroMixer?.stopAllAction();
  if(heroMixer)heroMixer.uncacheRoot(heroRig);
  player.remove(heroRig);
  heroRig=null;heroMixer=null;heroClips.clear();playHeroClip.previous=null;heroGun=null;heroLegBones=null;
 }
 heroModern=modern;
 heroRig=cloneSkinned(gltf.scene);
 let skinnedParts=0;
 heroRig.traverse(child=>{
  if(child.isSkinnedMesh){child.frustumCulled=false;skinnedParts++;}
  if(!modern&&/Sword|Shield|Cape/i.test(child.name))child.visible=false;
  // Work toward an urban-survivor palette without altering the original CC0 source GLB.
  if(!modern&&child.isMesh&&/Knight_(Body|Arm|Leg|Helmet)/.test(child.name)){
   child.material=Array.isArray(child.material)?child.material.map(m=>m.clone()):child.material.clone();
   const tint=/Helmet/.test(child.name)?0x748f77:/Body/.test(child.name)?0x76917c:0x929e8e;
   for(const m of (Array.isArray(child.material)?child.material:[child.material]))m.color.multiply(new THREE.Color(tint));
  }
 });
 normalize(heroRig,modern?0.83:2.1);
 // KayKit animated rigs face +Z, while our TPS camera assumes the hero faces -Z.
 heroRig.rotation.y=Math.PI;
 heroRestHeight=heroRig.position.y;
 heroMotionBlend=0;heroStridePhase=0;heroPreviousLegX=null;
 heroLegBones=modern?{
  leftThigh:findModernLegBone(heroRig,'left','thigh'),rightThigh:findModernLegBone(heroRig,'right','thigh'),
  leftShin:findModernLegBone(heroRig,'left','shin'),rightShin:findModernLegBone(heroRig,'right','shin')
 }:null;
 shell.dataset.heroLegRig=heroLegBones?.leftThigh&&heroLegBones?.rightThigh?'bound':'missing';
 shell.dataset.heroLegMotion='waiting';
 // Keep primitive fallback only until this correctly rigged hero is loaded.
 for(const c of player.children)if(!c.userData.fx)c.visible=false;
 player.add(heroRig);heroMixer=new THREE.AnimationMixer(heroRig);
 for(const clip of gltf.animations)heroClips.set(clip.name,clip);
 heroAnimation='';
 if(skinnedParts>0&&(heroClips.size===6||modern&&heroClips.size===3))shell.dataset.heroRig='loaded';
 if(modern&&heroClips.has('Run')){shell.dataset.modernHeroRig='loaded';shell.dataset.combatVersion='v016';}
 attachHeroGun();
}
function attachHeroGun(){
 if(!heroGunTemplate||!player)return;
 if(heroRig){
  if(heroGun){heroGun.parent?.remove(heroGun);heroGun=null;}
  let socket=null;
  heroRig.traverse(o=>{if(o.name===(heroModern?'RightHand':'handslot.r'))socket=o;});
  if(socket){
   const gun=heroGunTemplate.clone(true);
   // Kenney model hand is driven by the same imported 58-bone animation skeleton.
   // These are local attachment transforms, not absolute world coordinates.
   gun.position.set(0,0,-0.07);
   gun.rotation.set(0,Math.PI/2,0);
   gun.scale.setScalar(heroModern?0.48:0.9);
   socket.add(gun);heroGun=gun;
   if(heroModern)shell.dataset.modernGun='attached';
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
 const warning=new THREE.Mesh(attackRingGeometry,attackRingMaterials[e.type]||attackRingMaterials.zombie);
 warning.rotation.x=-Math.PI/2;warning.position.y=0.075;warning.visible=false;
 root.add(warning);visual.warning=warning;
 const kind=e.type==='minion'?'minion':
   e.type==='runner'&&assetCache.has('modernRunner')?'modernRunner':
   e.type==='zombie'&&assetCache.has('modernZombie')?'modernZombie':'undead';
 if(kind&&assetCache.has(kind)){
  const gltf=assetCache.get(kind);
  const model=cloneSkinned(gltf.scene);
  normalize(model,kind.startsWith('modern')?0.92:1.8);
  visual.hitMaterials=[];
  model.traverse(child=>{
   if(!child.isSkinnedMesh)return;
   child.frustumCulled=false;
   if(!kind.startsWith('modern'))return;
   const sources=Array.isArray(child.material)?child.material:[child.material];
   const copies=sources.map(m=>m.clone());
   child.material=Array.isArray(child.material)?copies:copies[0];
   for(const m of copies){
    if(!m.emissive)continue;
    m.userData.raniEmissiveBase=m.emissive.clone();
    m.userData.raniEmissiveLevel=m.emissiveIntensity||0;
    visual.hitMaterials.push(m);
   }
  });
  if(kind.startsWith('modern')){
   visual.headBone=model.getObjectByName('Head');
   if(visual.hitMaterials.length)shell.dataset.enemyHitShader='ready';
  }
  root.add(model);visual.model=model;
  if(gltf.animations.length){
   visual.mixer=new THREE.AnimationMixer(model);
   visual.rigKind=kind;visual.clips=new Map(gltf.animations.map(clip=>[clip.name,clip]));
   if(kind==='undead'||kind.startsWith('modern'))shell.dataset.undeadRig='loaded';
   if(kind==='minion'){
    visual.clip=visual.mixer.clipAction(gltf.animations[0]);visual.clip.play();
   }else playRigClip(visual,kind.startsWith('modern')?'Run':'Walking_D_Skeletons');
  }
 }else{
  const model=makeZombie(e.type);root.add(model);visual.model=model;
 }
 return visual;
}
function applyEnemyHitVisual(visual,pose){
 if(visual.headBone&&pose.headSnap>0.001)visual.headBone.rotation.z+=pose.headSnap;
 for(const m of visual.hitMaterials||[]){
  m.emissive.copy(m.userData.raniEmissiveBase).lerp(enemyHitTint,pose.hit);
  m.emissiveIntensity=m.userData.raniEmissiveLevel+pose.hitGlow;
 }
 if(pose.hit>0.01)shell.dataset.enemyHitFlash='detected';
}
function disposeEnemyHitVisual(visual){
 for(const m of visual.hitMaterials||[])m.dispose();
 visual.hitMaterials=[];
}
function syncEnemies(t){
 for(const e of state.enemies){
  let v=enemiesVisual.get(e.id);
  if(!v){v=makeEnemyVisual(e);enemiesVisual.set(e.id,v);}
  const root=v.root;
  root.position.set(e.x,e.hp<=0?0:e.hitTime>0?0.06:0,e.z);
  v.warning.visible=e.hp>0&&e.attackWindup>0;
  if(v.warning.visible){
   const t=1-e.attackWindup/Math.max(0.1,e.attackWindupTotal||0.36);
   v.warning.scale.setScalar(1.16-0.27*t);
  }
  const a=Math.atan2(state.x-e.x,state.z-e.z);
  const hitSide=(e.impactX||0)*Math.cos(a)-(e.impactZ||0)*Math.sin(a);
  const hitFront=(e.impactX||0)*Math.sin(a)+(e.impactZ||0)*Math.cos(a);
  root.rotation.y=(v.rigKind==='undead'||v.rigKind?.startsWith('modern')?a:v.mixer?a:a+Math.PI);
  if(e.hp<=0){
   if(v.rigKind?.startsWith('modern')){
    const pose=undeadCombatPose({...e,hitSide,hitFront,distance:Math.hypot(e.x-state.x,e.z-state.z)});
    playRigClip(v,pose.clip,0.05);
    v.mixer.update(Math.min(0.06,nowFrameDt));
    correctModernPose(v.model,'undead');
    applyEnemyHitVisual(v,pose);
    root.rotation.x=pose.leanX;root.rotation.z=pose.leanZ;
    root.position.y=pose.fallY;
    v.model.position.z=0;
   }else if(v.rigKind==='undead'){
    playRigClip(v,'Death_A',0.08);
    v.mixer.update(Math.min(0.06,nowFrameDt));
   }else{
    root.rotation.z=Math.min(1.25,e.deadTime*4);
    if(v.mixer)v.mixer.setTime(60/24+Math.min(e.deadTime,(89-60)/24));
   }
  }else if(v.rigKind?.startsWith('modern')){
   const pose=undeadCombatPose({...e,hitSide,hitFront,distance:Math.hypot(e.x-state.x,e.z-state.z)});
   playRigClip(v,pose.clip,0.13);
   v.mixer.update(Math.min(0.06,nowFrameDt));
   correctModernPose(v.model,'undead');
   applyEnemyHitVisual(v,pose);
   root.rotation.x=pose.leanX;root.rotation.z=pose.leanZ;
   v.model.position.z=pose.offsetZ;
  }else if(v.rigKind==='undead'){
   const attacking=e.attackWindup>0;
   const desired=e.hitTime>0?'Hit_A':attacking?'Unarmed_Melee_Attack_Punch_A':e.type==='runner'?'Running_A':'Walking_D_Skeletons';
   playRigClip(v,desired);
   v.mixer.update(Math.min(0.06,Math.max(0,nowFrameDt)));
  }else if(v.mixer){
   const from=e.attackWindup>0?30:0,len=29/24;
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
  disposeEnemyHitVisual(v);
  scene.remove(v.root);enemiesVisual.delete(id);
  // Shared GLB geometry/textures remain in cache; only per-enemy mixers are cleared.
 }
}
function syncBarrels(){
 for(const barrel of state.barrels){
  let view=barrelVisual.get(barrel.id);
  if(!view){
   // Original low-poly prop, no SVG or new network asset.
   const root=new THREE.Group();scene.add(root);root.position.set(barrel.x,0,barrel.z);
   const body=new THREE.Mesh(barrelBodyGeometry,mat(0xa64b36));
   body.position.y=0.59;root.add(body);
   for(const y of [0.21,0.97]){
    const band=new THREE.Mesh(barrelBandGeometry,mat(0x444e51));
    band.position.y=y;root.add(band);
   }
   const top=new THREE.Mesh(barrelTopGeometry,mat(0xf0b65a));
   top.position.y=1.17;root.add(top);
   view=root;barrelVisual.set(barrel.id,view);
  }
  view.visible=!barrel.exploded;
 }
 shell.dataset.destructibles=String(barrelVisual.size);
}
function spawnBlastEffect(evt){
 spawnBlastDust(evt);
 let fx=blastVisual.find(x=>x.ttl<=0)||blastVisual[0];
 fx.ttl=fx.total=0.40;fx.mesh.visible=true;
 fx.mesh.position.set(evt.x,0.85,evt.z);fx.mesh.scale.setScalar(0.15);
 fx.mesh.material.opacity=0.46;
 const ring=shockVisual.find(x=>x.ttl<=0)||shockVisual[0];
 ring.ttl=ring.total=0.46;ring.mesh.visible=true;ring.mesh.position.x=evt.x;ring.mesh.position.z=evt.z;ring.mesh.scale.setScalar(0.12);
}
function stepBlastEffects(dt){
 if(state.status!=='playing')return;
 for(const f of blastVisual){
  if(f.ttl<=0)continue;
  f.ttl=Math.max(0,f.ttl-dt);
  const t=1-f.ttl/f.total;
  f.mesh.scale.setScalar(0.15+BLAST_RADIUS*t*0.83);
  f.mesh.material.opacity=0.32*(1-t)*(1-t);
  if(f.ttl===0)f.mesh.visible=false;
 }
 for(const f of shockVisual){
  if(f.ttl<=0)continue;
  f.ttl=Math.max(0,f.ttl-dt);
  const t=1-f.ttl/f.total;
  f.mesh.scale.setScalar(0.12+BLAST_RADIUS*t);
  f.mesh.material.opacity=0.55*(1-t)*(1-t);
  if(f.ttl===0)f.mesh.visible=false;
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
function applyModernHeroStride(moving){
 const sprint=keys.has('shift')||sprintHeld;
 const step=Math.min(1,nowFrameDt*12);
 heroMotionBlend+=(Number(moving)-heroMotionBlend)*step;
 const previousPhase=heroStridePhase;
 heroStridePhase+=nowFrameDt*(sprint?14.5:10.5)*Math.max(0.13,heroMotionBlend);
 if(footstepCrossed({previousPhase,phase:heroStridePhase,blend:heroMotionBlend,moving})){
  spawnFootstepDust(Math.floor(heroStridePhase/Math.PI)%2===0);
  shell.dataset.footstepFx='active';shell.dataset.footstepCount=String(++footstepCount);
 }
 const gait=heroStridePose({phase:heroStridePhase,blend:heroMotionBlend,sprint,strafe:currentStrafe});
 // Rig root mass transfer, independent of whether the source Run clip moves its bones.
 heroRig.position.y=heroRestHeight+gait.bob;
 heroRig.rotation.x=gait.lean;
 heroRig.rotation.z=gait.sway;
 if(!heroLegBones?.leftThigh||!heroLegBones?.rightThigh)return;
 // AnimationMixer samples the imported clip first, then the lightweight stride
 // adjusts real skeletal joints. The original CC0 model and textures stay intact.
 for(const key of ['leftThigh','rightThigh','leftShin','rightShin']){
  const bone=heroLegBones[key];if(bone)bone.rotation.x+=gait[key];
 }
 const legX=[heroLegBones.leftThigh.rotation.x,heroLegBones.rightThigh.rotation.x];
 if(moving&&heroPreviousLegX&&legX.some((a,i)=>Math.abs(a-heroPreviousLegX[i])>0.012))shell.dataset.heroLegMotion='detected';
 heroPreviousLegX=legX;
}
function syncPlayer(t,moving){
 player.position.set(state.x,0,state.z);player.rotation.y=yaw;
 const dodgePhase=state.dodgeTime>0?Math.sin(Math.PI*(1-state.dodgeTime/DODGE_DURATION)):0;
 player.rotation.z=dodgePhase*0.17;
 if(heroMixer){
  const name=heroModern?(moving?'Run':'Idle'):
    state.reloadTime>0?'1H_Ranged_Reload':state.status==='playing'&&state.elapsed<heroShotUntil?'1H_Ranged_Shoot':
    moving?(keys.has('shift')||sprintHeld?'Running_A':'Walking_A'):'Idle';
  playHeroClip(name);
  if(heroModern&&heroClips.has('Run'))heroMixer.clipAction(heroClips.get('Run')).timeScale=keys.has('shift')||sprintHeld?1.35:0.8;
  heroMixer.update(Math.min(0.06,nowFrameDt));
  if(heroModern){
   applyModernHeroStride(moving);
   const pose=heroCombatPose({shotFlash:state.shotFlash,reloadTime:state.reloadTime,
     elapsed:state.elapsed,shotUntil:heroShotUntil,moving,sprint:keys.has('shift')||sprintHeld});
   heroRig.rotation.x+=pose.torsoKick;
   heroRig.rotation.z+=pose.torsoRoll;
   correctModernPose(heroRig,'survivor',pose);
   if(heroGun){
    heroGun.rotation.x=pose.gunPitch;
    heroGun.rotation.y=Math.PI/2+pose.gunYaw;
    heroGun.rotation.z=pose.gunRoll;
    heroGun.position.y=-pose.gunLower;
    heroGun.position.z=-0.07+pose.gunSlide;
   }
   if(pose.recoil>0.14)shell.dataset.shotPoseSeen='true';
   if(pose.reloadDip>0.25)shell.dataset.reloadPoseSeen='true';
  }
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
 const dodgePulse=state.status==='playing'&&state.dodgeTime>0
   ?Math.sin(Math.PI*(1-state.dodgeTime/DODGE_DURATION)):0;
 const targetFov=70+5.5*dodgePulse;
 const nextFov=camera.fov+(targetFov-camera.fov)*Math.min(1,dt*15);
 if(Math.abs(nextFov-camera.fov)>0.02){camera.fov=nextFov;camera.updateProjectionMatrix();}
 if(state.status==='playing'&&cameraKick>0){camera.position.y+=cameraKick*0.55;cameraKick=Math.max(0,cameraKick-dt*0.28);}
 // Short, subtle local camera response to *actual* damage, not to mere proximity.
 if(state.hitFlash>0&&state.status==='playing'){
  const strength=Math.min(0.09,state.hitFlash*0.22);
  camera.position.x+=Math.sin(state.elapsed*97)*strength;
  camera.position.y+=Math.cos(state.elapsed*109)*strength*0.65;
 }
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
 $('combatPopup').hidden=!on;
 $('attackCue').hidden=!on;
}
function begin(reset=false){
 if(reset||state.status==='gameover'){state=newGame();heroShotUntil=0;
  for(const v of pickupVisual.values())world.remove(v);pickupVisual.clear();
  for(const v of barrelVisual.values())scene.remove(v);barrelVisual.clear();
  for(const f of [...blastVisual,...shockVisual]){f.ttl=0;f.mesh.visible=false;}
 }
 state.status='playing';start(state);overlay.hidden=true;toggleHUD(true);
 yaw=state.yaw;fireHeld=false;combatPopupUntil=0;cameraKick=0;
 heroMotionBlend=0;heroStridePhase=0;heroPreviousLegX=null;shell.dataset.heroLegMotion='waiting';
 footstepCount=0;shell.dataset.footstepCount='0';shell.dataset.footstepFx='ready';
 shell.dataset.shotPoseSeen='false';shell.dataset.reloadPoseSeen='false';
 for(const f of [...impactPool,...casingPool,...dustPool]){f.ttl=0;f.mesh.visible=false;}
 $('combatPopup').style.opacity='0';updateHUD();
 syncBarrels();
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
 const loading=state.reloadTime>0;
 $('reloadTrack').hidden=!loading;
 $('reloadFill').style.width=(loading?Math.max(0,Math.min(100,(1-state.reloadTime/1.35)*100)):100)+'%';
 $('reloadText').textContent=loading?'장전 '+Math.round((1-state.reloadTime/1.35)*100)+'%':'';
 $('ammo').classList.toggle('empty',state.ammo===0&&!loading);
 $('mode').textContent=FIRE_MODES[state.fireMode].label;
 $('mode').setAttribute('aria-label','사격 모드 '+FIRE_MODES[state.fireMode].label+' 전환');
 const dodgeRemaining=Math.max(0,state.dodgeCooldown||0);
 $('dodge').disabled=dodgeRemaining>0;
 $('dodge').textContent=dodgeRemaining>0?Math.ceil(dodgeRemaining)+'초':'회피';
 $('dodge').setAttribute('aria-label',dodgeRemaining>0?'회피 대기 '+dodgeRemaining.toFixed(1)+'초':'회피 준비');
 shell.dataset.dodgeReady=dodgeRemaining<=0?'true':'false';
 $('hitScreen').style.opacity=Math.min(0.16,state.hitFlash*0.65);
 $('reticle').classList.toggle('hit',state.hitMarker>0);
 $('reticle').classList.toggle('kill',state.killMarker>0);
 $('combatPopup').style.opacity=performance.now()<combatPopupUntil?'1':'0';
 const danger=state.enemies.some(e=>e.hp>0&&e.attackWindup>0&&
   Math.hypot(e.x-state.x,e.z-state.z)<2.2);
 $('attackCue').style.opacity=danger&&state.status==='playing'?'1':'0';
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
  gain.gain.setValueAtTime(state.fireMode==='rapid'?0.075:0.12,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.17);
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
function spawnCasing(){
 if(!casingPool.length)return;
 const v=casingPool[casingCursor++%casingPool.length];
 const rightX=Math.cos(yaw),rightZ=Math.sin(yaw),fwdX=Math.sin(yaw),fwdZ=-Math.cos(yaw);
 const phase=(++shotSerial%7)*0.11;
 v.ttl=0.95;v.bounced=false;
 v.mesh.position.set(state.x+rightX*0.39+fwdX*0.24,1.55,state.z+rightZ*0.39+fwdZ*0.24);
 v.mesh.scale.setScalar(1);v.mesh.rotation.set(phase,phase,0);
 v.vx=rightX*(1.5+phase)+fwdX*0.35;v.vz=rightZ*(1.5+phase)+fwdZ*0.35;
 v.vy=1.25+phase;v.mesh.visible=true;
}
function spawnFootstepDust(leftFoot){
 if(!dustPool.length)return;
 const side=leftFoot?-1:1;
 const rightX=Math.cos(yaw),rightZ=Math.sin(yaw);
 const rearX=-Math.sin(yaw),rearZ=Math.cos(yaw);
 for(let i=0;i<2;i++){
  const p=dustPool[dustCursor++%dustPool.length];
  const dispersion=(i===0?-0.08:0.08);
  p.mesh.position.set(state.x+rightX*side*0.19+rearX*(0.1+dispersion),0.07,
    state.z+rightZ*side*0.19+rearZ*(0.1+dispersion));
  p.vx=rightX*side*0.11+rearX*0.20+i*0.05;
  p.vz=rightZ*side*0.11+rearZ*0.20-i*0.04;
  p.vy=0.09+i*0.06;p.ttl=0.2+i*0.07;
  p.mesh.scale.setScalar(0.2+i*0.04);p.mesh.visible=true;
 }
}
function spawnDodgeDust(evt){
 if(!dustPool.length)return;
 for(let i=0;i<4;i++){
  const part=dustPool[dustCursor++%dustPool.length];
  const side=i%2?1:-1;
  part.mesh.position.set(evt.x+side*0.26,0.11,evt.z+(i-1.5)*0.13);
  part.vx=-evt.dx*(0.8+i*0.12)+side*0.48;
  part.vz=-evt.dz*(0.8+i*0.12)-side*0.36;
  part.vy=0.35+i*0.13;part.ttl=0.32+i*0.025;
  part.mesh.scale.setScalar(0.45+i*0.08);part.mesh.visible=true;
 }
}
function spawnBlastDust(evt){
 if(!dustPool.length)return;
 for(let i=0;i<12;i++){
  const part=dustPool[dustCursor++%dustPool.length];
  const angle=(i/12)*Math.PI*2+evt.barrelId*0.31;
  const power=1.4+(i%3)*0.6;
  part.mesh.position.set(evt.x+Math.sin(angle)*0.16,0.34,evt.z+Math.cos(angle)*0.16);
  part.vx=Math.sin(angle)*power;part.vz=Math.cos(angle)*power;part.vy=1.6+(i%4)*0.25;
  part.ttl=0.73+(i%4)*0.1;part.mesh.scale.setScalar(0.68+(i%3)*0.23);
  part.mesh.visible=true;
 }
}
function stepPhysicalParticles(dt){
 if(state.status!=='playing')return;
 for(const c of casingPool){
  if(c.ttl<=0)continue;
  c.ttl=Math.max(0,c.ttl-dt);
  c.mesh.position.x+=c.vx*dt;c.mesh.position.z+=c.vz*dt;
  c.vy-=9.5*dt;c.mesh.position.y+=c.vy*dt;
  if(c.mesh.position.y<0.065){
   c.mesh.position.y=0.065;c.vy=c.bounced?0:Math.max(0.13,-c.vy*0.26);
   c.vx*=0.76;c.vz*=0.76;c.bounced=true;
  }
  c.mesh.rotation.x+=dt*13;c.mesh.rotation.z+=dt*9;
  if(c.ttl===0)c.mesh.visible=false;
 }
 for(const d of dustPool){
  if(d.ttl<=0)continue;
  d.ttl=Math.max(0,d.ttl-dt);
  d.mesh.position.x+=d.vx*dt;d.mesh.position.z+=d.vz*dt;
  d.vy-=6*dt;d.mesh.position.y=Math.max(0.08,d.mesh.position.y+d.vy*dt);
  d.mesh.rotation.y+=dt*3;d.mesh.scale.multiplyScalar(Math.max(0.75,1-dt*1.5));
  if(d.ttl===0)d.mesh.visible=false;
 }
}
function spawnCombatFragments(event){
 if(!scene||!event||!Number.isFinite(event.x)||!Number.isFinite(event.z))return;
 const count=event.type==='kill'?7:4;
 for(let i=0;i<count;i++){
  const slot=impactPool[fxCursor++%impactPool.length];
  const angle=(event.id*2.39996+i*1.61803)*1.3;
  const power=0.65+(i%3)*0.22;
  slot.vx=Math.cos(angle)*power;slot.vz=Math.sin(angle)*power;
  slot.vy=0.8+(i%4)*0.22;
  slot.ttl=event.type==='kill'?0.46:0.31;
  slot.mesh.material=event.type==='kill'?fragmentGold:fragmentStone;
  slot.mesh.position.set(event.x,1.3,event.z);
  slot.mesh.scale.setScalar(event.type==='kill'?1.15:0.82);
  slot.mesh.visible=true;
 }
}
function stepCombatFragments(dt){
 if(state.status!=='playing')return;
 for(const f of impactPool){
  if(f.ttl<=0)continue;
  f.ttl=Math.max(0,f.ttl-dt);
  f.mesh.position.x+=f.vx*dt;f.mesh.position.z+=f.vz*dt;
  f.mesh.position.y+=f.vy*dt;
  f.vy-=4.5*dt;
  f.mesh.scale.multiplyScalar(Math.max(0.7,1-dt*2));
  if(f.ttl===0)f.mesh.visible=false;
 }
}
function cueSound(type){
 // User-gesture audio context is created by shooting; keep secondary cues understated.
 try{
  const ctx=localSound.ctx;
  if(!ctx||ctx.state!=='running')return;
  const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
  const base=type==='kill'?600:type==='explosion'?90:type==='damage'?175:type==='warning'?420:470;
  osc.type=type==='damage'||type==='explosion'?'triangle':'sine';
  osc.frequency.setValueAtTime(base,now);
  osc.frequency.exponentialRampToValueAtTime(type==='kill'?880:type==='damage'?78:base*0.72,now+0.12);
  const volume=type==='explosion'?0.05:type==='damage'?0.032:type==='kill'?0.018:0.008;
  gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.13);
  osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+0.14);
 }catch{}
}
function dispatchCombatEffects(now){
 for(const event of drainCombatEffects(state)){
  if(event.type==='hit'||event.type==='kill'){
   spawnCombatFragments(event);
   const label=event.type==='kill'
     ?(event.blast?'폭발 처치 +':'처치 +')+event.points+(event.combo>1?' · '+event.combo+'연속':'')
     :'명중 −'+event.damage;
   $('combatPopup').textContent=label;
   $('combatPopup').classList.toggle('kill',event.type==='kill');
   combatPopupUntil=now+(event.type==='kill'?1350:520);
   if(event.type==='kill')cueSound('kill');
  }else if(event.type==='stagger'){
   $('combatPopup').textContent='공격 저지!';
   $('combatPopup').classList.remove('kill');combatPopupUntil=now+620;
   cueSound('warning');
  }else if(event.type==='explosion'){
   spawnBlastEffect(event);cueSound('explosion');
   if(mobile&&typeof navigator.vibrate==='function')navigator.vibrate(35);
   $('combatPopup').textContent='폭발!';
   $('combatPopup').classList.add('kill');
   combatPopupUntil=now+600;
  }else if(event.type==='dodge'){
    spawnDodgeDust(event);cameraKick=Math.min(0.09,cameraKick+0.03);
    $('combatPopup').textContent='회피!';
    $('combatPopup').classList.remove('kill');combatPopupUntil=now+430;
    cueSound('dodge');
   }else if(event.type==='evade'){
    $('combatPopup').textContent='완벽 회피!';
    $('combatPopup').classList.remove('kill');combatPopupUntil=now+700;
    cueSound('kill');
   }else if(event.type==='damage'){
   cueSound('damage');
   if(mobile&&typeof navigator.vibrate==='function')navigator.vibrate(20);
   combatPopupUntil=Math.max(combatPopupUntil,now+650);
   $('combatPopup').textContent='피격 −'+event.amount;
   $('combatPopup').classList.remove('kill');
  }else if(event.type==='warning'){
   // Avoid 12 nearby zombies playing an overlapping wall of warning beeps.
   if(now-lastWarningCue>850){cueSound('warning');lastWarningCue=now;}
  }else if(event.type==='mode'){
   $('combatPopup').textContent=FIRE_MODES[event.mode].label+' 사격';
   $('combatPopup').classList.remove('kill');combatPopupUntil=now+900;
  }else if(['reload','reloadDone','pickup','wave'].includes(event.type)){
   cueSound(event.type==='wave'?'kill':'reload');
  }
 }
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
function attemptPlayerDodge(){
 if(state.status!=='playing')return false;
 const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.z;
 const side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;
 const dx=Math.sin(yaw)*forward+Math.cos(yaw)*side;
 const dz=-Math.cos(yaw)*forward+Math.sin(yaw)*side;
 state.yaw=yaw;
 return tryDodge(state,dx,dz);
}
function doFire(){
 if(state.status!=='playing')return;
 const aim=getShotDirection();
 const result=shoot(state,aim.dx,aim.dz);
 if(result.fired){
  heroShotUntil=state.elapsed+(state.fireMode==='rapid'?0.18:0.32);
  const startPoint=new THREE.Vector3(state.x+Math.sin(yaw)*0.5,1.45,state.z-Math.cos(yaw)*0.5);
  const trueAim=result.aim||aim;
  const endpoint=new THREE.Vector3(startPoint.x+trueAim.dx*34,1.45,startPoint.z+trueAim.dz*34);
  if(result.hit){
   if(result.barrel)endpoint.set(result.x,1.0,result.z);
   else {
    const e=state.enemies.find(x=>x.id===result.id);
    if(e)endpoint.set(e.x,1.45,e.z);
   }
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
 if(result.fired){spawnCasing();localSound(result.hit);cameraKick=Math.min(0.1,cameraKick+(state.fireMode==='rapid'?0.012:0.025));}
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
  const prevX=state.x,prevZ=state.z;
  currentStrafe=strafe;
  tick(state,dt,{x:dx,z:dz,yaw,sprint:keys.has('shift')||sprintHeld});
  if(fireHeld&&state.shotCooldown<=0)doFire();
  syncPlayer(now/1000,Math.hypot(state.x-prevX,state.z-prevZ)>0.001);syncEnemies(now/1000);syncPickups(now/1000);syncBarrels();
  if(state.status==='gameover'){fireHeld=false;showMenu('생존 실패','다시 도전',true);}
  updateCamera(dt);
 }else{
  syncPlayer(now/1000,false);
  updateCamera(dt);
  syncPickups(now/1000);
 }
 dispatchCombatEffects(now);
 stepCombatFragments(dt);
 stepBlastEffects(dt);
 stepPhysicalParticles(dt);
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
  if((key==='1'||key==='2'||key==='q')&&!e.repeat&&state.status==='playing'){
   setFireMode(state,key==='1'?'precision':key==='2'?'rapid':state.fireMode==='precision'?'rapid':'precision');
  }
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();
  if(key===' '&&!e.repeat)attemptPlayerDodge();
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
   const look=applyLookDelta(yaw,pitch,e.movementX,e.movementY,
     {horizontal:LOOK_SENSITIVITY.mouseX,vertical:LOOK_SENSITIVITY.mouseY});
   yaw=look.yaw;pitch=look.pitch;shell.dataset.lookDirection='normal';
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
 $('mode').addEventListener('click',()=>setFireMode(state,state.fireMode==='precision'?'rapid':'precision'));
 $('dodge').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();attemptPlayerDodge();
 });
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
  const next=applyLookDelta(yaw,pitch,e.clientX-lastLook.x,e.clientY-lastLook.y,
    {horizontal:LOOK_SENSITIVITY.touchX,vertical:LOOK_SENSITIVITY.touchY});
  yaw=next.yaw;pitch=next.pitch;shell.dataset.lookDirection='normal';
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
