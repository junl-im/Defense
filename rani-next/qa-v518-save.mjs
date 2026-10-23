// v5.18 production Chromium QA: durable writes, quota error, portable backups,
// safe imported copies, old-save layout and small-phone pause without overflow.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const origin=process.argv[2]||'http://127.0.0.1:8931/',port=process.argv[3]||'9341';
const sleep=n=>new Promise(r=>setTimeout(r,n));
const browser=await getJSON('http://127.0.0.1:'+port+'/json/version');
const cd=new CDP();await cd.connect(browser.webSocketDebuggerUrl);
const {targetId}=await cd.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await cd.send('Target.attachToTarget',{targetId,flatten:true});
await cd.send('Page.enable',{},s);await cd.send('Runtime.enable',{},s);
const ev=async expr=>{
 const o=await cd.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(o.exceptionDetails)throw Error(o.exceptionDetails.exception?.description);
 return o.result.value;
};
const until=async expr=>{for(let i=0;i<360;i++){if(await ev(expr))return;await sleep(250);}throw Error('Timeout '+expr);};
try{
 // Reproduce the real GitHub Pages static site: no server /api/kv exists.
 // The dev preview can serve an API and hide browser-only quota failures.
 await cd.send('Page.addScriptToEvaluateOnNewDocument',{source:"(()=>{const f=window.fetch.bind(window);window.fetch=(input,options)=>{const u=typeof input==='string'?input:input?.url||'';if(/^\\/api\\/kv(?:\\/|$)/.test(u))return Promise.resolve(new Response('Not Found',{status:404,headers:{'content-type':'text/plain'}}));return f(input,options);};})();"},s);
 await cd.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await cd.send('Page.navigate',{url:origin},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.31');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game && !!document.querySelector('#rk-strategy-toggle')");
 await cd.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27},s);
 await cd.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27},s);
 await until("!!document.querySelector('#pause #rk-save-import')");
 const form=await ev("(()=>({input:!!document.querySelector('#rk-save-import-input'),first:!!document.querySelector('#pause .slot.empty button'),inline:document.documentElement.scrollWidth-innerWidth,match:document.querySelector('#rk-save-transport').textContent}))()");
 assert.ok(form.input&&form.first&&form.inline<=2,JSON.stringify(form));
 // QuotaExceededError in local-only storage must NOT be swallowed.
 await ev("(()=>{window.__rkSaveSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('fiefdom.save.'))throw new DOMException('quota blocked','QuotaExceededError');return window.__rkSaveSet.call(this,k,v);};document.querySelector('#pause .slot.empty button').click();})()");
 const quota=await ev("(()=>({message:document.querySelector('#pause .msg').textContent,bad:document.querySelector('#pause .msg').classList.contains('bad'),phantom:!!localStorage.getItem('fiefdom.save.1')}))()");
 assert.ok(quota.bad&&quota.message.includes('quota blocked')&&!quota.phantom,JSON.stringify(quota));
 await ev("Storage.prototype.setItem=window.__rkSaveSet;document.querySelector('#pause .slot.empty button').click()");
 const saved=await ev("(()=>{const x=localStorage.getItem('fiefdom.save.1');const d=JSON.parse(x);return {exists:!!x,version:d.version,map:d.map.name,buildings:d.buildings.length,factions:d.factions.length,hasExport:!!document.querySelector('#pause .rk-save-export'),buttons:document.querySelectorAll('#pause .slot button').length};})()");
 assert.ok(saved.exists&&saved.version===4&&saved.buildings>0&&saved.hasExport,JSON.stringify(saved));
 await ev("document.querySelector('#pause .rk-save-export').click()");
 assert.ok((await ev("document.querySelector('#pause .msg').textContent")).includes('백업 파일'), 'Export feedback missing');
 // Import same data as a COPY; never overwrites slot 1.
 await ev("(()=>{const raw=localStorage.getItem('fiefdom.save.1');const f=new File([raw],'rani-backup.json',{type:'application/json'}),dt=new DataTransfer();dt.items.add(f);const input=document.querySelector('#rk-save-import-input');Object.defineProperty(input,'files',{configurable:true,value:dt.files});input.dispatchEvent(new Event('change',{bubbles:true}));})()");
 await until("!!localStorage.getItem('fiefdom.save.2')");
 const copy=await ev("(()=>{const a=localStorage.getItem('fiefdom.save.1'),b=localStorage.getItem('fiefdom.save.2');return {identical:a===b,slot1:JSON.parse(a).map.name,slot2:JSON.parse(b).map.name,message:document.querySelector('#pause .msg').textContent};})()");
 assert.ok(copy.identical&&copy.message.includes('2번 새 슬롯'),JSON.stringify(copy));
 // Corrupt file is rejected without touching the user's two valid saves.
 await ev("(()=>{const f=new File(['{bad-json'],'corrupted.json',{type:'application/json'}),dt=new DataTransfer();dt.items.add(f);const i=document.querySelector('#rk-save-import-input');Object.defineProperty(i,'files',{configurable:true,value:dt.files});i.dispatchEvent(new Event('change',{bubbles:true}));})()");
 await until("document.querySelector('#pause .msg').textContent.includes('가져오기 실패')");
 const corrupt=await ev("(()=>({bad:document.querySelector('#pause .msg').classList.contains('bad'),slot3:!!localStorage.getItem('fiefdom.save.3'),safe1:!!localStorage.getItem('fiefdom.save.1'),safe2:!!localStorage.getItem('fiefdom.save.2')}))()");
 assert.ok(corrupt.bad&&!corrupt.slot3&&corrupt.safe1&&corrupt.safe2,JSON.stringify(corrupt));
 // The phone pause overlay must not trigger sideways browser scrolling.
 await cd.send('Emulation.setDeviceMetricsOverride',{width:320,height:568,mobile:true,deviceScaleFactor:2},s);
 await sleep(250);
 const narrow=await ev("(()=>{const p=document.querySelector('#pause .box'),r=p.getBoundingClientRect();return {x:r.x,right:r.right,w:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...document.querySelectorAll('#pause .slot button')].every(b=>b.getBoundingClientRect().width>15)};})()");
 assert.ok(narrow.x>=0&&narrow.right<=narrow.w+2&&narrow.overflow<=2&&narrow.buttons,JSON.stringify(narrow));
 console.log('PASS v5.18 verified browser saves, quota rejection, backup JSON, new-slot import, corruption guard, 320px mobile',{form,quota,saved,copy,corrupt,narrow});
}finally{
 await cd.send('Target.closeTarget',{targetId});
}
process.exit(0);
