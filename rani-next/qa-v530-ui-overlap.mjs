// v5.30 real native layout regression: PC, 320/390 phone and landscape.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=ms=>new Promise(r=>setTimeout(r,ms));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async x=>{
 const r=await c.send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
};
const until=async x=>{
 for(let i=0;i<340;i++){if(await ev(x))return;await sleep(180);}
 throw Error('Timed out '+x);
};
async function start(w,h,mobile){
 await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.raniWheel");
}
const geometry=[
"(()=>{",
"const rect=e=>{if(!e)return null;const s=getComputedStyle(e),b=e.getBoundingClientRect();",
"return s.display==='none'||s.visibility==='hidden'||b.width<1||b.height<1?null:{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};",
"const overlap=(a,b)=>!a||!b?0:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));",
"const at=s=>rect(document.querySelector(s));",
"const hex=[...document.querySelectorAll('#rk-hex-menu .rk-hex-option')].filter(b=>!b.hidden).map(b=>({name:b.dataset.action,box:rect(b),background:getComputedStyle(b).backgroundImage}));",
"return {w:innerWidth,h:innerHeight,dock:at('#rk-actions'),row:at('#rk-actions .rk-action-row'),build:at('#rk-build-toggle'),menu:at('#rk-pause-toggle'),",
"catalog:at('#buildwrap'),stats:at('#stats'),controls:at('#controls'),",
"pad:at('#pad'),group:at('.rk-touch-actions'),touchBuild:at('#rk-touch-build'),touchMenu:at('#rk-touch-menu'),",
"hex,overlapDockStats:overlap(at('#rk-actions'),at('#stats')),overlapDockControls:overlap(at('#rk-actions'),at('#controls')),",
"overlapCatalogRow:overlap(at('#buildwrap'),at('#rk-actions .rk-action-row')),",
"overlapPadHex:Math.max(0,...hex.map(b=>overlap(b.box,at('#pad')))),",
"overlapTouch:overlap(at('#rk-touch-build'),at('#rk-touch-menu')),overflow:document.documentElement.scrollWidth-innerWidth};",
"})()"
].join('');
try{
 for(const [w,h,mobile] of [[1366,768,false],[1024,600,false],[390,844,true],[320,568,true],[844,390,true]]){
  await start(w,h,mobile);
  if(!mobile){
   await ev("document.querySelector('#rk-build-toggle').click()");
   await sleep(100);
   const d=await ev(geometry);
   assert.ok(d.dock&&d.row&&d.build&&d.menu&&d.catalog,JSON.stringify(d));
   assert.ok(d.overlapDockStats<=1&&d.overlapDockControls<=1&&d.overlapCatalogRow<=1,JSON.stringify(d));
   assert.ok(d.row.bottom<=h+1&&d.build.left>=0&&d.menu.right<=w+1,JSON.stringify(d));
   await ev("document.querySelector('#rk-build-toggle').click()");
  }else{
   const d=await ev(geometry);
   assert.ok(d.pad&&d.group&&d.touchBuild&&d.touchMenu&&!d.dock,JSON.stringify(d));
   assert.ok(d.overlapTouch<=1&&d.touchBuild.left>=0&&d.touchMenu.right<=w+1&&d.pad.bottom<=h+1,JSON.stringify(d));
  }
  await ev("(()=>{const g=window.__game,k=g.state.buildings.find(b=>b.name==='keep');g.raniWheel.close();g.raniWheel.toggle({key:'building:'+k.id,name:k.name,label:k.def.label,x:k.x+k.def.footprint[0]/2,z:k.z+k.def.footprint[1]/2,building:k});})()");
  await sleep(100);
  const x=await ev(geometry);
  assert.equal(x.hex.length,6,JSON.stringify(x));
  assert.ok(x.hex.every(b=>b.box&&b.box.left>=-2&&b.box.right<=w+2&&b.box.top>=-2&&b.box.bottom<=h+2&&b.background.includes('gradient')),JSON.stringify(x));
  assert.ok(x.overlapPadHex<=1,JSON.stringify(x));
  assert.ok(x.overflow<=3,JSON.stringify(x));
  console.log('PASS v5.30 collision-free royal dock/hex',w,h,mobile);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
