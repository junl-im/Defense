// Rani Kingdom v2.0 — real 3D royal road/wall/port details.
// Only vertex-colored merged Three.js geometry. No saved state or game rules.
import * as THREE from 'three';
import { part, merge } from '../assets/GeometryUtils.js';
import { PALETTE, MATS } from './Materials.js';
import { edgeAngle } from '../grid/Hex.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';

function oneMesh(name, parts) {
  if (!parts.length) return null;
  const mesh = new THREE.Mesh(merge(parts), MATS.vcStatic);
  mesh.name = name;
  mesh.userData.raniVisualOnly = true;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

/** Cobblestones follow the EXISTING road edges; no new connectivity rules.
 * The base road mesh remains as a smooth continuous support layer.
 * Returns a single batched mesh instead of one draw call per stone.
 */
export function makeRoyalRoadPaving(edges, connectedMask=0x3f) {
  if (!edges?.length) return null;
  const parts=[];
  const apothem=Math.sqrt(3)/2;
  const tones=[PALETTE.royalPave, PALETTE.royalPaveLight, PALETTE.royalPaveShade];
  for(const edge of [...new Set(edges)]){
    if(!Number.isInteger(edge)||edge<0||edge>5)continue;
    const a=edgeAngle(edge), c=Math.cos(a),s=Math.sin(a);
    const radialSteps=5;
    // Unconnected roads are capped at 60% of an edge, matching
    // AutoMesh's existing dead-end support, never floating off-road.
    const maxR=((connectedMask>>edge)&1)?(apothem-.08):.47;
    for(let step=0;step<radialSteps;step++){
      const r=.15+step*(maxR-.15)/(radialSteps-1);
      for(const lane of [-1,1]){
        const side=(lane*.075)+((step%2)*.009);
        const x=c*r+s*side,z=-s*r+c*side;
        const tone=tones[(step+edge+(lane+1))%tones.length];
        parts.push(part(new THREE.BoxGeometry(.11,.012,.115),tone,{
          t:[x,TILE_H+.044,z],ry:a
        }));
      }
    }
  }
  // A compact royal paved plaza is added once, not repeated per connection.
  for(let step=0;step<7;step++){
    const a=step*2*Math.PI/7,rad=step%2===0?.17:.115;
    parts.push(part(new THREE.BoxGeometry(.095,.013,.09),
      tones[step%tones.length],{
      t:[Math.cos(a)*rad,TILE_H+.046,Math.sin(a)*rad],ry:a
    }));
  }
  return oneMesh('rani-royal-road-paving',parts);
}

/** Automatic hostile-border stone wall, unlocked VISUALLY at village Lv.2.
 * Keep the original palisade at Lv.1 and all original battle/territory rules.
 */
export function makeRoyalBorderWall() {
  const parts=[
    part(new THREE.BoxGeometry(.94,.085,.16),PALETTE.rockDark,{t:[0,.045,0]}),
    part(new THREE.BoxGeometry(.92,.30,.115),PALETTE.royalStone,{t:[0,.23,0]}),
    part(new THREE.BoxGeometry(.96,.035,.15),PALETTE.royalPaveShade,{t:[0,.395,0]}),
  ];
  // Broken-up stone blocks and alternating crenels read as true castle wall
  // at default isometric distance, without a separate mesh per brick.
  for(let i=0;i<5;i++){
    const x=-.39+i*.195;
    parts.push(part(new THREE.BoxGeometry(.095,.09,.14),PALETTE.royalStone,{
      t:[x,.464,0]
    }));
    parts.push(part(new THREE.BoxGeometry(.17,.012,.01),
      i%2?PALETTE.royalPaveShade:PALETTE.royalPave,{
      t:[x,.285,.063]
    }));
  }
  // Blue and gold trim forms the royal faction motif on the outside.
  parts.push(part(new THREE.BoxGeometry(.17,.15,.014),PALETTE.royalBlue,{
    t:[0,.26,.071]
  }));
  parts.push(part(new THREE.BoxGeometry(.025,.12,.02),PALETTE.royalGold,{
    t:[0,.27,.085]
  }));
  parts.push(part(new THREE.BoxGeometry(.1,.021,.021),PALETTE.royalGold,{
    t:[0,.295,.087]
  }));
  return oneMesh('rani-royal-border-wall',parts);
}

export function makeRoyalGateOrnaments() {
  const parts=[];
  // Place all features on the 4th (finished) construction phase.
  for(const x of [-.21,.21]){
    parts.push(part(new THREE.BoxGeometry(.12,.025,.14),
      PALETTE.royalGold,{t:[x,.657,.007]}));
    parts.push(part(new THREE.BoxGeometry(.066,.115,.013),
      PALETTE.royalBlue,{t:[x,.39,.11]}));
    parts.push(part(new THREE.BoxGeometry(.016,.089,.02),
      PALETTE.royalGold,{t:[x,.39,.124]}));
    parts.push(part(new THREE.SphereGeometry(.024,6,4),
      PALETTE.royalGold,{t:[x,.838,0]}));
  }
  // Crest on the lintel facing the player, well ABOVE the door opening.
  parts.push(part(new THREE.BoxGeometry(.09,.075,.014),
    PALETTE.royalBlue,{t:[0,.535,.115]}));
  parts.push(part(new THREE.BoxGeometry(.016,.058,.021),
    PALETTE.royalGold,{t:[0,.535,.125]}));
  parts.push(part(new THREE.BoxGeometry(.07,.015,.021),
    PALETTE.royalGold,{t:[0,.547,.127]}));
  return oneMesh('rani-royal-gate-ornaments',parts);
}

export function makeRoyalBastionOrnaments() {
  const parts=[
    part(new THREE.ConeGeometry(.16,.17,7),PALETTE.royalBlue,{t:[0,.75,0]}),
    part(new THREE.SphereGeometry(.033,6,5),PALETTE.royalGold,{t:[0,.86,0]}),
    part(new THREE.BoxGeometry(.075,.12,.02),PALETTE.royalBlue,{t:[0,.36,.161]}),
    part(new THREE.BoxGeometry(.02,.09,.025),PALETTE.royalGold,{t:[0,.36,.178]}),
  ];
  return oneMesh('rani-royal-bastion-ornaments',parts);
}

/** Quayside gold/blue kingdom flags, decking bands and proper sail silhouette.
 * The ORIGINAL pier/boat remains unchanged and interactive.
 */
export function makeRoyalHarborOrnaments(kind='port') {
  const port=kind==='port';
  const parts=[];
  const x=port?.34:.19,z=port?.13:.29;
  // Pier's boat mast already exists only in port; fishing pier gets a shorter
  // pennant pole on the quay. Keep these far from built cargo crane/counter.
  const mastHeight=port?.39:.31,deck=port?.12:.12;
  parts.push(part(new THREE.CylinderGeometry(.009,.012,mastHeight,5),
    PALETTE.woodBeam,{t:[x,deck+mastHeight/2,z]}));
  parts.push(part(new THREE.BoxGeometry(.19,.11,.012),PALETTE.royalBlue,{
    t:[x+.096,deck+mastHeight-.11,z]
  }));
  parts.push(part(new THREE.BoxGeometry(.024,.085,.018),PALETTE.royalGold,{
    t:[x+.09,deck+mastHeight-.11,z+.011]
  }));
  parts.push(part(new THREE.SphereGeometry(.021,5,4),
    PALETTE.royalGold,{t:[x,deck+mastHeight+.015,z]}));
  // Three real timber plank joints on quay; no fake splash texture.
  for(const offset of [-.15,0,.15]){
    parts.push(part(new THREE.BoxGeometry(port?.12:.17,.012,.018),
      PALETTE.royalPave,{t:[offset,port?.113:.137,port?-.05:.22]}));
  }
  if(port){
    // Cobalt harbor authority sign on the actual building front.
    parts.push(part(new THREE.BoxGeometry(.095,.083,.015),PALETTE.royalBlue,{
      t:[-.2,.24,-.003]
    }));
    parts.push(part(new THREE.BoxGeometry(.019,.062,.02),PALETTE.royalGold,{
      t:[-.2,.24,.008]
    }));
  }
  return oneMesh(port?'rani-royal-harbor-ornaments':'rani-royal-pier-ornaments',parts);
}
