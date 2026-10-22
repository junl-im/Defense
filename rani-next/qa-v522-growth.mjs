// v5.30: use actual native footprint/level and avoid phantom success.
// Isolated CDP test, in addition to all existing v5.21 + 600s QAs.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const x=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description);
 return x.result.value;
};
const until=async expr=>{
 for(let i=0;i<350;i++){if(await ev(expr))return;await sleep(220);}
 throw Error('Timed out '+expr);
};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:320,height:568,mobile:true,deviceScaleFactor:2},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-construction-fx')");
 const build=await ev(`(()=>{
   const g=window.__game;
   for(const name of ['wood','stone','gold'])g.state.stock[name]=3000;
   const where=g.findSpot('hovel'),count=g.state.buildings.length;
   const out=g.build('hovel',where.x,where.z);
   const host=document.querySelector('#rk-construction-fx');
   const node=host.querySelector('.rk-construction');
   const steps=node?.querySelectorAll('.rk-growth-step');
   const def=g.state.buildings.at(-1)?.def;
   return {out,count,after:g.state.buildings.length,serial:host.dataset.rkSerial,
     area:node?.dataset.rkArea,expected:def?.footprint?.join('×'),
     scale:node?.style.getPropertyValue('--rk-area-scale'),
     steps:steps?.length,label:node?.querySelector('.rk-build-label')?.textContent,
     stageAnimation:steps?.[0]?getComputedStyle(steps[0]).animationName:''};
 })()`);
 assert.ok(build.out==='hovel'&&build.after===build.count+1&&
   build.area===build.expected&&build.steps===3&&
   build.label?.includes('건설 완료')&&
   build.stageAnimation.includes('rk-growth-beat'),JSON.stringify(build));
 const blocked=await ev(`(()=>{
   const g=window.__game,host=document.querySelector('#rk-construction-fx');
   const before=+host.dataset.rkSerial;
   g.build('hovel',-4,-4);
   return {before,after:+host.dataset.rkSerial};
 })()`);
 assert.equal(blocked.after,blocked.before,'Failed placement played success effects');
 const upgrade=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   if(!b) return {missing:true};
   for(const k of ['wood','stone','gold','iron'])g.state.stock[k]=50000;
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
     x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
   const button=document.querySelector('#rk-hex-menu [data-action=upgrade]');
   const previous=b.lvl||1;
   if(button&&!button.hidden)button.click();
   const node=document.querySelector('#rk-construction-fx .rk-upgrade');
   return {previous,level:b.lvl||1,area:node?.dataset.rkArea,
    expected:b.def.footprint.join('×'),label:node?.querySelector('.rk-build-label')?.textContent,
    steps:node?.querySelectorAll('.rk-growth-step').length,
    closed:document.querySelector('#rk-hex-menu').hidden};
 })()`);
 assert.ok(upgrade.level===upgrade.previous+1&&upgrade.area===upgrade.expected
   &&upgrade.steps===3&&upgrade.label?.includes(upgrade.previous+' → '+upgrade.level+'단계')
   &&upgrade.closed,JSON.stringify(upgrade));
 console.log('PASS v5.30 footprint-aware real-world build/upgrade FX, stage cues and failed-build guard',{build,blocked,upgrade});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
