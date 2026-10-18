// Lightweight real Three.js FIELD scene, separate from the existing playable village.
// Every faction is one visible 3D town-center model, scaled to its actual territory.
// Field graphics are not part of the village grid or saved data.
import * as THREE from 'three';
const a=Math.PI/6;
// Shared geometry: refreshing factions never allocates fresh WebGL buffers.
const platformGeometry=new THREE.CylinderGeometry(.72,.76,.23,6);
const bodyGeometry=new THREE.BoxGeometry(.68,.58,.64);
const roofGeometry=new THREE.ConeGeometry(.53,.55,4);
const towerGeometry=new THREE.CylinderGeometry(.14,.17,.70,8);
const castleMaterial=new THREE.MeshStandardMaterial({color:0xc9b98a,roughness:.9});
const enemyMaterial=new THREE.MeshStandardMaterial({color:0xa48670,roughness:.9});
const playerMaterial=new THREE.MeshStandardMaterial({color:0xc7ad66,roughness:.9});
const roofMaterial=new THREE.MeshStandardMaterial({color:0x7e4537,roughness:.85});
const playerRoofMaterial=new THREE.MeshStandardMaterial({color:0x4b786a,roughness:.85});
function tier(n){return n>=16?4:n>=9?3:n>=4?2:1;}
function normalize(q,r,limit) {return {x:8*(q+0.5*r)/limit,z:7*r/limit};}
export class RaniFieldScene {
  constructor(game){
    this.game=game;this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x7eab9b);
    this.scene.fog=new THREE.Fog(0x7eab9b,20,33);
    this.camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,80);
    this.camera.position.set(9,15,18);this.camera.lookAt(0,0,0);
    this.ray=new THREE.Raycaster();this.ndc=new THREE.Vector2();
    this.entries=[];this.active=false;
    this.focus=new THREE.Vector3(0,0,0);
    this.viewDirection=this.camera.position.clone().normalize();
    this.zoomDistance=this.camera.position.length();
    this.pointers=new Map();
    this.pinchDistance=0;
    this.lastTap=null;
    this.labels=document.createElement('div');
    this.labels.id='rani-field-labels';
    this.labels.hidden=true;
    document.body.appendChild(this.labels);
    this.labels.addEventListener('click',e=>{
      const el=e.target.closest('[data-field-faction]');
      if(!el)return;
      this.select(el.dataset.fieldFaction);
    });
    const hemi=new THREE.HemisphereLight(0xe9f6ee,0x66765a,2.1);this.scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xffebc0,2);sun.position.set(-6,15,8);this.scene.add(sun);
    this.terrain=new THREE.Group();this.scene.add(this.terrain);
    this._createTerrain();
    this.towns=new THREE.Group();this.scene.add(this.towns);
    // Field assets load only after the player opens the field (not at game boot).
    game.canvas.addEventListener('wheel',e=>{
      if(!this.active)return;
      e.preventDefault();
      this._zoom(e.deltaY>0?1.12:.89);
    },{passive:false});
    game.canvas.addEventListener('pointerdown',e=>{
      if(!this.active||e.button!==0)return;
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(this.pointers.size===1){
        this.lastTap={x:e.clientX,y:e.clientY,id:e.pointerId};
        this.pinchDistance=0;
      }else{
        this.lastTap=null;
        this.pinchDistance=this._pointerDistance();
      }
    });
    game.canvas.addEventListener('pointermove',e=>{
      if(!this.active||!this.pointers.has(e.pointerId))return;
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(this.pointers.size>=2){
        const next=this._pointerDistance();
        if(this.pinchDistance>0&&next>0)this._zoom(this.pinchDistance/next);
        this.pinchDistance=next;
        this.lastTap=null;
        return;
      }
      if(!this.lastTap||this.lastTap.id!==e.pointerId)return;
      const dx=e.clientX-this.lastTap.x,dy=e.clientY-this.lastTap.y;
      if(Math.hypot(dx,dy)<8)return;
      const step=.016*(this.zoomDistance/22);
      this.focus.x=THREE.MathUtils.clamp(this.focus.x-dx*step,-9,9);
      this.focus.z=THREE.MathUtils.clamp(this.focus.z+dy*step,-9,9);
      this._applyCamera();
      this.lastTap={x:e.clientX,y:e.clientY,id:e.pointerId};
    });
    const release=e=>{
      if(!this.pointers.has(e.pointerId))return;
      this.pointers.delete(e.pointerId);
      this.lastTap=null;
      this.pinchDistance=this.pointers.size>=2?this._pointerDistance():0;
    };
    game.canvas.addEventListener('pointerup',release);
    game.canvas.addEventListener('pointercancel',release);
    window.addEventListener('blur',()=>{this.pointers.clear();this.lastTap=null;this.pinchDistance=0;});
  }
  _pointerDistance(){
    const [a,b]=[...this.pointers.values()];
    return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;
  }
  _applyCamera(){
    this.camera.position.copy(this.focus).addScaledVector(this.viewDirection,this.zoomDistance);
    this.camera.lookAt(this.focus);
  }
  _zoom(factor){
    if(!Number.isFinite(factor)||factor<=0)return;
    this.zoomDistance=THREE.MathUtils.clamp(this.zoomDistance*factor,9,32);
    this._applyCamera();
  }
  _createTerrain(){
    const geometry=new THREE.CylinderGeometry(.76,.8,.20,6,1);
    const material=[
      new THREE.MeshStandardMaterial({color:0x689476,roughness:1}),
      new THREE.MeshStandardMaterial({color:0x77a388,roughness:1}),
      new THREE.MeshStandardMaterial({color:0x749588,roughness:1}),
    ];
    // Draw >100 hexes in three instanced draws, never as 100 independent meshes.
    const inst=material.map(mat=>new THREE.InstancedMesh(geometry,mat,60));
    const dummy=new THREE.Object3D();const counter=[0,0,0];
    for(let r=-6;r<=6;r++)for(let q=-6;q<=6;q++){
      if(Math.abs(q+r)>7)continue;
      const ix=(Math.abs(q*19+r*13))%3;
      dummy.position.set(q*.93+r*.465,-.21,r*.81);
      dummy.rotation.y=a;
      dummy.updateMatrix();
      inst[ix].setMatrixAt(counter[ix]++,dummy.matrix);
    }
    inst.forEach((mesh,i)=>{mesh.count=counter[i];mesh.instanceMatrix.needsUpdate=true;this.terrain.add(mesh)});
  }
  async _loadAsset(){
    try{
      const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
      const res=await new GLTFLoader().loadAsync('assets/quaternius/town-center-first-age-3.gltf');
      if(!this.active)return;
      this.modelTemplate=res.scene;
      const box=new THREE.Box3().setFromObject(this.modelTemplate);
      const size=box.getSize(new THREE.Vector3());
      this.templateSize=Math.max(size.x,size.z,size.y);
      this.refresh();
    }catch(e){
      // Procedural real 3D landmark remains if model loading is unavailable.
      this.assetUnavailable=true;
      console.info('필드 대표 건물 모델 로딩 실패: 기본 3D 성채를 사용합니다.',e);
    }
  }
  _town(entry){
    const group=new THREE.Group();group.position.set(entry.x,.0,entry.z);
    group.userData.factionId=entry.id;
    const tone=entry.id==='player'?playerMaterial:entry.hostile?enemyMaterial:castleMaterial;
    const roof=entry.id==='player'?playerRoofMaterial:roofMaterial;
    const platform=new THREE.Mesh(platformGeometry,tone);
    platform.position.y=.12;group.add(platform);
    const body=new THREE.Mesh(bodyGeometry,tone);body.position.y=.49;group.add(body);
    const roofMesh=new THREE.Mesh(roofGeometry,roof);
    roofMesh.position.y=1.04;roofMesh.rotation.y=a;group.add(roofMesh);
    const scale=entry.tier===1?.82:entry.tier===2?.95:entry.tier===3?1.12:1.3;
    group.scale.setScalar(scale);
    if(entry.tier>=3){
      for(const x of [-.43,.43]){
        const tower=new THREE.Mesh(towerGeometry,tone);
        tower.position.set(x,.48,-.31);group.add(tower);
      }
    }
    // Reuse exactly one real CC0 town-center asset per settlement once available.
    if(this.modelTemplate){
      const model=this.modelTemplate.clone(true);
      model.scale.setScalar(.9/Math.max(.01,this.templateSize));
      const bound=new THREE.Box3().setFromObject(model);
      model.position.y=.25-bound.min.y;
      model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});
      group.add(model);
      body.visible=false;roofMesh.visible=false;
    }
    group.traverse(o=>{if(o.isMesh)o.userData.factionId=entry.id});
    this.towns.add(group);
    entry.group=group;
  }
  refresh(){
    for(const obj of [...this.towns.children])this.towns.remove(obj);
    const factions=this.game.factionSystem.factions;
    const radius=Math.max(8,...factions.map(f=>Math.max(Math.abs(f.home.q),Math.abs(f.home.r))));
    this.entries=[{id:'player',name:'내 마을',q:0,r:0,
      count:this.game.nativeVillage.size*this.game.nativeVillage.size,
      tier:this.game.nativeVillage.level,hostile:false},
      ...factions.map(f=>({id:f.id,name:f.label,q:f.home.q,r:f.home.r,
        count:f.territory.size,tier:tier(f.territory.size),hostile:f.hostile}))];
    for(const entry of this.entries){
      const pos=normalize(entry.q,entry.r,radius);
      entry.x=pos.x;entry.z=pos.z;
      this._town(entry);
    }
    this.labels.innerHTML=this.entries.map(entry=>
      '<button type="button" data-field-faction="'+entry.id.replace(/[^\w-]/g,'')+
      '" aria-label="'+entry.name.replace(/[<>&"]/g,'')+
      '">'+(entry.id==='player'?'🏰':'🏘️')+' '+entry.name.replace(/[<>&"]/g,'')+
      ' · '+entry.tier+'단계</button>').join('');
    this._markSelected(this.game.nativeVillageUI?.selectedId);
    this.updateLabels();
  }
  _markSelected(id){
    for(const entry of this.entries){
      entry.group.children[0].material=entry.id===id?playerMaterial:
        entry.id==='player'?playerMaterial:entry.hostile?enemyMaterial:castleMaterial;
    }
    for(const button of this.labels.querySelectorAll('[data-field-faction]')){
      const selected=button.dataset.fieldFaction===id;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    }
  }
  open(){
    this.active=true;this.labels.hidden=false;this.refresh();
    if(!this.modelTemplate&&!this.assetUnavailable&&!this.modelPending){
      this.modelPending=this._loadAsset().finally(()=>{this.modelPending=null});
    }
    this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.select(this.game.nativeVillageUI?.selectedId||'player');
  }
  close(){this.active=false;this.labels.hidden=true}
  select(id){
    const entry=this.entries.find(e=>e.id===id);
    if(!entry)return;
    this.game.nativeVillageUI.selectedId=id;
    // Selecting a city moves the actual 3D camera to that settlement.
    // The toolbar picker is therefore useful even for offscreen cities.
    this.focus.set(entry.x,0,entry.z);
    this._applyCamera();
    this._markSelected(id);
    this.game.nativeVillageUI.refreshWorld();
    this.updateLabels();
  }
  tap(x,y){
    this.ndc.set(x/innerWidth*2-1,1-y/innerHeight*2);
    this.ray.setFromCamera(this.ndc,this.camera);
    const found=this.ray.intersectObjects(this.towns.children,true);
    if(!found.length)return;
    let obj=found[0].object;
    while(obj&&!obj.userData.factionId)obj=obj.parent;
    if(obj?.userData?.factionId)this.select(obj.userData.factionId);
  }
  updateLabels(){
    if(!this.active)return;
    const buttons=this.labels.querySelectorAll('button');
    for(let i=0;i<this.entries.length;i++){
      const entry=this.entries[i],button=buttons[i];if(!button)continue;
      const projected=new THREE.Vector3(entry.x,1.8*entry.group.scale.x,entry.z).project(this.camera);
      const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
      button.style.left=x+'px';button.style.top=y+'px';
      button.hidden=projected.z< -1||projected.z>1||x<0||x>innerWidth||y<0||y>innerHeight;
    }
  }
  render(){
    if(!this.active)return;
    this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.updateLabels();
    this.game.renderer.render(this.scene,this.camera);
  }
}
