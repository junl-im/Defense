// v1.9: actual 3D embellishments for the approved royal-kingdom art direction.
// Geometry is vertex-colored and merged to ONE draw-call per decorated tile.
// Only visuals change: no build jobs, resource data, picking keys or save fields.
import * as THREE from 'three';
import { PALETTE, MATS } from './Materials.js';
import { part, merge } from '../assets/GeometryUtils.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
import { Rng } from '../core/Rng.js';

const stoneColors=[
  PALETTE.royalPave,PALETTE.royalPaveLight,PALETTE.royalPaveShade
];

export const ROYAL_TILE_TYPES=Object.freeze(['village','field']);

export function makeRoyalTileDressing(cell) {
  if(!ROYAL_TILE_TYPES.includes(cell.tileType))return null;
  const rng=new Rng((cell.seed ^ 0x5a31819b)>>>0);
  const parts=[];
  if(cell.tileType==='village'){
    // A continuous miniature cobbled apron outside the old center castle.
    // Stay inside the hex prism and avoid the central castle/gate footprint.
    for(let zi=-5;zi<=5;zi++){
      for(let xi=-5;xi<=5;xi++){
        const x=xi*.143+(zi%2)*.061,z=zi*.137;
        const radius=Math.hypot(x,z);
        if(radius<.44||radius>.79)continue;
        const tone=stoneColors[rng.int(0,stoneColors.length-1)];
        parts.push(part(new THREE.BoxGeometry(
          rng.range(.106,.13),.012,rng.range(.103,.128)
        ),tone,{t:[x,TILE_H+.019,z]}));
      }
    }
    // Two low carved stone thresholds frame the approach from the south.
    for(const x of [-.22,.22]){
      parts.push(part(new THREE.BoxGeometry(.055,.06,.17),
        PALETTE.royalStone,{t:[x,TILE_H+.035,.51]}));
    }
  }else{
    // Golden ripe wheat along the field margin. Existing road lines, the
    // player-built farm and construction work retain the open tile center.
    const rows=[-.63,-.51,.51,.63];
    for(let row=0;row<rows.length;row++){
      const z=rows[row];
      for(let col=0;col<11;col++){
        const x=-.6+col*.12+(row%2)*.026;
        if(Math.hypot(x,z)>.84)continue;
        const h=rng.range(.11,.19);
        const stalk=rng.int(0,2)===0?PALETTE.fieldDark:PALETTE.royalWheat;
        parts.push(part(new THREE.CylinderGeometry(.008,.012,h,4),stalk,{
          t:[x,TILE_H+.035+h/2,z]
        }));
        parts.push(part(new THREE.ConeGeometry(.026,.074,5),PALETTE.royalWheatTip,{
          t:[x,TILE_H+.035+h+.028,z]
        }));
      }
    }
    // Narrow brown soil trenches make field strips read as actual farmland
    // at the default 2.5D camera angle even when the camera zooms out.
    for(const z of [-.68,-.44,.44,.68]){
      parts.push(part(new THREE.BoxGeometry(1.08,.008,.035),
        PALETTE.royalSoil,{t:[0,TILE_H+.01,z]}));
    }
  }
  if(!parts.length)return null;
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name='rani-royal-tile-dressing';
  mesh.userData.raniVisualOnly=true;
  mesh.receiveShadow=true;
  mesh.castShadow=false;
  return mesh;
}

/** Extra geometry is attached only to construction PHASE FOUR.
 * A partially built castle never receives floating finished decorations.
 */
export function makeRoyalCastleOrnaments(style='round') {
  const parts=[];
  const round=style==='round';
  if(round){
    // Blue-roofed castle keep rising above the original flat roof.
    parts.push(part(new THREE.ConeGeometry(.29,.24,4),PALETTE.royalBlue,{
      t:[0,.61,0],ry:Math.PI/4
    }));
    parts.push(part(new THREE.BoxGeometry(.38,.022,.022),PALETTE.royalGold,{
      t:[0,.48,.218]
    }));
  }else{
    // The square variant already owns its pitched keep roof. Keep it and
    // highlight the dormer instead of adding a second conflicting rooftop.
    parts.push(part(new THREE.BoxGeometry(.27,.022,.022),PALETTE.royalGold,{
      t:[0,.59,.115]
    }));
  }
  const front=round?.212:.118;
  for(const x of [-.13,.13]){
    parts.push(part(new THREE.BoxGeometry(.045,.09,.008),PALETTE.royalWindow,{
      t:[x,round?.34:.44,front]
    }));
    parts.push(part(new THREE.BoxGeometry(.055,.016,.02),PALETTE.royalGold,{
      t:[x,round?.389:.489,front]
    }));
  }
  // Gold-inlaid heraldic shield/banner front and centered on the gate,
  // with a blue field and a distinct golden vertical cross.
  const gateFront=round?.218:.322;
  parts.push(part(new THREE.BoxGeometry(.10,.15,.014),PALETTE.royalBlue,{
    t:[0,.28,gateFront]
  }));
  parts.push(part(new THREE.BoxGeometry(.02,.106,.024),PALETTE.royalGold,{
    t:[0,.283,gateFront+.013]
  }));
  parts.push(part(new THREE.BoxGeometry(.07,.019,.025),PALETTE.royalGold,{
    t:[0,.298,gateFront+.014]
  }));
  // Gold tower finials plus simple stone string courses.
  const corners=round
    ? [[-.3,-.25],[.3,-.25],[-.3,.25],[.3,.25]]
    : [[-.3,-.24],[.3,-.24],[-.3,.24],[.3,.24]];
  for(const [x,z] of corners){
    parts.push(part(new THREE.SphereGeometry(.023,6,4),PALETTE.royalGold,{
      t:[x,round?.765:.71,z]
    }));
    parts.push(part(new THREE.BoxGeometry(.12,.024,.12),PALETTE.royalStone,{
      t:[x,round?.576:.52,z]
    }));
  }
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name='rani-royal-castle-ornaments';
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  mesh.userData.raniVisualOnly=true;
  return mesh;
}
