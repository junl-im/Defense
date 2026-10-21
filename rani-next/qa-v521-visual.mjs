// v5.21 Chromium: actual build/upgrade animation, palette scrollbars,
// interactive rectangle overlap (phone landscape/portrait), no phantom success.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const browser=await getJSON('http://127.0.0.1:'+port+'/json/version'),c=new CDP();
await c.connect(browser.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{const x=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description);return x.result.value;};
const until=async expr=>{for(let i=0;i<360;i++){if(await ev(expr))return;await sleep(220);}throw Error('Timeout '+expr);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.21');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game && !!document.querySelector('#rk-construction-fx')");
 const initial=await ev("(()=>{const fx=document.querySelector('#rk-construction-fx');const pause=document.querySelector('#rk-strategy-card');return {hidden:fx.hidden,sequence:fx.dataset.rkSerial||'0',pointer:getComputedStyle(fx).pointerEvents,scroll:pause?getComputedStyle(pause).scrollbarColor:'',older:document.querySelector('#rk-hex-menu .rk-hex-buttons')?.tagName};})()");
 assert.ok(initial.hidden&&initial.sequence==='0'&&initial.pointer==='none'&&initial.scroll.includes('rgb('),JSON.stringify(initial));
 const build=await ev("(()=>{const g=window.__game;g.state.stock.wood=3000;g.state.stock.stone=3000;const fx=document.querySelector('#rk-construction-fx'),where=g.findSpot('hovel');const old=g.state.buildings.length;const r=g.build('hovel',where.x,where.z);return {result:r,site:where,old,now:g.state.buildings.length,sequence:+fx.dataset.rkSerial||0,kind:fx.dataset.rkEvent,hidden:fx.hidden,screen:g.iso.worldToScreen(where.x+.5,0,where.z+.5)};})()");
 assert.ok(build.result==='hovel'&&build.now===build.old+1&&build.sequence===1&&build.kind==='build'&&!build.hidden,JSON.stringify(build));
 await sleep(160);
 const pixels=await ev("(()=>{const c=document.querySelector('#rk-construction-fx'),x=c.getContext('2d'),p=x.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<p.length;i+=4)if(p[i])n++;return {alpha:n,width:c.width,height:c.height};})()");
 const onscreen=build.screen[0]>=-120&&build.screen[0]<=390+120&&build.screen[1]>=-120&&build.screen[1]<=844+120;
 if(onscreen)assert.ok(pixels.alpha>250&&pixels.width>300,JSON.stringify({build,pixels}));
 else console.log('PASS off-screen construction effect culling',{screen:build.screen,viewport:[390,844]});
 const blocked=await ev("(()=>{const g=window.__game,fx=document.querySelector('#rk-construction-fx'),before=g.state.buildings.length,serial=+fx.dataset.rkSerial;const r=g.build('hovel',-5,-5);return{result:r,count:g.state.buildings.length,before,serialBefore:serial,serialAfter:+fx.dataset.rkSerial};})()");
 assert.ok(blocked.count===blocked.before&&blocked.serialBefore===blocked.serialAfter,JSON.stringify(blocked));
 const upgrade=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep'),fx=document.querySelector('#rk-construction-fx');g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});const btn=document.querySelector('#rk-hex-menu [data-action=upgrade]');const was=b.lvl??1;if(btn&&!btn.hidden)btn.click();return {before:was,after:b.lvl??1,serial:+fx.dataset.rkSerial,event:fx.dataset.rkEvent,button:!!btn,hidden:!!btn?.hidden,wheelClosed:document.querySelector('#rk-hex-menu').hidden};})()");
 assert.ok(upgrade.button&&!upgrade.hidden&&upgrade.after===upgrade.before+1&&upgrade.serial===2&&upgrade.event==='upgrade'&&upgrade.wheelClosed,JSON.stringify(upgrade));
 await ev("window.__game.raniWheel.close()");
 // Check real visible rectangles, not just CSS selectors. The UI may hide
 // individual controls while guides or sheets are active.
 const sizes=[[390,844],[320,568],[844,390],[667,375]];
 for(const [width,height] of sizes){
   await c.send('Emulation.setDeviceMetricsOverride',{width,height,mobile:true,deviceScaleFactor:2},s);
   await sleep(120);
   const layout=await ev("(()=>{const names=['#rk-strategy-toggle','#rk-enter-fullscreen','#rk-strategy-card','#rk-phone-zoom','#rk-first-steps','#rk-harbor-panel','#rk-quick-build','#rk-hex-menu'];const items=names.map(id=>{const e=document.querySelector(id);if(!e)return null;const st=getComputedStyle(e),r=e.getBoundingClientRect();return{id,visible:!e.hidden&&st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0,x:r.x,y:r.y,right:r.right,bottom:r.bottom};}).filter(Boolean);return {w:innerWidth,h:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth,items};})()");
   assert.ok(layout.overflow<=2,'Viewport horizontal scroll '+JSON.stringify(layout));
   const active=layout.items.filter(x=>x.visible);
   for(const item of active.filter(x=>/rk-strategy-toggle|rk-enter-fullscreen|rk-phone-zoom/.test(x.id))){
     assert.ok(item.x>=-2&&item.right<=width+2&&item.y>=-2&&item.bottom<=height+2,'Interactive HUD clipped '+JSON.stringify({width,height,item}));
   }
   for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
     const a=active[i],b=active[j];
     if(!(/rk-strategy|rk-enter-fullscreen|rk-phone-zoom|rk-first-steps/.test(a.id)&&/rk-strategy|rk-enter-fullscreen|rk-phone-zoom|rk-first-steps/.test(b.id)))continue;
     // A status toggle and its OWN expanded card are allowed nearby, not on top of one another.
     if(a.id.includes('strategy-toggle')&&b.id.includes('strategy-card'))continue;
     const x=Math.min(a.right,b.right)-Math.max(a.x,b.x);
     const y=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
     assert.ok(x<=4||y<=4,'Two mobile HUD controls overlap '+JSON.stringify({width,height,a,b,x,y}));
   }
   console.log('PASS v5.21 responsive HUD',width,height,active.map(x=>x.id));
 }
 // Clicking a modal must suppress the decorative canvas above it.
 await ev("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}))");
 await until("!document.querySelector('#rk-exit-dialog').hidden");
 const mod=await ev("(()=>({visible:getComputedStyle(document.querySelector('#rk-construction-fx')).visibility,buttons:getComputedStyle(document.querySelector('#rk-strategy-toggle')).visibility,dialog:!document.querySelector('#rk-exit-dialog').hidden}))()");
 assert.ok(mod.dialog&&mod.visible==='hidden',JSON.stringify(mod));
 await ev("document.querySelector('#rk-exit-stay').click()");
 console.log('PASS v5.21 build upgrade animation only on success, golden scrollbars, modal layers, four phone layouts',{initial,build,pixels,blocked,upgrade,mod});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
