// Rani Kingdom v3.2 — lived-in street furnishings for ACTUALLY completed
// player buildings. Original BuildingSystem record/position is the source of
// truth. No invented homes, additional slots, economy or save data.
import * as THREE from 'three';
import { part,merge } from '../assets/GeometryUtils.js';
import { PALETTE,MATS } from './Materials.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';

const colors=[PALETTE.royalPave,PALETTE.royalPaveLight,PALETTE.royalPaveShade];
const makeBox=(p,w,h,d,color,x,y,z,angle=0)=>p.push(part(
  new THREE.BoxGeometry(w,h,d),color,{t:[x,y,z],ry:angle}));
function stoneApron(parts,rec,index){
  const pos=rec.pos;
  if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z))return;
  const radial=Math.hypot(pos.x,pos.z);
  // Toward tile perimeter and AWAY from the actual building center.
  // A centered building uses a stable per-slot direction.
  const theta=radial>.05?Math.atan2(pos.z,pos.x):
    ((rec.slot??index)%2)*Math.PI;
  const nx=Math.cos(theta),nz=Math.sin(theta),sx=-nz,sz=nx;
  const angle=-theta;
  // Keep all props inside the actual hex ground, rather than drawing
  // decorative "extra buildings" in adjacent empty or enemy-owned cells.
  const radius=Math.min(.69,Math.max(.40,radial+.23));
  const px=nx*radius,pz=nz*radius;
  const y=TILE_H;
  for(let j=0;j<4;j++){
    const distance=(j-1.5)*.095;
    makeBox(parts,.10,.012,.075,colors[(j+index)%3],
      px+sx*distance,y+.025,pz+sz*distance,angle);
  }
  // Low planter and guild trim: stays below existing building roofs.
  const side=(index%2===0)?1:-1;
  const bx=px+sx*.22*side,bz=pz+sz*.22*side;
  if(Math.hypot(bx,bz)<.78){
    makeBox(parts,.105,.052,.10,PALETTE.royalStone,bx,y+.048,bz,angle);
    makeBox(parts,.083,.014,.078,PALETTE.royalSoil,bx,y+.083,bz,angle);
    for(let k=0;k<3;k++){
      const fx=bx+sx*(k-1)*.023,fz=bz+sz*(k-1)*.023;
      parts.push(part(new THREE.IcosahedronGeometry(.017,0),
        k===1?PALETTE.flower2:PALETTE.flower1,
        {t:[fx,y+.107,fz]}));
    }
  }
  // Compact blue/gold ground marker distinguishes a developed street.
  // It reads as furnished public space, never as an extra building.
  const lx=px-sx*.20*side,lz=pz-sz*.20*side;
  if(Math.hypot(lx,lz)<.78){
    makeBox(parts,.045,.09,.045,PALETTE.royalStone,lx,y+.071,lz);
    makeBox(parts,.059,.024,.059,PALETTE.royalGold,lx,y+.13,lz);
    makeBox(parts,.046,.060,.02,PALETTE.royalBlue,lx,y+.172,lz);
    makeBox(parts,.016,.043,.025,PALETTE.royalGold,lx,y+.177,lz);
  }
}

/** Accept only completed and already REVEALED player buildings. */
export function makeRoyalBuiltNeighborhood(cell,records=[]){
  if(!cell||cell.owner&&cell.owner!=='player')return null;
  const done=records.filter(b=>b?.done===true &&
    b.visual?.done===true && b.pos &&
    Number.isFinite(b.pos.x)&&Number.isFinite(b.pos.z) &&
    b.id!=='road');
  if(!done.length)return null;
  const pieces=[];
  done.forEach((rec,index)=>stoneApron(pieces,rec,index));
  if(!pieces.length)return null;
  const mesh=new THREE.Mesh(merge(pieces),MATS.vcStatic);
  mesh.name='rani-completed-neighborhood-v32';
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniBuiltNeighborhood=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  mesh.raycast=()=>{}; // selecting a built facility still selects that facility
  return mesh;
}
