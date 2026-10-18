import { Engine,Scene,Vector3,Color3,Color4,HemisphericLight,DirectionalLight,ArcRotateCamera,SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
// Isolated, SVG-free transparent PNG generation from the actual CC0 female meshes.
const canvas=document.getElementById('render');
const engine=new Engine(canvas,false,{preserveDrawingBuffer:true,premultipliedAlpha:false,alpha:true,stencil:false},false);
const scene=new Scene(engine);
scene.clearColor=new Color4(0,0,0,0);
const amb=new HemisphericLight('ambient',new Vector3(.15,1,0),scene);amb.intensity=1.45;
const key=new DirectionalLight('softbox',new Vector3(-.4,-.85,.5),scene);key.intensity=.9;
window.__spriteStatus={ready:false,error:null};
async function prepareSprite(){
try{
 const model=new URLSearchParams(location.search).get('model')||'soldier';
 if(!['soldier','scifi','medieval','witch'].includes(model))throw new Error('Invalid character '+model);
 const result=await SceneLoader.ImportMeshAsync('',import.meta.env.BASE_URL+'assets/characters/',model+'.glb',scene);
 const meshes=result.meshes.filter(m=>m.getBoundingInfo&&m.getTotalVertices&&m.getTotalVertices()>0);
 if(!meshes.length)throw new Error('No model geometry');
 result.animationGroups?.forEach(a=>a.stop());
 const idle=result.animationGroups?.find(a=>a.name==='Idle');
 idle?.goToFrame(2);
 let min=new Vector3(Infinity,Infinity,Infinity),max=new Vector3(-Infinity,-Infinity,-Infinity);
 for(const m of meshes){m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;
  min=Vector3.Minimize(min,b.minimumWorld);max=Vector3.Maximize(max,b.maximumWorld);}
 const center=Vector3.Center(min,max),height=Math.max(.5,max.y-min.y),width=Math.max(.5,max.x-min.x);
 const camera=new ArcRotateCamera('portrait',-Math.PI/2,Math.PI/2.1,Math.max(height*1.7,width*2.8),center,scene);
 camera.inputs.clear();camera.mode=0;camera.fov=.52;
 window.__spriteCamera=camera;window.__spriteModel=model;
 let frame=0;
 engine.runRenderLoop(()=>{scene.render();frame++;if(frame>=12)window.__spriteStatus.ready=true;});
 window.addEventListener('beforeunload',()=>engine.dispose());
}catch(e){window.__spriteStatus.error=String(e?.stack||e);}
}
prepareSprite();
