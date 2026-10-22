// v5.31: inspect real native buttons, untranslated panels and legacy duplicate.
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
async function until(x){for(let i=0;i<360;i++){if(await ev(x))return;await sleep(160);}throw Error('Timeout: '+x);}
async function start(w,h,mobile){
 await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version')?.textContent"),'v5.31');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.hud && !!document.querySelector('#controls') && !!document.querySelector('#market')");
}
const snapshot='(()=>{'
+'const visible=e=>!!e&&getComputedStyle(e).display!=="none"&&getComputedStyle(e).visibility!=="hidden"&&e.getBoundingClientRect().width>1&&e.getBoundingClientRect().height>1;'
+'const legacy=document.querySelector("#rani-build-toggle"),modern=document.querySelector("#rk-build-toggle"),touch=document.querySelector("#rk-touch-build"),menu=document.querySelector("#rk-touch-menu");'
+'const market=document.querySelector("#market"),barracks=document.querySelector("#view-barracks"),controls=document.querySelector("#controls"),group=document.querySelector("#pad .rk-touch-actions");'
+'const buttons=[...controls.querySelectorAll("button")].map(x=>x.textContent);'
+'const rect=e=>e?.getBoundingClientRect().toJSON();'
+'return {oldVisible:visible(legacy),modernVisible:visible(modern),touchVisible:visible(touch),menuVisible:visible(menu),buildCount:[legacy,modern,touch].filter(visible).length,'
+'marketToggles:[...market.querySelectorAll("button.tog[data-kind]")].slice(0,8).map(b=>b.textContent),'
+'instantTitles:[...market.querySelectorAll("button[title]")].map(b=>b.title).filter(t=>t.includes("즉시")),'
+'rally:[...barracks.querySelectorAll(".hint")].map(x=>x.textContent).join(" "),'
+'needs:[...barracks.querySelectorAll("[data-need]")].map(x=>x.textContent),'
+'edge:buttons.find(x=>/가장자리 스크롤|Edge scrolling/i.test(x)),'
+'menuNames:group?[...group.querySelectorAll("button")].map(x=>x.textContent):[],'
+'group:rect(group),dock:rect(document.querySelector("#rk-actions")),doc:document.documentElement.scrollWidth'
+'};})()';
try{
 for(const [w,h,mobile] of [[1366,768,false],[960,640,false],[390,844,true],[320,568,true],[844,390,true]]){
  await start(w,h,mobile);
  const a=await ev(snapshot);
  assert.equal(a.oldVisible,false,'obsolete Build still visible '+JSON.stringify(a));
  assert.equal(a.buildCount,1,'duplicate construction button '+JSON.stringify(a));
  assert.ok(a.marketToggles.length>=2&&a.marketToggles.every(t=>t==='구매'||t==='판매'),JSON.stringify(a));
  assert.ok(a.instantTitles.some(t=>t.startsWith('자원 1개 즉시 구매'))&&a.instantTitles.some(t=>t.startsWith('자원 1개 즉시 판매')),JSON.stringify(a));
  assert.ok(a.rally.includes('집결 깃발')&&!a.rally.includes('New troops gather'),JSON.stringify(a));
  assert.ok(a.needs.length>0&&a.needs.every(t=>!/\bBuild\b|\bfirst\b/i.test(t)),JSON.stringify(a));
  assert.ok(a.doc<=w+3,'viewport horizontal scrolling '+JSON.stringify(a));
  if(mobile){
   assert.ok(!a.modernVisible&&a.touchVisible&&a.menuVisible,JSON.stringify(a));
   assert.deepEqual(a.menuNames,['건설','메뉴'],JSON.stringify(a));
   assert.ok(a.group.left>=0&&a.group.right<=w+1&&a.group.bottom<=h+1,JSON.stringify(a));
  }else{
   assert.ok(a.modernVisible&&!a.touchVisible,JSON.stringify(a));
   assert.ok(a.edge?.startsWith('가장자리 스크롤'),JSON.stringify(a));
   assert.ok(a.dock.left>=0&&a.dock.right<=w+2,JSON.stringify(a));
  }
  await ev('(()=>{const b=document.querySelector("#controls .hintbar");if(b)b.click()})()');
  const toggle=await ev('document.querySelector("#controls .hintbar .tw")?.textContent');
  if(toggle!==undefined)assert.equal(toggle,'펼치기');
  console.log('PASS v5.31 native Korean dynamic panels and one visible Build control',w,h);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
