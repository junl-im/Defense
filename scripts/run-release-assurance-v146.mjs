import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const requireBrowser = process.env.REQUIRE_BROWSER_V146 === '1';
const reportPath = path.join(root, 'logs/qa/v146/release-assurance-report.json');
const screenshotPath = path.join(root, 'logs/qa/v146/release-assurance-wave-100.png');
const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
const command = commands.find((candidate) => spawnSync(candidate, ['--version'], { encoding: 'utf8' }).status === 0);
const browserVersion = command ? spawnSync(command, ['--version'], { encoding: 'utf8' }).stdout.trim() : '';
const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const bootTimeoutMs = positiveInt(process.env.V145_BROWSER_BOOT_TIMEOUT_MS, 60000);
const sessionTimeoutMs = positiveInt(process.env.V145_SESSION_TIMEOUT_MS, 180000);
const cdpTimeoutMs = positiveInt(process.env.V145_BROWSER_CDP_TIMEOUT_MS, 190000);
const extraFlags = (process.env.V145_CHROMIUM_FLAGS || '').split(/\s+/).map((value) => value.trim()).filter(Boolean);

const failOrSkip = (message) => {
  if (requireBrowser) throw new Error(message);
  console.log(`SKIP v1.0.46 long-session browser assurance: ${message}`);
  process.exit(0);
};

if (!fs.existsSync(path.join(dist, 'index.html'))) failOrSkip('dist/index.html missing');
if (!fs.existsSync(path.join(dist, 'assets/game.js')) || !fs.existsSync(path.join(dist, 'assets/game.css'))) {
  failOrSkip('complete Vite bundle missing (assets/game.js and assets/game.css required)');
}
if (!command) failOrSkip('Chromium/Chrome unavailable');

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.glb': 'model/gltf-binary',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.wasm': 'application/wasm'
};

function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '');
  const names = decoded ? [decoded] : ['index.html'];
  if (decoded.includes('/')) names.push(decoded.split('/').slice(1).join('/'));
  for (const name of names) {
    const target = path.resolve(dist, name || 'index.html');
    if ((target.startsWith(`${dist}${path.sep}`) || target === path.join(dist, 'index.html')) && fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  }
  return null;
}

const requestLog = [];
const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  const target = resolveRequest(url.pathname);
  if (requestLog.length < 500) requestLog.push({ method: request.method || 'GET', pathname: url.pathname, status: target ? 200 : 404 });
  if (!target) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    response.end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store',
    'cross-origin-opener-policy': 'same-origin'
  });
  fs.createReadStream(target).pipe(response);
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const port = server.address().port;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFile(file, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(file) && fs.statSync(file).size > 0) return;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.serial = 0;
    this.pending = new Map();
    this.waiters = new Map();
    this.listeners = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8'));
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject, timer } = this.pending.get(message.id);
        clearTimeout(timer);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`));
        else resolve(message.result || {});
        return;
      }
      if (message.method && this.waiters.has(message.method)) {
        const queue = this.waiters.get(message.method);
        this.waiters.delete(message.method);
        for (const waiter of queue) waiter(message.params || {});
      }
      if (message.method && this.listeners.has(message.method)) {
        for (const listener of this.listeners.get(message.method)) listener(message.params || {});
      }
    });
  }
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP websocket timeout')), 10000);
      socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP websocket error')); }, { once: true });
    });
    return new CdpClient(socket);
  }
  send(method, params = {}, timeoutMs = cdpTimeoutMs) {
    const id = ++this.serial;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  waitFor(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`CDP event ${method} timed out after ${timeoutMs}ms`)), timeoutMs);
      const queue = this.waiters.get(method) || [];
      queue.push((params) => { clearTimeout(timer); resolve(params); });
      this.waiters.set(method, queue);
    });
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  close() { this.socket.close(); }
}

async function evaluate(client, expression, timeoutMs = cdpTimeoutMs) {
  const result = await client.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, timeoutMs);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime.evaluate failed');
  return result.result?.value;
}

fs.rmSync(path.dirname(reportPath), { recursive: true, force: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dokkaebi-v146-release-assurance-'));
const stderrPath = path.join(profile, 'chromium.stderr.log');
const stderr = fs.openSync(stderrPath, 'w');
const chromiumFlags = [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-default-apps',
  '--disable-extensions', '--disable-sync', '--metrics-recording-only', '--mute-audio', '--js-flags=--expose-gc',
  '--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader', '--remote-debugging-port=0'
];
const child = spawn(command, [...chromiumFlags, ...extraFlags, `--user-data-dir=${profile}`, '--window-size=430,932', 'about:blank'], {
  cwd: root,
  stdio: ['ignore', 'ignore', stderr]
});
const diagnostics = { console: [], exceptions: [], failedRequests: [], navigation: null, boot: null };
let client;
let sessionReport = null;
let fatalError = '';

try {
  const activePortPath = path.join(profile, 'DevToolsActivePort');
  await waitForFile(activePortPath);
  const [debugPort] = fs.readFileSync(activePortPath, 'utf8').trim().split(/\r?\n/);
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const target = targets.find((item) => item.type === 'page');
  if (!target?.webSocketDebuggerUrl) throw new Error('No Chromium page target');
  client = await CdpClient.connect(target.webSocketDebuggerUrl);
  client.on('Runtime.consoleAPICalled', (event) => {
    if (diagnostics.console.length < 160) diagnostics.console.push({ type: event.type, values: (event.args || []).map((arg) => arg.value ?? arg.description ?? arg.type) });
  });
  client.on('Runtime.exceptionThrown', (event) => {
    if (diagnostics.exceptions.length < 80) diagnostics.exceptions.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text || 'unknown exception');
  });
  client.on('Network.loadingFailed', (event) => {
    if (diagnostics.failedRequests.length < 120) diagnostics.failedRequests.push({ errorText: event.errorText, canceled: event.canceled === true, blockedReason: event.blockedReason || '' });
  });
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  });
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const loaded = client.waitFor('Page.loadEventFired', 30000).catch((error) => {
    diagnostics.loadEventError = error instanceof Error ? error.message : String(error);
    return null;
  });
  diagnostics.navigation = await client.send('Page.navigate', { url: `http://127.0.0.1:${port}/?qa=v146&longSession=100&loadPhases=1` });
  if (diagnostics.navigation?.errorText) {
    const hint = diagnostics.navigation.errorText === 'net::ERR_BLOCKED_BY_ADMINISTRATOR'
      ? ' (browser URL policy blocked localhost; CI runner must allow loopback HTTP)'
      : '';
    throw new Error(`Navigation failed: ${diagnostics.navigation.errorText}${hint}`);
  }
  if (!await loaded) throw new Error(diagnostics.loadEventError || 'Page load event unavailable');

  diagnostics.boot = await evaluate(client, `(async()=>{
    const deadline=Date.now()+${bootTimeoutMs};
    while(!window.__DOKKAEBI_BOOT_OK__&&Date.now()<deadline) await new Promise(r=>setTimeout(r,100));
    return {ok:Boolean(window.__DOKKAEBI_BOOT_OK__),hasApi:Boolean(window.__DOKKAEBI_TEST_API__),error:document.querySelector('#boot-error')?.textContent||'',href:location.href,readyState:document.readyState};
  })()`, bootTimeoutMs + 5000);
  if (!diagnostics.boot?.ok || !diagnostics.boot?.hasApi) throw new Error(`Complete game did not boot: ${diagnostics.boot?.error || 'test API unavailable'}`);

  sessionReport = await evaluate(client, `(async()=>{
    const api=window.__DOKKAEBI_TEST_API__;
    const deadline=Date.now()+${sessionTimeoutMs};
    const progress=[];
    await api.prepareLongSessionV145({targetWaves:100,seed:'V146-CI-100-WAVES'});
    for(let wave=1;wave<=100;wave+=1){
      if(Date.now()>deadline) throw new Error('v146 long-session deadline exceeded');
      const snapshot=await api.advanceLongSessionWaveV146({observationFrames:18});
      if(snapshot.currentWave!==wave) throw new Error('v146 wave mismatch '+snapshot.currentWave+' != '+wave);
      if(wave===50){
        const recovery=await api.exerciseWebGLRecoveryV145();
        if(!recovery.supported||!recovery.lost||!recovery.restored) throw new Error('v146 WebGL recovery failed: '+JSON.stringify(recovery));
      }
      if(wave%5===0){
        if(typeof gc==='function') gc();
        const frameWindow=await api.measureFrameWindowV145(10);
        const sample=api.recordLongSessionSampleV145(frameWindow);
        progress.push({wave:sample.wave,frameP95Ms:sample.frameP95Ms,heapUsedMB:sample.heapUsedMB,textures:sample.textures,geometries:sample.geometries,loadPhase:snapshot.loadPhase||null});
      }
    }
    const report=api.finishLongSessionV146();
    return {report,progress,snapshot:api.snapshot(),reliability:api.reliabilityReport()};
  })()`, sessionTimeoutMs + 30000);

  const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }, 10000);
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  if (!sessionReport?.report?.passed) throw new Error(`v146 long-session checks failed: ${JSON.stringify({checks:sessionReport?.report?.checks||{},loadChecks:sessionReport?.report?.loadChecks||{},digest:sessionReport?.report?.failureDigest||{}})}`);
  if (!sessionReport?.report?.failureDigest) throw new Error('v146 failure digest missing');
  if ((sessionReport?.report?.loadPhases||[]).length !== 5) throw new Error('v146 deterministic load phases missing');
  if (diagnostics.exceptions.length) throw new Error(`v146 runtime exceptions captured: ${diagnostics.exceptions.length}`);
  const meaningfulFailures = diagnostics.failedRequests.filter((item) => !item.canceled && !/ERR_ABORTED/.test(item.errorText || ''));
  if (meaningfulFailures.length) throw new Error(`v146 network failures captured: ${meaningfulFailures.length}`);
} catch (error) {
  fatalError = error instanceof Error ? error.message : String(error);
  if (client) {
    try {
      const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }, 5000);
      fs.writeFileSync(path.join(path.dirname(reportPath), 'long-session-failure.png'), Buffer.from(screenshot.data, 'base64'));
    } catch {}
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
  try { client?.close(); } catch {}
  if (child.exitCode === null) child.kill('SIGKILL');
  await new Promise((resolve) => {
    if (child.exitCode !== null) { resolve(); return; }
    const timer = setTimeout(resolve, 2500);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  });
  try { fs.closeSync(stderr); } catch {}
}

const report = {
  id: 'DD-RELEASE-ASSURANCE-BROWSER-V146',
  releaseVersion: '1.0.46',
  buildTarget: 'complete-vite-dist',
  targetWaves: 100,
  seed: 'V146-CI-100-WAVES',
  chromium: command,
  chromiumVersion: browserVersion,
  chromiumFlags: [...chromiumFlags, ...extraFlags],
  timeouts: { bootTimeoutMs, sessionTimeoutMs, cdpTimeoutMs },
  passed: !fatalError && sessionReport?.report?.passed === true,
  error: fatalError,
  session: sessionReport,
  diagnostics,
  serverRequests: requestLog,
  screenshot: fs.existsSync(screenshotPath) ? path.relative(root, screenshotPath) : '',
  chromiumStderr: fs.existsSync(stderrPath) ? fs.readFileSync(stderrPath, 'utf8').slice(-12000) : ''
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
for (let attempt = 0; attempt < 6; attempt += 1) {
  try { fs.rmSync(profile, { recursive: true, force: true }); break; }
  catch (error) {
    if (attempt === 5) console.warn(`WARN v146 Chromium profile cleanup: ${error.code || error.message}`);
    else await sleep(120 * (attempt + 1));
  }
}
if (!report.passed) {
  console.error(`FAIL v1.0.46 100-wave long-session assurance: ${fatalError || 'unknown failure'}`);
  process.exit(1);
}
console.log('PASS v1.0.46 100-wave long-session assurance with frame, heap, renderer, and WebGL recovery evidence');
