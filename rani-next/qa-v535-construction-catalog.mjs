// v5.35 — real construction catalog geometry and clickable category/cards.
// Browser checks at desktop, narrow desktop, portrait, small and landscape phones.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ws=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(ws.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async e=>{
 const r=await c.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;
};
const until=async e=>{for(let i=0;i<340;i++){if(await ev(e))return;await sleep(160);}throw Error('timeout '+e)};
const point=async selector=>ev(`(()=>{
 const el=document.querySelector(${JSON.stringify(selector)});
 if(!el)throw Error('Missing ' + ${JSON.stringify(selector)});
 const r=el.getBoundingClientRect(),x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;
 const hit=document.elementFromPoint(x,y);
 return {x,y,w:r.width,h:r.height,hit:hit===el||el.contains(hit),box:r.toJSON()};
})()`);
const tap=async selector=>{
 const p=await point(selector);
 assert.ok(p.w>24&&p.h>24&&p.hit,'blocked tap '+selector+' '+JSON.stringify(p));
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
try {
 for(const [w,h,mobile] of [[1366,768,false],[960,640,false],[320,568,true],[390,844,true],[844,390,true]]){
  await start(w,h,mobile);
  if(mobile){await until("!!document.querySelector('#rk-touch-build')");await tap('#rk-touch-build');await until("!!document.querySelector('#sheet-build.open')");}
  else{await until("!!document.querySelector('#rk-build-toggle')");await ev("document.querySelector('#rk-build-toggle').click()");await until("document.querySelector('#rk-actions').dataset.open==='true'");}
  await sleep(180);
  const x=await ev(`(()=>{
    const bar=document.querySelector('#buildbar'),menu=document.querySelector('#buildmenu');
    const wrap=document.querySelector('#buildwrap'),guide=document.querySelector('#rk-build-guide');
    const buttons=[...bar.querySelectorAll('button[data-group]')];
    const br=bar.getBoundingClientRect(),mr=menu.getBoundingClientRect();
    const visible=el=>{const r=el.getBoundingClientRect();return r.width>15&&r.height>15};
    const dr=document.querySelector('#rk-actions')?.getBoundingClientRect();
    return {categoryFirst:!!(bar.compareDocumentPosition(menu)&Node.DOCUMENT_POSITION_FOLLOWING),
      guide:guide?.textContent,buttons:buttons.length,items:menu.querySelectorAll('button[data-name]').length,
      bar:br.toJSON(),menu:mr.toJSON(),dock:dr?.toJSON(),horizontal:bar.scrollWidth>bar.clientWidth+10,
      hit:visible(buttons[0]),overflow:document.documentElement.scrollWidth};
  })()`);
  assert.ok(x.categoryFirst,'building list appears BEFORE tabs '+JSON.stringify(x));
  assert.ok(x.guide?.includes('종류 선택')&&x.buttons>=3&&x.items>0,'missing usable catalog '+JSON.stringify(x));
  assert.ok(x.bar.bottom<=x.menu.top+2,'categories overlap building cards '+JSON.stringify(x));
  assert.ok(x.bar.left>=-1&&x.bar.right<=w+1&&x.menu.left>=-1&&x.menu.right<=w+1,'catalog offscreen '+JSON.stringify(x));
  assert.ok(x.overflow<=w+4,'horizontal viewport overflow '+JSON.stringify(x));
  if(mobile){
    assert.ok(x.horizontal,'phone categories must be one scrollable row '+JSON.stringify(x));
    await tap('#buildbar button[data-group="0"]');
    assert.ok(await ev("!document.querySelector('#buildmenu').classList.contains('hidden')"),'active mobile category unexpectedly closed catalog');
  }else{
    assert.ok(x.dock?.right<=w+1&&x.dock?.top>=0,'desktop dock outside viewport '+JSON.stringify(x));
    await ev("document.querySelector('#buildbar button[data-group=\"0\"]').click()");
    assert.ok(await ev("!document.querySelector('#buildmenu').classList.contains('hidden')"),'active desktop tab closed catalog');
  }
  // Native item click must close the sheet/dock, select an actual world tool, and offer cancellation.
  await ev("document.querySelector('#buildmenu button[data-name]').click()");
  await until("!!window.__game.placement.selected");
  const active=await ev("(()=>{const b=document.querySelector('#rk-placement-cancel');return {hidden:b.hidden,text:b.textContent,selected:window.__game.placement.selected};})()");
  assert.ok(!active.hidden&&active.text.includes('취소'),'placement cancel missing '+JSON.stringify(active));
  if(mobile)await tap('#rk-placement-cancel');else await ev("document.querySelector('#rk-placement-cancel').click()");
  assert.equal(await ev("window.__game.placement.selected"),null,'building ghost remained armed');
  console.log('PASS v5.35 construction tabs, scroll, responsive cards and cancel',w,h,mobile?'phone':'desktop');
 }
} finally {await c.send('Target.closeTarget',{targetId});}
process.exit(0);
