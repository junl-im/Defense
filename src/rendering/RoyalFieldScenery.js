// Rani Kingdom v2.4 — lightweight royalty-themed scenery in the REAL 3D field.
// Cosmetic only. Field ownership/territory, picking, combat and saves are untouched.
// Four shared InstancedMeshes for the backdrop; one merged mesh per actual town.
import * as THREE from 'three';
import { PALETTE, MATS } from './Materials.js';
import { part, merge } from '../assets/GeometryUtils.js';

const HEX_ANGLE=Math.PI/6;
function mix(n) {
  n=Math.imul(n ^ (n>>>16),0x7feb352d);
  n=Math.imul(n ^ (n>>>15),0x846ca68b);
  return (n ^ (n>>>16))>>>0;
}
function nonPickable(mesh) {
  mesh.raycast=()=>{}; // decorative geometry must never steal town/hex clicks
  mesh.userData.raniFieldVisualOnly=true;
  mesh.frustumCulled=false;
  return mesh;
}

export function installRoyalFieldScenery(scene) {
  const group=new THREE.Group();
  group.name='rani-royal-field-scenery';
  group.userData.raniFieldVisualOnly=true;
  // Shared buffers and a fixed budget, built once with the lazy field scene.
  const capacity=128;
  const trunks=nonPickable(new THREE.InstancedMesh(
    new THREE.CylinderGeometry(.042,.072,.36,5),
    new THREE.MeshLambertMaterial({color:PALETTE.trunk}),capacity));
  const pine=nonPickable(new THREE.InstancedMesh(
    new THREE.ConeGeometry(.29,.70,6),
    new THREE.MeshLambertMaterial({color:PALETTE.leafPine}),capacity));
  const oak=nonPickable(new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(.33,0),
    new THREE.MeshLambertMaterial({color:PALETTE.leafB}),capacity));
  const stones=nonPickable(new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(.17,0),
    new THREE.MeshLambertMaterial({color:PALETTE.royalPaveShade}),capacity));
  const dummy=new THREE.Object3D();
  let nt=0,np=0,no=0,ns=0;
  for(let r=-6;r<=6;r++)for(let q=-6;q<=6;q++){
    if(Math.abs(q+r)>7)continue;
    // Keep the center clear and never replace the authoritative field grid.
    if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<5)continue;
    const hash=mix(Math.imul(q+23,73856093)^Math.imul(r+41,19349663));
    if((hash>>>9)%2!==0)continue; // mixed conifers/oaks, still sparse at map edges
    const x=q*.93+r*.465, z=r*.81;
    // Avoid masking the player's central castle or the prominent map axis.
    if(Math.hypot(x,z)<4.2)continue;
    const h=.76+((hash>>>8)%40)/100;
    const offsetX=((hash>>>15)%17-8)*.026;
    const offsetZ=((hash>>>21)%17-8)*.026;
    const px=x+offsetX,pz=z+offsetZ;
    dummy.rotation.set(0,(hash%6)*HEX_ANGLE,0);
    dummy.scale.set(h,h,h);
    dummy.position.set(px,-.11+.18*h,pz);
    dummy.updateMatrix();
    trunks.setMatrixAt(nt++,dummy.matrix);
    dummy.position.y=-.11+.71*h;
    dummy.updateMatrix();
    if(hash&1)pine.setMatrixAt(np++,dummy.matrix);
    else oak.setMatrixAt(no++,dummy.matrix);
    if((hash&7)===0){
      dummy.position.set(px+.29,-.095,pz-.2);
      dummy.scale.set(.7,((hash>>>12)%4+5)/10,1);
      dummy.updateMatrix();
      stones.setMatrixAt(ns++,dummy.matrix);
    }
  }
  for(const [mesh,count] of [[trunks,nt],[pine,np],[oak,no],[stones,ns]]){
    mesh.count=count;
    mesh.instanceMatrix.needsUpdate=true;
    group.add(mesh);
  }
  scene.add(group);
  return group;
}

export function makeRoyalFieldTownDressing(entry) {
  const player=entry.id==='player';
  const factionColor=player?PALETTE.royalBlue:
    entry.hostile?0xa85044:0x57866d;
  const parts=[];
  // Thin stone forecourt lets the real 3D settlement read as a village.
  // Do not add new buildings or fictitious claims to the saved territory.
  const tones=[PALETTE.royalPave,PALETTE.royalPaveLight,PALETTE.royalPaveShade];
  for(let i=0;i<8;i++){
    const ang=i*Math.PI/4;
    parts.push(part(new THREE.BoxGeometry(.24,.035,.22),tones[i%3],{
      t:[Math.cos(ang)*.79,.205,Math.sin(ang)*.79],ry:ang
    }));
  }
  // Heraldic poles stand outside the existing town-center and GLTF hit area.
  const flagCount=player||entry.tier>=3?2:1;
  for(let i=0;i<flagCount;i++){
    const x=flagCount===1?-.59:(i===0?-.59:.59),z=.32;
    const y=entry.tier>=3?1.02:.86;
    parts.push(part(new THREE.CylinderGeometry(.013,.018,y-.2,5),PALETTE.woodBeam,{
      t:[x,(y+.2)/2,z]
    }));
    parts.push(part(new THREE.BoxGeometry(.19,.12,.014),factionColor,{
      t:[x+.10,y-.10,z]
    }));
    parts.push(part(new THREE.BoxGeometry(.025,.084,.021),PALETTE.royalGold,{
      t:[x+.08,y-.10,z+.014]
    }));
    parts.push(part(new THREE.SphereGeometry(.028,6,4),PALETTE.royalGold,{
      t:[x,y+.01,z]
    }));
  }
  if(player&&entry.tier>=2){
    // An upgraded kingdom earns a visible crest, not a new gameplay level.
    parts.push(part(new THREE.BoxGeometry(.11,.17,.025),PALETTE.royalBlue,{
      t:[0,.63,.48]
    }));
    parts.push(part(new THREE.BoxGeometry(.027,.14,.035),PALETTE.royalGold,{
      t:[0,.63,.50]
    }));
  }
  const mesh=new THREE.Mesh(merge(parts),MATS.vcStatic);
  mesh.name='rani-royal-field-town-dressing';
  mesh.userData.raniFieldVisualOnly=true;
  mesh.userData.raniVisualOnly=true;
  mesh.castShadow=false;
  mesh.receiveShadow=true;
  mesh.raycast=()=>{}; // existing platform/city remains the sole selection target
  return mesh;
}
