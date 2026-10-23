// v5.33 — verify the real page leaves normal boot alone and explains WebGL failure.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const ver=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(ver.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
async function ev(x){
 const r=await c.send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
}
async function until(x){for(let i=0;i<240;i++){if(await ev(x))return;await sleep(150);}throw Error('Timeout: '+x);}
try{
 for(const [w,h,mobile] of [[1366,768,false],[320,568,true]]){
  await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
  await c.send('Page.navigate',{url},s);
  await until("!!document.querySelector('#rk-start-now')&&window.__rkBootGuard===true");
  assert.equal(await ev("!!document.querySelector('#rk-webgl-fallback')"),false);
  await ev("window.dispatchEvent(new ErrorEvent('error',{message:'Unrelated warning'}))");
  assert.equal(await ev("!!document.querySelector('#rk-webgl-fallback')"),false);
  await ev("window.dispatchEvent(new ErrorEvent('error',{message:'THREE.WebGLRenderer: Error creating WebGL context.'}))");
  await until("!!document.querySelector('#rk-webgl-fallback')");
  const snap=await ev("(()=>{const e=document.querySelector('#rk-webgl-fallback'),p=e.querySelector('.rk-webgl-panel'),b=e.querySelector('button'),r=p.getBoundingClientRect();return{role:e.getAttribute('role'),heading:e.querySelector('h2').textContent,help:e.querySelector('#rk-webgl-help').textContent,retry:b.textContent,focused:document.activeElement===b,links:[...e.querySelectorAll('a')].map(a=>new URL(a.href).pathname),left:r.left,right:r.right,top:r.top,bottom:r.bottom,scrollWidth:document.documentElement.scrollWidth}})()");
  assert.equal(snap.role,'alertdialog');assert.equal(snap.heading,'왕국 화면을 열 수 없어요');
  assert.ok(snap.help.includes('그래픽 가속'));assert.equal(snap.retry,'다시 시도');
  assert.equal(snap.focused,true);
  assert.ok(snap.left>=0&&snap.right<=w+1,JSON.stringify(snap));
  assert.ok(snap.top>=0&&snap.bottom<=h+1,JSON.stringify(snap));
  assert.ok(snap.scrollWidth<=w+2,JSON.stringify(snap));
  if(new URL(url).pathname.startsWith('/Defense/'))assert.deepEqual(snap.links,['/Defense/legacy/']);
  console.log('PASS v5.33 Korean WebGL recovery and healthy initial screen',w,h);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
