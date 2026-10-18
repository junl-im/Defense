import { Engine, Scene, Vector3, Color3, Color4, HemisphericLight, DirectionalLight, ArcRotateCamera, MeshBuilder, StandardMaterial, DynamicTexture, TransformNode, SceneLoader, SpriteManager, Sprite } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {applyGate,phaseForHp,clamp} from './logic.js';
import {makeBossAttack,hitsHero,bossCasualties} from './boss-combat.js';
import {BARRICADE_MAX_HP,BARRICADE_Z,BARRICADE_HOLD_Z,stepBarricade,advanceTowardsBarricade} from './barricade.js';
import './style.css';

const $=id=>document.getElementById(id);
$('heroPreview').src=import.meta.env.BASE_URL+'assets/sprites/heroine-portrait.png';
const canvas=$('gameCanvas'),engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});
const scene=new Scene(engine);
scene.clearColor=new Color4(.045,.055,.11,1);
const light=new HemisphericLight('ambient',new Vector3(.2,1,.2),scene); light.intensity=.7;
const sun=new DirectionalLight('sun',new Vector3(-.4,-1,.5),scene);sun.intensity=.9;
const camera=new ArcRotateCamera('follow',Math.PI/2,1.05,32,new Vector3(0,0,12),scene);
camera.inputs.clear(); camera.fov=.68;
const mat=(name,hex)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(.19,.19,.22);return m;};
const groundMat=mat('lane','#62728f'),railMat=mat('rail','#606f90'),heroMat=mat('hero','#65b8ff'),enemyMat=mat('enemy','#f04c7f'),bossMat=mat('boss','#8336a9'),hairMat=mat('hair','#c2a6ff'),whiteMat=mat('white','#efedf8'),gateBlue=mat('blueGate','#348cfa'),gateGold=mat('goldGate','#f0b64e');
const ground=MeshBuilder.CreateGround('floor',{width:13,height:105},scene);ground.position.z=45;ground.material=groundMat;
for(const x of [-6.75,6.75]){const wall=MeshBuilder.CreateBox('parapet',{width:.8,height:1.55,depth:105},scene);wall.position.set(x,.7,45);wall.material=railMat;}
for(let z=0;z<90;z+=4){const strip=MeshBuilder.CreateBox('stripe',{width:12,height:.025,depth:.075},scene);strip.position.set(0,.02,z);strip.material=whiteMat;strip.visibility=.15;}
function box(name,w,h,d,x,y,z,material,parent){const mesh=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);mesh.position.set(x,y,z);mesh.material=material;if(parent)mesh.parent=parent;return mesh;}
function label(text,color,parent,y){const plane=MeshBuilder.CreatePlane('sign',{width:3.2,height:1.35},scene);plane.parent=parent;plane.position.y=y;plane.rotation.y=Math.PI;const dt=new DynamicTexture('text',{width:512,height:210},scene,true);dt.hasAlpha=true;dt.drawText(text,null,151,'bold 133px Arial',color,'#202744',true);const sm=new StandardMaterial('textMat',scene);sm.diffuseTexture=dt;sm.emissiveColor=new Color3(.95,.95,.95);sm.backFaceCulling=false;plane.material=sm;return plane;}
const heroine=new TransformNode('heroRoot',scene);heroine.position.set(0,0,3);
const body=MeshBuilder.CreateCapsule('prototype hero',{radius:.43,height:1.75},scene);body.parent=heroine;body.position.y=1;body.material=heroMat;
const head=MeshBuilder.CreateSphere('head',{diameter:.83},scene);head.parent=heroine;head.position.y=2.1;head.material=whiteMat;
const hair=MeshBuilder.CreateSphere('hair',{diameter:.88,segments:12},scene);hair.parent=heroine;hair.position.set(0,2.34,-.12);hair.scaling.y=.52;hair.material=hairMat;
box('weapon',.18,.15,.82,.42,1.32,.35,railMat,heroine);
const gates=[
 {z:17,done:false,choices:[{x:-3,kind:'add',value:5,material:gateBlue},{x:3,kind:'multiply',value:3,material:gateGold}]},
 {z:37,done:false,choices:[{x:-3,kind:'add',value:30,material:gateBlue},{x:3,kind:'multiply',value:2,material:gateGold}]},
 {z:55,done:false,choices:[{x:-3,kind:'add',value:15,material:gateBlue},{x:3,kind:'multiply',value:2,material:gateGold}]}
];
for(const gate of gates)for(const c of gate.choices){const r=new TransformNode('gate',scene);r.position.set(c.x,0,gate.z);box('gateFoot',3.6,.24,.26,0,.14,0,c.material,r);box('gateLeft',.2,2.55,.3,-1.7,1.35,0,c.material,r);box('gateRight',.2,2.55,.3,1.7,1.35,0,c.material,r);box('gateTop',3.6,.25,.3,0,2.5,0,c.material,r);box('gateBackplate',3.1,1.55,.14,0,1.43,0,c.material,r);label(c.kind==='multiply'?'×'+c.value:'+'+c.value,'#ffffff',r,1.45);}
// Breakable 300 HP siege barricade. Only Babylon meshes, PNG and CSS; no SVG.
const woodMat=mat('siegeOak','#875737'),ironMat=mat('siegeIron','#33384f');
const barricadeRoot=new TransformNode('siegeBarricade',scene);
barricadeRoot.position.set(0,0,BARRICADE_Z);
const barricadePlanks=[];
for(let i=0;i<15;i++){
 const x=-5.6+i*.8,height=1.95+(i%3)*.1;
 const plank=box('woodPlank'+i,.75,height,.38,x,height/2,-.02,woodMat,barricadeRoot);
 barricadePlanks.push({mesh:plank,x,originalY:height/2,index:i});
}
for(const y of [.52,1.6])box('ironBrace',12,.15,.32,0,y,-.37,ironMat,barricadeRoot);
for(const x of [-5.95,5.95])box('siegePost',.4,2.4,.5,x,1.2,-.12,ironMat,barricadeRoot);
const barricadeBillboard=MeshBuilder.CreatePlane('barrierHPInWorld',{width:3.1,height:1.15},scene);
barricadeBillboard.parent=barricadeRoot;barricadeBillboard.position.set(0,2.5,-.5);barricadeBillboard.rotation.y=Math.PI;
const barricadeText=new DynamicTexture('barrierNumber',{width:512,height:192},scene,true);
barricadeText.hasAlpha=true;
const barricadeLabelMat=new StandardMaterial('barrierNumberInk',scene);
barricadeLabelMat.diffuseTexture=barricadeText;barricadeLabelMat.emissiveColor=new Color3(1,1,1);barricadeLabelMat.backFaceCulling=false;
barricadeBillboard.material=barricadeLabelMat;
let barricadeLastHp=-1,barricadeBrokeAt=-1;
function updateBarricadeLabel(hp){
 const rounded=Math.ceil(Math.max(0,hp));
 if(rounded===barricadeLastHp)return;
 barricadeLastHp=rounded;
 barricadeText.drawText(String(rounded),null,143,'bold 130px Arial','#fff6df','#2c2434',true);
}
updateBarricadeLabel(BARRICADE_MAX_HP);
const mobRoot=new TransformNode('mobRoot',scene);
let soldierTemplate=MeshBuilder.CreateCapsule('squad proto',{radius:.27,height:1.1},scene);soldierTemplate.isVisible=false;soldierTemplate.material=heroMat;
let squadScale=1,squadBaseY=.58;let activeBillboards=false;const allySprites=[];
let soldierMeshes=[];
function drawSquad(count){const visible=Math.min(110,Math.floor(count));
if(activeBillboards){
 while(allySprites.length<visible){
  const sprite=new Sprite('femaleAlly'+allySprites.length,allySpriteManager);
  sprite.width=.86;sprite.height=1.36;
  allySprites.push(sprite);
 }
 for(let i=0;i<allySprites.length;i++){
  const sprite=allySprites[i];sprite.isVisible=i<visible;
  if(i<visible){
   const col=i%11,row=Math.floor(i/11);
   sprite.position.set(heroine.position.x+(col-5)*.42,.76,heroine.position.z-1.3-row*.55);
  }
 }
 return;
}
while(soldierMeshes.length<visible){const a=soldierTemplate.createInstance('soldier'+soldierMeshes.length);a.scaling.setAll(squadScale);soldierMeshes.push(a);}
soldierMeshes.forEach((a,i)=>{a.isVisible=i<visible;if(i<visible){const col=i%11,row=Math.floor(i/11);a.position.set(heroine.position.x+(col-5)*.37,squadBaseY+Math.sin(state.time*7+i*.7)*.045,heroine.position.z-1.2-row*.54);}});}
let allySpriteManager=null,enemySpriteManager=null;
const enemyBase=MeshBuilder.CreateCapsule('enemy base',{radius:.28,height:1.3},scene);enemyBase.isVisible=false;enemyBase.material=enemyMat;
const enemies=[];for(let i=0;i<135;i++){const n=enemyBase.createInstance('enemy_'+i);n.position.set((i%13-6)*.66,.7,25+Math.floor(i/13)*1.65);enemies.push(n);}
const bossRoot=new TransformNode('bossRoot',scene);bossRoot.position.set(0,0,77);
const warningMat=mat('bossWarning','#ff4e83');warningMat.alpha=.3;warningMat.emissiveColor=new Color3(.8,.1,.3);
const warning=MeshBuilder.CreateGround('bossWarningZone',{width:3.4,height:15},scene);
warning.material=warningMat;warning.position.y=.12;warning.setEnabled(false);
const outerWarnings=[-3.55,3.55].map((x,i)=>{
 const lane=MeshBuilder.CreateGround('bossSideWarning'+i,{width:3.9,height:15},scene);
 lane.material=warningMat;lane.position.set(x,.13,71.5);lane.setEnabled(false);return lane;
});
function clearBossWarnings(){warning.setEnabled(false);warning.scaling.x=1;outerWarnings.forEach(w=>w.setEnabled(false));}
function showBossWarnings(attack){
 clearBossWarnings();
 const playerZ=state.z+1.5;
 if(attack.type==='sweep'){for(const w of outerWarnings){w.position.z=playerZ;w.setEnabled(true);}}
 else{warning.position.set(attack.lane,.12,playerZ);warning.scaling.x=attack.type==='pulse'?1.65:1;warning.setEnabled(true);}
}
let bossAttackTime=0,bossPreviousPhase=1,attackCount=0,pendingAttack=null,shotCooldown=0;
let bossAnimationGroups=null,hitFlashUntil=0,bossPulseUntil=0;
const bulletMat=mat('projectileMaterial','#ffe88e');bulletMat.emissiveColor=new Color3(.8,.65,.1);
const bullets=Array.from({length:26},(_,i)=>{const mesh=MeshBuilder.CreateSphere('shot'+i,{diameter:.18,segments:6},scene);mesh.material=bulletMat;mesh.setEnabled(false);return {mesh,life:0};});

box('boss armor',4.2,5,2.6,0,4,0,bossMat,bossRoot);const bossHead=MeshBuilder.CreateSphere('boss head',{diameter:3.3},scene);bossHead.parent=bossRoot;bossHead.position.y=7.8;bossHead.material=whiteMat;
const bossHair=MeshBuilder.CreateSphere('boss hair',{diameter:3.45},scene);bossHair.parent=bossRoot;bossHair.position.set(0,8.75,-.25);bossHair.scaling.y=.65;bossHair.material=hairMat;
for(const x of [-2.55,2.55])box('boss gauntlet',1.25,4.5,1.6,x,4.2,0,bossMat,bossRoot);
box('boss left boot',1.4,3,1.7,-1,1.1,0,railMat,bossRoot);box('boss right boot',1.4,3,1.7,1,1.1,0,railMat,bossRoot);
const state={running:false,paused:false,finished:false,z:3,x:0,units:12,score:0,enemyCount:135,bossHp:1600,maxBossHp:1600,wallHp:BARRICADE_MAX_HP,wallStoppedSeconds:0,wallDamage:0,time:0};
let input=0,pointerStart=null;
const bossPrototypeMeshes=bossRoot.getChildMeshes();
async function decorateStage(){
 const home=import.meta.env.BASE_URL+'assets/environment/';
 const walls=[],towers=[],trees=[],rocks=[],flags=[];
 
 for(let z=1;z<92;z+=6.0){walls.push([-7.6,0,z,6.0],[7.6,0,z,6.0]);}
 for(let z=10;z<92;z+=16)towers.push([-6.8,0,z,3.7],[6.8,0,z,3.7]);
 for(let z=7;z<96;z+=13)trees.push([-13,0,z,3], [12.5,0,z+5,2.7]);
 for(let z=11;z<96;z+=18)rocks.push([-10.4,0,z,2.1],[11,0,z+8,2.3]);
 flags.push([-6.7,3.4,72,3.2],[6.7,3.4,72,3.2]);
 const stoneMat=mat('castleStone','#8291aa'),towerMat=mat('castlePillars','#aab5c8'),forestMat=mat('woodland','#3f8f75'),rocksMat=mat('stones','#627288'),bannerMat=mat('castleBanners','#ab779e');
 
 // Castle side walls are batched modular stone blocks while GLB wall-block is
 // excluded: its upstream texture is not supported in Chromium and caused a silent fallback.
 for(let z=1;z<92;z+=6){
  for(const x of [-7.25,7.25]){
   const outer=box('castleStoneSegment',.75,2.5,5.75,x,1.18,z,stoneMat);
   outer.freezeWorldMatrix();
  }
 }
 // The source pillar-stone GLB has an unsupported embedded texture in Chromium.
 // Use optimized low-poly stone pillars here while preserving other approved GLBs.
 for(const [x,,z,scale] of towers){
  const column=MeshBuilder.CreateCylinder('stoneTower',{height:scale,diameter:.65,tessellation:8},scene);
  column.position.set(x,scale/2,z);column.material=towerMat;column.freezeWorldMatrix();
  const cap=MeshBuilder.CreateCylinder('stoneTowerCap',{height:.32,diameter:1.12,tessellation:8},scene);
  cap.position.set(x,scale+.13,z);cap.material=stoneMat;cap.freezeWorldMatrix();
 }
 const designs=[['tree',trees,forestMat],['rock-large',rocks,rocksMat],['banner-red',flags,bannerMat]];
 await Promise.all(designs.map(async ([name,locations,material])=>{
  try {
   const pack=await SceneLoader.ImportMeshAsync('',home,name+'.glb',scene);
   const template=pack.meshes.find(m=>!m.parent)||pack.meshes[0];
   if(material)for(const mesh of pack.meshes)if(mesh.material&&mesh.getTotalVertices&&mesh.getTotalVertices()>0)mesh.material=material;
   if(!template||!template.clone)throw Error('No GLB root for '+name);
   for(let i=0;i<locations.length;i++){
    const [x,y,z,scale]=locations[i],copy=template.clone(name+'_instance_'+i,null,false);
    if(!copy)continue;
    copy.position.set(x,y,z);copy.scaling.scaleInPlace(scale);copy.setEnabled(true);
   }
   template.setEnabled(false);
  }catch(e){console.warn('Optional environment prop failed',name,e);}
 }));
}
decorateStage();

const say=(text)=>{const target=$('message');target.textContent=text;target.classList.add('show');setTimeout(()=>target.classList.remove('show'),1000);};
function renderHud(){
 $('units').textContent=state.units.toLocaleString();
 $('score').textContent=state.score.toLocaleString();
 $('bossHp').textContent=state.z>60?Math.max(0,Math.ceil(state.bossHp)).toLocaleString():'—';
 const wallRemaining=Math.max(0,Math.ceil(state.wallHp));
 const wallTrack=$('wallBar');
 wallTrack.classList.toggle('active',state.z>=45&&wallRemaining>0);
 $('wallHpLabel').textContent=wallRemaining.toLocaleString()+' / '+BARRICADE_MAX_HP;
 $('wallBarFill').style.width=(100*wallRemaining/BARRICADE_MAX_HP).toFixed(1)+'%';
 wallTrack.setAttribute('aria-valuenow',String(wallRemaining));
 const showBoss=state.z>=66;
 const track=$('bossBar');
 track.classList.toggle('active',showBoss);
 const value=Math.max(0,Math.ceil(state.bossHp));
 $('bossBarText').textContent=value.toLocaleString()+' / '+state.maxBossHp.toLocaleString();
 $('bossPhase').textContent='PHASE '+phaseForHp(value,state.maxBossHp);
 const health=$('bossBarFill');
 health.style.width=(100*value/state.maxBossHp).toFixed(1)+'%';
 track.setAttribute('aria-valuenow',String(value));
}
function reset(){Object.assign(state,{running:true,paused:false,finished:false,z:3,x:0,units:12,score:0,enemyCount:135,bossHp:1600,wallHp:BARRICADE_MAX_HP,wallStoppedSeconds:0,wallDamage:0,time:0});
 $('pausePanel').classList.add('hidden');$('pauseBtn').setAttribute('aria-pressed','false');$('pauseBtn').textContent='Ⅱ';
 bossAttackTime=0;bossPreviousPhase=1;attackCount=0;pendingAttack=null;shotCooldown=0;hitFlashUntil=0;bossPulseUntil=0;
 clearBossWarnings();$('hitFlash').classList.remove('active');$('attackText').textContent='다음 공격 대기';
 barricadeBrokeAt=-1;barricadeRoot.setEnabled(true);barricadeBillboard.setEnabled(true);
 barricadeLastHp=-1;updateBarricadeLabel(BARRICADE_MAX_HP);
 for(const p of barricadePlanks){p.mesh.position.set(p.x,p.originalY,-.02);p.mesh.rotation.z=0;}
 lastBossAnimation='Idle';
 if(bossAnimationGroups?.length){bossAnimationGroups.forEach(g=>g.stop());bossAnimationGroups.find(g=>g.name==='Idle')?.start(true,.75);}
 bullets.forEach(b=>{b.life=0;b.mesh.setEnabled(false);});
gates.forEach(g=>g.done=false);enemies.forEach(e=>e.isVisible=true);$('front').classList.add('hidden');heroine.position.z=3;heroine.position.x=0;renderHud();}
$('startBtn').addEventListener('click',reset);
function togglePause(){
 if(!state.running || state.finished)return;
 state.paused=!state.paused;
 $('pausePanel').classList.toggle('hidden',!state.paused);
 $('pauseBtn').textContent=state.paused?'▶':'Ⅱ';
 $('pauseBtn').setAttribute('aria-pressed',String(state.paused));
}
$('pauseBtn').addEventListener('click',togglePause);
$('resumeBtn').addEventListener('click',togglePause);
window.addEventListener('keydown',e=>{if(e.key==='p'||e.key==='P'||e.key==='Escape'){e.preventDefault();togglePause();return;}if(['ArrowLeft','a','A'].includes(e.key))input=-1;if(['ArrowRight','d','D'].includes(e.key))input=1;if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
window.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key))input=0;});
canvas.addEventListener('pointerdown',e=>{pointerStart=e.clientX;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(pointerStart!==null){state.x=clamp(state.x+(e.clientX-pointerStart)*.014,-4.9,4.9);pointerStart=e.clientX;}});
canvas.addEventListener('pointerup',()=>pointerStart=null);
function complete(win){state.running=false;state.finished=true;$('front').classList.remove('hidden');$('front').querySelector('h1').innerHTML=win?'작전 <em>성공</em>':'작전 <em>실패</em>';$('front').querySelector('.eyebrow').textContent=win?'MISSION CLEARED':'MISSION FAILED';$('startBtn').innerHTML='다시 도전 →';}
async function tryLoadApprovedModel(path,parent,scale,clip='Idle'){try{const exists=await fetch(path,{method:'HEAD'});if(!exists.ok)return false;const file=path.split('/').pop(),dir=path.slice(0,path.lastIndexOf('/')+1);const result=await SceneLoader.ImportMeshAsync('',dir,file,scene);const group=new TransformNode('approvedArt',scene);group.parent=parent;group.scaling.setAll(scale);result.meshes.forEach(m=>{if(!m.parent)m.parent=group;});if(parent===heroine){[body,head,hair].forEach(m=>m.setEnabled(false));scene.getMeshByName('weapon')?.setEnabled(false);}
if(parent===bossRoot){bossPrototypeMeshes.forEach(m=>m.setEnabled(false));bossAnimationGroups=result.animationGroups||null;}
const animation=result.animationGroups?.find(a=>a.name===clip)||result.animationGroups?.find(a=>a.name==='Idle');
if(animation)animation.start(true,/^Run/.test(clip)?1.05:.75);
return true;
}catch(e){console.warn('Approved model not loaded',path,e);return false;}}
const characterBase=import.meta.env.BASE_URL+'assets/characters/';
tryLoadApprovedModel(characterBase+'medieval.glb',heroine,1.25,'Run_Shoot').then(ok=>{if(!ok)tryLoadApprovedModel(import.meta.env.BASE_URL+'assets/approved/hero.glb',heroine,1);});
tryLoadApprovedModel(characterBase+'witch.glb',bossRoot,4.2,'Idle').then(ok=>{if(!ok)tryLoadApprovedModel(import.meta.env.BASE_URL+'assets/approved/hero.glb',bossRoot,4.1);});
const supportRoot=new TransformNode('scifiSupport',scene);supportRoot.parent=heroine;supportRoot.position.set(-1.45,0,-1.1);
const eliteRoot=new TransformNode('soldierElite',scene);eliteRoot.parent=heroine;eliteRoot.position.set(1.45,0,-1.1);
tryLoadApprovedModel(characterBase+'scifi.glb',supportRoot,.78,'Run_Shoot');
tryLoadApprovedModel(characterBase+'soldier.glb',eliteRoot,.78,'Run_Shoot');
let lastBossAnimation='Idle';
function triggerBossAnimation(pattern){
 if(!bossAnimationGroups?.length)return;
 const clip=pattern==='lane'?'Sword_Slash':pattern==='sweep'?'Gun_Shoot':'Punch_Left';
 const attack=bossAnimationGroups.find(group=>group.name===clip);
 if(!attack)return;
 lastBossAnimation=clip;
 const idle=bossAnimationGroups.find(group=>group.name==='Idle');
 if(idle)idle.stop();
 attack.stop();attack.start(false,1.15);
 attack.onAnimationGroupEndObservable.addOnce(()=>{if(state.running&&idle)idle.start(true,.75);});
}
function playBossDefeat(){
 if(!bossAnimationGroups?.length)return;
 bossAnimationGroups.forEach(group=>group.stop());
 const death=bossAnimationGroups.find(group=>group.name==='Death');
 if(death){lastBossAnimation='Death';death.start(false,.88);}
}
async function loadSquadArt(){
 const path=import.meta.env.BASE_URL+'assets/approved/hero.glb';
 try{
  const loaded=await SceneLoader.ImportMeshAsync('',path.slice(0,path.lastIndexOf('/')+1),'hero.glb',scene);
  const mesh=loaded.meshes.find(m=>m.getTotalVertices&&m.getTotalVertices()>0);
  if(!mesh)throw Error('No static crowd mesh');
  mesh.setParent(null);mesh.position.set(9999,-1000,9999);
  mesh.alwaysSelectAsActiveMesh=true;
  // One 256-triangle licensed female mesh can be GPU-instanced for both sides.
  // This replaces the generic pink enemy capsules without per-soldier rigs.
  const redSource=mesh.clone('enemyFemaleSource');
  redSource.material=enemyMat;redSource.position.set(-9999,-1000,-9999);
  redSource.alwaysSelectAsActiveMesh=true;
  enemies.forEach((old,i)=>{
   const copy=redSource.createInstance('femaleEnemy_'+i);
   copy.position.copyFrom(old.position);copy.position.y=.01;
   copy.scaling.setAll(.53);copy.isVisible=old.isVisible;
   old.dispose();enemies[i]=copy;
  });
  soldierMeshes.forEach(s=>s.dispose());soldierMeshes=[];
  soldierTemplate=mesh;squadScale=.49;squadBaseY=.02;
 }catch(e){console.warn('Female squad prototype unavailable',e);}
}
loadSquadArt();
async function initCrowdBillboards(){
 try{
  const base=import.meta.env.BASE_URL+'assets/sprites/';
  const sprites=['ally-female.png','enemy-female.png'];
  const available=await Promise.all(sprites.map(async file=>{
   const reply=await fetch(base+file,{method:'HEAD'});return reply.ok;
  }));
  if(!available.every(Boolean))return;
  allySpriteManager=new SpriteManager('licensedFemaleAllies',base+sprites[0],120,{width:384,height:512},scene);
  enemySpriteManager=new SpriteManager('licensedFemaleEnemies',base+sprites[1],160,{width:384,height:512},scene);
  allySpriteManager.isPickable=false;enemySpriteManager.isPickable=false;
  const world=enemies.map(enemy=>({pos:enemy.position.clone(),visible:enemy.isVisible}));
  const replacements=world.map((entry,i)=>{
   const sprite=new Sprite('femaleEnemy'+i,enemySpriteManager);
   sprite.width=1.0;sprite.height=1.48;sprite.color=new Color4(1,.55,.68,1);
   sprite.position.set(entry.pos.x,.78,entry.pos.z);
   sprite.isVisible=entry.visible;return sprite;
  });
  enemies.forEach(e=>e.dispose());
  enemies.splice(0,enemies.length,...replacements);
  soldierMeshes.forEach(m=>m.dispose());
  soldierMeshes=[];soldierTemplate.setEnabled(false);
  activeBillboards=true;
  console.info('Female PNG impostors enabled for crowd:',world.length);
 }catch(error){console.warn('PNG female crowd setup failed; retaining 3D fallback',error);}
}
initCrowdBillboards();
function tickBullets(dt){
 shotCooldown-=dt;
 if(state.running&&!state.paused&&shotCooldown<=0&&state.z>21&&state.z<91){
  shotCooldown=state.z>64?.09:.135;
  const found=bullets.find(p=>p.life<=0);
  if(found){found.life=.42;found.mesh.position.set(state.x+.4,1.28,state.z+.8);found.mesh.setEnabled(true);}
 }
 for(const b of bullets)if(b.life>0){b.life-=dt;b.mesh.position.z+=30*dt;if(b.life<=0)b.mesh.setEnabled(false);}
}

engine.runRenderLoop(()=>{const dt=Math.min(engine.getDeltaTime()/1000,.35);if(state.running&&!state.paused){state.time+=dt;state.x=clamp(state.x+input*dt*7.2,-4.9,4.9);if(state.z<70)state.z=Math.min(70,advanceTowardsBarricade(state.z,dt*5.6,state.wallHp));
if(state.wallHp>0 && state.z>=BARRICADE_HOLD_Z-.001){
 state.wallStoppedSeconds+=dt;
 const result=stepBarricade(state.wallHp,state.units,dt);
 state.wallHp=result.hp;state.wallDamage+=result.damage;
 updateBarricadeLabel(state.wallHp);
 if(result.destroyed){barricadeBrokeAt=state.time;say('방벽 파괴! +300');state.score+=300;barricadeBillboard.setEnabled(false);}
}
if(barricadeBrokeAt>=0){
 const age=state.time-barricadeBrokeAt;
 for(const p of barricadePlanks){
  const side=p.x<0?-1:1;
  p.mesh.position.y=p.originalY-Math.min(3,age*2.8);
  p.mesh.rotation.z=side*Math.min(1.5,age*1.3+(p.index%3)*.12);
 }
 if(age>1.5)barricadeRoot.setEnabled(false);
}
heroine.position.x=state.x;heroine.position.z=state.z;heroine.rotation.z=input*-.07;
for(const g of gates){if(!g.done&&state.z>=g.z){g.done=true;const choice=g.choices[state.x>=0?1:0];state.units=applyGate(state.units,choice.kind,choice.value);state.score+=120;say(choice.kind==='multiply'?'병력 ×'+choice.value:'병력 +'+choice.value);}}
if(state.z>26&&state.z<59&&state.enemyCount>0){const defeated=Math.min(state.enemyCount,dt*(5+state.units*.38));state.enemyCount-=defeated;state.score+=Math.ceil(defeated*3);const alive=Math.ceil(state.enemyCount);enemies.forEach((e,i)=>e.isVisible=i<alive);if(state.time%2<dt&&state.units>1)state.units=Math.max(1,state.units-1);}
if(state.z>66){
 const phase=phaseForHp(state.bossHp,state.maxBossHp);
 if(phase!==bossPreviousPhase){say('보스 '+phase+'페이즈!');bossPreviousPhase=phase;bossPulseUntil=state.time+.55;}
 const damage=dt*(state.units*(phase===3?1.2:1.8)+15);
 state.bossHp-=damage;
 bossRoot.rotation.y=Math.sin(state.time*2)*.14;
 bossRoot.scaling.x=bossRoot.scaling.z=1+(state.time<bossPulseUntil?.045:0);
 if(!pendingAttack && state.time>=bossAttackTime && state.bossHp>0){
  pendingAttack=makeBossAttack(phase,attackCount++,state.x,state.time);
  bossAttackTime=pendingAttack.nextAttackAt;
  showBossWarnings(pendingAttack);triggerBossAnimation(pendingAttack.type);
  $('attackText').textContent=pendingAttack.title+' · 회피!';
 }
 if(pendingAttack && state.time>=pendingAttack.executeAt){
  clearBossWarnings();
  if(hitsHero(pendingAttack,state.x)){
   const casualties=bossCasualties(state.units,pendingAttack);
   state.units=Math.max(0,state.units-casualties);
   hitFlashUntil=state.time+.25;
   say('피격! -'+casualties+'명');
  }else{
   state.score+=40;say('완벽 회피 +40');
  }
  pendingAttack=null;$('attackText').textContent='다음 공격 대기';
 }
 if(state.bossHp<=0){state.bossHp=0;state.score+=10000;pendingAttack=null;clearBossWarnings();playBossDefeat();complete(true);}
 else if(state.units<=0){pendingAttack=null;clearBossWarnings();complete(false);}
}
$('hitFlash').classList.toggle('active',state.running&&state.time<hitFlashUntil);
if(state.z>94)complete(false);
renderHud();}
tickBullets(state.paused?0:dt);drawSquad(state.units);camera.target.set(state.x*.18,0,state.z+2.7);camera.position.set(state.x*.22,12.8,state.z-10.2);scene.render();});
// Read-only QA telemetry; does not change gameplay.
window.__defenseQa=()=>({running:state.running,paused:state.paused,finished:state.finished,bossPattern:pendingAttack?.type||'none',attacksLaunched:attackCount,bossLastAnimation:lastBossAnimation,bossAnimationsLoaded:bossAnimationGroups?.length||0,z:+state.z.toFixed(2),units:state.units,score:state.score,bossHp:Math.ceil(state.bossHp),wallHp:Math.ceil(state.wallHp),wallDamage:Math.round(state.wallDamage),wallStoppedSeconds:+state.wallStoppedSeconds.toFixed(2),elapsed:+state.time.toFixed(2),fps:Math.round(engine.getFps()),meshes:scene.meshes.length,billboards:activeBillboards,enemySprites:activeBillboards?enemies.length:0,allySprites:allySprites.length,sceneReady:scene.isReady()});
window.addEventListener('resize',()=>engine.resize());
