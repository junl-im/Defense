// © 2026 곰같은여우: lightweight instanced environmental art, no SVG/assets/network.
// All tiny street objects are decorative; solid cover remains defined by simulation COVER.
export function populateRuinedCity(THREE,world,cover,arena,{mobile=false}={}){
 let seed=2610;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const cube=new THREE.BoxGeometry(1,1,1);
 const dummy=new THREE.Object3D();
 const instances=(items,color,roughness=1)=>{
  if(!items.length)return null;
  const mesh=new THREE.InstancedMesh(cube,new THREE.MeshStandardMaterial({color,roughness,metalness:0.03}),items.length);
  for(let i=0;i<items.length;i++){
   const p=items[i];dummy.position.set(p.x,p.y,p.z);
   dummy.rotation.set(p.rx||0,p.ry||0,p.rz||0);
   dummy.scale.set(p.w,p.h,p.d);
   dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;
  mesh.frustumCulled=false;
  world.add(mesh);
  return mesh;
 };
 const blocked=(x,z,margin=1.2)=>cover.some(c=>Math.abs(x-c.x)<c.w/2+margin&&Math.abs(z-c.z)<c.d/2+margin);
 const light=[],dark=[],paint=[],vegetation=[],rust=[];
 const max=mobile?115:225;
 for(let n=0;n<max*5&&light.length+dark.length<max;n++){
  const x=(random()*2-1)*(arena-1),z=(random()*2-1)*(arena-1);
  if(Math.abs(x)<5.4||Math.abs(z)<5.4||blocked(x,z)||x*x+z*z<56)continue;
  const obj={x,z,y:0.08,w:0.14+random()*0.7,h:0.06+random()*0.26,d:0.18+random()*0.7,ry:random()*6.283};
  (random()<0.55?light:dark).push(obj);
 }
 // Road cracks / scattered faded paint: fixed instanced strips = minimal draw calls.
 for(let n=0;n<(mobile?40:85);n++){
  const horizontal=random()<0.5,x=horizontal?(random()*2-1)*arena:(random()*2-1)*3.1;
  const z=horizontal?(random()*2-1)*3.1:(random()*2-1)*arena;
  if(Math.hypot(x,z)<4.8||blocked(x,z,0.5))continue;
  paint.push({x,z,y:0.075,w:0.055+random()*0.04,h:0.011,d:0.35+random()*0.9,ry:random()*Math.PI});
 }
 // Grass breaks through neglected pavements. Low-profile, so no collision discrepancy.
 for(let n=0;n<(mobile?25:75);n++){
  const x=(random()*2-1)*(arena-1),z=(random()*2-1)*(arena-1);
  if(blocked(x,z)||Math.abs(x)<4.4||Math.abs(z)<4.4)continue;
  vegetation.push({x,z,y:0.14,w:0.14+random()*0.22,h:0.18+random()*0.34,d:0.13+random()*0.2,ry:random()*6.28});
 }
 for(let n=0;n<20;n++){
  const sign=n%2?-1:1,z=-24+(n*17)%48;
  rust.push({x:sign*28.2,y:0.24,z,w:1.5+random()*0.8,h:0.25,d:0.7,ry:random()*2.5});
 }
 instances(light,0x716d64);instances(dark,0x38484a);
 instances(paint,0x353940);instances(vegetation,0x426348);
 instances(rust,0x6b5545);
 // These silhouettes are outside the player collision area; they must not block an invisible path.
 const vehicle=(x,z,rotation)=>{
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=rotation;world.add(root);
  const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:0.9,metalness:0.18});
  const chassis=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.68,4.3),material(0x53616a));
  chassis.position.y=0.55;root.add(chassis);
  const top=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.6,2.2),material(0x36434e));
  top.position.set(0,1.16,-0.12);root.add(top);
  const black=material(0x242b30);
  for(const xSide of [-1.05,1.05])for(const offset of [-1.34,1.34]){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.27,8),black);
   wheel.rotation.z=Math.PI/2;wheel.position.set(xSide,0.4,offset);root.add(wheel);
  }
  for(const offset of [-1,1]){
   const lamp=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.18,0.08),
    material(offset===-1?0x9b8a5d:0x703c39));
   lamp.position.set(offset*0.65,0.58,-2.18);root.add(lamp);
  }
 };
 vehicle(-30,-12,0.25);vehicle(30,11,-0.42);
 return {rubble:light.length+dark.length,roadDamage:paint.length,vegetation:vegetation.length};
}
