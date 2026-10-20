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
await evaluate("[...document.querySelectorAll('#menu button')].find(b=>b.textContent.includes('CHOOSE LORDS')).click()");
await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('BEGIN'))");
await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('BEGIN')).click()");
await wait("!!window.__game&&!!document.getElementById('rani-controls-toggle')",120);
await sleep(800);
const state=await evaluate(`(()=>{
 const g=window.__game,ui=document.querySelector('#ui');
 const controls=document.querySelector('#controls');
 const info=document.querySelector('#stats2');
 return {game:!!g.state,buildings:g.state.buildings.length,
         zoom:g.iso.zoom,controlsHidden:getComputedStyle(controls).display==='none',
         infoHidden:getComputedStyle(info).display==='none',
         realRes:document.querySelectorAll('#topbar [data-res]').length,
         nativeBuild:!!document.getElementById('buildbar'),
         mini:!!document.querySelector('#minimap canvas')};
})()`);
assert.ok(state.game&&state.buildings>0&&Math.abs(state.zoom-1.5)<.05,state);
assert.ok(state.controlsHidden&&state.infoHidden&&state.realRes>4&&state.nativeBuild&&state.mini,state);
await evaluate("document.getElementById('rani-controls-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('controls')).display==='none'"),false);
await evaluate("document.getElementById('rani-info-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('stats2')).display==='none'"),false);
await evaluate("document.getElementById('rani-controls-toggle').click();document.getElementById('rani-info-toggle').click()");
if(shot){
 const r=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot,Buffer.from(r.data,'base64'));
}
assert.deepEqual(issues,[]);
console.log('PASS actual Rani Next 2.5D: Korean start, hidden editable map list, real coast map, playable game, zoom 1.5, data-driven HUD and toggles');
process.exit(0);
