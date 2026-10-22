// v5.30 real native Chromium overlap and 6-hex layout regression.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const browser=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(browser.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async e=>{
 const r=await c.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
};
const until=async e=>{for(let i=0;i<300;i++){if(await ev(e))return;await sleep(180);}throw Error('Timeout '+e)};
const overlap=(a,b)=>a&&b?Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)):0;
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
 await until("!!window.__game&&!!document.querySelector('#rk-hex-menu')");
}
try {
 for(const [width,height,mobile] of [[1366,768,false],[780,550,false],[390,844,true],[320,568,true],[844,390,true]]){
  await start(width,height,mobile);
  const first=await ev("(()=>{const rect=e=>e?.getBoundingClientRect()?.toJSON(),d=document.querySelector('#rk-actions'),p=document.querySelector('#pad'),g=p?.querySelector('.rk-touch-actions');return {legacy:document.querySelector('#rani-build-toggle')?getComputedStyle(document.querySelector('#rani-build-toggle')).display:'none',dockParent:d?.parentElement?.tagName,wrapParent:document.querySelector('#buildwrap')?.parentElement?.id,dock:rect(d),buttons:[...d?.querySelectorAll('.rk-action-row button')||[]].map(rect),pad:rect(p),group:rect(g),groupLabels:[...g?.querySelectorAll('button')||[]].map(b=>b.textContent),utils:[...p?.querySelectorAll(':scope > button')||[]].map(rect),glyphs:[...document.querySelectorAll('#rk-hex-menu .rk-hex-option')].map(b=>b.dataset.rkGlyph),scroll:document.documentElement.scrollWidth-innerWidth};})()");
  assert.equal(first.legacy,'none','Duplicate old construction button visible: '+JSON.stringify(first));
  assert.equal(first.glyphs.length,6);
  assert.ok(first.glyphs.every(Boolean),JSON.stringify(first));
  assert.ok(first.scroll<=3,JSON.stringify(first));
  if(!mobile){
   assert.equal(first.dockParent,'DIV',JSON.stringify(first));
   assert.equal(first.wrapParent,'rk-actions');
   assert.equal(first.buttons.length,2);
   assert.ok(first.dock.left>=0&&first.dock.right<=width+1&&first.dock.bottom<=height+1,JSON.stringify(first));
   assert.ok(overlap(first.buttons[0],first.buttons[1])<=1,JSON.stringify(first));
   const opened=await ev("(()=>{const btn=document.querySelector('#rk-build-toggle'),dock=document.querySelector('#rk-actions'),r=e=>e.getBoundingClientRect().toJSON();btn.click();const o={open:dock.dataset.open,menu:r(document.querySelector('#buildmenu')),row:r(document.querySelector('.rk-action-row')),dock:r(dock)};btn.click();o.closed=dock.dataset.open;return o;})()");
   assert.ok(opened.open==='true'&&opened.closed==='false'&&opened.dock.bottom<=height+1&&overlap(opened.menu,opened.row)<=1,JSON.stringify(opened));
  }else{
   assert.deepEqual(first.groupLabels,['건설','메뉴'],JSON.stringify(first));
   assert.ok(first.group.left>=0&&first.group.right<=width+1&&first.group.bottom<=height+1,JSON.stringify(first));
   for(const b of first.utils)assert.ok(overlap(b,first.group)<=1,'Mobile build/menu collision '+JSON.stringify(first));
  }
  await ev("(()=>{const g=window.__game,k=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.close();g.raniWheel.toggle({key:'building:'+k.id,name:k.name,label:k.def.label,x:k.x+k.def.footprint[0]/2,z:k.z+k.def.footprint[1]/2,building:k});document.querySelector('#rk-hex-menu [data-action=info]').click();return true;})()");
  await sleep(220);
  const wheel=await ev("(()=>{const rect=e=>e?.getBoundingClientRect()?.toJSON(),m=document.querySelector('#rk-hex-menu');return {wheel:rect(m),info:rect(m.querySelector('#rk-hex-info')),pad:rect(document.querySelector('#pad')),dock:rect(document.querySelector('#rk-actions')),layout:m.dataset.rkLayout};})()");
  assert.ok(wheel.wheel.left>=-1&&wheel.wheel.right<=width+1&&wheel.wheel.top>=-1&&wheel.wheel.bottom<=height+1,JSON.stringify(wheel));
  assert.ok(wheel.info.left>=-1&&wheel.info.right<=width+1&&wheel.info.top>=-1&&wheel.info.bottom<=height+1,'Information panel offscreen '+JSON.stringify(wheel));
  if(mobile)assert.ok(overlap(wheel.info,wheel.pad)<=2,JSON.stringify(wheel));
  else assert.ok(overlap(wheel.wheel,wheel.dock)<=2,JSON.stringify(wheel));
  console.log('PASS v5.30 desktop/mobile one dock, 6 hex options, no info/toolbar overlap',width,height,mobile,wheel.layout);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
