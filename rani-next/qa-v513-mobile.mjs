// Real Chrome phone regression, touch gestures + overlays. v5.13.
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
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
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

 if(!await ev("!!document.querySelector('#rk-first-steps')"))
   await ev("document.querySelector('#rk-guide-toggle').click()");
 const guide=await ev("(()=>{const g=document.querySelector('#rk-first-steps');return {compact:g.dataset.rkCompact,more:!!g.querySelector('.rk-step-more'),hiddenHarbor:getComputedStyle(document.querySelector('#rk-harbor-panel')).display==='none'};})()");
 assert.equal(guide.compact,'true',JSON.stringify(guide));
 assert.ok(guide.more&&guide.hiddenHarbor,JSON.stringify(guide));
 await ev("document.querySelector('#rk-first-steps .rk-step-more').click()");
 assert.equal(await ev("document.querySelector('#rk-first-steps').dataset.rkCompact"),'false');
 await ev("document.querySelector('#rk-first-steps .rk-step-more').click()");
 const candidates=await ev("(()=>{const g=window.__game,p=g.findSpot('hovel');if(!p)return {spot:null};const opened=g.rkOpenGroundBuild(p.x,p.z),q=document.querySelector('#rk-quick-build'),choices=[...q.querySelectorAll('.rk-quick-choice')].map(b=>b.dataset.name);return {spot:p,opened,visible:!q.hidden,origin:q.dataset.origin,choices,allLegal:choices.every(n=>g.placement.check(n,p.x,p.z).ok),built:g.state.buildings.length};})()");
 assert.ok(candidates.spot&&candidates.opened&&candidates.visible&&candidates.allLegal,JSON.stringify(candidates));
 assert.ok(candidates.choices.length>0&&candidates.choices.length<=4,JSON.stringify(candidates));
 assert.equal(candidates.built,before,'quick picker built without confirmation');
 const selected=await ev("(()=>{const g=window.__game,b=document.querySelector('#rk-quick-build .rk-quick-choice'),name=b.dataset.name;b.click();return {name,selected:g.placement.selected,closed:document.querySelector('#rk-quick-build').hidden};})()");
 assert.ok(selected.selected===selected.name&&selected.closed,JSON.stringify(selected));
 await ev("window.__game.placement.cancel()");
 const roof=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.close();const cx=b.x+b.def.footprint[0]/2,cz=b.z+b.def.footprint[1]/2;const p=g.iso.worldToScreen(cx,0,cz),picked=g.rkMobileTapBuilding(p[0],p[1]-14,-10,-10);return {picked,menu:!document.querySelector('#rk-hex-menu').hidden,selected:g.raniWheel.target?.key};})()");
 assert.ok(roof.picked&&roof.menu&&roof.selected?.startsWith('building:'),JSON.stringify(roof));
 await ev("window.__game.raniWheel.close()");
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true},s);
 await sleep(500);
 const landscape=await ev("(()=>{const g=window.__game,p=g.findSpot('hovel');g.rkOpenGroundBuild(p.x,p.z);const r=document.querySelector('#rk-quick-build').getBoundingClientRect(),pad=document.querySelector('#pad').getBoundingClientRect();return {bounds:r.toJSON(),pad:pad.toJSON(),viewport:{w:innerWidth,h:innerHeight},overflow:document.documentElement.scrollWidth-innerWidth};})()");
 assert.ok(landscape.bounds.left>=0&&landscape.bounds.right<=landscape.viewport.w+1,JSON.stringify(landscape));
 assert.ok(landscape.bounds.bottom<=landscape.pad.top+3&&landscape.overflow<=2,JSON.stringify(landscape));
 await ev("document.querySelector('#rk-quick-build .rk-quick-close').click()");
 console.log('PASS v5.13 native quick build, actual rules, roof hit, minimal guide, landscape',{guide,candidates,selected,roof,landscape});
 console.log('PASS v5.13 phone-first UI, gesture guard, mobile zoom, contextual hex',{initial,z,after,layout});
}finally{
 await c.send('Target.closeTarget',{targetId});
}
// CDP keeps an active WebSocket; terminate the QA process after success.
process.exit(0);
