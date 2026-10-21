// v5.17: source-backed kingdom production + warehouse diagnostics, optional only.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const root=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const browser=await getJSON('http://127.0.0.1:'+port+'/json/version'),c=new CDP();
await c.connect(browser.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{const q=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(q.exceptionDetails)throw Error(q.exceptionDetails.exception?.description);return q.result.value;};
const until=async expr=>{for(let i=0;i<360;i++){if(await ev(expr))return;await sleep(250);}throw Error('Timed out '+expr);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url:root},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.22');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-strategy-toggle')");
 const closed=await ev("(()=>{const b=document.querySelector('#rk-strategy-toggle'),c=document.querySelector('#rk-strategy-card'),map=document.querySelector('#rk-strategy-map');return {pressed:b.getAttribute('aria-pressed'),hidden:c.hidden,mapHidden:map.hidden,button:getComputedStyle(b).display};})()");
 assert.ok(closed.pressed==='false'&&closed.hidden&&closed.mapHidden&&closed.button!=='none',JSON.stringify(closed));
 await ev("document.querySelector('#rk-strategy-toggle').click()");
 await sleep(500);
 const report=await ev("(()=>{const g=window.__game,c=document.querySelector('#rk-strategy-card'),cv=document.querySelector('#rk-strategy-map');return {pressed:document.querySelector('#rk-strategy-toggle').getAttribute('aria-pressed'),visible:!c.hidden&&!cv.hidden,stock:c.dataset.stockpile,expected:g.state.stockpileUsed+'/'+g.state.stockpileCapacity,granary:c.dataset.granary,fields:c.querySelectorAll('.rk-strategy-row').length,markers:+c.dataset.markers,explanation:c.textContent,canvas:getComputedStyle(cv).pointerEvents,overflow:document.documentElement.scrollWidth-innerWidth};})()");
 assert.ok(report.pressed==='true'&&report.visible&&report.stock===report.expected,JSON.stringify(report));
 assert.ok(report.fields===4&&report.markers>=1&&report.markers<=18&&report.canvas==='none'&&report.overflow<=2,JSON.stringify(report));
 assert.ok(report.explanation.includes('인구')===false&&report.explanation.includes('사거리')&&report.explanation.includes('창고'),JSON.stringify(report));
 // The wheel opens cleanly without forcing a hidden economy table behind it.
 const wheel=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});return {wheel:!document.querySelector('#rk-hex-menu').hidden,plain:getComputedStyle(document.querySelector('#rk-hex-menu .rk-hex-buttons')).backgroundImage,disabled:document.querySelector('#rk-strategy-toggle').getAttribute('aria-pressed')};})()");
 await sleep(100);
 assert.ok(wheel.wheel&&wheel.plain==='none',JSON.stringify(wheel));
 assert.equal(await ev("document.querySelector('#rk-strategy-toggle').getAttribute('aria-pressed')"),'false');
 await ev("window.__game.raniWheel.close()");
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true},s);
 await ev("document.querySelector('#rk-strategy-toggle').click()");
 await sleep(350);
 const rotate=await ev("(()=>{const t=document.querySelector('#rk-strategy-toggle').getBoundingClientRect(),p=document.querySelector('#rk-strategy-card').getBoundingClientRect();return {width:innerWidth,height:innerHeight,bounds:[t.toJSON(),p.toJSON()],overflow:document.documentElement.scrollWidth-innerWidth};})()");
 assert.ok(rotate.bounds.every(b=>b.left>=0&&b.right<=rotate.width&&b.top>=0)&&rotate.overflow<=2,JSON.stringify(rotate));
 await ev("document.querySelector('#rk-strategy-toggle').click()");
 assert.equal(await ev("document.querySelector('#rk-strategy-card').hidden"),true);
 console.log('PASS v5.17 economy source truth, 18 label limit, unobtrusive toggle, wheel isolation, rotated phone',{closed,report,wheel,rotate});
}finally{
 await c.send('Target.closeTarget',{targetId});
}
process.exit(0);
