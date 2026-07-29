import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { buildOfflineReconnectSuiteV147 } from './offline-reconnect-model-v147.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const requireBrowser = process.env.REQUIRE_BROWSER_V147 === '1';
const reportPath = path.join(root, 'logs/qa/v147/offline-reconnect-report.json');
const screenshotPath = path.join(root, 'logs/qa/v147/offline-reconnect-failure.png');
const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
const command = commands.find((candidate) => spawnSync(candidate, ['--version'], { encoding: 'utf8' }).status === 0);
const positiveInt = (value, fallback) => { const parsed = Number.parseInt(value || '', 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; };
const bootTimeoutMs = positiveInt(process.env.V147_BROWSER_BOOT_TIMEOUT_MS, 70000);
const cdpTimeoutMs = positiveInt(process.env.V147_BROWSER_CDP_TIMEOUT_MS, 120000);
const failOrSkip = (message) => {
  if (requireBrowser) throw new Error(message);
  console.log(`SKIP v1.0.47 offline/reconnect browser assurance: ${message}`);
  process.exit(0);
};
if (!fs.existsSync(path.join(dist, 'index.html'))) failOrSkip('dist/index.html missing');
if (!fs.existsSync(path.join(dist, 'assets/game.js')) || !fs.existsSync(path.join(dist, 'assets/game.css')) || !fs.existsSync(path.join(dist, 'sw.js'))) failOrSkip('complete Vite dist missing');
if (!command) failOrSkip('Chromium/Chrome unavailable');

const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.wasm':'application/wasm' };
function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidates = decoded ? [decoded, decoded.includes('/') ? decoded.split('/').slice(1).join('/') : ''] : ['index.html'];
  for (const name of candidates.filter(Boolean)) {
    const target = path.resolve(dist, name);
    if ((target === path.join(dist, 'index.html') || target.startsWith(`${dist}${path.sep}`)) && fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  }
  return null;
}
const serverRequests = [];
const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  const target = resolveRequest(url.pathname || '/');
  if (serverRequests.length < 600) serverRequests.push({ pathname: url.pathname, status: target ? 200 : 404 });
  if (!target) { response.writeHead(404, {'content-type':'text/plain','cache-control':'no-store'}); response.end('not found'); return; }
  response.writeHead(200, {'content-type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream','cache-control':'no-store','service-worker-allowed':'/'});
  fs.createReadStream(target).pipe(response);
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const port = server.address().port;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForFile(file, timeoutMs = 10000) { const deadline=Date.now()+timeoutMs; while(Date.now()<deadline){ if(fs.existsSync(file)&&fs.statSync(file).size>0)return; await sleep(50); } throw new Error(`Timed out waiting for ${file}`); }

class CdpClient {
  constructor(socket) { this.socket=socket; this.serial=0; this.pending=new Map(); this.waiters=new Map(); this.listeners=new Map(); socket.addEventListener('message',(event)=>{ const message=JSON.parse(typeof event.data==='string'?event.data:Buffer.from(event.data).toString('utf8')); if(message.id&&this.pending.has(message.id)){const item=this.pending.get(message.id);clearTimeout(item.timer);this.pending.delete(message.id);message.error?item.reject(new Error(`${message.error.message} (${message.error.code})`)):item.resolve(message.result||{});return;} if(message.method&&this.waiters.has(message.method)){const queue=this.waiters.get(message.method);this.waiters.delete(message.method);queue.forEach((fn)=>fn(message.params||{}));} if(message.method&&this.listeners.has(message.method))this.listeners.get(message.method).forEach((fn)=>fn(message.params||{})); }); }
  static async connect(url){const socket=new WebSocket(url);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('CDP websocket timeout')),10000);socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP websocket error'));},{once:true});});return new CdpClient(socket);}
  send(method,params={},timeoutMs=cdpTimeoutMs){const id=++this.serial;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
  waitFor(method,timeoutMs=30000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`CDP event ${method} timeout`)),timeoutMs);const queue=this.waiters.get(method)||[];queue.push((params)=>{clearTimeout(timer);resolve(params);});this.waiters.set(method,queue);});}
  on(method,fn){const list=this.listeners.get(method)||[];list.push(fn);this.listeners.set(method,list);}
  close(){this.socket.close();}
}
async function evaluate(client, expression, timeoutMs = cdpTimeoutMs) { const result=await client.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true},timeoutMs); if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Runtime.evaluate failed'); return result.result?.value; }
async function waitBoot(client) { return evaluate(client, `(async()=>{const deadline=Date.now()+${bootTimeoutMs};while((!window.__DOKKAEBI_BOOT_OK__||!window.__DOKKAEBI_TEST_API__)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));return {ok:Boolean(window.__DOKKAEBI_BOOT_OK__),hasApi:Boolean(window.__DOKKAEBI_TEST_API__),controlled:Boolean(navigator.serviceWorker?.controller),error:document.querySelector('#boot-error')?.textContent||''};})()`, bootTimeoutMs+5000); }
async function navigateAndLoad(client, url) { const loaded=client.waitFor('Page.loadEventFired',45000); const nav=await client.send('Page.navigate',{url}); if(nav.errorText) throw new Error(`Navigation failed: ${nav.errorText}`); await loaded; return nav; }
async function reloadAndLoad(client) { const loaded=client.waitFor('Page.loadEventFired',45000); await client.send('Page.reload',{ignoreCache:false}); await loaded; }

fs.rmSync(path.dirname(reportPath), { recursive:true, force:true }); fs.mkdirSync(path.dirname(reportPath),{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'dokkaebi-v147-offline-')); const stderrPath=path.join(profile,'chromium.stderr.log'); const stderr=fs.openSync(stderrPath,'w');
const flags=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-default-apps','--disable-extensions','--disable-sync','--metrics-recording-only','--mute-audio','--use-gl=angle','--use-angle=swiftshader-webgl','--enable-unsafe-swiftshader','--remote-debugging-port=0'];
const child=spawn(command,[...flags,`--user-data-dir=${profile}`,'--window-size=430,932','about:blank'],{cwd:root,stdio:['ignore','ignore',stderr]});
const diagnostics={console:[],exceptions:[],failedRequests:[],boot:[]}; let client; let suite=null; let error=''; let scenarioData={};
try {
  const active=path.join(profile,'DevToolsActivePort'); await waitForFile(active); const [debugPort]=fs.readFileSync(active,'utf8').trim().split(/\r?\n/); const targets=await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json(); const target=targets.find((item)=>item.type==='page'); if(!target?.webSocketDebuggerUrl) throw new Error('No Chromium page target');
  client=await CdpClient.connect(target.webSocketDebuggerUrl); client.on('Runtime.consoleAPICalled',(event)=>{if(diagnostics.console.length<160)diagnostics.console.push({type:event.type,values:(event.args||[]).map((arg)=>arg.value??arg.description??arg.type)});}); client.on('Runtime.exceptionThrown',(event)=>{if(diagnostics.exceptions.length<80)diagnostics.exceptions.push(event.exceptionDetails?.exception?.description||event.exceptionDetails?.text||'unknown');}); client.on('Network.loadingFailed',(event)=>{if(diagnostics.failedRequests.length<160)diagnostics.failedRequests.push({errorText:event.errorText,canceled:event.canceled===true,blockedReason:event.blockedReason||''});});
  await client.send('Page.enable'); await client.send('Runtime.enable'); await client.send('Network.enable'); await client.send('Emulation.setDeviceMetricsOverride',{width:430,height:932,deviceScaleFactor:2,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}}); await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const url=`http://127.0.0.1:${port}/?qa=v147&offlineReconnect=1`;
  await navigateAndLoad(client,url); let boot=await waitBoot(client); diagnostics.boot.push({phase:'warm',...boot}); if(!boot.ok) throw new Error(`warm boot failed: ${boot.error}`);
  const warm=await evaluate(client, `(async()=>{await navigator.serviceWorker.ready;return {controlled:Boolean(navigator.serviceWorker.controller)};})()`);
  if(!warm?.controlled){await reloadAndLoad(client);boot=await waitBoot(client);diagnostics.boot.push({phase:'controlled',...boot});if(!boot.ok||!boot.controlled)throw new Error(`service-worker control boot failed: ${boot.error||'controller missing'}`);}
  const saveBefore=await evaluate(client, `Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('dokkaebi-')).sort().map(k=>[k,localStorage.getItem(k)]))`);
  await client.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0,connectionType:'none'});
  await reloadAndLoad(client); const offlineBoot=await waitBoot(client); diagnostics.boot.push({phase:'offline-launch',...offlineBoot});
  const saveAfter=await evaluate(client, `Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('dokkaebi-')).sort().map(k=>[k,localStorage.getItem(k)]))`);
  await client.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:5*1024*1024,uploadThroughput:2*1024*1024,connectionType:'wifi'}); await sleep(300);
  const before=await evaluate(client, `(async()=>{window.__V147_NET__={online:0,offline:0};addEventListener('online',()=>window.__V147_NET__.online++);addEventListener('offline',()=>window.__V147_NET__.offline++);const api=window.__DOKKAEBI_TEST_API__;await api.prepareLongSessionV145({targetWaves:10,seed:'V147-OFFLINE-RECONNECT'});for(let i=0;i<4;i++)await api.advanceLongSessionWaveV146({observationFrames:8});return api.snapshot();})()`);
  await client.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0,connectionType:'none'}); await sleep(250);
  const offline=await evaluate(client, `(async()=>{const api=window.__DOKKAEBI_TEST_API__;await api.advanceLongSessionWaveV146({observationFrames:8});return api.snapshot();})()`);
  await client.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:3*1024*1024,uploadThroughput:1024*1024,connectionType:'cellular4g'}); await sleep(500);
  const after=await evaluate(client, `(async()=>{const api=window.__DOKKAEBI_TEST_API__;await api.advanceLongSessionWaveV146({observationFrames:8});return {snapshot:api.snapshot(),net:window.__V147_NET__,errors:api.reliabilityReport()?.runtimeErrors||[]};})()`);
  scenarioData={saveBefore,saveAfter,before,offline,after};
  suite=buildOfflineReconnectSuiteV147({offlineLaunch:{shellCached:offlineBoot.ok,serviceWorkerControlled:offlineBoot.controlled,bootMarker:offlineBoot.ok,saveBefore,saveAfter,failedRequests:diagnostics.failedRequests},midWaveReconnect:{before,offline,after:after.snapshot,reconnectEvents:after.net?.online||0,queuedWritesBefore:0,queuedWritesAfter:0,runtimeErrors:diagnostics.exceptions}});
  if(!suite.passed) throw new Error(`offline/reconnect checks failed: ${JSON.stringify(suite.scenarios.map((entry)=>entry.checks))}`);
} catch(caught) { error=caught instanceof Error?caught.message:String(caught); if(client){try{const shot=await client.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false},5000);fs.writeFileSync(screenshotPath,Buffer.from(shot.data,'base64'));}catch{}} }
finally { await new Promise((resolve)=>server.close(resolve)); try{client?.close();}catch{} if(child.exitCode===null)child.kill('SIGKILL'); await sleep(300); try{fs.closeSync(stderr);}catch{} }
const report={id:'DD-OFFLINE-RECONNECT-BROWSER-V147',releaseVersion:'1.0.47',scenario:'offline-launch-and-mid-wave-reconnect',passed:!error&&suite?.passed===true,error,suite,scenarioData,diagnostics,serverRequests,screenshot:fs.existsSync(screenshotPath)?path.relative(root,screenshotPath):'',chromium:command,chromiumVersion:command?spawnSync(command,['--version'],{encoding:'utf8'}).stdout.trim():'',chromiumStderr:fs.existsSync(stderrPath)?fs.readFileSync(stderrPath,'utf8').slice(-12000):''};
fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`); try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
if(!report.passed){console.error(`FAIL v1.0.47 offline/reconnect browser assurance: ${error}`);process.exit(1);} console.log('PASS v1.0.47 offline launch and mid-wave reconnect browser assurance');
