// v5.34 real control interaction regression: dock hit-target, ghost escape,
// contextual build, and phone sheet. Run against preview root and /Defense/.
import assert from 'node:assert/strict';
import { CDP,getJSON } from '../engines/fiefdom/tools/e2e/cdp.mjs';
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
 for(let i=0;i<340;i++){if(await ev(expression))return;await nap(160);}
 throw Error('timeout waiting for '+expression);
};
const point=async selector=>ev(`(()=>{
 const b=document.querySelector(${JSON.stringify(selector)});
 if(!b)throw Error('missing '+${JSON.stringify(selector)});
 const r=b.getBoundingClientRect(), x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;
 const el=document.elementFromPoint(x,y);
 return {x,y,w:r.width,h:r.height,hit:el===b||b.contains(el),display:getComputedStyle(b).display};
})()`);
const mouse=async selector=>{
 const p=await point(selector);
 assert.ok(p.w>25&&p.h>25&&p.hit,selector+' blocked: '+JSON.stringify(p));
 await c.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y,button:'none'},s);
 await c.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',buttons:1,clickCount:1},s);
 await c.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',buttons:0,clickCount:1},s);
};
const touch=async selector=>{
 const p=await point(selector);
 assert.ok(p.w>25&&p.h>25&&p.hit,selector+' blocked on phone: '+JSON.stringify(p));
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
 await until("!!window.__game?.raniWheel");
}
try{
 for(const [w,h] of [[1366,768],[960,640]]){
  await start(w,h,false);
  await until("!!document.querySelector('#rk-build-toggle')");
  await nap(450);
  await mouse('#rk-build-toggle');
  await until("document.querySelector('#rk-actions').dataset.open==='true'");
  assert.ok(await ev("!document.querySelector('#buildmenu').classList.contains('hidden')"),'desktop build catalog was hidden');
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  assert.equal(await ev("document.querySelector('#rk-actions').dataset.open"),'false');
  assert.ok(await ev("!document.querySelector('#rk-placement-cancel').hidden"),'missing escape from placement');
  await mouse('#rk-placement-cancel');
  assert.equal(await ev("window.__game.placement.selected"),null,'ghost survived cancel');
  await mouse('#rk-build-toggle');
  await until("document.querySelector('#rk-actions').dataset.open==='true'");
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  await mouse('#rk-build-toggle');
  assert.equal(await ev("window.__game.placement.selected"),null,'ghost survived Build toggle');
  await until("document.querySelector('#rk-actions').dataset.open==='true'");
  await mouse('#rk-build-toggle');
  assert.equal(await ev("document.querySelector('#rk-actions').dataset.open"),'false');
  await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.close();g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});})()");
  await until("!document.querySelector('#rk-hex-menu').hidden");
  await ev("document.querySelector('#rk-hex-menu [data-action=build]').click()");
  await until("document.querySelector('#rk-actions').dataset.open==='true'");
  console.log('PASS v5.34 desktop physical Build/Cancel, wheel and ghost lifetime',w,h);
 }
 for(const [w,h] of [[390,844],[844,390]]){
  await start(w,h,true);
  await until("!!document.querySelector('#rk-touch-build')");
  assert.equal(await ev("document.querySelectorAll('#rk-actions').length"),0);
  await touch('#rk-touch-build');
  await until("!!document.querySelector('#sheet-build.open')");
  assert.ok(await ev("!document.querySelector('#buildmenu').classList.contains('hidden')"),'phone sheet opened empty');
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  assert.ok(await ev("!document.querySelector('#rk-placement-cancel').hidden"),'phone placement cannot be cancelled');
  const p=await point('#rk-placement-cancel');
  assert.ok(p.hit&&p.x>=0&&p.y>=0&&p.x<=w&&p.y<=h,'phone cancel button blocked '+JSON.stringify(p));
  await touch('#rk-placement-cancel');
  assert.equal(await ev("window.__game.placement.selected"),null);
  await touch('#rk-touch-build');
  await until("!!document.querySelector('#sheet-build.open')");
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  await touch('#rk-touch-build');
  assert.equal(await ev("window.__game.placement.selected"),null);
  await until("!!document.querySelector('#sheet-build.open')");
  await touch('#rk-touch-build');
  assert.ok(await ev("!document.querySelector('#sheet-build').classList.contains('open')"),'second phone Build click must close sheet');
  console.log('PASS v5.34 phone build sheet, in-game cancel, no sticky ghost',w,h);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);