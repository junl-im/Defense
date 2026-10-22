// v5.30: REAL 2.5D Chrome browser collision audit.
// Desktop duplicate build CTA + dock, royal wheel, small phone and landscape.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const base=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async exp=>{
 const r=await c.send('Runtime.evaluate',{expression:exp,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
};
const until=async exp=>{for(let i=0;i<380;i++){if(await ev(exp))return;await sleep(170);}throw Error('Timeout '+exp)};
const rect=(e)=>e?.getBoundingClientRect()?.toJSON();
async function start(w,h,mobile){
 await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 const url=base+(mobile?(base.includes('?')?'&':'?')+'touch=1':'');
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.raniWheel&&(!!document.querySelector('#pad')||!!document.querySelector('#rk-actions'))");
 await ev("window.__rkRect=e=>e?.getBoundingClientRect()?.toJSON()");
}
function separate(a,b,gap=0){
 if(!a||!b)return true;
 return a.right<=b.left+gap||b.right<=a.left+gap||
        a.bottom<=b.top+gap||b.bottom<=a.top+gap;
}
try{
 await start(1366,768,false);
 const desktop=await ev(`(()=>{
 const old=document.querySelector('#rani-build-toggle');
 const native=document.querySelector('#rk-build-toggle');
 const menu=document.querySelector('#rk-pause-toggle'),dock=document.querySelector('#rk-actions');
 const visible=e=>!!e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getBoundingClientRect().width>0;
 const one=[old,native].filter(visible).length;
 const start={one,oldHidden:!visible(old),dock:window.__rkRect(dock),build:window.__rkRect(native),menu:window.__rkRect(menu)};
 native.click();const open=dock.dataset.open==='true';
 const catalog=window.__rkRect(document.querySelector('#buildwrap'));
 native.click();return {...start,open,closed:dock.dataset.open==='false',catalog,stats:window.__rkRect(document.querySelector('#stats')),viewport:{w:innerWidth,h:innerHeight}};
 })()`);
 assert.ok(desktop.one===1&&desktop.oldHidden&&desktop.open&&desktop.closed,JSON.stringify(desktop));
 assert.ok(separate(desktop.build,desktop.menu)
   &&separate(desktop.dock,desktop.stats)
   &&desktop.catalog.bottom<=desktop.viewport.h+2,JSON.stringify(desktop));
 const wheel=await ev(`(()=>{
  const g=window.__game,b=g.state.buildings.find(b=>b.name==='keep');
  g.raniWheel.close();g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
   x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
  const node=document.querySelector('#rk-hex-menu');
  const opts=[...node.querySelectorAll('.rk-hex-option')];
  return {menu:window.__rkRect(node),dock:window.__rkRect(document.querySelector('#rk-actions')),
   buttons:opts.map(e=>({action:e.dataset.action,icon:e.dataset.rkIcon,rect:window.__rkRect(e),disabled:e.disabled})),
   visible:!node.hidden};
 })()`);
 assert.ok(wheel.visible&&wheel.buttons.length===6&&wheel.buttons.every(x=>x.icon)
  &&separate(wheel.menu,wheel.dock),JSON.stringify(wheel));
 const inspector=await ev(`(()=>{
 const node=document.querySelector('#rk-hex-menu');
 node.querySelector('[data-action=info]').click();
 return {mode:node.dataset.rkInfoOpen,body:window.__rkRect(node.querySelector('#rk-hex-info')),
  exists:!node.querySelector('#rk-hex-info').hidden};
 })()`);
 assert.ok(inspector.mode==='true'&&inspector.exists
   &&inspector.body.left>=0&&inspector.body.right<=1366
   &&inspector.body.bottom<=768+3,JSON.stringify(inspector));
 console.log('PASS v5.30 desktop single build trigger, conflict-free gold dock and six-hex inspector',desktop,wheel,inspector);
 for(const [w,h] of [[320,568],[390,844],[844,390]]){
  await start(w,h,true);
  const phone=await ev(`(()=>{
    const pad=document.querySelector('#pad');
    const group=pad.querySelector('.rk-touch-actions');
    const all=[...pad.querySelectorAll('button')].map(e=>({text:e.textContent||'',id:e.id,rect:window.__rkRect(e),
       visible:getComputedStyle(e).visibility!=='hidden'}));
    const legacy=document.querySelector('#rani-build-toggle');
    return {w:innerWidth,h:innerHeight,pad:window.__rkRect(pad),group:window.__rkRect(group),
      actions:[...group.querySelectorAll('button')].map(e=>e.id),
      buttons:all,oldHidden:!legacy||getComputedStyle(legacy).display==='none',
      overflow:document.documentElement.scrollWidth-innerWidth};
  })()`);
  assert.deepEqual(phone.actions,['rk-touch-build','rk-touch-menu']);
  assert.ok(phone.oldHidden&&phone.buttons.length>=7&&phone.overflow<=3
    &&phone.group.left>=0&&phone.group.right<=phone.w+1
    &&phone.pad.bottom<=phone.h+1,JSON.stringify(phone));
  for(let i=0;i<phone.buttons.length;i++)
   for(let j=i+1;j<phone.buttons.length;j++)
    assert.ok(separate(phone.buttons[i].rect,phone.buttons[j].rect,1),
      'Overlapping mobile action buttons '+w+'x'+h+': '+JSON.stringify([phone.buttons[i],phone.buttons[j]]));
  const hex=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(b=>b.name==='keep');
   g.raniWheel.close();g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
     x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
   const node=document.querySelector('#rk-hex-menu');
   return {wheel:window.__rkRect(node),pad:window.__rkRect(document.querySelector('#pad')),
     opts:[...node.querySelectorAll('.rk-hex-option')].map(e=>({id:e.dataset.action,icon:e.dataset.rkIcon,box:window.__rkRect(e)}))};
  })()`);
  assert.ok(hex.wheel.left>=0&&hex.wheel.right<=w+1
    &&hex.wheel.top>=-2&&hex.wheel.bottom<=hex.pad.top+3
    &&hex.opts.length===6&&hex.opts.every(x=>x.icon),JSON.stringify({w,h,hex}));
  const details=await ev(`(()=>{
    const node=document.querySelector('#rk-hex-menu');
    node.querySelector('[data-action=info]').click();
    const panel=node.querySelector('#rk-hex-info');
    return {infoOpen:node.dataset.rkInfoOpen,panel:window.__rkRect(panel),
     exit:window.__rkRect(node.querySelector('.rk-hex-close')),
     pad:window.__rkRect(document.querySelector('#pad')),
     closed:getComputedStyle(node.querySelector('.rk-hex-buttons')).visibility};
  })()`);
  assert.ok(details.infoOpen==='true'&&details.closed==='hidden'
    &&details.panel.left>=0&&details.panel.right<=w+1
    &&details.panel.top>=-1&&details.panel.bottom<=details.pad.top+3
    &&details.exit.bottom<=details.pad.top+3,JSON.stringify({w,h,details}));
  const quick=await ev(`(()=>{
    const g=window.__game;g.raniWheel.close();
    const spot=g.findSpot('hovel');if(!spot)return {spot:null};
    g.rkOpenGroundBuild(spot.x,spot.z);
    return {spot,open:!document.querySelector('#rk-quick-build').hidden,
      tray:window.__rkRect(document.querySelector('#rk-quick-build')),
      pad:window.__rkRect(document.querySelector('#pad'))};
  })()`);
  assert.ok(quick.spot&&quick.open&&quick.tray.left>=0&&quick.tray.right<=w+1
    &&quick.tray.bottom<=quick.pad.top+3,JSON.stringify({w,h,quick}));
  console.log('PASS v5.30 mobile non-overlap audit',w,h,phone.actions);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
