// v5.30: test real playing world, no fake screenshots/markup.
// Desktop dock must not overlap stats/auxiliary buttons; six actual hex
// actions and mobile inspector must fit above the true thumb bar.
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
 if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||JSON.stringify(x.exceptionDetails));
 return x.result.value;
};
const until=async expr=>{for(let i=0;i<330;i++){if(await ev(expr))return;await sleep(180);}throw Error('Timeout '+expr);};
const overlaps=(a,b)=>a&&b&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
async function boot(width,height,mobile){
 await c.send('Emulation.setDeviceMetricsOverride',{width,height,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.raniWheel");
}
const box=r=>r?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}:null;
try{
 for(const [w,h,mobile] of [[1366,768,false],[900,650,false],[720,480,false],[390,844,true],[320,568,true],[844,390,true]]){
  await boot(w,h,mobile);
  if(!mobile){
   await until("document.querySelector('#rk-actions')?.dataset.rkLayout==='stable'");
   const initial=await ev(`(()=>{
     const d=document.querySelector('#rk-actions'),legacy=document.querySelector('#rani-build-toggle');
     const r=e=>e?.getBoundingClientRect()?.toJSON();
     return {dock:r(d),stats:r(document.querySelector('#stats')),rival:r(document.querySelector('#rani-controls-toggle')),
      other:r(document.querySelector('#rani-info-toggle')),bar:r(d.querySelector('.rk-action-row')),buttons:[...d.querySelector('.rk-action-row').children].map(r),
      oldVisible:legacy?getComputedStyle(legacy).display!=='none'&&!legacy.hidden:false,
      status:d.dataset.open,limit:d.style.getPropertyValue('--rk530-build-limit'),scroll:document.documentElement.scrollWidth-innerWidth,
      position:getComputedStyle(d).position};
   })()`);
   assert.ok(initial.position==='fixed'&&!initial.oldVisible&&initial.status==='false',JSON.stringify(initial));
   assert.ok(initial.dock.left>=0&&initial.dock.right<=w+1&&initial.dock.bottom<=h+1
     &&initial.dock.top>initial.stats.bottom-1&&initial.scroll<=3,JSON.stringify(initial));
   assert.ok(!overlaps(initial.buttons[0],initial.buttons[1])&&!overlaps(initial.dock,initial.rival)
     &&!overlaps(initial.dock,initial.other),JSON.stringify(initial));
   await ev("document.querySelector('#rk-build-toggle').click()");
   const expanded=await ev(`(()=>{
     const d=document.querySelector('#rk-actions'),r=e=>e?.getBoundingClientRect()?.toJSON();
     return {open:d.dataset.open,wrap:r(document.querySelector('#buildwrap')),bar:r(d.querySelector('.rk-action-row')),
      stats:r(document.querySelector('#stats')),menu:r(document.querySelector('#buildmenu')),
      visible:getComputedStyle(document.querySelector('#buildwrap')).display,
      height:innerHeight};
   })()`);
   assert.ok(expanded.open==='true'&&expanded.wrap.height>0&&expanded.visible!=='none'
     &&expanded.wrap.top>=expanded.stats.bottom-1&&expanded.wrap.bottom<=expanded.bar.top+2
     &&expanded.bar.bottom<=h+1,JSON.stringify(expanded));
   await ev("document.querySelector('#rk-build-toggle').click()");
   assert.equal(await ev("document.querySelector('#rk-actions').dataset.open"),'false');
   console.log('PASS v5.30 desktop no duplicate build button and no stats/action overlaps',w,h);
  }else{
   const buttons=await ev(`(()=>{
     const pad=document.querySelector('#pad'),group=pad.querySelector('.rk-touch-actions');
     const r=e=>e?.getBoundingClientRect()?.toJSON();
     return {pad:r(pad),group:r(group),primary:[...group.children].map(r),
      utils:[...pad.querySelectorAll(':scope > button')].map(r),scroll:document.documentElement.scrollWidth-innerWidth};
   })()`);
   assert.ok(buttons.group.left>=0&&buttons.group.right<=w+1
     &&buttons.pad.bottom<=h+1&&buttons.group.top>=buttons.pad.top-1
     &&buttons.primary.length===2&&buttons.scroll<=3,JSON.stringify(buttons));
   assert.ok(buttons.utils.every(x=>!overlaps(x,buttons.group))
     &&!overlaps(buttons.primary[0],buttons.primary[1]),JSON.stringify(buttons));
   console.log('PASS v5.30 mobile one-sided actions',w,h);
  }
  const wheel=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   g.raniWheel.close();
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
     x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
   const el=document.querySelector('#rk-hex-menu'),r=e=>e?.getBoundingClientRect()?.toJSON();
   return {wheel:r(el),buttons:[...el.querySelectorAll('.rk-hex-option')].map(b=>({id:b.dataset.action,rect:r(b)})),
     pad:r(document.querySelector('#pad')),status:el.dataset.rkViewportFit};
  })()`);
  assert.ok(wheel.status==='true'&&wheel.buttons.length===6&&new Set(wheel.buttons.map(b=>b.id)).size===6,
    JSON.stringify(wheel));
  assert.ok(wheel.buttons.every(b=>b.rect.left>=-1&&b.rect.right<=w+1
   &&b.rect.top>=-1&&b.rect.bottom<=h+1&&!overlaps(b.rect,wheel.pad)),JSON.stringify(wheel));
  const inspector=await ev(`(()=>{
   document.querySelector('#rk-hex-menu [data-action=info]').click();
   const el=document.querySelector('#rk-hex-menu'),i=el.querySelector('#rk-hex-info');
   return {info:i.getBoundingClientRect().toJSON(),hidden:i.hidden,
      pad:document.querySelector('#pad')?.getBoundingClientRect().toJSON(),
      scroll:document.documentElement.scrollWidth-innerWidth};
  })()`);
  assert.ok(!inspector.hidden&&inspector.info.left>=-1&&inspector.info.right<=w+1
   &&inspector.info.top>=-1&&inspector.info.bottom<=h+1&&!overlaps(inspector.info,inspector.pad)
   &&inspector.scroll<=3,JSON.stringify(inspector));
  await ev("window.__game.raniWheel.close()");
  console.log('PASS v5.30 actual six-hex menu and expanded building info avoid controls',w,h,mobile);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);