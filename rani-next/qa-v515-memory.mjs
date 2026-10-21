// v5.15 Chromium regression: preserve sprite world geometry while cutting mobile GPU allocation.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const base=process.argv[2]||'http://127.0.0.1:8931/';
const url=base+(base.includes('?')?'&':'?')+'quality=lite';
const port=process.argv[3]||'9341';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(chrome.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const result=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description);
 return result.result.value;
};
const until=async expr=>{for(let i=0;i<360;i++){if(await ev(expr))return;await sleep(250);}throw Error('Timeout '+expr);};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:4},s);
 await c.send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36 Chrome/150.0.0.0 Mobile Safari/537.36',platform:'Android'},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.19');
 const meta=await ev("(async()=>{const src=new URL('assets/sprites/',location.href);const [hi,lo]=await Promise.all(['rani-atlas-v59.json','rani-atlas-mobile-v515.json'].map(name=>fetch(new URL(name,src)).then(r=>{if(!r.ok)throw Error(name+' HTTP '+r.status);return r.json()})));const keys=Object.keys(hi.frames);const unchanged=keys.length===Object.keys(lo.frames).length&&keys.every(k=>{const a=hi.frames[k],b=lo.frames[k];return ['x','y','w','h','ax','ay','scale'].every(f=>Math.abs(a[f]/2-b[f])<1e-6)&&a.page===b.page;});return {high:hi.size,low:lo.size,hiVersion:hi.version,loVersion:lo.version,pages:lo.pages.length,frames:keys.length,unchanged};})()");
 assert.equal(meta.hiVersion,59,JSON.stringify(meta));
 assert.equal(meta.loVersion,515,JSON.stringify(meta));
 assert.ok(meta.frames>5000&&meta.unchanged,JSON.stringify(meta));
 assert.deepEqual(meta.low,meta.high.map(n=>n/2),JSON.stringify(meta));
 assert.equal(meta.pages,4,JSON.stringify(meta));
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game && !!window.__rkNetworkSavings && document.querySelector('#loading').classList.contains('done')");
 const data=await ev("(()=>{const s=window.__rkNetworkSavings,g=window.__game,assets=performance.getEntriesByType('resource').map(x=>new URL(x.name).pathname);return {quality:s.quality,version:s.atlasVersion,textureMB:s.estimatedTextureBytes/1048576,pages:s.texturePages,keep:!!g.state.buildings.find(b=>b.name==='keep'),litePages:assets.filter(a=>/rani-atlas-mobile-v515-\\d+\\.png$/.test(a)).length,fullDownloaded:assets.some(a=>a.includes('rani-atlas-v59-0.png')),totalRequests:assets.length};})()");
 assert.equal(data.quality,'lite',JSON.stringify(data));
 assert.equal(data.version,515,JSON.stringify(data));
 assert.ok(data.keep&&data.pages===4&&data.litePages===4,JSON.stringify(data));
 assert.ok(data.textureMB<70&&data.textureMB>55,JSON.stringify(data));
 assert.equal(data.fullDownloaded,false,'full atlas downloaded in low-memory profile');
 assert.ok(data.totalRequests<280,JSON.stringify(data));
 const art=await ev("(()=>{const g=window.__game,b=g.state.buildings.find(b=>b.name==='keep'),[sx,sy]=g.iso.worldToScreen(b.x+b.def.footprint[0]/2,0,b.z+b.def.footprint[1]/2);return {x:sx,y:sy,footprint:b.def.footprint,mode:document.documentElement.dataset.rkSceneMode};})()");
 assert.ok(Number.isFinite(art.x)&&Number.isFinite(art.y)&&art.footprint.every(n=>n>0),JSON.stringify(art));
 console.log('PASS v5.15 mobile 4x smaller texture; identical metadata geometry; game boot',{meta,data,art});
}finally{
 await c.send('Target.closeTarget',{targetId});
}
process.exit(0);
