// v5.39 — browser QA: fewer build choices, access to ALL, 3 display modes.
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
 for(let i=0;i<345;i++){if(await ev(expression))return;await nap(160)}
 throw Error('timeout '+expression);
};
const clickTouch=async selector=>{
 const p=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;const hit=document.elementFromPoint(x,y);return {x,y,w:r.width,h:r.height,hit:hit===e||e.contains(hit)}})()`);
 assert.ok(p.w>20&&p.h>25&&p.hit,'touch blocked '+selector+' '+JSON.stringify(p));
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1}]},s);
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},s);
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
 await until("!!window.__game?.placement");
}
const stats=()=>ev("(()=>{const all=[...document.querySelectorAll('#buildmenu button[data-name]')];const visible=all.filter(x=>getComputedStyle(x).display!=='none');const quality=document.querySelector('#rk-quality-mode'),cv=document.querySelector('#app canvas');return {all:all.length,visible:visible.length,hidden:all.length-visible.length,easy:document.querySelector('#rk-easy-toggle')?.dataset.rkEasy,text:document.querySelector('#rk-easy-hint')?.textContent,q:quality?.dataset.rkQuality,dpr:cv.width/window.innerWidth,attr:quality?.dataset.rkDpr};})()");
try{
 for(const [w,h,mobile] of [[1366,768,false],[390,844,true],[320,568,true],[844,390,true]]){
  await start(w,h,mobile);
  assert.ok(await ev("!!document.querySelector('#rk-easy-toggle') && !!document.querySelector('#rk-quality-mode')"),'simple UI missing');
  if(mobile){
   await clickTouch('#rk-touch-build');
   await until("!!document.querySelector('#sheet-build.open')");
  }else{
   await ev("document.querySelector('#rk-build-toggle').click()");
   await until("document.querySelector('#rk-actions').dataset.open==='true'");
  }
  const a=await stats();
  assert.ok(a.all>12&&a.visible>0&&a.visible<a.all,'easy menu not simplified '+JSON.stringify(a));
  assert.equal(a.easy,'true');
  assert.equal(a.q,'balanced');
  if(mobile)assert.ok(Math.abs(a.dpr-1.25)<0.04,'mobile default still at full DPR: '+JSON.stringify(a));
  if(mobile)await clickTouch('#rk-easy-toggle');
  else await ev("document.querySelector('#rk-easy-toggle').click()");
  await until("document.querySelector('#rk-easy-toggle')?.dataset.rkEasy==='false'");
  if(mobile){await nap(320);assert.equal(await ev("document.querySelector('#rk-easy-toggle').dataset.rkEasy"),'false','one tap fired twice');}
  const b=await stats();
  assert.equal(b.visible,b.all,'all buildings not accessible '+JSON.stringify(b));
  assert.equal(b.easy,'false');
  if(mobile)await clickTouch('#rk-easy-toggle');
  else await ev("document.querySelector('#rk-easy-toggle').click()");
  await until("document.querySelector('#rk-easy-toggle')?.dataset.rkEasy==='true'");
  if(mobile){await nap(320);assert.equal(await ev("document.querySelector('#rk-easy-toggle').dataset.rkEasy"),'true','second tap fired twice');}
  assert.equal((await stats()).visible,a.visible,'simple view did not restore');
  // These settings are in the info sheet on phones, not permanent map clutter.
  if(mobile){
   await clickTouch('#pad button:nth-child(4)');
   await until("!!document.querySelector('#sheet-info.open')");
   await ev("document.querySelector('#rk-quality-mode').scrollIntoView({block:'center'})");
   await nap(180);
   await clickTouch('#rk-quality-mode');
  }else await ev("document.querySelector('#rk-quality-mode').click()");
  await until("document.querySelector('#rk-quality-mode')?.dataset.rkQuality==='saving'");
  if(mobile){await nap(320);assert.equal(await ev("document.querySelector('#rk-quality-mode').dataset.rkQuality"),'saving','quality touch fired twice');}
  const save=await stats();
  assert.equal(save.q,'saving');
  assert.ok(Math.abs(save.dpr-1)<0.035,'saving must reduce render size '+JSON.stringify(save));
  if(mobile)await clickTouch('#rk-quality-mode');
  else await ev("document.querySelector('#rk-quality-mode').click()");
  await until("document.querySelector('#rk-quality-mode')?.dataset.rkQuality==='sharp'");
  const sharp=await stats();
  assert.equal(sharp.q,'sharp');
  if(mobile)assert.ok(Math.abs(sharp.dpr-2)<0.06,'sharp quality must be restorable '+JSON.stringify(sharp));
  if(mobile)await clickTouch('#rk-quality-mode');
  else await ev("document.querySelector('#rk-quality-mode').click()");
  await until("document.querySelector('#rk-quality-mode')?.dataset.rkQuality==='balanced'");
  assert.equal((await stats()).q,'balanced');
  assert.equal(await ev("localStorage.getItem('rani.quality.v1')"),'balanced');
  assert.equal(await ev("localStorage.getItem('rani.easy-build.v1')"),'easy');
  console.log('PASS v5.39 real beginner catalog, full choices, GPU modes',w,h,mobile?'touch':'desktop');
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
