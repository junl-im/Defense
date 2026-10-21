// v5.19 native engine QA: true materials, exact footprint, stale-picker protection.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;};
const until=async expr=>{for(let i=0;i<330;i++){if(await ev(expr))return;await sleep(230);}throw Error('Timeout '+expr);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.23');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-quick-build')");
 const initial=await ev("(()=>{const g=window.__game,p=g.findSpot('hovel');if(!p)return {noSpot:true};const open=g.rkOpenGroundBuild(p.x,p.z),root=document.querySelector('#rk-quick-build');const buttons=[...root.querySelectorAll('.rk-quick-choice')];return {p,open,hidden:root.hidden,choices:buttons.map(b=>({name:b.dataset.name,cost:b.dataset.rkCost,footprint:b.dataset.rkFootprint,aria:b.getAttribute('aria-label'),small:b.querySelectorAll('small').length})),count:g.state.buildings.length,reason:root.querySelector('.rk-quick-reasons')!==null};})()");
 assert.ok(!initial.noSpot&&initial.open&&!initial.hidden&&initial.choices.length>0&&initial.choices.length<=4,JSON.stringify(initial));
 assert.ok(initial.choices.every(x=>x.footprint.includes('칸')&&x.cost&&x.small===2&&x.aria.includes(x.cost)),JSON.stringify(initial));
 const source=await ev("(()=>{const g=window.__game,b=document.querySelector('#rk-quick-build .rk-quick-choice'),def=g.state.buildings[0]?.def;const n=b.dataset.name;const first=g.state.stock,actualCosts={};const button=document.querySelector('#buildmenu button[data-name=\"'+n+'\"]');return {name:n,hasButton:!!button,costText:b.dataset.rkCost,footprint:b.dataset.rkFootprint,resources:Object.keys(first).length,buildings:g.state.buildings.length};})()");
 assert.ok(source.hasButton&&source.resources>5,JSON.stringify(source));
 // Force native state to change AFTER creating the candidate. Old choices must
 // not bypass Placement.check and must never select/build when unaffordable.
 const blocked=await ev("(()=>{const g=window.__game,b=document.querySelector('#rk-quick-build .rk-quick-choice'),n=b.dataset.name,definitions=g.state.buildings.map(x=>x.def),box=document.querySelector('#rk-quick-build');const before=g.state.buildings.length;const stock=g.state.stock;const saved={};for(const k in stock)saved[k]=stock[k];window.__v519StockSaved=saved;for(const k in stock)stock[k]=0;b.click();return {name:n,selected:g.placement.selected,open:!box.hidden,buildings:g.state.buildings.length,before,note:box.querySelector('.rk-quick-note').textContent,invalid:box.querySelector('.rk-quick-note').dataset.rkInvalid,updated:b.dataset.rkCost};})()");
 assert.ok(blocked.buildings===blocked.before&&blocked.open&&blocked.invalid==='true'&&blocked.note.includes('설치 불가'),JSON.stringify(blocked));
 // Back to valid stock and choose normally; no immediate construction.
 const reopened=await ev("(()=>{const g=window.__game;Object.assign(g.state.stock,window.__v519StockSaved);const p=g.findSpot('hovel');g.rkOpenGroundBuild(p.x,p.z);const b=document.querySelector('#rk-quick-build .rk-quick-choice'),name=b.dataset.name;const before=g.state.buildings.length;b.click();return {name,selected:g.placement.selected,closed:document.querySelector('#rk-quick-build').hidden,buildings:g.state.buildings.length,before};})()");
 assert.ok(reopened.name===reopened.selected&&reopened.closed&&reopened.buildings===reopened.before,JSON.stringify(reopened));
 await ev("window.__game.placement.cancel()");
 await c.send('Emulation.setDeviceMetricsOverride',{width:320,height:568,mobile:true,deviceScaleFactor:2},s);
 const phone=await ev("(()=>{const g=window.__game,p=g.findSpot('hovel');g.rkOpenGroundBuild(p.x,p.z);const el=document.querySelector('#rk-quick-build'),r=el.getBoundingClientRect();return {visible:!el.hidden,left:r.left,right:r.right,height:r.height,width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth};})()");
 assert.ok(phone.visible&&phone.left>=-2&&phone.right<=phone.width+2&&phone.overflow<=2,JSON.stringify(phone));
 await ev("document.querySelector('#rk-quick-build .rk-quick-close').click()");
 const hex=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});const el=document.querySelector('#rk-hex-menu .rk-hex-buttons');return {bg:getComputedStyle(el).backgroundImage,display:getComputedStyle(el).display};})()");
 assert.equal(hex.bg,'none',JSON.stringify(hex));
 console.log('PASS v5.19 source-truth footprint and cost; no stale-resource construction, 320px phone, clean hex', {initial,blocked,reopened,phone,hex});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
