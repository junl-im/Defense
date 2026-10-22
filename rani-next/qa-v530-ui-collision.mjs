import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ws=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(ws.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;};
const until=async e=>{for(let i=0;i<340;i++){if(await ev(e))return;await sleep(160);}throw Error('timeout '+e)};
const intersection=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
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
try{
 for(const [w,h] of [[1366,768],[960,640]]){
  await start(w,h,false);await until("!!document.querySelector('#rk-actions')");
  await sleep(320);
  const before=await ev("(()=>{const d=document.querySelector('#rk-actions'),g=document.querySelector('#rk-first-steps');return {dock:d.getBoundingClientRect().toJSON(),step:g&&!g.hidden?g.getBoundingClientRect().toJSON():null,layout:d.dataset.rkLayout,wrap:document.querySelector('#buildwrap').parentElement.id,doc:document.documentElement.scrollWidth};})()");
  assert.equal(before.layout,'one-dock');assert.equal(before.wrap,'rk-actions');
  assert.ok(before.dock.left>=0&&before.dock.right<=w+1&&before.dock.bottom<=h+1,JSON.stringify(before));
  if(before.step)assert.ok(intersection(before.dock,before.step)<50,JSON.stringify(before));
  await ev("document.querySelector('#rk-build-toggle').click()");
  await until("document.querySelector('#rk-actions').dataset.open==='true'");await sleep(230);
  const open=await ev("(()=>{const d=document.querySelector('#rk-actions'),g=document.querySelector('#rk-first-steps');return {dock:d.getBoundingClientRect().toJSON(),step:g&&!g.hidden&&getComputedStyle(g).visibility!=='hidden'?g.getBoundingClientRect().toJSON():null,wrap:document.querySelector('#buildwrap').parentElement.id,categories:document.querySelectorAll('#buildbar button').length};})()");
  assert.ok(open.categories>=3&&open.dock.top>=0&&open.dock.right<=w+1,JSON.stringify(open));
  if(open.step)assert.ok(intersection(open.dock,open.step)<50,JSON.stringify(open));
  await ev("document.querySelector('#rk-build-toggle').click()");
  assert.equal(await ev("document.querySelector('#rk-actions').dataset.open"),'false');
  console.log('PASS v5.30 desktop dock and onboarding no overlap',w,h);
 }
 for(const [w,h] of [[320,568],[390,844],[844,390]]){
  await start(w,h,true);await until("!!document.querySelector('#pad .rk-touch-actions')");
  const pad=await ev("(()=>{const p=document.querySelector('#pad'),a=p.querySelector('.rk-touch-actions'),rect=x=>x.getBoundingClientRect().toJSON();return {group:rect(a),pad:rect(p),names:[...a.querySelectorAll('button')].map(x=>x.textContent),utils:[...p.querySelectorAll(':scope > button')].map(rect),doc:document.documentElement.scrollWidth,other:document.querySelectorAll('#rk-actions').length};})()");
  assert.deepEqual(pad.names,['건설','메뉴']);assert.equal(pad.other,0);
  assert.ok(pad.group.left>=0&&pad.group.right<=w+1&&pad.pad.bottom<=h+1&&pad.doc<=w+3,JSON.stringify(pad));
  assert.ok(pad.utils.every(x=>x.right<=pad.group.left+1),JSON.stringify(pad));
  const wheel=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.close();g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});const el=document.querySelector('#rk-hex-menu'),body=el.querySelector('.rk-hex-buttons'),options=[...el.querySelectorAll('.rk-hex-option')];return {bounds:el.getBoundingClientRect().toJSON(),buttons:options.length,absolute:options.every(x=>getComputedStyle(x).position==='absolute'),icon:getComputedStyle(options[0],'::before').content,back:getComputedStyle(body).backgroundImage,color:getComputedStyle(body).backgroundColor,compact:el.dataset.rkCompact,pad:document.querySelector('#pad').getBoundingClientRect().toJSON()};})()");
  assert.equal(wheel.buttons,6);assert.ok(wheel.absolute&&wheel.icon!=='none');
  assert.equal(wheel.back,'none');assert.equal(wheel.color,'rgba(0, 0, 0, 0)');
  assert.ok(wheel.bounds.left>=-1&&wheel.bounds.right<=w+1&&wheel.bounds.top>=-2&&wheel.bounds.bottom<=wheel.pad.top+2,JSON.stringify(wheel));
  await ev("document.querySelector('#rk-hex-menu [data-action=info]').click()");
  const info=await ev("(()=>{const e=document.querySelector('#rk-hex-menu');return {visible:!e.querySelector('#rk-hex-info').hidden,expanded:e.querySelector('[data-action=info]').getAttribute('aria-expanded')};})()");
  assert.ok(info.visible&&info.expanded==='true',JSON.stringify(info));
  await ev("document.querySelector('#rk-hex-menu .rk-hex-core').click()");
  assert.ok(await ev("document.querySelector('#rk-hex-menu').hidden"));
  console.log('PASS v5.30 mobile real controls and themed safe-area hex',w,h);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);