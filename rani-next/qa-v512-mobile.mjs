// Real Chrome phone regression, touch gestures + overlays. v5.12.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const base=process.argv[2]||'http://127.0.0.1:8931/';
const url=base+(base.includes('?')?'&':'?')+'touch=1';
const port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const root=await getJSON('http://127.0.0.1:'+port+'/json/version'),c=new CDP();
await c.connect(root.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);
await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);
 return r.result.value;
};
const until=async expr=>{
 for(let i=0;i<360;i++){if(await ev(expr))return;await sleep(250);}
 throw Error('Timeout '+expr);
};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.15');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game && document.documentElement.classList.contains('phone')");
 const initial=await ev("(()=>{const zoom=document.querySelector('#rk-phone-zoom'),pad=document.querySelector('#pad'),top=document.querySelector('#topbar');return {zoom:!!zoom&&getComputedStyle(zoom).display!=='none',buttons:[...zoom.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')),pad:pad.getBoundingClientRect().toJSON(),top:top.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth-innerWidth,screen:innerWidth};})()");
 assert.ok(initial.zoom&&initial.buttons.includes('지도 확대')&&initial.buttons.includes('지도 축소'),JSON.stringify(initial));
 assert.ok(initial.overflow<=2,JSON.stringify(initial));
 const z=await ev("(()=>{const g=window.__game,at=g.iso.zoom;document.querySelector('#rk-phone-zoom button').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch'}));return {at,target:g.iso.zoomIndex};})()");
 assert.ok(Number.isFinite(z.at),JSON.stringify(z));
 await ev("window.__game.placement.select('hovel')");
 const before=await ev("window.__game.state.buildings.length");
 const touch=(type,touchPoints)=>c.send('Input.dispatchTouchEvent',{type,touchPoints},s);
 await touch('touchStart',[{x:180,y:390,id:21},{x:216,y:390,id:22}]);
 await touch('touchMove',[{x:145,y:390,id:21},{x:254,y:390,id:22}]);
 await touch('touchEnd',[{x:254,y:390,id:22}]);
 await touch('touchEnd',[]);
 await sleep(200);
 const after=await ev("({n:window.__game.state.buildings.length,selected:window.__game.placement.selected})");
 assert.equal(after.n,before,'pinch release placed a building');
 assert.equal(after.selected,'hovel','pinch release canceled building selection');
 await ev("window.__game.placement.cancel()");
 const hit=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});return {hasKeep:!!b};})()");
 assert.ok(hit.hasKeep);
 await sleep(150);
 const layout=await ev("(()=>{const wheel=document.querySelector('#rk-hex-menu'),r=wheel.getBoundingClientRect(),pad=document.querySelector('#pad').getBoundingClientRect(),guide=document.querySelector('#rk-first-steps');return {open:!wheel.hidden,wheel:r.toJSON(),pad:pad.toJSON(),guideHidden:!guide||getComputedStyle(guide).visibility==='hidden'};})()");
 assert.ok(layout.open&&layout.wheel.bottom<=layout.pad.top+3&&layout.guideHidden,JSON.stringify(layout));
 console.log('PASS v5.12 phone-first UI, gesture guard, mobile zoom, contextual hex',{initial,z,after,layout});
}finally{
 await c.send('Target.closeTarget',{targetId});
}
// CDP keeps an active WebSocket; terminate the QA process after success.
process.exit(0);
