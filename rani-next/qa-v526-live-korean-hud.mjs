// v5.31 — real running game: rapidly regenerated popularity, production,
// recruitment costs and keyboard hints must be Korean in the rendered HUD.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
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
const until=async expr=>{
 for(let i=0;i<340;i++){if(await ev(expr))return;await sleep(190);}
 throw Error('Timeout: '+expr);
};
try {
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.31');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.hud");
 const results=await ev(`(()=>{
  const g=window.__game,h=g.hud;
  h.setView('popularity');h.update();
  const popularity=document.querySelector('#view-popularity')?.textContent||'';
  h.setView('production');h.update();
  const production=document.querySelector('#view-production')?.textContent||'';
  h.setView('barracks');h.update();
  const barracks=document.querySelector('#view-barracks');
  const prices=[...barracks?.querySelectorAll('span.c')||[]].map(e=>e.textContent||'');
  const warning=[...barracks?.querySelectorAll('[data-need]')||[]].map(e=>e.textContent||'');
  const hint=[...barracks?.querySelectorAll('.hint')||[]].map(e=>e.textContent||'').join(' ');
  const controls=document.querySelector('#controls');
  const speed=[...document.querySelectorAll('[data-speed]')].map(e=>e.textContent||'');
  const speedTitles=[...document.querySelectorAll('[data-speed]')].map(e=>e.title||'');
  return {popularity,production,prices,warning,hint,speed,speedTitles,
          overall:document.querySelector('#rk-actions')?.dataset.open};
 })()`);
 assert.ok(results.popularity.includes('민심')&&results.popularity.includes('분당'),
  'Popularity generated stale English UI '+JSON.stringify(results));
 assert.ok(!/\b(Popularity|steady|rising|falling|Reaching|minute|about)\b/i.test(results.popularity),
  'Popularity regeneration English regression '+JSON.stringify(results));
 assert.ok(!/\b(nothing produced yet|measuring)\b/i.test(results.production),
  'Production regeneration English regression '+JSON.stringify(results));
 assert.ok(results.warning.length>0&&results.warning.every(t=>t.includes('건설')&&!/\bBuild\b/i.test(t)),
  'Recruitment prerequisite English regression '+JSON.stringify(results));
 assert.ok(results.prices.length>0&&results.prices.every(t=>t.includes('금 ')&&!/\d+g\b/i.test(t)),
  'Recruit cost must show Korean prices '+JSON.stringify(results));
 assert.ok(results.hint.includes('Ctrl+클릭')&&!/\bRight-click\b/i.test(results.hint),
  'Help must match disabled right-click and translated commands '+JSON.stringify(results));
 assert.ok(results.speed.length>0&&results.speed.some(t=>/일시정지|느림|보통|빠름/.test(t)),
  'Speed buttons not localized '+JSON.stringify(results));
 assert.ok(results.speedTitles.every(t=>!/\b(speed|the world stops)\b/i.test(t)),
  'Speed hover title in English '+JSON.stringify(results));
 console.log('PASS v5.31 real popularity, production, recruitment, no-right-click and speed HUD',{results});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
