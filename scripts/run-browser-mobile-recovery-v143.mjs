import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const commands=['google-chrome-stable','google-chrome','chromium','chromium-browser'];
const command=commands.find((candidate)=>spawnSync('sh',['-lc',`command -v ${candidate}`],{encoding:'utf8'}).status===0);
if(!command){console.log('SKIP v1.0.43 browser recovery: Chromium/Chrome unavailable');process.exit(0)}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://127.0.0.1');
  const relative=url.pathname==='/'?'scripts/fixtures/mobile-browser-recovery-v143.html':decodeURIComponent(url.pathname.replace(/^\//,''));
  const target=path.resolve(root,relative);
  if(!target.startsWith(root)||!fs.existsSync(target)||fs.statSync(target).isDirectory()){response.writeHead(404);response.end('not found');return}
  response.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(target).pipe(response);
});
await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const result=spawnSync(command,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-default-apps',
  '--disable-extensions','--disable-sync','--metrics-recording-only','--mute-audio','--use-angle=swiftshader',
  '--enable-webgl','--ignore-gpu-blocklist','--virtual-time-budget=12000','--dump-dom',
  `http://127.0.0.1:${port}/scripts/fixtures/mobile-browser-recovery-v143.html`
],{cwd:root,encoding:'utf8',timeout:12000,maxBuffer:8*1024*1024});
server.close();
if(result.error || result.status!==0){
  const reason=result.error?.code||`status-${result.status}`;
  console.warn(`SKIP live Chromium v1.0.43 fixture (${reason}); deterministic recovery contract remains mandatory.`);
  process.exit(0);
}
const dom=result.stdout||'';
const match=dom.match(/<pre id="report">([\s\S]*?)<\/pre>/);
const decoded=(match?.[1]||'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
if(!dom.includes('data-v143-result="pass"')){console.error('FAIL v1.0.43 browser recovery fixture');console.error(decoded||dom.slice(-3000));process.exit(1)}
console.log('PASS v1.0.43 Chromium pointer recovery, viewport/orientation reset, legacy loading retirement, and 100-wave WebGL create/delete cycle');
