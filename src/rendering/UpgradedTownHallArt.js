// Progressive visual upgrade: this is NOT a replacement for the original 3D game.
// Loads the CC0 Quaternius Fantasy RTS town-center model only after the first
// hall promotion. Original Hexkingdom construction & meshes remain the fallback.
import * as THREE from 'three';
import { events } from '../core/Events.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
const MODEL_URL = 'assets/quaternius/town-center-first-age-3.gltf';
export class UpgradedTownHallArt {
  constructor(game) {
    this.game=game;
    this.model=null;
    this.loading=null;
    this.failed=false;
    events.on('native-village:expanded',()=>this.refresh());
    events.on('native-village:changed',()=>this.refresh());
    events.on('game:restart',()=>this.hide());
    this.refresh();
  }
  hide(){if(this.model)this.model.visible=false;}
  refresh() {
    const level=this.game.nativeVillage?.level||1;
    if(level<2) {this.hide();return;}
    if(this.model){
      this.model.visible=true;
      this.model.scale.setScalar(this.baseScale*(1+0.06*(level-2)));
      this.positionModel();
    } else if(!this.failed&&!this.loading) this.load();
  }
  positionModel(){
    if(!this.model)return;
    // Bounding box is computed in the source scale. Village lives at 0,0.
    const box=this.sourceBox;
    const scale=this.model.scale.x;
    const center=box.getCenter(new THREE.Vector3());
    this.model.position.set(-center.x*scale,TILE_H-box.min.y*scale,-center.z*scale);
  }
  async load(){
    this.loading=(async()=>{
      try{
        const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
        const gltf=await new GLTFLoader().loadAsync(MODEL_URL);
        const root=gltf.scene;
        root.updateMatrixWorld(true);
        const box=new THREE.Box3().setFromObject(root);
        const size=box.getSize(new THREE.Vector3());
        if(Math.min(size.x,size.y,size.z)<=0)throw new Error('빈 3D 모형');
        this.sourceBox=box;
        this.baseScale=Math.min(1.16/size.x,1.16/size.z,1.55/size.y);
        root.traverse(node=>{
          if(!node.isMesh)return;
          node.castShadow=true;
          node.receiveShadow=true;
        });
        this.model=root;
        this.game.scene.add(root);
        this.refresh();
      } catch(err){
        // Preserve the complete original Hexkingdom visuals if a CDN/model fails.
        this.failed=true;
        console.info('추가 3D 중심 건물 모델을 불러오지 못해 기존 외형을 유지합니다.',err);
      }
    })();
    await this.loading;
    this.loading=null;
  }
}
