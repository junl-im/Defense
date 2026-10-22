// Real Chromium QA: native game notice, hover, resource costs, one-side action dock.
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
 for(let i=0;i<350;i++){if(await ev(expr))return;await sleep(240);}
 throw Error('Timed out '+expr);
};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.28');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-actions')");
 const original=await ev(`(()=>{
   const g=window.__game,dock=document.querySelector('#rk-actions');
   const wrap=document.querySelector('#buildwrap');
   const button=document.querySelector('#rk-build-toggle');
   g.state.notify('Your people are starving!','warn');
   const starve=g.state.notices.at(-1).text;
   g.state.notify('Not enough wood and stone','warn');
   const insufficient=g.state.notices.at(-1).text;
   g.state.notify('No trees near the woodcutter','warn');
   const timber=g.state.notices.at(-1).text;
   const cost=document.querySelector('#buildmenu button[data-name=hovel]')?.title||'';
   const before=dock.dataset.open;
   button.click();
   const after=dock.dataset.open;
   const open=!document.querySelector('#buildmenu').classList.contains('hidden');
   button.click();
   const closed=dock.dataset.open;
   // Native Hud.showTip is called by the original frame loop on building hover.
   // Supply real input shapes, inspect immediately before the next animation tick.
   g.hud.showTip(120,150,'주택',
     '2/4 workers · 1 wood / 15s · click to make iron · houses 8');
   const tip=document.querySelector('#tip').textContent;
   return {starve,insufficient,timber,cost,before,after,open,closed,tip,
     parent:wrap.parentElement.id,version:document.querySelector('.rk-public-version')?.textContent};
 })()`);
 assert.equal(original.starve,'주민들이 굶주리고 있습니다!',JSON.stringify(original));
 assert.equal(original.insufficient,'목재·석재 부족',JSON.stringify(original));
 assert.ok(original.timber.includes('벌목장')&&original.timber.includes('나무'),JSON.stringify(original));
 assert.ok(original.cost.includes('목재')&&!original.cost.includes(' wood'),JSON.stringify(original));
 assert.ok(original.before==='false'&&original.after==='true'&&original.open&&original.closed==='false'&&original.parent==='rk-actions',JSON.stringify(original));
 assert.ok(original.tip.includes('일꾼')&&original.tip.includes('목재')
 &&original.tip.includes('철')&&original.tip.includes('주거 수용')
 &&!/\b(workers?|wood|click|houses)\b/i.test(original.tip),JSON.stringify(original));
 const layout=await ev(`(()=>{
   const bar=document.querySelector('#rk-actions'),stats=document.querySelector('#stats');
   const a=bar.getBoundingClientRect(),b=stats.getBoundingClientRect();
   return {dock:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},
     stats:{bottom:b.bottom},width:innerWidth,height:innerHeight,
     hidden:document.querySelector('#buildwrap').getBoundingClientRect().height===0};
 })()`);
 assert.ok(layout.dock.left>=0&&layout.dock.right<layout.width*.4
 &&layout.dock.bottom<=layout.height+2&&layout.hidden,JSON.stringify(layout));
 await ev("document.querySelector('#rk-pause-toggle').click()");
 await until("!!document.querySelector('#pause')");
 console.log('PASS v5.28 Korean native notices, building hover and left-side menu dock',{original,layout});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
