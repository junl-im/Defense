// Rani Kingdom v3.1 — royal streets from the ACTUAL AutoMesh road graph.
// Purely decorative 3D, refreshed/disposed by the original overlay lifecycle.
// Avoid dummy streets, SVG, save/economy changes and drawing road into water.
import * as THREE from 'three';
import { part, merge } from '../assets/GeometryUtils.js';
import { PALETTE, MATS } from './Materials.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
import { edgeAngle, HEX_SIZE } from '../grid/Hex.js';

const APOTHEM=HEX_SIZE*Math.sqrt(3)/2;
const at=(edge,r,lateral)=>{
  const a=edgeAngle(edge),c=Math.cos(a),s=Math.sin(a);
  return [c*r+s*lateral,-s*r+c*lateral];
};
const block=(pieces,w,h,d,color,x,y,z,angle=0)=>
  pieces.push(part(new THREE.BoxGeometry(w,h,d),color,
    {t:[x,y,z],ry:angle}));
const stone=[PALETTE.royalStone,PALETTE.royalPaveShade,PALETTE.royalPaveLight];

function finish(name,parts){
  if(!parts.length)return null;
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name=name;
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniStreetDetail=true;
  mesh.raycast=()=>{};
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  return mesh;
}
/**
 * Decorative curbs flank only the actual pre-existing roads.
 * The connectedMask comes directly from AutoMesh, never from a second graph.
 * Disconnected ends terminate at 0.6 of the hex radius like the original
 * road strip; no floating curbs at unbuilt edges.
 */
export function makeRoyalConnectedRoadside(cell,connectedMask=0){
  const edges=[...new Set(cell?.roadEdges||[])].filter(e=>Number.isInteger(e)&&e>=0&&e<6);
  if(!edges.length)return null;
  const parts=[];
  // A road crossing a river already has its own bridge treatment. No floating
  // cobbled kerb/lantern over that river or lake.
  if(cell.tileType==='river'||cell.tileType==='lake')return null;
  for(const edge of edges){
    const connected=((connectedMask>>>edge)&1)!==0;
    const far=connected?APOTHEM*.88:(APOTHEM+.06)*.52;
    const a=edgeAngle(edge);
    const count=connected?5:3;
    for(let i=0;i<count;i++){
      const r=.22+(far-.22)*(i+.5)/count;
      for(const side of [-1,1]){
        const [x,z]=at(edge,r,side*.191);
        block(parts,.115,.027,.028,stone[(edge+i+1)%stone.length],
          x,TILE_H+.049,z,a);
      }
    }
    if(connected){
      // Guild waymarker only at real network edges, outside road surface.
      const [x,z]=at(edge,APOTHEM*.76,.24);
      block(parts,.048,.123,.048,PALETTE.royalStone,x,TILE_H+.097,z);
      block(parts,.072,.022,.072,PALETTE.royalGold,x,TILE_H+.17,z);
      block(parts,.058,.07,.019,PALETTE.royalBlue,x,TILE_H+.205,z);
      block(parts,.011,.05,.026,PALETTE.royalGold,x,TILE_H+.21,z);
    }else{
      // Physical dead end, never indicate a road beyond an empty edge.
      const [x,z]=at(edge,far+.018,0);
      block(parts,.038,.064,.31,PALETTE.royalStone,x,TILE_H+.056,z,a);
      block(parts,.014,.018,.135,PALETTE.royalGold,x,TILE_H+.098,z,a);
    }
  }
  return finish('rani-connected-royal-roadside-v31',parts);
}
/** Connect gold-topped lamps to the ORIGINAL village/castle entrance mask. */
export function makeRoyalConnectedVillageGate(cell,connections=[]){
  if(!['village','castle'].includes(cell?.tileType))return null;
  const edges=[...new Set(connections)].filter(e=>Number.isInteger(e)&&e>=0&&e<6);
  if(!edges.length)return null;
  const parts=[];
  for(const edge of edges){
    // Reuse AutoMesh's actual village entrance posts at d=apothem*.82,
    // lateral offset=.20. Decorative gold/blue caps sit on their tops.
    const a=edgeAngle(edge);
    for(const side of [-1,1]){
      const [x,z]=at(edge,APOTHEM*.82,side*.20);
      block(parts,.071,.019,.071,PALETTE.royalGold,x,TILE_H+.228,z,a);
      block(parts,.047,.063,.047,PALETTE.royalBlue,x,TILE_H+.27,z,a);
      block(parts,.052,.014,.052,PALETTE.royalGold,x,TILE_H+.309,z,a);
      block(parts,.024,.025,.024,PALETTE.royalWindow,x,TILE_H+.278,z,a);
    }
    // Tiny entrance pavement at the front of the road, not on the keep.
    for(const r of [.58,.71]){
      const [x,z]=at(edge,r,0);
      block(parts,.13,.012,.21,PALETTE.royalPaveLight,
        x,TILE_H+.039,z,a);
    }
  }
  return finish('rani-connected-royal-village-gate-v31',parts);
}
