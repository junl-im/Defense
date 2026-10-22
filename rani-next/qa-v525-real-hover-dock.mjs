// v5.30: inspect actual, initialized kingdom buildings, not invented tooltip strings.
// Tests nullable empty store slot, real housing labels and real touch button placement.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
async function ev(expr){
 const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
}
async function until(expr){
 for(let i=0;i<350;i++){if(await ev(expr))return;await sleep(210);}
 throw Error('Timed out '+expr);
}
async function start(){
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!window.__game.describeAt");
}
try {
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await start();
 const real=await ev(`(()=>{
   const g=window.__game;
   const homes=g.state.buildings.filter(b=>b.def.housing>0);
   const slots=g.state.buildings.filter(b=>b.def.storeFor==='stockpile'||b.def.storeFor==='granary');
   if(!homes.length||!slots.length)return {error:'Missing real starting buildings',homes:homes.length,slots:slots.length};
   const sample=homes.map(b=>({name:b.name,housing:b.def.housing,sub:g.describeAt(b.x,b.z)?.sub||''}));
   const stocks=slots.map(b=>({name:b.name,sub:g.describeAt(b.x,b.z)?.sub||''}));
   // Simulate a real, currently unassigned empty store slot.
   const stock=slots[0],original=g.state.layoutFor;
   let empty;
   try {
      g.state.layoutFor=function(k){
        const prior=original.call(this,k);
        if(k!==stock.def.storeFor)return prior;
        return {...prior,piles:[{x:stock.x,z:stock.z,count:0,res:null}]};
      };
      empty=g.describeAt(stock.x,stock.z)?.sub;
   }finally{g.state.layoutFor=original;}
   // This is still an actual building's native describeAt -> HUD pipeline.
   g.hud.showTip(100,150,g.describeAt(stock.x,stock.z).title,empty);
   const visible=document.querySelector('#tip')?.textContent||'';
   return {sample,stocks,empty,visible,slot:stock.name};
 })()`);
 assert.ok(!real.error,JSON.stringify(real));
 assert.ok(real.sample.some(x=>x.housing===8||x.housing>0),JSON.stringify(real));
 for(const home of real.sample){
   assert.ok(home.sub.includes('주거 수용 '+home.housing+'명'),JSON.stringify(home));
   assert.ok(!/\bhouses?\s+\d+\b/i.test(home.sub),JSON.stringify(home));
 }
 for(const store of real.stocks)assert.ok(!/\b(?:null|undefined)\b/i.test(store.sub),JSON.stringify(store));
 assert.ok(real.empty.includes('비어 있음')&&!/null|undefined|empty|\b0\s*null/i.test(real.empty),JSON.stringify(real));
 assert.ok(real.visible.includes('비어 있음')&&!/null|undefined/i.test(real.visible),JSON.stringify(real));
 console.log('PASS v5.30 true real-world housing and store tooltip/nullable stock',real);
 for(const [w,h] of [[320,568],[390,844],[844,390]]) {
   await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile:true,deviceScaleFactor:2},s);
   await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
   await start();
   const layout=await ev(`(()=>{
     const pad=document.querySelector('#pad'),group=pad.querySelector('.rk-touch-actions');
     const a=group?.getBoundingClientRect(),b=pad?.getBoundingClientRect();
     const actions=[...group?.querySelectorAll('button')||[]].map(e=>({id:e.id,label:e.textContent,disabled:e.disabled,box:e.getBoundingClientRect().toJSON()}));
     const utils=[...pad.querySelectorAll(':scope > button')].map(e=>({label:e.textContent,box:e.getBoundingClientRect().toJSON()}));
     return {w:innerWidth,h:innerHeight,
       group:!!group,pad:b?.toJSON(),dock:a?.toJSON(),actions,utils,
       renderedButtons:[...pad.querySelectorAll('button')].length,
       sheet:document.querySelector('#sheet-build')?.className};
   })()`);
   assert.ok(layout.group&&layout.actions.length===2&&layout.renderedButtons>=7,JSON.stringify(layout));
   assert.deepEqual(layout.actions.map(x=>x.label),['건설','메뉴']);
   assert.ok(layout.dock.left>=0&&layout.dock.right<=layout.w+.5
    &&layout.pad.bottom<=layout.h+.5&&layout.dock.left>=layout.utils.at(-1).box.right-1,JSON.stringify(layout));
   console.log('PASS v5.30 grouped mobile actions',w,h,layout.actions.map(x=>x.label));
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
