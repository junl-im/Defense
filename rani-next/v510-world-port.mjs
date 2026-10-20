// v5.10: actual water-only animated ships and world-positioned fishery piers.
// Decorative 3D dock meshes reflect native Fiefdom state. No fake building.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const p=path.join(root,'src/main.ts');let s=fs.readFileSync(p,'utf8');
const rep=(a,b)=>{assert.equal(s.split(a).length,2,'v5.10 source drift '+a.slice(0,78));s=s.replace(a,b);};
rep('  const rkSeaShips: THREE.Sprite[]=[];',[
"  const rkSeaShips: THREE.Sprite[]=[];",
"  // Sprite ships and pier props use the SAME native tile coordinates and",
"  // terrain as worker movement. No shore crossing, phantom ports or SVG.",
"  const rkPortDocks=new Map<number,THREE.Group>();",
"  const rkWaterId=GROUND_TYPES.indexOf('water');",
"  const rkWaterAt=(x:number,z:number)=>x>=0&&z>=0&&x<MAP_W&&z<MAP_H&&groundType[z*MAP_W+x]===rkWaterId;",
"  const rkDeepWater=(x:number,z:number)=>[[0,0],[-1,0],[1,0],[0,-1],[0,1]].every(([dx,dz])=>rkWaterAt(x+dx,z+dz));",
"  const rkBoatCourse=(x:number,z:number,index:number)=>{",
"    const dirs:[[number,number],[number,number],[number,number],[number,number]]=[[1,0],[0,1],[-1,0],[0,-1]];",
"    let best={dx:0,dz:0,count:0};",
"    for(const [dx,dz] of [dirs[index%4],...dirs]){",
"      let count=0;",
"      for(let n=1;n<=18;n++){if(!rkDeepWater(x+dx*n,z+dz*n))break;count=n;}",
"      if(count>best.count)best={dx,dz,count};",
"    }",
"    return {ax:x+.5,az:z+.5,bx:x+.5+best.dx*best.count,bz:z+.5+best.dz*best.count,tiles:best.count};",
"  };",
"  const rkDockDeck=new THREE.BoxGeometry(1.75,.22,3.2);",
"  const rkDockSlat=new THREE.BoxGeometry(1.68,.04,.09);",
"  const rkDockPole=new THREE.BoxGeometry(.18,1.45,.18);",
"  const rkDockLantern=new THREE.SphereGeometry(.16,8,6);",
"  const rkDockTimber=new THREE.MeshBasicMaterial({color:0x795333});",
"  const rkDockPlanks=new THREE.MeshBasicMaterial({color:0xb58a52});",
"  const rkDockGold=new THREE.MeshBasicMaterial({color:0xf1d18d});",
"  const rkMakePier=(x:number,z:number,rotation:number,buildingId:number)=>{",
"    const group=new THREE.Group();group.name='rk-world-fishery-pier';",
"    group.userData.buildingId=buildingId;",
"    group.position.set(x+.5,terrain.heightAt(x,z)+.46,z+.5);",
"    group.rotation.y=rotation;",
"    const deck=new THREE.Mesh(rkDockDeck,rkDockTimber);deck.position.y=.20;group.add(deck);",
"    for(let n=0;n<7;n++){const slat=new THREE.Mesh(rkDockSlat,rkDockPlanks);",
"      slat.position.set(0,.33,-1.27+n*.42);group.add(slat);}",
"    for(const dz of [-1.25,1.25])for(const dx of [-.78,.78]){",
"      const pole=new THREE.Mesh(rkDockPole,rkDockTimber);",
"      pole.position.set(dx,-.37,dz);group.add(pole);",
"      if(dz>0){const lamp=new THREE.Mesh(rkDockLantern,rkDockGold);",
"        lamp.position.set(dx,.45,dz);group.add(lamp);}",
"    }",
"    scene.add(group);return group;",
"  };",
"  let rkLastDockSync=0;",
"  const rkSyncPortDocks=()=>{",
"    if(!(chosen.id==='rani_coast'||chosen.id==='coast'))return;",
"    const active=new Set<number>();",
"    for(const b of state.buildings){",
"      if(b.name!=='fishery')continue;",
"      active.add(b.id);if(rkPortDocks.has(b.id))continue;",
"      const [w,d]=b.def.footprint,cx=b.x+w/2,cz=b.z+d/2;",
"      let near:{x:number,z:number,dist:number}|null=null;",
"      for(let z=Math.max(2,Math.floor(cz)-7);z<=Math.min(MAP_H-3,Math.ceil(cz)+7);z++)",
"        for(let x=Math.max(2,Math.floor(cx)-7);x<=Math.min(MAP_W-3,Math.ceil(cx)+7);x++){",
"          if(!rkWaterAt(x,z))continue;",
"          const dist=Math.hypot(x+.5-cx,z+.5-cz);",
"          if(dist>7.6)continue;",
"          if(!near||dist<near.dist)near={x,z,dist};",
"        }",
"      if(near){const rotation=Math.atan2(near.x+.5-cx,near.z+.5-cz);",
"        rkPortDocks.set(b.id,rkMakePier(near.x,near.z,rotation,b.id));}",
"    }",
"    for(const [id,pier] of rkPortDocks)if(!active.has(id)){scene.remove(pier);rkPortDocks.delete(id);}",
"  };"
].join('\n'));
rep("     scene.add(vessel);rkSeaShips.push(vessel);",[
"     // Every route step has verified navigable deep-water neighbors.",
"     vessel.userData.rkRoute=rkBoatCourse(x,z,rkSeaShips.length);",
"     scene.add(vessel);rkSeaShips.push(vessel);"
].join('\n'));
rep("      terrain.setRaniSeaTime(now/1000);",[
"      terrain.setRaniSeaTime(now/1000);",
"      if(now-rkLastDockSync>950){rkLastDockSync=now;rkSyncPortDocks();}"
].join('\n'));
rep("        ship.position.y=(ship.userData.originalY as number)+Math.sin(now/1550+(ship.userData.wavePhase as number))*.06;",[
"        const course=ship.userData.rkRoute as {ax:number,az:number,bx:number,bz:number,tiles:number};",
"        const phase=ship.userData.wavePhase as number;",
"        const travel=(1+Math.sin(now/7300+phase))/2;",
"        ship.position.x=course.ax+(course.bx-course.ax)*travel;",
"        ship.position.z=course.az+(course.bz-course.az)*travel;",
"        ship.position.y=terrain.heightAt(Math.floor(ship.position.x),Math.floor(ship.position.z))+2.3+Math.sin(now/1550+phase)*.06;",
"        ship.scale.x=Math.sin(now/7300+phase)>=0?7.2:-7.2;"
].join('\n'));
rep("    rkSeaShips,","    rkSeaShips,\n    rkPortDocks,\n    rkSyncPortDocks,");
fs.writeFileSync(p,s);
const title=path.join(root,'src/ui/menu.ts');const text=fs.readFileSync(title,'utf8');
assert.equal(text.split("version.textContent='v5.9';").length,2);
fs.writeFileSync(title,text.replace("version.textContent='v5.9';","version.textContent='v5.10';"));
console.log('PASS v5.10 moving trade ships on certified water, real-state fishery wooden piers');
