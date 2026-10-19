// Rani Kingdom v3.0 — additional lived-in districts on ACTUAL completed
// civic buildings. No standalone fake houses, new footprint, save/economy
// changes or cropped art. One merged, vertex-coloured Three.js mesh each.
import * as THREE from 'three';
import { part, merge } from '../assets/GeometryUtils.js';
import { PALETTE, MATS } from './Materials.js';

export const LIVED_IN_CIVIC_TYPES=Object.freeze([
  'apiary','bakery','stable','temple','university','observatory','library'
]);
function block(p,w,h,d,color,x,y,z,ry=0){
  p.push(part(new THREE.BoxGeometry(w,h,d),color,{t:[x,y,z],ry}));
}
function cone(p,r,h,color,x,y,z,sides=6){
  p.push(part(new THREE.ConeGeometry(r,h,sides),color,{t:[x,y,z]}));
}
function sphere(p,r,color,x,y,z){
  p.push(part(new THREE.IcosahedronGeometry(r,0),color,{t:[x,y,z]}));
}
function post(p,x,z,h=.18){
  block(p,.021,h,.021,PALETTE.woodBeam,x,h/2+.03,z);
  block(p,.052,.032,.052,PALETTE.royalBlue,x,h+.055,z);
  block(p,.057,.009,.057,PALETTE.royalGold,x,h+.075,z);
  sphere(p,.013,PALETTE.royalWindow,x,h+.054,z+.028);
}
function borderPavers(p,xs,z){
  for(let i=0;i<xs.length;i++)block(p,.075,.013,.074,
    i%2?PALETTE.royalPaveShade:PALETTE.royalPaveLight,
    xs[i],.013,z);
}
function crest(p,x,y,z){
  block(p,.077,.098,.013,PALETTE.royalBlue,x,y,z);
  block(p,.014,.073,.017,PALETTE.royalGold,x,y,z+.009);
  block(p,.054,.011,.02,PALETTE.royalGold,x,y+.012,z+.011);
}
/** Original build maker only calls this for construction PHASE FOUR. */
export function makeRoyalLivedInDistrict(kind){
  if(!LIVED_IN_CIVIC_TYPES.includes(kind))return null;
  const p=[];
  if(kind==='apiary'){
    // Existing three honey hives stay; add low practical orchard fencing,
    // royal guild notice, pollen flowers and stored honey jars.
    for(const x of [-.24,.24]){
      post(p,x,.19,.15);
      block(p,.016,.12,.025,PALETTE.royalStone,x,.09,-.10);
    }
    block(p,.50,.015,.022,PALETTE.crateWood,0,.13,.19);
    crest(p,-.15,.22,.017);
    for(const [x,z,c] of [[-.10,.14,PALETTE.flower1],
      [.13,-.15,PALETTE.flower2],[.24,.10,PALETTE.flower3]]){
      sphere(p,.018,c,x,.065,z);
      block(p,.009,.055,.009,PALETTE.leafC,x,.03,z);
    }
    for(const x of [-.06,-.012,.036]){
      p.push(part(new THREE.CylinderGeometry(.017,.020,.048,6),
        PALETTE.goldDeep,{t:[x,.054,-.18]}));
      block(p,.037,.009,.035,PALETTE.royalGold,x,.084,-.18);
    }
    borderPavers(p,[-.13,-.04,.05,.14],.255);
  }else if(kind==='bakery'){
    // Baking counter and bread stall sit on the original front approach.
    crest(p,-.105,.31,.165);
    for(const x of [-.22,.22])post(p,x,.275,.18);
    block(p,.27,.024,.11,PALETTE.crateWood,0,.094,.245);
    block(p,.23,.02,.07,PALETTE.royalPaveLight,0,.115,.245);
    for(const x of [-.075,0,.075]){
      sphere(p,.034,PALETTE.hay,x,.142,.245);
      block(p,.028,.010,.014,PALETTE.royalWheatTip,x,.167,.245);
    }
    borderPavers(p,[-.16,-.08,0,.08,.16],.354);
  }else if(kind==='stable'){
    // Original horse and fenced paddock remain interactive as before.
    // Add compact shelter crest, hoof-worn stones and separate water barrels.
    crest(p,-.16,.246,.09);
    for(const x of [-.17,-.08,.01]){
      block(p,.072,.012,.075,PALETTE.royalPave,x,.016,.245);
    }
    for(const x of [-.18,-.08]){
      p.push(part(new THREE.CylinderGeometry(.037,.039,.077,7),
        PALETTE.barrelWood,{t:[x,.05,.315]}));
      block(p,.075,.009,.073,PALETTE.barrelBand,x,.078,.315);
    }
    for(const x of [-.20,.25]){
      cone(p,.047,.083,PALETTE.hay,x,.083,-.2);
      sphere(p,.023,PALETTE.royalWheatTip,x,.126,-.20);
    }
    block(p,.32,.016,.025,PALETTE.royalGold,-.02,.33,-.058);
  }else if(kind==='temple'){
    // Warm ceremonial approach, blue/gold bell-house fascia and candles.
    crest(p,.14,.49,.194);
    for(const x of [-.23,-.13,.03]){
      block(p,.067,.018,.09,PALETTE.royalPaveLight,x,.095,.248);
    }
    for(const x of [-.21,.29]){
      post(p,x,.28,.21);
      block(p,.056,.01,.053,PALETTE.royalGold,x,.10,.23);
    }
    for(const x of [-.12,-.06]){
      p.push(part(new THREE.CylinderGeometry(.011,.014,.074,6),
        PALETTE.royalStone,{t:[x,.16,.21]}));
      sphere(p,.018,PALETTE.lantern,x,.212,.21);
    }
    block(p,.24,.02,.02,PALETTE.royalGold,-.06,.385,.13);
  }else if(kind==='university'){
    // Actual twin-wing university gains manuscript cases and arcade piers.
    crest(p,-.1,.40,.179);
    for(const x of [-.25,-.02,.19]){
      block(p,.05,.25,.05,PALETTE.royalStone,x,.176,.26);
      block(p,.065,.025,.065,PALETTE.royalGold,x,.315,.26);
    }
    for(const z of [-.02,.055,.13]){
      block(p,.17,.027,.058,PALETTE.crateWood,.30,.11,z);
      block(p,.128,.018,.046,PALETTE.royalBlue,.30,.132,z);
    }
    for(const x of [-.12,0,.12])block(p,.09,.017,.10,
      PALETTE.royalPaveLight,x,.027,.315);
    sphere(p,.029,PALETTE.royalGold,-.1,.82,0);
  }else if(kind==='observatory'){
    // Original telescope and dome preserved; additional compass / rail
    // details keep the platform legible without obstructing slit or optics.
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const x=Math.cos(a)*.215,z=Math.sin(a)*.215;
      block(p,.024,.082,.024,PALETTE.royalStone,x,.57,z);
      sphere(p,.014,PALETTE.royalGold,x,.617,z);
    }
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
      const x=Math.cos(a)*.23,z=Math.sin(a)*.23;
      block(p,.06,.015,.064,PALETTE.royalPaveLight,x,.018,z);
    }
    crest(p,.0,.27,.18);
    block(p,.11,.022,.06,PALETTE.woodBeam,.27,.08,.07);
    sphere(p,.038,PALETTE.royalBlue,.27,.115,.07);
    sphere(p,.018,PALETTE.royalGold,.27,.151,.07);
  }else if(kind==='library'){
    // The old scroll shelf and green roof are left in place. A blue reading
    // alcove, illuminated sign and book-display stall finish the street edge.
    crest(p,.105,.38,.165);
    for(const x of [-.16,.16]){
      post(p,x,.27,.21);
      block(p,.064,.013,.06,PALETTE.royalPaveLight,x,.019,.25);
    }
    block(p,.22,.025,.11,PALETTE.crateWood,0,.085,.295);
    for(const [x,c] of [[-.071,PALETTE.royalBlue],[0,PALETTE.tabardRed],
      [.071,PALETTE.royalBlue]]){
      block(p,.054,.016,.073,c,x,.105,.295);
      block(p,.012,.019,.075,PALETTE.royalGold,x-.018,.106,.295);
    }
    block(p,.18,.016,.018,PALETTE.royalGold,0,.343,.165);
    borderPavers(p,[-.12,-.04,.04,.12],.38);
  }
  const mesh=new THREE.Mesh(merge(p),MATS.vcStatic);
  mesh.name='rani-lived-in-'+kind+'-v30';
  mesh.userData.raniVisualOnly=true;
  mesh.userData.raniLivedInDistrict=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  // Picking must continue to target actual complete structures / tiles.
  mesh.raycast=()=>{};
  return mesh;
}
