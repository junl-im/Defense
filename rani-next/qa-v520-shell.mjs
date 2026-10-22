// v5.20 Chromium: native back / visual confirmation / no mouse context drag,
// passive version footer, fullscreen gesture and phone safe HUD positioning.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const base=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const version=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(version.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;};
const until=async expr=>{for(let i=0;i<370;i++){if(await ev(expr))return;await sleep(200);}throw Error('Timeout '+expr);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:4},s);
 await c.send('Page.navigate',{url:base},s);
 await until("!!document.querySelector('#rk-start-now')");
 const footer=await ev("(()=>({version:document.querySelector('.rk-public-version')?.textContent,button:!!document.querySelector('#rk-version-info-toggle'),panel:!!document.querySelector('#rk-version-info-panel'),popup:!!document.querySelector('#rk-exit-dialog'),guard:history.state?.rkBackGuard===true}))()");
 assert.deepEqual(footer,{version:'v5.30',button:false,panel:false,popup:true,guard:true},JSON.stringify(footer));
 // Verify mobile title back button is not forced off-site without confirmation.
 await ev("history.back()");
 await until("!document.querySelector('#rk-exit-dialog').hidden");
 const welcome=await ev("(()=>{const e=document.querySelector('#rk-exit-dialog'),p=e.querySelector('.rk-exit-panel'),r=p.getBoundingClientRect();return {open:!e.hidden,title:e.querySelector('strong').textContent,background:getComputedStyle(p).backgroundImage,buttons:[...e.querySelectorAll('button')].map(x=>x.textContent),bounds:r.toJSON()};})()");
 assert.ok(welcome.open&&welcome.title.includes('왕국')&&welcome.background.includes('gradient')&&welcome.buttons.includes('나가기'),JSON.stringify(welcome));
 assert.ok(welcome.bounds.left>=0&&welcome.bounds.right<=390&&welcome.bounds.top>=0&&welcome.bounds.bottom<=844,JSON.stringify(welcome));
 await ev("document.querySelector('#rk-exit-stay').click()");
 assert.ok(await ev("document.querySelector('#rk-exit-dialog').hidden"));
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-strategy-toggle')");
 const context=await ev("(()=>{const g=window.__game,canvas=document.querySelector('canvas');g.placement.select('hovel');const old=g.placement.selected;const event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:180,clientY:300});const permitted=canvas.dispatchEvent(event);const drag=new DragEvent('dragstart',{bubbles:true,cancelable:true});const dragAllowed=canvas.dispatchEvent(drag);const right=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'mouse',button:2,buttons:2,clientX:182,clientY:301});const downAllowed=canvas.dispatchEvent(right);return {permitted,dragAllowed,downAllowed,preserved:g.placement.selected===old};})()");
 assert.ok(!context.permitted&&!context.dragAllowed&&!context.downAllowed&&context.preserved,JSON.stringify(context));
 await ev("window.__game.placement.cancel()");
 const hud=await ev("(()=>{const top=document.querySelector('#topbar')?.getBoundingClientRect(),btn=document.querySelector('#rk-strategy-toggle').getBoundingClientRect(),full=document.querySelector('#rk-enter-fullscreen'),retry=full.hidden?null:full.getBoundingClientRect();return {topBottom:top?.bottom,top:btn.top,strategyRight:btn.right,fullscreenVisible:!!retry,retry:retry?.toJSON(),width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,popupHidden:document.querySelector('#rk-exit-dialog').hidden};})()");
 assert.ok(hud.top>=Math.min(hud.topBottom||0,844)-1&&hud.overflow<=2&&hud.popupHidden,JSON.stringify(hud));
 if(hud.fullscreenVisible)assert.ok(hud.retry.right<=hud.width+2&&hud.retry.left>=0&&hud.retry.left>=hud.strategyRight-2,JSON.stringify(hud));
 // Simulate Android system back via session history popstate.
 await ev("history.back()");
 await until("!document.querySelector('#rk-exit-dialog').hidden");
 const modal=await ev("(()=>{const d=document.querySelector('#rk-exit-dialog'),p=d.querySelector('.rk-exit-panel'),r=p.getBoundingClientRect(),z=getComputedStyle(d).zIndex;return {open:!d.hidden,saving:d.textContent.includes('자동 저장'),confirm:d.querySelector('#rk-exit-confirm').textContent,bounds:r.toJSON(),z:+z};})()");
 assert.ok(modal.open&&modal.saving&&modal.confirm==='저장 후 종료'&&modal.z>1000,JSON.stringify(modal));
 await ev("document.querySelector('#rk-exit-stay').click()");
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,mobile:true,deviceScaleFactor:2},s);
 await sleep(240);
 const rotate=await ev("(()=>{const button=document.querySelector('#rk-strategy-toggle').getBoundingClientRect(),el=document.querySelector('#rk-enter-fullscreen'),f=el.hidden?null:el.getBoundingClientRect();return {width:innerWidth,height:innerHeight,topbar:document.querySelector('#topbar')?.getBoundingClientRect().bottom,top:button.top,button:button.toJSON(),fullscreen:f?.toJSON(),overflow:document.documentElement.scrollWidth-innerWidth};})()");
 assert.ok(rotate.top>=Math.min(rotate.topbar||0,rotate.height)-2&&rotate.button.right<=rotate.width+2&&rotate.overflow<=2,JSON.stringify(rotate));
 if(rotate.fullscreen)assert.ok(rotate.fullscreen.left>=rotate.button.right-2,JSON.stringify(rotate));
 await ev("history.back()");
 await until("!document.querySelector('#rk-exit-dialog').hidden");
 const landscape=await ev("(()=>{const r=document.querySelector('.rk-exit-panel').getBoundingClientRect();return {top:r.top,bottom:r.bottom,h:innerHeight,width:r.width};})()");
 assert.ok(landscape.top>=0&&landscape.bottom<=landscape.h+1,JSON.stringify(landscape));
 await ev("document.querySelector('#rk-exit-stay').click()");
 console.log('PASS v5.20 mobile back confirmation, keyboard/native right-drag blocking, passive version, safe HUD/fullscreen controls',{footer,welcome,context,hud,modal,rotate,landscape});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
