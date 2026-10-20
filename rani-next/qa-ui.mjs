// Prove this is a playable kingdom world, not a static illustrated mock.
// Uses Fiefdom's original Chrome DevTools harness, with real DOM game actions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const host=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const shot=process.argv[4];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const v=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(v.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);
await c.send('Runtime.enable',{},s);
await c.send('Emulation.setDeviceMetricsOverride',
 {width:1440,height:900,deviceScaleFactor:1,mobile:false},s);
const issues=[];
c.onEvent=message=>{
 if(message.method==='Runtime.exceptionThrown') issues.push('exception');
 if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')
   issues.push('console.error '+message.params.args.map(a=>a.value??a.description).join(' '));
};
const evaluate=async expression=>{
 const r=await c.send('Runtime.evaluate',
  {expression,awaitPromise:true,returnByValue:true},s);
 if(r.exceptionDetails) throw new Error('Page JS: '+r.exceptionDetails.exception?.description);
 return r.result.value;
};
const wait=async(expression,seconds=90)=>{
 for(let i=0;i<seconds*2;i++){if(await evaluate(expression))return;await sleep(500);}
 throw new Error('Timed out waiting for: '+expression);
};
await c.send('Page.navigate',{url:host},s);
await wait("!!document.getElementById('rani-map-picker')");
const initial=await evaluate(`(()=>{
 const menu=document.querySelector('#menu');
 const details=document.querySelector('#rani-map-picker');
 const hero=document.querySelector('#rani-start-hero');
 return {title:menu?.querySelector('h1')?.textContent,
         chosen:hero?.querySelector('strong')?.textContent,
         visible:!!hero && getComputedStyle(hero).display!=='none',
         originalCards:details?.querySelectorAll('.maps .map').length,
         closed:details?.open===false,
         mapDisplay:getComputedStyle(details?.querySelector('.maps')).display,
         actualStart:!!menu?.querySelector('button.go')};
})()`);
assert.equal(initial.title,'라니킹덤');
assert.equal(initial.chosen,'푸른 해안');
assert.ok(initial.visible&&initial.closed&&initial.originalCards>=10&&initial.actualStart,initial);
assert.equal(initial.mapDisplay,'none');
if(shot){
 const page=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-menu.png'),Buffer.from(page.data,'base64'));
}
assert.equal(await evaluate("getComputedStyle(document.querySelector('#menu .go')).backgroundImage.includes('rk_royal_button.webp')"),true);

await evaluate("document.querySelector('#rani-map-picker summary').click()");
assert.equal(await evaluate("document.querySelector('#rani-map-picker').open"),true);
// Select another existing Fiefdom map, then choose coast again. The original
// real map selection controls and their saved seeds are still authoritative.
await evaluate("document.querySelectorAll('#rani-map-picker .maps .map')[1].click()");
assert.equal(await evaluate("document.querySelector('#rani-map-picker').open"),false);
assert.notEqual(await evaluate("document.querySelector('#rani-start-hero strong').textContent"),'푸른 해안');
await evaluate("document.querySelector('#rani-map-picker summary').click()");
await evaluate("document.querySelector('#rani-map-picker .map').click()");
assert.equal(await evaluate("document.querySelector('#rani-start-hero strong').textContent"),'푸른 해안');
await evaluate("[...document.querySelectorAll('#menu button')].find(b=>b.textContent.includes('영주 선택')).click()");
await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('BEGIN'))");
await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('BEGIN')).click()");
await wait("!!window.__game&&!!document.getElementById('rani-controls-toggle')",120);
await wait("document.getElementById('ui')?.dataset.raniAssets==='1'",20);
const placements=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {count:ui.dataset.raniAssetCount,
   house:!!ui.querySelector('#buildmenu button[data-name="hovel"] img.rani-approved-building'),
   market:!!ui.querySelector('#buildmenu button[data-name="market"] img.rani-approved-building'),
   panel:!!ui.querySelector('#rani-approved-royal-panel'),
   ship:!!ui.querySelector('#market #rani-market-art img')};
})()`);
console.log('Rani user asset placement',JSON.stringify(placements));
assert.equal(placements.count,'4',placements);
await sleep(800);
const owned=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 const house=ui.querySelector('#buildmenu button[data-name="hovel"]');
 const market=ui.querySelector('#buildmenu button[data-name="market"]');
 const trade=ui.querySelector('#market #rani-market-art img');
 const panel=ui.querySelector('#rani-approved-royal-panel');
 const images=[
  house?.querySelector('img.rani-approved-building'),
  market?.querySelector('img.rani-approved-building'),trade,panel
 ];
 return {count:images.length,loaded:images.map(x=>!!x&&x.complete&&x.naturalWidth>0),
   originalButtons:[house,market].map(x=>typeof x?.onclick==='function'),
   nativeCanvas:[house,market].map(x=>!!x?.querySelector('canvas')),
   fallbackReady:[house,market].map(x=>!!x?.querySelector('canvas.rani-hide-canvas')),
   tradingControls:!!ui.querySelector('#market')};
})()`);
assert.deepEqual(owned.loaded,[true,true,true,true],owned);
assert.deepEqual(owned.originalButtons,[true,true],owned);
assert.deepEqual(owned.nativeCanvas,[true,true],owned);
assert.deepEqual(owned.fallbackReady,[true,true],owned);
assert.ok(owned.tradingControls,owned);
const state=await evaluate(`(()=>{
 const g=window.__game,ui=document.querySelector('#ui');
 const controls=document.querySelector('#controls');
 const info=document.querySelector('#rightpanel');
 return {game:!!g.state,buildings:g.state.buildings.length,
         zoom:g.iso.zoom,controlsHidden:getComputedStyle(controls).display==='none',
         infoHidden:getComputedStyle(info).display==='none',
         realRes:document.querySelectorAll('#topbar [data-res]').length,
         nativeBuild:!!document.getElementById('buildbar'),
         mini:!!document.querySelector('#minimap canvas')};
})()`);
assert.ok(state.game&&state.buildings>0&&Math.abs(state.zoom-1.5)<.05,state);
assert.ok(state.controlsHidden&&state.infoHidden&&state.realRes>4&&state.nativeBuild&&state.mini,state);
const res=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {toggle:!!document.getElementById('rani-resource-toggle'),
   displayed:[...document.querySelectorAll('#topbar .res')].filter(e=>getComputedStyle(e).display!=='none').length,
   total:document.querySelectorAll('#topbar .res').length};
})()`);
assert.ok(res.toggle&&res.displayed===5&&res.total>res.displayed,res);
await evaluate("document.getElementById('rani-resource-toggle').click()");
const expanded=await evaluate("[...document.querySelectorAll('#topbar .res')].filter(e=>getComputedStyle(e).display!=='none').length");
assert.ok(expanded>res.displayed,{expanded,res});
await evaluate("document.getElementById('rani-resource-toggle').click()");
const beforeBuild=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {button:!!document.getElementById('rani-build-toggle'),
   hidden:getComputedStyle(document.getElementById('buildwrap')).display==='none',
   catalog:!!document.querySelector('#buildbar button[data-group="2"]')};
})()`);
assert.ok(beforeBuild.button&&beforeBuild.hidden&&beforeBuild.catalog,beforeBuild);
await evaluate("document.getElementById('rani-build-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildwrap')).display==='none'"),false);
await evaluate("document.querySelector('#buildbar button[data-group=2]').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildmenu')).display==='none'"),false);
await evaluate("document.getElementById('rani-build-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildwrap')).display==='none'"),true);

await evaluate("document.getElementById('rani-controls-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('controls')).display==='none'"),false);
await evaluate("document.getElementById('rani-info-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('rightpanel')).display==='none'"),false);
if(shot){
 await evaluate(`(()=>{
 const sel=document.querySelector('#rightpanel select');
 sel.value='market';sel.dispatchEvent(new Event('change',{bubbles:true}));
 })()`);
 await sleep(250);
 const proof=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-market.png'),Buffer.from(proof.data,'base64'));
}
await evaluate("document.getElementById('rani-controls-toggle').click();document.getElementById('rani-info-toggle').click()");
if(shot){
 const r=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot,Buffer.from(r.data,'base64'));
}
assert.deepEqual(issues,[]);
console.log('PASS actual Rani Next 2.5D: Korean start, hidden editable map list, real coast map, playable game, zoom 1.5, data-driven HUD and toggles');
process.exit(0);
