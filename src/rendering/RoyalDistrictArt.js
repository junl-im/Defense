// Royal District v2.1 — readable building silhouettes and street-level detail.
// Every attachment is merged vertex-colored Three.js geometry (ONE draw call).
// This module only enriches the original phase-four construction groups;
// original footprints, saved buildings, pick targets and production stay intact.
import * as THREE from 'three';
import { PALETTE, MATS } from './Materials.js';
import { part, merge } from '../assets/GeometryUtils.js';

function finish(name,parts) {
  if (!parts.length) return null;
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name=name;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  mesh.userData.raniVisualOnly=true;
  return mesh;
}
function block(parts,w,h,d,color,x,y,z,ry=0){
  parts.push(part(new THREE.BoxGeometry(w,h,d),color,{t:[x,y,z],ry}));
}
function pot(parts,x,z,shade=0) {
  const foliage=[PALETTE.leafA,PALETTE.leafB,PALETTE.leafC][shade%3];
  parts.push(part(new THREE.CylinderGeometry(.035,.045,.073,6),
    PALETTE.crateWood,{t:[x,.073,z]}));
  parts.push(part(new THREE.IcosahedronGeometry(.06,0),
    foliage,{t:[x,.15,z]}));
  parts.push(part(new THREE.IcosahedronGeometry(.016,0),
    PALETTE.flower2,{t:[x+.015,.195,z+.008]}));
}

/** Royal homes stay five DISTINCT original shapes, not cloned houses.
 * Props and entrance steps occupy a tiny area near the front facade only.
 */
export function makeRoyalHouseDetails(style,w,d,wallH) {
  const parts=[];
  const round=style==='E';
  const front=round?w*.87:d/2+.013;
  const roofTop=style==='C'?.51:(.06+wallH);
  const facadeH=style==='C'?.36:(.06+wallH*.58);
  // Cut-stone threshold is an actual tiny 3D step, not a UI overlay.
  block(parts,.16,.025,.105,PALETTE.royalPaveLight,0,.025,front+.045);
  block(parts,.19,.016,.078,PALETTE.royalPaveShade,0,.012,front+.091);
  // Distinct house silhouettes: square timber-frame / tall stone /
  // long annex / circular cottage, original meshes untouched.
  if(!round){
    const outer=Math.min(w*.41,.19);
    for(const x of [-outer,outer]){
      // Fine carved vertical corner timbers and a warm upper-lit window.
      block(parts,.025,style==='C'?.22:wallH*.75,.024,
        PALETTE.woodBeam,x,style==='C'?.35:(.06+wallH*.51),front);
      block(parts,.064,.077,.011,PALETTE.royalWindow,
        x*.7,facadeH,front+.013);
      block(parts,.078,.015,.022,PALETTE.royalGold,
        x*.7,facadeH+.045,front+.02);
      block(parts,.012,.077,.023,PALETTE.woodBeam,
        x*.7,facadeH,front+.025);
    }
    // Cobalt crest, intentionally narrow enough not to cover the door.
    block(parts,.09,.065,.012,PALETTE.royalBlue,0,
      style==='C'?.43:(.06+wallH*.84),front+.018);
    block(parts,.014,.049,.02,PALETTE.royalGold,0,
      style==='C'?.43:(.06+wallH*.84),front+.03);
  } else {
    // The round home keeps a thatched-style cone silhouette with blue
    // royal cloth, a bright eave border and a hanging round lantern.
    parts.push(part(new THREE.TorusGeometry(w+.063,.012,4,10),
      PALETTE.royalGold,{t:[0,roofTop+.006,0],rx:Math.PI/2}));
    block(parts,.065,.08,.02,PALETTE.royalWindow,w*.5,
      .05+wallH*.58,front-.03);
    block(parts,.085,.015,.02,PALETTE.royalGold,w*.5,
      .05+wallH*.58+.046,front-.03);
  }
  // Flowers make the medieval home inviting without filling surrounding
  // hex land that still needs tile selection and construction clicks.
  if(style==='B'||style==='D')pot(parts,-Math.min(.21,w*.47),front+.085,1);
  if(style==='A'||style==='C'||style==='E')pot(parts,Math.min(.22,w*.48),front+.085,2);
  return finish('rani-royal-house-'+style.toLowerCase(),parts);
}

/** Commercial/military/production buildings read as different professions
 * through hanging crests, roof line details and tiny ground props.
 */
export function makeRoyalDistrictDetails(kind) {
  const parts=[];
  if(kind==='market'){
    // Stall banners and produce containers leave the market center open.
    for(const x of [-.19,.18]){
      block(parts,.085,.12,.013,PALETTE.royalBlue,
        x,.37,.10);
      block(parts,.018,.093,.019,PALETTE.royalGold,
        x,.38,.113);
    }
    for(const [x,z,color] of [
      [-.22,.23,PALETTE.appleRed],[.16,.22,PALETTE.hay],
      [.3,-.16,PALETTE.leafB]]){
      block(parts,.11,.06,.11,PALETTE.crateWood,x,.04,z);
      parts.push(part(new THREE.IcosahedronGeometry(.041,0),color,{
        t:[x,.09,z]
      }));
    }
    // Edge paving makes the bazaar feel attached to the actual streets.
    for(const x of [-.23,0,.23])block(parts,.16,.015,.12,
      PALETTE.royalPaveLight,x,.025,.35);
  } else if(kind==='barracks'){
    // Castle-blue heraldry and drill yard; original weapons rack remains.
    block(parts,.09,.12,.015,PALETTE.royalBlue,0,.205,.102);
    block(parts,.02,.09,.019,PALETTE.royalGold,0,.207,.114);
    block(parts,.075,.016,.02,PALETTE.royalGold,0,.22,.117);
    for(const x of [-.21,.21]){
      block(parts,.045,.27,.045,PALETTE.royalStone,
        x,.15,.26);
      parts.push(part(new THREE.ConeGeometry(.043,.10,4),PALETTE.royalBlue,{
        t:[x,.335,.26],ry:Math.PI/4
      }));
      parts.push(part(new THREE.SphereGeometry(.017,5,4),PALETTE.royalGold,{
        t:[x,.393,.26]
      }));
    }
    block(parts,.19,.018,.12,PALETTE.royalPaveLight,0,.029,.21);
  }else if(kind==='forge'){
    block(parts,.14,.09,.018,PALETTE.royalBlue,0,.245,.168);
    block(parts,.02,.06,.025,PALETTE.royalGold,0,.25,.182);
    block(parts,.09,.017,.028,PALETTE.royalGold,0,.259,.182);
    for(const x of [-.23,.23]){
      block(parts,.055,.055,.12,PALETTE.royalStone,x,.055,.21);
    }
    block(parts,.15,.018,.12,PALETTE.royalPaveLight,0,.03,.24);
  }else if(kind==='sawmill'||kind==='lumber'){
    const mill=kind==='sawmill';
    // Blue guild sign and a visibly stocked wood yard.
    block(parts,.14,.105,.015,PALETTE.royalBlue,
      mill?-.09:0,.23,.15);
    block(parts,.02,.075,.021,PALETTE.royalGold,
      mill?-.09:0,.23,.163);
    block(parts,.1,.018,.021,PALETTE.royalGold,
      mill?-.09:0,.245,.165);
    for(const z of [.27,.32]){
      parts.push(part(new THREE.CylinderGeometry(.025,.025,.25,5),
        PALETTE.trunk,{t:[mill?.11:.26,.055,z],rz:Math.PI/2}));
    }
    block(parts,.18,.014,.085,PALETTE.royalPaveLight,
      mill?-.06:.02,.023,.265);
  }
  return finish('rani-royal-district-'+kind,parts);
}
