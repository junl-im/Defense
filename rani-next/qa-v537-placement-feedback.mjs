// v5.37: fixed native build verdict and no ghost after cancellation.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const nap=ms=>new Promise(r=>setTimeout(r,ms));
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
const until=async expression=>{
 for(let i=0;i<340;i++){if(await ev(expression))return;await nap(160)}
 throw Error('timeout '+expression);
};
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
 await until("!!window.__game?.raniWheel");
}
async function touch(selector){
 const p=await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),b=el.getBoundingClientRect();return {x:(b.left+b.right)/2,y:(b.top+b.bottom)/2,w:b.width,h:b.height}})()`);
 assert.ok(p.w>22&&p.h>22,'touch target missing '+selector);
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1}]},s);
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},s);
}
try{
 for(const [w,h,mobile] of [[1366,768,false],[390,844,true],[844,390,true]]){
  await start(w,h,mobile);
  if(mobile){await touch('#rk-touch-build');await until("!!document.querySelector('#sheet-build.open')");}
  else await ev("document.querySelector('#rk-build-toggle').click()");
  await until("!!document.querySelector('#buildmenu button[data-name]')");
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  await until("!document.querySelector('#rk-placement-state').hidden");
  const info=await ev("(()=>{const el=document.querySelector('#rk-placement-state'),b=el.getBoundingClientRect(),stop=document.querySelector('#rk-placement-cancel');return {text:el.textContent,visible:!el.hidden,valid:el.dataset.rkValid,rect:b.toJSON(),hit:document.elementFromPoint(b.left+b.width/2,b.top+b.height/2)?.id,canCancel:!stop.hidden};})()");
  assert.ok(info.visible&&info.text.includes('배치')&&info.text.length>8,JSON.stringify(info));
  assert.ok(info.rect.left>=-1&&info.rect.right<=w+1&&info.rect.top>=-1&&info.rect.bottom<=h+1,'placement feedback offscreen '+JSON.stringify(info));
  assert.ok(info.canCancel,'placement escape not available '+JSON.stringify(info));
  assert.notEqual(info.hit,'rk-placement-state','status must not steal map taps');
  if(mobile)await touch('#rk-placement-cancel');
  else await ev("document.querySelector('#rk-placement-cancel').click()");
  await until("document.querySelector('#rk-placement-state').hidden");
  assert.equal(await ev("window.__game.placement.selected"),null);
  console.log('PASS v5.37 placement feedback, safe bounds, escape',w,h,mobile?'touch':'mouse');
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
