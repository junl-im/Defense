// Post-v5.31 regression: the live native food/resource HUD must never repaint English.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const v=await getJSON('http://127.0.0.1:'+port+'/json/version');
const client=new CDP();await client.connect(v.webSocketDebuggerUrl);
const {targetId}=await client.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await client.send('Target.attachToTarget',{targetId,flatten:true});
await client.send('Page.enable',{},s);await client.send('Runtime.enable',{},s);
async function ev(expression){
 const x=await client.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},s);
 if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||JSON.stringify(x.exceptionDetails));
 return x.result.value;
}
async function until(expression){
 for(let i=0;i<350;i++){if(await ev(expression))return;await sleep(170);}
 throw Error('Timed out: '+expression);
}
try{
 await client.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await client.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version')?.textContent"),'v5.31');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until('!!window.__game?.hud');
 const result=await ev(`(()=>{
   const h=window.__game.hud;
   h.setView('food');h.update();
   const food=document.querySelector('#view-food')?.textContent||'';
   const resourceTips=[...document.querySelectorAll('#topbar [data-res][title]')].map(x=>x.title);
   return {food,resourceTips};
 })()`);
 assert.ok(result.food.includes('식량 수지')&&result.food.includes('분'),JSON.stringify(result));
 assert.ok(!/\b(no inn|holding|min|food balance)\b/i.test(result.food),JSON.stringify(result));
 assert.ok(result.resourceTips.length>=1,JSON.stringify(result));
 assert.ok(result.resourceTips.every(t=>!t.includes('click for history')),JSON.stringify(result));
 console.log('PASS native food timers, inn/stock states and resource hover Korean',result);
}finally{await client.send('Target.closeTarget',{targetId});}
process.exit(0);
