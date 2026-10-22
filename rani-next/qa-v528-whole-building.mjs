// v5.29: whole 2.5D building roof picker and true-footprint growth effect.
// Runs on actual native Fiefdom world, no fabricated DOM/sprites or save schema.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async e=>{
 const x=await c.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},s);
 if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||JSON.stringify(x.exceptionDetails));
 return x.result.value;
};
const until=async e=>{for(let i=0;i<330;i++){if(await ev(e))return;await sleep(180);}throw Error('Timeout: '+e);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.29');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.rkHitWholeBuilding");
 const geom=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(b=>b.name==='keep');
   const [w,d]=b.def.footprint;
   const pts=[[b.x,b.z],[b.x+w,b.z],[b.x+w,b.z+d],[b.x,b.z+d]];
   const found=pts.map(([x,z])=>{
     const px=g.iso.worldToScreen(x+.01,g.terrain.heightAt(x,z),z+.01);
     const gg=g.iso.screenToGround(px[0],px[1],g.iso.target.y);
     return {x,z,screen:px,hit:g.rkHitWholeBuilding(px[0],px[1],x+.01,z+.01)?.id===b.id};
   });
   const center=g.iso.worldToScreen(b.x+w/2,g.terrain.heightAt(b.x,b.z),b.z+d/2);
   let roof=[];
   for(const offset of [10,20,30,40,50,60,70,80,90,100]){
      const px=center[0],py=center[1]-offset;
      let ground=g.iso.screenToGround(px,py,g.iso.target.y);
      ground=g.iso.screenToGround(px,py,g.terrain.heightAt(ground.x,ground.z));
      const on=g.state.buildings.some(t=>t.id===b.id &&
        ground.x>=t.x&&ground.z>=t.z&&ground.x<t.x+w&&ground.z<t.z+d);
      roof.push({offset,groundStillOverKeep:on,hit:g.rkHitWholeBuilding(px,py,ground.x,ground.z)?.id===b.id});
   }
   return {size:[w,d],found,roof,hover:g.describeAt(b.x,b.z)?.title};
 })()`);
 assert.ok(geom.found.every(p=>p.hit),JSON.stringify(geom));
 assert.ok(geom.roof.some(p=>p.hit&&!p.groundStillOverKeep),
   'Roof pixels should resolve to building even if ground ray points outside: '+JSON.stringify(geom));
 const build=await ev(`(()=>{
   const g=window.__game;
   for(const name of ['wood','stone','gold','iron'])g.state.stock[name]=50000;
   const pos=g.findSpot('hovel');
   const out=g.build('hovel',pos.x,pos.z);
   const root=document.querySelector('#rk-construction-fx');
   const node=root.querySelector('.rk-construction');
   const outline=node.querySelector('.rk-growth-outline');
   const wash=node.querySelector('.rk-growth-wash');
   const tower=node.querySelector('.rk-growth-tower');
   const point=node.querySelector('.rk-growth-edge');
   const last=g.state.buildings.at(-1);
   return {out,area:node.dataset.rkArea,
      expected:last.def.footprint.join('×'),corners:node.dataset.rkFootprintCorners,
      projectedWidth:+node.dataset.rkProjectedWidth,projectedHeight:+node.dataset.rkProjectedHeight,
      edges:outline.children.length,edgeLength:parseFloat(point.style.width),
      mask:wash.style.clipPath,verticalHeight:parseFloat(tower.style.height),
      animation:getComputedStyle(point).animationName,pointer:getComputedStyle(root).pointerEvents};
 })()`);
 assert.ok(build.out==='hovel'&&build.area===build.expected&&build.corners==='4'
   &&build.edges===4&&build.projectedWidth>0&&build.projectedHeight>0
   &&build.edgeLength>4&&build.mask.startsWith('polygon(')
   &&build.verticalHeight>build.projectedHeight
   &&build.animation.includes('rk-v528-edge-rise')
   &&build.pointer==='none',JSON.stringify(build));
 const blocked=await ev(`(()=>{
   const g=window.__game,fx=document.querySelector('#rk-construction-fx');
   const serial=Number(fx.dataset.rkSerial);
   g.build('hovel',-5,-5);
   return {before:serial,after:Number(fx.dataset.rkSerial)};
 })()`);
 assert.equal(blocked.after,blocked.before);
 const upgrade=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
    x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
   const previous=b.lvl||1,control=document.querySelector('#rk-hex-menu [data-action=upgrade]');
   if(control&&!control.hidden)control.click();
   const node=document.querySelector('#rk-construction-fx .rk-upgrade');
   return {previous,level:b.lvl||1,actual:b.def.footprint.join('×'),
     area:node?.dataset.rkArea,corners:node?.dataset.rkFootprintCorners,
     edges:node?.querySelectorAll('.rk-growth-edge').length,
     projectedWidth:+node?.dataset.rkProjectedWidth,mask:node?.querySelector('.rk-growth-wash')?.style.clipPath};
 })()`);
 assert.ok(upgrade.level===upgrade.previous+1&&upgrade.area===upgrade.actual
   &&upgrade.corners==='4'&&upgrade.edges===4&&upgrade.projectedWidth>build.projectedWidth,
  JSON.stringify(upgrade));
 console.log('PASS v5.29 real whole building hit + projected roof + physical 4-corner upgrade',geom,build,upgrade);
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);