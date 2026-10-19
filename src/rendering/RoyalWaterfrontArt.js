// Rani Kingdom v2.6 — real Three.js water-edge ornaments for existing tiles.
// Visual-only geometry: never changes rivers, economy, navigation or save fields.
// One vertex-color merged draw per river/lake, deterministic from cell.seed.
import * as THREE from 'three';
import { part, merge } from '../assets/GeometryUtils.js';
import { PALETTE, MATS } from './Materials.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
import { edgeAngle } from '../grid/Hex.js';
import { Rng } from '../core/Rng.js';

export const ROYAL_WATER_TILE_TYPES=Object.freeze(['river','lake']);
const stoneTones=[PALETTE.royalStone,PALETTE.royalPave,PALETTE.royalPaveShade];
const reedTones=[PALETTE.reed,PALETTE.reedHead,PALETTE.grassDark];

function bankStone(parts,x,z,rng){
  const radius=rng.range(.024,.051);
  parts.push(part(new THREE.IcosahedronGeometry(radius,0),
    stoneTones[rng.int(0,2)],{
      t:[x,TILE_H+.055,z],s:[1.25,.65,.82],ry:rng.range(0,Math.PI)
    }));
}
function reedClump(parts,x,z,rng) {
  // Distinct visible reeds; all stems/grainheads batched to a single mesh.
  for(let i=0;i<3;i++){
    const dx=(i-1)*.03,dz=rng.range(-.022,.022);
    const height=rng.range(.16,.255);
    parts.push(part(new THREE.CylinderGeometry(.006,.013,height,4),
      reedTones[i%3],{t:[x+dx,TILE_H+.04+height/2,z+dz]}));
    parts.push(part(new THREE.ConeGeometry(.013,.055,4),
      PALETTE.reedHead,{t:[x+dx,TILE_H+.04+height+.02,z+dz]}));
  }
}
function lakeBanks(parts,rng){
  // Existing lake water radius .64 and existing shore .72. Keep this bank
  // OUTSIDE the water with an unobstructed center and no faux ship/harbor.
  for(let i=0;i<20;i++){
    const a=2*Math.PI*(i/20)+rng.range(-.075,.075);
    const radius=rng.range(.70,.79);
    const x=Math.cos(a)*radius,z=Math.sin(a)*radius;
    if(i%3===0)reedClump(parts,x,z,rng);
    else bankStone(parts,x,z,rng);
  }
  // Few water lilies, just above the already animated original water surface.
  // Their coordinates stay inside the central water surface, not in the shore.
  for(let i=0;i<4;i++){
    const a=2*Math.PI*i/4+rng.range(-.25,.25);
    const radius=rng.range(.22,.47);
    const x=Math.cos(a)*radius,z=Math.sin(a)*radius;
    parts.push(part(new THREE.CylinderGeometry(.071,.071,.009,7),
      PALETTE.lilyPad,{t:[x,TILE_H+.065,z]}));
    if(i%2===0){
      parts.push(part(new THREE.SphereGeometry(.023,5,4),
        PALETTE.lilyFlower,{t:[x+.016,TILE_H+.09,z]}));
    }
  }
}
function riverBanks(parts,cell,rng){
  // Mirror the REAL river edge indices after rotation. No invented
  // connectivity; stay alongside the original .36-wide channel and leave
  // central junction and river flow unobstructed.
  const edges=[...new Set(cell.riverEdges||[])].filter(
    e=>Number.isInteger(e)&&e>=0&&e<6);
  for(const edge of edges){
    const a=edgeAngle(edge),cx=Math.cos(a),cz=-Math.sin(a);
    const px=-cz,pz=cx;
    for(const step of [.33,.51,.69]){
      for(const side of [-1,1]){
        const jitter=rng.range(-.021,.021);
        const x=cx*step+px*(side*.235+jitter);
        const z=cz*step+pz*(side*.235+jitter);
        if(step===.51)reedClump(parts,x,z,rng);
        else bankStone(parts,x,z,rng);
      }
    }
  }
}
export function makeRoyalWaterfrontDressing(cell){
  if(!ROYAL_WATER_TILE_TYPES.includes(cell?.tileType))return null;
  const rng=new Rng(((cell.seed??0) ^ 0x4cb7e521)>>>0);
  const parts=[];
  if(cell.tileType==='lake')lakeBanks(parts,rng);
  else riverBanks(parts,cell,rng);
  if(!parts.length)return null;
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name='rani-royal-waterfront-dressing';
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniWaterVisualOnly=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  // Water ornament overlays cannot steal tile/water/building selection.
  mesh.raycast=()=>{};
  return mesh;
}
