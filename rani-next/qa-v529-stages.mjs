// v5.29: actual game-world stage 1/2/3 appearance and click selection styling.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=ms=>new Promise(r=>setTimeout(r,ms));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expression=>{
 const q=await c.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},s);
 if(q.exceptionDetails)throw Error(q.exceptionDetails.exception?.description||JSON.stringify(q.exceptionDetails));
 return q.result.value;
};
const until=async e=>{for(let i=0;i<310;i++){if(await ev(e))return;await sleep(160);}throw Error('Timeout '+e)};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.29');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.rkAppearance");
 const stage1=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   g.raniWheel.close();
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+1.5,z:b.z+1.5,building:b});
   g.rkAppearance.force();
   const root=document.querySelector('#rk-stage-appearance'),node=root.querySelector('[data-rk-id="'+b.id+'"]');
   const outline=node?.querySelector('.rk-stage-outline');
   return {id:b.id,level:b.lvl??1,selected:root.dataset.rkSelected,stage:node?.dataset.rkStage,
    visible:!!node,corners:node?.dataset.rkFootprintCorners,width:+node?.dataset.rkProjectedWidth,
    edges:outline?.children.length,crest:getComputedStyle(node.querySelector('.rk-stage-crest')).display,
    flags:getComputedStyle(node.querySelector('.rk-stage-flag')).display,
    pointer:getComputedStyle(root).pointerEvents,scroll:document.documentElement.scrollWidth-innerWidth};
 })()`);
 assert.ok(stage1.visible&&stage1.level===1&&stage1.stage==='1'
  &&stage1.id.toString()===stage1.selected&&stage1.corners==='4'
  &&stage1.edges===4&&stage1.width>20&&stage1.crest==='none'
  &&stage1.flags==='none'&&stage1.pointer==='none'&&stage1.scroll<=3,JSON.stringify(stage1));
 const stage2=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   for(const k of ['wood','stone','iron'])g.state.stock[k]=50000;
   const a=document.querySelector('#rk-hex-menu [data-action=upgrade]');
   if(a&&!a.disabled)a.click();g.rkAppearance.force();
   const root=document.querySelector('#rk-stage-appearance'),node=root.querySelector('[data-rk-id="'+b.id+'"]');
   return {level:b.lvl,stage:node?.dataset.rkStage,selected:node?.dataset.rkSelected,
     crest:getComputedStyle(node.querySelector('.rk-stage-crest')).display,
     flag:getComputedStyle(node.querySelector('.rk-stage-flag')).display,
     name:node?.getAttribute('aria-label'),width:+node?.dataset.rkProjectedWidth,
     selectedTag:root.dataset.rkSelected};
 })()`);
 assert.ok(stage2.level===2&&stage2.stage==='2'&&stage2.crest!=='none'
   &&stage2.flag==='none'&&stage2.name.includes('2단계'),JSON.stringify(stage2));
 const stage3=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+1.5,z:b.z+1.5,building:b});
   const a=document.querySelector('#rk-hex-menu [data-action=upgrade]');
   if(a&&!a.disabled)a.click();g.rkAppearance.force();
   const n=document.querySelector('#rk-stage-appearance [data-rk-id="'+b.id+'"]');
   return {level:b.lvl,stage:n?.dataset.rkStage,selected:n?.dataset.rkSelected,
     crest:getComputedStyle(n.querySelector('.rk-stage-crest')).display,
     flag:getComputedStyle(n.querySelector('.rk-stage-flag')).display,
     flags:n?.querySelectorAll('.rk-stage-flag').length,width:+n?.dataset.rkProjectedWidth};
 })()`);
 assert.ok(stage3.level===3&&stage3.stage==='3'&&stage3.crest!=='none'
     &&stage3.flags===2&&stage3.flag!=='none',JSON.stringify(stage3));
 const camera=await ev(`(()=>{
   const g=window.__game,root=document.querySelector('#rk-stage-appearance');
   const b=g.state.buildings.find(x=>x.name==='keep');
   const n=root.querySelector('[data-rk-id="'+b.id+'"]');
   const old=n.style.left;
   g.iso.panByPixels(65,15);g.rkAppearance.force();
   const changed=n.style.left!==old;
   g.raniWheel.close();g.rkAppearance.force();
   return {old,newLeft:n.style.left,changed,remaining:!!root.querySelector('[data-rk-id="'+b.id+'"]'),
     selected:root.dataset.rkSelected,count:g.rkAppearance.count()};
 })()`);
 assert.ok(camera.changed&&camera.remaining&&camera.selected===''&&camera.count<=32,JSON.stringify(camera));
 const blocked=await ev(`(()=>{
   const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
   const previous=b.lvl,stock=g.state.stock.stone;
   // No fourth level. The disabled upgrade cannot be used to mutate state.
   g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+1.5,z:b.z+1.5,building:b});
   const control=document.querySelector('#rk-hex-menu [data-action=upgrade]');
   if(control&&!control.disabled)control.click();
   return {previous,after:b.lvl,stock,afterStock:g.state.stock.stone,disabled:control.disabled};
 })()`);
 assert.ok(blocked.disabled&&blocked.previous===blocked.after&&blocked.stock===blocked.afterStock,JSON.stringify(blocked));
 console.log('PASS v5.29 native selected footprint, persistent true Lv.2/3 crest + heraldry, camera tracking, no fourth stage',{stage1,stage2,stage3,camera,blocked});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);