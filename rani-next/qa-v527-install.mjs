// v5.30: real manifest/icons/installed shortcuts and native modal layout,
// including GitHub Pages /Defense/ scope and preserved /legacy/.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async e=>{
 const q=await c.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},s);
 if(q.exceptionDetails)throw Error(q.exceptionDetails.exception?.description||JSON.stringify(q.exceptionDetails));
 return q.result.value;
};
const until=async e=>{for(let i=0;i<300;i++){if(await ev(e))return;await sleep(140);}throw Error('Timeout: '+e)};
try{
 for(const [width,height,mobile] of [[1366,768,false],[390,844,true],[320,568,true],[844,390,true]]){
  await c.send('Emulation.setDeviceMetricsOverride',{width,height,mobile,deviceScaleFactor:mobile?2:1},s);
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
  await c.send('Page.navigate',{url},s);
  await until("!!document.querySelector('#rk-start-now')&&!!document.querySelector('#rk-install-shortcut')");
  assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
  const snapshot=await ev("(()=>{const b=document.querySelector('#rk-install-shortcut'),game=document.querySelector('#rk-start-now'),footer=document.querySelector('#menu .ver'),rect=e=>e?.getBoundingClientRect()?.toJSON();return {install:b.textContent,icon:b.querySelector('img')?.src,link:document.querySelector('link[rel=manifest]')?.href,button:rect(b),game:rect(game),footer:rect(footer),width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth-innerWidth}})()");
  assert.ok(snapshot.install.includes('앱 설치')&&snapshot.icon.includes('icon-64.png'),JSON.stringify(snapshot));
  assert.ok(snapshot.button.left>=0&&snapshot.button.right<=width+1&&snapshot.button.top>=0&&snapshot.button.bottom<=height+1,JSON.stringify(snapshot));
  assert.ok(snapshot.button.top>=snapshot.game.bottom-2&&snapshot.button.bottom<=snapshot.footer.top+2,JSON.stringify(snapshot));
  assert.ok(snapshot.scroll<=3,JSON.stringify(snapshot));
  const info=await ev("(async()=>{const manifestUrl=new URL('rani/manifest.webmanifest',new URL('./',document.baseURI));const response=await fetch(manifestUrl.href);const m=await response.json();const urls=m.icons.map(i=>new URL(i.src,manifestUrl));const checks=await Promise.all(urls.map(async u=>{const r=await fetch(u.href);const a=new Uint8Array(await r.arrayBuffer());return {status:r.status,bytes:a.length,png:a[0]===137&&a[1]===80&&a[2]===78&&a[3]===71}}));const sw=await fetch(new URL('rani-sw.js',new URL('./',document.baseURI)));return {manifestStatus:response.status,manifest:m,checks,workerStatus:sw.status,workerText:(await sw.text()).slice(0,200),url:manifestUrl.pathname};})()");
  const basePath=new URL(url).pathname;
  const expected=basePath.startsWith('/Defense/')?'/Defense/':'/';
  assert.equal(info.manifestStatus,200);
  assert.equal(info.manifest.short_name,'라니킹덤');
  assert.equal(info.manifest.start_url,expected);
  assert.equal(info.manifest.scope,expected);
  assert.equal(info.manifest.display,'standalone');
  assert.equal(info.workerStatus,200);
  assert.ok(info.checks.length>=3&&info.checks.every(x=>x.status===200&&x.png&&x.bytes>1000),JSON.stringify(info));
  await ev("document.querySelector('#rk-install-shortcut').click()");
  await until("!!document.querySelector('#rk-install-dialog')&&!document.querySelector('#rk-install-dialog').hidden");
  const modal=await ev("(()=>{const p=document.querySelector('.rk-install-panel'),d=document.querySelector('#rk-install-dialog');const r=p.getBoundingClientRect();return {title:p.querySelector('h2')?.textContent,description:p.querySelector('p')?.textContent,rect:r.toJSON(),visible:!d.hidden}})()");
  assert.ok(modal.visible&&modal.title==='라니킹덤 바로가기'&&modal.description.length>30,JSON.stringify(modal));
  assert.ok(modal.rect.left>=0&&modal.rect.right<=width+1&&modal.rect.top>=0&&modal.rect.bottom<=height+1,JSON.stringify(modal));
  await ev("document.querySelector('#rk-install-dialog button:last-child').click()");
  assert.ok(await ev("document.querySelector('#rk-install-dialog').hidden"));
  console.log('PASS v5.30 Rani dedicated app icon, manifest, modal, safe viewport, PWA worker',width,height,expected);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
