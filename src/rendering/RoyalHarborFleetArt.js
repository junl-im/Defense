// Rani Kingdom v2.8 — high-quality decorative additions to ORIGINAL 3D
// port + fishing pier. No new buildings, resources, save keys or sprite sheets.
// One vertex-colored merged Three.js mesh per completed harbor structure.
import * as THREE from 'three';
import { part, merge } from '../assets/GeometryUtils.js';
import { PALETTE, MATS } from './Materials.js';

const add=(pieces,geo,color,t)=>pieces.push(part(geo,color,{t}));
const box=(pieces,dimensions,color,position)=>add(pieces,
  new THREE.BoxGeometry(...dimensions),color,position);

/** Adds *detail to the pre-existing boat* centered at the exact original
 * CivicFactory coordinate, instead of laying an unrelated fake ship above it.
 */
function decorateExistingBoat(parts,kind){
  const port=kind==='port';
  const x=port?.16:.22;
  const z=.26;
  const hullW=port?.14:.12;
  // Both upstream boats have a box-shaped hull in completed construction p4.
  // Bow/stern shaped cedar trim stays outside the original boat body.
  const length=port?.30:.26;
  for(const sign of [-1,1]){
    const zEnd=z+sign*length*.47;
    box(parts,[hullW+.025,.026,.019],PALETTE.boatHull,
      [x,.082,zEnd]);
    box(parts,[hullW+.018,.009,.02],PALETTE.royalGold,
      [x,.101,zEnd]);
  }
  for(const side of [-1,1]){
    const sx=x+side*(hullW*.5+.012);
    box(parts,[.014,.038,length*.74],PALETTE.crateWood,
      [sx,.078,z]);
    box(parts,[.007,.011,length*.60],PALETTE.royalGold,
      [sx+side*.007,.096,z]);
  }
  // Real horizontal thwart benches; leave the original boat mast untouched.
  for(const zOffset of [-.075,.058]){
    box(parts,[hullW+.01,.009,.041],PALETTE.royalStone,
      [x,.103,z+zOffset]);
  }
  if(port){
    // Two independently readable cloth sails on the EXISTING mast.
    // White sail, royal blue lower embroidery and curved timber boom.
    box(parts,[.161,.187,.011],PALETTE.wallPlaster,[x+.055,.264,z]);
    box(parts,[.164,.022,.016],PALETTE.royalBlue,[x+.055,.185,z+.005]);
    box(parts,[.026,.115,.019],PALETTE.royalGold,[x+.017,.255,z+.011]);
    box(parts,[.17,.014,.025],PALETTE.woodBeam,[x+.05,.365,z]);
    box(parts,[.17,.013,.025],PALETTE.woodBeam,[x+.05,.164,z]);
    // Small second streamer flowing from main mast for royal silhouette.
    box(parts,[.135,.055,.013],PALETTE.royalBlue,
      [x+.085,.405,z]);
    box(parts,[.027,.039,.018],PALETTE.royalGold,
      [x+.045,.404,z+.008]);
    // Bracing rope is not interactive, and does not hide the dock.
    for(const side of [-1,1]){
      const sx=x+side*.075;
      add(parts,new THREE.CylinderGeometry(.004,.004,.24,4),
        PALETTE.ropeTan,[sx,.245,z+.08]);
    }
  }else{
    // Fisherman's original open rowboat stays small. Add readable oars,
    // blue pennant and net bundle, rather than fictional full-height mast.
    for(const side of [-1,1]){
      box(parts,[.12,.009,.012],PALETTE.woodBeam,
        [x+side*.095,.119,z-.01]);
      box(parts,[.068,.009,.037],PALETTE.ropeTan,
        [x+side*.155,.119,z-.01]);
    }
    add(parts,new THREE.IcosahedronGeometry(.041,0),PALETTE.ropeTan,
      [x,.127,z+.068]);
    add(parts,new THREE.IcosahedronGeometry(.016,0),PALETTE.royalBlue,
      [x+.018,.168,z+.074]);
  }
}
function decorateDock(parts,kind){
  const port=kind==='port';
  // Prominent original docks sit toward positive Z.
  const z=port?.10:.30;
  const step=port?.30:.25;
  for(let i=0;i<4;i++){
    const zz=z+(i-1.5)*step/4;
    box(parts,[port?.46:.22,.012,.016],i%2?
      PALETTE.woodBeam:PALETTE.crateWood,[port?-.015:-.01,.139,zz]);
  }
  // Dock bollards and mooring rope visually link the harbor to its boat.
  for(const x of port?[-.24,.25]:[-.105,.104]){
    add(parts,new THREE.CylinderGeometry(.017,.021,.055,6),
      PALETTE.royalStone,[x,.155,port?.18:.30]);
    add(parts,new THREE.CylinderGeometry(.022,.023,.010,6),
      PALETTE.royalGold,[x,.185,port?.18:.30]);
  }
  if(port){
    // Cargo and a blue guild banner reinforce the existing trading post.
    for(const [x,z] of [[-.23,.15],[-.12,.19],[.29,-.015]]){
      box(parts,[.068,.067,.068],PALETTE.crateWood,[x,.155,z]);
      box(parts,[.071,.013,.073],PALETTE.royalGold,[x,.19,z]);
    }
    add(parts,new THREE.CylinderGeometry(.026,.031,.095,7),
      PALETTE.barrelWood,[-.23,.155,-.16]);
    box(parts,[.066,.009,.070],PALETTE.ironBand,[-.23,.163,-.16]);
  }else{
    // A fisherman-only basket and drying lines (not copied cargo crates).
    add(parts,new THREE.CylinderGeometry(.052,.041,.067,7),
      PALETTE.ropeTan,[-.055,.164,.12]);
    for(const x of [-.17,-.09,-.01])
      box(parts,[.008,.085,.008],PALETTE.ropeTan,[x,.27,-.05]);
  }
}
export function makeRoyalHarborFleetDetail(kind='port'){
  if(kind!=='port'&&kind!=='pier')return null;
  const parts=[];
  decorateExistingBoat(parts,kind);
  decorateDock(parts,kind);
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name=kind==='port'?'rani-royal-harbor-fleet-v28':'rani-royal-fishing-fleet-v28';
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniHarborVisualOnly=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  // Harbor details cannot steal original building selection or block buttons.
  mesh.raycast=()=>{};
  return mesh;
}
