// v5.16 Chromium: no backing table under the hexes, real placement reasons.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const host=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(browser.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);
 return r.result.value;
};
const until=async e=>{for(let i=0;i<350;i++){if(await ev(e))return;await wait(240);}throw Error('Timeout '+e);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:3},s);
 await c.send('Page.navigate',{url:host},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.25');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game && !!document.querySelector('#rk-hex-menu')");
 const wheel=await ev("(()=>{const g=window.__game,keep=g.state.buildings.find(b=>b.name==='keep');g.raniWheel.close();const wood=g.state.stock.wood,stone=g.state.stock.stone;g.state.stock.wood=0;g.state.stock.stone=0;g.raniWheel.toggle({key:'building:'+keep.id,name:keep.name,label:keep.def.label,x:keep.x+keep.def.footprint[0]/2,z:keep.z+keep.def.footprint[1]/2,building:keep});const el=document.querySelector('#rk-hex-menu'),area=el.querySelector('.rk-hex-buttons'),style=getComputedStyle(area),actions=[...el.querySelectorAll('.rk-hex-option')],shown=actions.filter(b=>!b.hidden),core=el.querySelector('.rk-hex-core');const info=el.querySelector('#rk-hex-info');return {back:style.backgroundImage,color:style.backgroundColor,border:style.borderTopWidth,display:style.display,message:el.querySelector('.rk-hex-message').textContent,open:!el.hidden,shown:shown.map(b=>b.dataset.action),positions:shown.map(b=>getComputedStyle(b).position),core:getComputedStyle(core).position,infoHidden:info.hidden,bounds:el.getBoundingClientRect().toJSON(),saved:{wood,stone}};})()");
 assert.ok(wheel.open&&wheel.display==='block'&&wheel.back==='none',JSON.stringify(wheel));
 assert.ok(wheel.color==='rgba(0, 0, 0, 0)'&&wheel.border==='0px',JSON.stringify(wheel));
 assert.equal(wheel.message,'','No automatic table or reasons behind hexes');
 assert.ok(wheel.infoHidden&&wheel.shown.includes('info')&&wheel.shown.every((x,i)=>wheel.positions[i]==='absolute'),JSON.stringify(wheel));
 assert.equal(wheel.core,'absolute');
 const explanations=await ev("(()=>{document.querySelector('#rk-hex-menu [data-action=info]').click();const el=document.querySelector('#rk-hex-info');return {open:!el.hidden,text:el.textContent}})()");
 assert.ok(explanations.open&&explanations.text.includes('현재 불가능')&&explanations.text.includes('자원 부족'),JSON.stringify(explanations));
 await ev("(()=>{const g=window.__game;g.state.stock.wood=999;g.state.stock.stone=999;g.raniWheel.close()})()");
 const quick=await ev("(()=>{const g=window.__game,spot=g.findSpot('hovel');if(!spot)return {spot:null};const opened=g.rkOpenGroundBuild(spot.x,spot.z);const box=document.querySelector('#rk-quick-build');return {spot,opened,choices:[...box.querySelectorAll('.rk-quick-choice')].map(x=>x.dataset.name),reasons:box.querySelector('.rk-quick-reasons')!==null};})()");
 assert.ok(quick.spot&&quick.opened&&quick.choices.length>0&&quick.reasons,JSON.stringify(quick));
 const build=await ev("(()=>{const g=window.__game,p=g.findSpot('hovel');document.querySelector('#rk-quick-build .rk-quick-close').click();g.placement.select('hovel');g.placement.moveTo(p.x,p.z);g.redraw();const hint=document.querySelector('#rk-placement-hint');const legal={text:hint.textContent,ready:hint.dataset.ready,hidden:hint.hidden};g.placement.moveTo(-1,-1);g.redraw();const bad={text:hint.textContent,ready:hint.dataset.ready,hidden:hint.hidden};g.placement.cancel();g.redraw();return {legal,bad,hiddenAfterCancel:hint.hidden};})()");
 assert.ok(build.legal.ready==='true'&&!build.legal.hidden&&build.legal.text.includes('설치 가능'),JSON.stringify(build));
 assert.ok(build.bad.ready==='false'&&build.bad.text.includes('설치 불가')&&build.bad.text.includes('지도'),JSON.stringify(build));
 assert.ok(build.hiddenAfterCancel,JSON.stringify(build));
 const roof=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(b=>b.name==='keep');g.raniWheel.close();const p=g.iso.worldToScreen(b.x+b.def.footprint[0]/2,0,b.z+b.def.footprint[1]/2);const ok=g.rkMobileTapBuilding(p[0],p[1]-14,-10,-10);return {ok,target:g.raniWheel.target?.key};})()");
 assert.ok(roof.ok&&roof.target?.startsWith('building:'),JSON.stringify(roof));
 await ev("window.__game.raniWheel.close()");
 console.log('PASS v5.16 clean radial hex, on-demand reasons, real placement badge, roof hit',{wheel,explanations,quick,build,roof});
}finally{
 await c.send('Target.closeTarget',{targetId});
}
process.exit(0);
