// Browser QA: default coast enters the real Fiefdom world with one click.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const host=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',shot=process.argv[4];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const v=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(v.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);
await c.send('Runtime.enable',{},s);
await c.send('Emulation.setDeviceMetricsOverride',
 {width:1280,height:800,deviceScaleFactor:1,mobile:false},s);
const issues=[];
c.onEvent=message=>{
 if(message.method==='Runtime.exceptionThrown')issues.push('JS exception');
 if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')
  issues.push('console.error '+message.params.args.map(a=>a.value??a.description).join(' '));
};
const evaluate=async expression=>{
 const r=await c.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},s);
 if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description);
 return r.result.value;
};
async function wait(expr,seconds=120){
 for(let i=0;i<seconds*2;i++){if(await evaluate(expr))return;await sleep(500);}
 throw new Error('Timeout '+expr);
}
await c.send('Page.navigate',{url:host},s);
await wait("!!document.querySelector('#rani-map-picker')&&!!document.querySelector('#rk-start-now')");
const initial=await evaluate("(()=>({coast:document.querySelector('#rani-start-hero strong')?.textContent,quick:document.querySelector('#rk-start-now')?.textContent,manual:!!document.querySelector('#menu button.go'),mapPicker:!!document.querySelector('#rani-map-picker')}))()");
assert.equal(initial.coast,'푸른 해안',initial);
assert.equal(initial.quick,'바로 왕국 시작',initial);
assert.ok(initial.manual&&initial.mapPicker,initial);
await evaluate("document.querySelector('#rk-start-now').click()");
await wait("!!window.__game&&!!document.querySelector('#ui')&&!document.querySelector('#lords')");
const proof=await evaluate("(()=>{const g=window.__game;return {menuGone:!document.querySelector('#menu'),lordGone:!document.querySelector('#lords'),hasKeep:g.state?.buildings?.some(b=>b.name==='keep'),buildings:g.state?.buildings?.length,canvas:!!document.querySelector('canvas'),realBuild:!!document.querySelector('#buildmenu button[data-name]'),wheel:!!g.raniWheel};})()");
assert.ok(proof.menuGone&&proof.lordGone&&proof.hasKeep&&proof.buildings>0
 &&proof.canvas&&proof.realBuild&&proof.wheel,proof);
await sleep(700);assert.deepEqual(issues,[],issues);
if(shot){const pic=await c.send('Page.captureScreenshot',{format:'png'},s);fs.writeFileSync(shot,Buffer.from(pic.data,'base64'));}
console.log('PASS v5.4 real world quickstart: coast, native seat, keep, economy/build interface, zero JS errors',proof);
await c.send('Target.closeTarget',{targetId});c.close();