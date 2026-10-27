// v5.38: camera pans and zooms must not move the selected building to a
// different WORLD tile each animation frame. Uses real browser pointer events.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const ws=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(ws.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expression=>{
 const r=await c.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);
 return r.result.value;
};
const until=async e=>{for(let i=0;i<350;i++){if(await ev(e))return;await pause(160)}throw Error('timeout '+e);};
const view=()=>ev("(()=>{const g=window.__game;return {selected:g.placement.selected,hover:g.placement.hover,cam:[g.iso.target.x,g.iso.target.z],notice:document.querySelector('#rk-placement-state')?.textContent};})()");
async function start(w,h,mobile){
 await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.placement");
 // Select a REAL, non-paintable building: no painted wall/run gestures.
 await ev("window.__game.placement.select('hovel');window.__game.hud.onSelect?.()");
 await until("!!window.__game.placement.selected");
}
const mouse=async(type,x,y,pressed=false)=>c.send('Input.dispatchMouseEvent',{
 type,x,y,button:pressed?'left':'none',buttons:pressed?1:0,
 ...(type==='mousePressed'||type==='mouseReleased'?{button:'left',clickCount:1}:{})
},s);
const touch=async(type,coords)=>c.send('Input.dispatchTouchEvent',{
 type,touchPoints:coords.map(([x,y],i)=>({x,y,id:i+1}))
},s);
async function check(w,h,mobile){
 await start(w,h,mobile);
 const xy=await ev("(()=>{const b=document.querySelector('#app canvas').getBoundingClientRect();return {x:b.left+b.width*.60,y:b.top+b.height*.50,w:b.width,h:b.height};})()");
 assert.ok(xy.w>150&&xy.h>150);
 const x=xy.x,y=xy.y;
 if(mobile){
   // Establish the actual world tile without placing the building.
   await touch('touchStart',[[x,y]]);
   await pause(85);
 }else{
   await mouse('mouseMoved',x,y);
   await pause(85);
   await mouse('mousePressed',x,y,true);
   await pause(85);
 }
 const initial=await view();
 assert.ok(initial.hover&&initial.selected==='hovel',JSON.stringify(initial));
 const buildings=await ev("window.__game.state.buildings.length");
 for(let k=1;k<=3;k++){
   const nx=x+k*22,ny=y+k*9;
   if(mobile)await touch('touchMove',[[nx,ny]]);
   else await mouse('mouseMoved',nx,ny,true);
   await pause(150);
   const step=await view();
   assert.deepEqual(step.hover,initial.hover,'preview tile jumps while map pans '+JSON.stringify({w,h,k,initial,step}));
   assert.equal(step.selected,'hovel','pan dropped building selection');
   assert.ok(step.notice?.includes('위치 유지'),'missing anchored preview feedback '+JSON.stringify(step));
 }
 const moved=await view();
 assert.ok(Math.hypot(moved.cam[0]-initial.cam[0],moved.cam[1]-initial.cam[1])>.05,
  'real map did not pan '+JSON.stringify({initial,moved}));
 if(mobile)await touch('touchEnd',[]);
 else await mouse('mouseReleased',x+66,y+27);
 await pause(90);
 assert.deepEqual((await view()).hover,initial.hover,'world ghost jumped on pan release');
 assert.equal(await ev("window.__game.state.buildings.length"),buildings,'pan accidentally built a house');
 if(!mobile){
   // A deliberate free mouse movement releases the anchor and repicks.
   await mouse('mouseMoved',x+135,y-90);
   await pause(150);
   const next=await view();
   assert.ok(next.hover,'hover missing after free mouse movement');
   assert.notDeepEqual(next.hover,initial.hover,'free mouse movement cannot relocate preview');
 }else{
   // Cancel must remain usable without a mouse/keyboard after a pan.
   assert.equal(await ev("document.querySelector('#rk-placement-cancel').hidden"),false);
 }
 console.log('PASS v5.38 stable building world tile during pan',w,h,mobile?'touch':'mouse');
}
try{
 await check(1366,768,false);
 await check(390,844,true);
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
