// v5.14 title viewport assertions: desktop, tablet, phone and short landscape.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ver=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(ver.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);
 return r.result.value;
};
const until=async expr=>{
 for(let i=0;i<320;i++){if(await ev(expr))return;await sleep(190);}
 throw Error('Timeout '+expr);
};
const sizes=[
 [1440,900,false,'pc'],[1366,600,false,'pc-short'],[768,1024,true,'tablet'],
 [390,844,true,'phone'],[375,667,true,'phone-small'],[320,568,true,'narrow'],
 [320,480,true,'tiny'],[844,390,true,'landscape'],[667,375,true,'short-landscape']
];
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#menu.rk-title-v57 .rk-public-version')");
 // The original menu-compact.js moves a 10+ map grid into a hidden disclosure
 // asynchronously; test the real settled landing stage, not the transient DOM.
 await until("document.querySelector('#menu')?.dataset.raniCompact==='1'");
 await sleep(180);
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.23');
 for(const [w,h,mobile,name] of sizes){
  await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
  await sleep(180);
  const layout=await ev("(()=>{const root=document.querySelector('#menu'),b=root.querySelector('#rk-start-now'),footer=root.querySelector('.ver'),info=root.querySelector('#rk-version-info-toggle');const spans=['.rk-title-kicker','h1','.sub','.rk-title-ribbon','.acts','.ver'];const measure=el=>{if(!el)return null;const r=el.getBoundingClientRect(),st=getComputedStyle(el);return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,visible:st.display!=='none'&&st.visibility!=='hidden'};};return {width:innerWidth,height:innerHeight,bodyOverflow:document.documentElement.scrollWidth-innerWidth,menuScroll:root.scrollHeight-root.clientHeight,windowScroll:document.documentElement.scrollHeight-innerHeight,parts:Object.fromEntries(spans.map(x=>[x,measure(root.querySelector(x))])),start:measure(b),footer:measure(footer),info:measure(info),version:root.querySelector('.rk-public-version').textContent};})()");
  const visible=Object.entries(layout.parts).filter(([,p])=>p&&p.visible).map(([key,p])=>({key,...p}));
  assert.equal(layout.version,'v5.23',JSON.stringify({name,layout}));
  assert.ok(layout.menuScroll<=3&&layout.bodyOverflow<=3&&layout.windowScroll<=3,'First screen scrolls: '+JSON.stringify({name,layout}));
  for(const item of visible){
   assert.ok(item.top>=-2&&item.bottom<=h+2&&item.left>=-2&&item.right<=w+2,'Offscreen title element '+JSON.stringify({name,item,layout}));
  }
  assert.ok(layout.footer.bottom<=h-1&&layout.footer.bottom>h-45,'Footer not at bottom '+JSON.stringify({name,layout}));
  assert.ok(layout.start.top>=0&&layout.start.bottom<layout.footer.top-3,'Start overlaps footer '+JSON.stringify({name,layout}));
  assert.equal(layout.info,null,'Version info button must be removed completely');
  assert.equal(await ev("!!document.querySelector('#rk-version-info-panel')"),false,'Version popup must not exist');
  console.log('PASS one-screen title',name,w,h,{footerBottom:layout.footer.bottom,scroll:layout.menuScroll});
 }
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 assert.ok(await ev("document.querySelector('#rani-map-picker').open"));
 assert.ok(await ev("document.querySelector('.rk-manual-start').getBoundingClientRect().width>30"));
 await ev("document.querySelector('#rk-region-back').click()");
 await until("!document.querySelector('#menu').classList.contains('rk-choose-region')");
 assert.ok(await ev("document.querySelector('#rk-start-now').getBoundingClientRect().height>40"));
 console.log('PASS v5.20 title with passive version text, region choice preserved');
}finally{
 await c.send('Target.closeTarget',{targetId});
}
process.exit(0);
