import { Engine, Scene, Vector3, Color3, Color4, HemisphericLight, DirectionalLight, ArcRotateCamera, MeshBuilder, StandardMaterial, DynamicTexture, TransformNode, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {applyGate,phaseForHp,clamp} from './logic.js';
import './style.css';

const $=id=>document.getElementById(id);
const canvas=$('gameCanvas'),engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});
const scene=new Scene(engine);
scene.clearColor=new Color4(.045,.055,.11,1);
const light=new HemisphericLight('ambient',new Vector3(.2,1,.2),scene); light.intensity=.85;
const sun=new DirectionalLight('sun',new Vector3(-.4,-1,.5),scene);sun.intensity=1.25;
const camera=new ArcRotateCamera('follow',Math.PI/2,1.05,32,new Vector3(0,0,12),scene);
camera.inputs.clear(); camera.fov=.74;
const mat=(name,hex)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(.19,.19,.22);return m;};
const groundMat=mat('lane','#8992b2'),railMat=mat('rail','#4b5378'),heroMat=mat('hero','#65b8ff'),enemyMat=mat('enemy','#f04c7f'),bossMat=mat('boss','#8336a9'),hairMat=mat('hair','#c2a6ff'),whiteMat=mat('white','#efedf8'),gateBlue=mat('blueGate','#348cfa'),gateGold=mat('goldGate','#f0b64e');
const ground=MeshBuilder.CreateGround('floor',{width:13,height:105},scene);ground.position.z=45;ground.material=groundMat;
for(const x of [-6.75,6.75]){const wall=MeshBuilder.CreateBox('parapet',{width:.8,height:1.55,depth:105},scene);wall.position.set(x,.7,45);wall.material=railMat;}
for(let z=0;z<90;z+=4){const strip=MeshBuilder.CreateBox('stripe',{width:12,height:.025,depth:.075},scene);strip.position.set(0,.02,z);strip.material=whiteMat;strip.visibility=.15;}
function box(name,w,h,d,x,y,z,material,parent){const mesh=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);mesh.position.set(x,y,z);mesh.material=material;if(parent)mesh.parent=parent;return mesh;}
function label(text,color,parent,y){const plane=MeshBuilder.CreatePlane('sign',{width:3.2,height:1.35},scene);plane.parent=parent;plane.position.y=y;plane.rotation.y=Math.PI;const dt=new DynamicTexture('text',{width:512,height:210},scene,true);dt.hasAlpha=true;dt.drawText(text,null,151,'bold 120px Arial',color,'transparent',true);const sm=new StandardMaterial('textMat',scene);sm.diffuseTexture=dt;sm.emissiveColor=new Color3(.95,.95,.95);sm.backFaceCulling=false;plane.material=sm;return plane;}
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
for(const gate of gates)for(const c of gate.choices){const r=new TransformNode('gate',scene);r.position.set(c.x,0,gate.z);box('gateFoot',3.6,.24,.26,0,.14,0,c.material,r);box('gateLeft',.2,2.55,.3,-1.7,1.35,0,c.material,r);box('gateRight',.2,2.55,.3,1.7,1.35,0,c.material,r);box('gateTop',3.6,.25,.3,0,2.5,0,c.material,r);label(c.kind==='multiply'?'×'+c.value:'+'+c.value,'#ffffff',r,1.45);}
const mobRoot=new TransformNode('mobRoot',scene);
const soldierTemplate=MeshBuilder.CreateCapsule('squad proto',{radius:.27,height:1.1},scene);soldierTemplate.isVisible=false;soldierTemplate.material=heroMat;
let soldierMeshes=[];
function drawSquad(count){const visible=Math.min(110,Math.floor(count));while(soldierMeshes.length<visible){const a=soldierTemplate.createInstance('soldier'+soldierMeshes.length);soldierMeshes.push(a);}
soldierMeshes.forEach((a,i)=>{a.isVisible=i<visible;if(i<visible){const col=i%11,row=Math.floor(i/11);a.position.set(heroine.position.x+(col-5)*.37,.58,heroine.position.z-1.2-row*.54);}});}
const enemyBase=MeshBuilder.CreateCapsule('enemy base',{radius:.28,height:1.3},scene);enemyBase.isVisible=false;enemyBase.material=enemyMat;
const enemies=[];for(let i=0;i<135;i++){const n=enemyBase.createInstance('enemy_'+i);n.position.set((i%13-6)*.66,.7,25+Math.floor(i/13)*1.65);enemies.push(n);}
const bossRoot=new TransformNode('bossRoot',scene);bossRoot.position.set(0,0,77);
box('boss armor',4.2,5,2.6,0,4,0,bossMat,bossRoot);const bossHead=MeshBuilder.CreateSphere('boss head',{diameter:3.3},scene);bossHead.parent=bossRoot;bossHead.position.y=7.8;bossHead.material=whiteMat;
const bossHair=MeshBuilder.CreateSphere('boss hair',{diameter:3.45},scene);bossHair.parent=bossRoot;bossHair.position.set(0,8.75,-.25);bossHair.scaling.y=.65;bossHair.material=hairMat;
for(const x of [-2.55,2.55])box('boss gauntlet',1.25,4.5,1.6,x,4.2,0,bossMat,bossRoot);
box('boss left boot',1.4,3,1.7,-1,1.1,0,railMat,bossRoot);box('boss right boot',1.4,3,1.7,1,1.1,0,railMat,bossRoot);
const state={running:false,finished:false,z:3,x:0,units:12,score:0,enemyCount:135,bossHp:1600,maxBossHp:1600,time:0};
let input=0,pointerStart=null;
const say=(text)=>{const target=$('message');target.textContent=text;target.classList.add('show');setTimeout(()=>target.classList.remove('show'),1000);};
function renderHud(){ $('units').textContent=state.units.toLocaleString();$('score').textContent=state.score.toLocaleString();$('bossHp').textContent=state.z>60?Math.max(0,Math.ceil(state.bossHp)).toLocaleString():'—';}
function reset(){Object.assign(state,{running:true,finished:false,z:3,x:0,units:12,score:0,enemyCount:135,bossHp:1600,time:0});gates.forEach(g=>g.done=false);enemies.forEach(e=>e.isVisible=true);$('front').classList.add('hidden');heroine.position.z=3;heroine.position.x=0;renderHud();}
$('startBtn').addEventListener('click',reset);
window.addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))input=-1;if(['ArrowRight','d','D'].includes(e.key))input=1;if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
window.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(e.key))input=0;});
canvas.addEventListener('pointerdown',e=>{pointerStart=e.clientX;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(pointerStart!==null){state.x=clamp(state.x+(e.clientX-pointerStart)*.014,-4.9,4.9);pointerStart=e.clientX;}});
canvas.addEventListener('pointerup',()=>pointerStart=null);
function complete(win){state.running=false;state.finished=true;$('front').classList.remove('hidden');$('front').querySelector('h1').innerHTML=win?'작전 <em>성공</em>':'작전 <em>실패</em>';$('front').querySelector('.eyebrow').textContent=win?'MISSION CLEARED':'MISSION FAILED';$('startBtn').innerHTML='다시 도전 →';}
async function tryLoadApprovedModel(path,parent,scale){try{const exists=await fetch(path,{method:'HEAD'});if(!exists.ok)return;const file=path.split('/').pop(),dir=path.slice(0,path.lastIndexOf('/')+1);const result=await SceneLoader.ImportMeshAsync('',dir,file,scene);const group=new TransformNode('approvedArt',scene);group.parent=parent;group.scaling.setAll(scale);result.meshes.forEach(m=>{if(!m.parent)m.parent=group;});if(parent===heroine){[body,head,hair].forEach(m=>m.setEnabled(false));} }catch(e){console.warn('Approved model not loaded',e);}}
tryLoadApprovedModel(import.meta.env.BASE_URL+'assets/approved/hero.glb',heroine,1);
engine.runRenderLoop(()=>{const dt=Math.min(engine.getDeltaTime()/1000,.04);if(state.running){state.time+=dt;state.x=clamp(state.x+input*dt*7.2,-4.9,4.9);state.z+=dt*5.6;heroine.position.x=state.x;heroine.position.z=state.z;heroine.rotation.z=input*-.07;
for(const g of gates){if(!g.done&&state.z>=g.z){g.done=true;const choice=g.choices[state.x>=0?1:0];state.units=applyGate(state.units,choice.kind,choice.value);state.score+=120;say(choice.kind==='multiply'?'병력 ×'+choice.value:'병력 +'+choice.value);}}
if(state.z>26&&state.z<59&&state.enemyCount>0){const defeated=Math.min(state.enemyCount,dt*(5+state.units*.38));state.enemyCount-=defeated;state.score+=Math.ceil(defeated*3);const alive=Math.ceil(state.enemyCount);enemies.forEach((e,i)=>e.isVisible=i<alive);if(state.time%2<dt&&state.units>1)state.units=Math.max(1,state.units-1);}
if(state.z>66){const phase=phaseForHp(state.bossHp,state.maxBossHp);const damage=dt*(state.units*(phase===3?1.2:1.8)+15);state.bossHp-=damage;bossRoot.rotation.y=Math.sin(state.time*2)*.12;if(state.time%1.4<dt){state.units=Math.max(0,state.units-(phase+2));}if(state.bossHp<=0){state.bossHp=0;state.score+=10000;complete(true);}else if(state.units<=0)complete(false);}
if(state.z>94)complete(false);
renderHud();}
drawSquad(state.units);camera.target.set(state.x*.18,0,state.z+16);camera.position.set(state.x*.22,19,state.z-16);scene.render();});
window.addEventListener('resize',()=>engine.resize());
