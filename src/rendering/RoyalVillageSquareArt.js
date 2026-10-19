// Rani Kingdom v2.9 — royal village square is ACTUAL Three.js scene art.
// Appended to the existing selectable village hex, not a second fake map.
// One vertex-color draw call and no changes to building, economy or saves.
import * as THREE from 'three';
import { part,merge } from '../assets/GeometryUtils.js';
import { PALETTE,MATS } from './Materials.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
import { Rng } from '../core/Rng.js';

export function makeRoyalVillageSquareArt(cell){
  if(cell?.tileType!=='village')return null;
  const rng=new Rng(((cell.seed??0)^0x2b7429a1)>>>0);
  const parts=[];
  const block=(w,h,d,col,x,y,z)=>parts.push(part(
    new THREE.BoxGeometry(w,h,d),col,{t:[x,y,z]}));
  const orb=(r,col,x,y,z)=>parts.push(part(
    new THREE.IcosahedronGeometry(r,0),col,{t:[x,y,z]}));
  // Outer perimeter only: keep original castle/road center and all entrances
  // visible. Original v1.9 paving already defines paths at radii .44..79.
  for(const [x,z] of [[-.61,.40],[.61,.40],[-.66,-.32],[.66,-.32]]){
    // Four blue/gold royal lanterns: actual tiny masonry and torch ornaments.
    block(.098,.044,.098,PALETTE.royalStone,x,TILE_H+.045,z);
    block(.035,.20,.035,PALETTE.woodBeam,x,TILE_H+.157,z);
    block(.075,.085,.075,PALETTE.royalBlue,x,TILE_H+.302,z);
    block(.078,.015,.078,PALETTE.royalGold,x,TILE_H+.346,z);
    orb(.028,PALETTE.royalWindow,x,TILE_H+.306,z+.041);
  }
  // Formal blue/gold quarter markers on the north approach (actual 3D stone).
  // Keep flags below tower silhouettes; no shadow rendering per small detail.
  for(const x of [-.58,.58]){
    block(.093,.052,.091,PALETTE.royalStone,x,TILE_H+.045,-.46);
    block(.023,.24,.023,PALETTE.woodBeam,x,TILE_H+.18,-.46);
    block(.105,.092,.016,PALETTE.royalBlue,x+.047,TILE_H+.262,-.46);
    block(.015,.075,.019,PALETTE.royalGold,x+.047,TILE_H+.264,-.447);
  }
  // Low planters/flowers add density while never blocking tile selection.
  for(const [x,z] of [[-.74,.05],[.74,.05],[-.44,-.60],[.44,-.60]]){
    block(.115,.055,.10,PALETTE.royalPave,x,TILE_H+.035,z);
    block(.095,.019,.079,PALETTE.royalSoil,x,TILE_H+.070,z);
    for(let j=0;j<3;j++){
      const dx=(j-1)*.024,dz=rng.range(-.022,.022);
      orb(.019,j===1?PALETTE.flower2:PALETTE.flower1,
        x+dx,TILE_H+.094+rng.range(0,.015),z+dz);
    }
  }
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name='rani-production-village-square-v29';
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniVillageDecorOnly=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  mesh.raycast=()=>{};
  return mesh;
}
