import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const requireBrowser = process.env.REQUIRE_BROWSER_V144 === '1';
const outputDir = path.join(root, 'logs/qa/v144/mobile-matrix');
const reportPath = path.join(root, 'logs/qa/v144/mobile-matrix-report.json');
const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
const command = commands.find((candidate) => spawnSync(candidate, ['--version'], { encoding: 'utf8' }).status === 0);
const browserVersion = command ? spawnSync(command, ['--version'], { encoding: 'utf8' }).stdout.trim() : '';

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const bootTimeoutMs = positiveInt(process.env.V144_BROWSER_BOOT_TIMEOUT_MS, 45000);
const cdpTimeoutMs = positiveInt(process.env.V144_BROWSER_CDP_TIMEOUT_MS, 45000);
const scenarioFilter = new Set((process.env.V144_SCENARIOS || '').split(',').map((value) => value.trim()).filter(Boolean));
const extraFlags = (process.env.V144_CHROMIUM_FLAGS || '').split(/\s+/).map((value) => value.trim()).filter(Boolean);

const failOrSkip = (message) => {
  if (requireBrowser) throw new Error(message);
  console.log(`SKIP v1.0.44 built-game mobile matrix: ${message}`);
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
    if (target.startsWith(`${dist}${path.sep}`) || target === path.join(dist, 'index.html')) {
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
    }
  }
  return null;
}

const requestLog = [];
const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  const target = resolveRequest(url.pathname);
  const status = target ? 200 : 404;
  if (requestLog.length < 300) requestLog.push({ method: request.method || 'GET', pathname: url.pathname, status });
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
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  }, timeoutMs);
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime.evaluate failed');
  }
  return result.result?.value;
}

const scenarioCatalog = [
  { id: 'portrait', width: 430, height: 932, scale: 1, handedness: 'right', orientation: { type: 'portraitPrimary', angle: 0 } },
  { id: 'landscape', width: 932, height: 430, scale: 1, handedness: 'right', orientation: { type: 'landscapePrimary', angle: 90 } },
  { id: 'left-handed', width: 430, height: 932, scale: 1, handedness: 'left', orientation: { type: 'portraitPrimary', angle: 0 } },
  { id: 'zoom-150', width: 430, height: 932, scale: 1.5, handedness: 'right', orientation: { type: 'portraitPrimary', angle: 0 } }
];
const scenarios = scenarioFilter.size ? scenarioCatalog.filter((scenario) => scenarioFilter.has(scenario.id)) : scenarioCatalog;
if (!scenarios.length) failOrSkip(`no valid scenarios selected: ${[...scenarioFilter].join(', ')}`);

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
const results = [];
const chromiumFlags = [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-default-apps',
  '--disable-extensions', '--disable-sync', '--metrics-recording-only', '--mute-audio',
  '--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader',
  '--remote-debugging-port=0'
];

try {
  for (const scenario of scenarios) {
    console.log(`RUN v144 mobile matrix ${scenario.id} (${scenario.width}x${scenario.height}, scale ${scenario.scale})`);
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), `dokkaebi-v144-${scenario.id}-`));
    const stderrPath = path.join(profile, 'chromium.stderr.log');
    const stderr = fs.openSync(stderrPath, 'w');
    const diagnostics = { console: [], exceptions: [], failedRequests: [], navigation: null, boot: null };
    const child = spawn(command, [
      ...chromiumFlags, ...extraFlags, `--user-data-dir=${profile}`,
      `--window-size=${scenario.width},${scenario.height}`, 'about:blank'
    ], { cwd: root, stdio: ['ignore', 'ignore', stderr] });

    let client;
    try {
      const activePortPath = path.join(profile, 'DevToolsActivePort');
      await waitForFile(activePortPath);
      const [debugPort] = fs.readFileSync(activePortPath, 'utf8').trim().split(/\r?\n/);
      const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
      const target = targets.find((item) => item.type === 'page');
      if (!target?.webSocketDebuggerUrl) throw new Error('No Chromium page target');
      client = await CdpClient.connect(target.webSocketDebuggerUrl);
      client.on('Runtime.consoleAPICalled', (event) => {
        if (diagnostics.console.length < 80) diagnostics.console.push({ type: event.type, values: (event.args || []).map((arg) => arg.value ?? arg.description ?? arg.type) });
      });
      client.on('Runtime.exceptionThrown', (event) => {
        if (diagnostics.exceptions.length < 40) diagnostics.exceptions.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text || 'unknown exception');
      });
      client.on('Network.loadingFailed', (event) => {
        if (diagnostics.failedRequests.length < 80) diagnostics.failedRequests.push({ requestId: event.requestId, errorText: event.errorText, canceled: event.canceled === true, blockedReason: event.blockedReason || '' });
      });
      await client.send('Page.enable');
      await client.send('Runtime.enable');
      await client.send('Network.enable');
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: scenario.width,
        height: scenario.height,
        deviceScaleFactor: 2,
        mobile: true,
        screenOrientation: scenario.orientation
      });
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      if (scenario.scale !== 1) await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: scenario.scale });
      const loaded = client.waitFor('Page.loadEventFired', Math.min(cdpTimeoutMs, 30000)).catch((error) => {
        diagnostics.loadEventError = error instanceof Error ? error.message : String(error);
        return null;
      });
      diagnostics.navigation = await client.send('Page.navigate', { url: `http://127.0.0.1:${port}/?qa=v144&scenario=${scenario.id}` });
      if (diagnostics.navigation?.errorText) {
        const policyHint = diagnostics.navigation.errorText === 'net::ERR_BLOCKED_BY_ADMINISTRATOR'
          ? ' (browser URL policy blocked localhost; CI runner must allow loopback HTTP)'
          : '';
        throw new Error(`Navigation failed: ${diagnostics.navigation.errorText}${policyHint}`);
      }
      if (!await loaded) throw new Error(diagnostics.loadEventError || 'Page load event unavailable');

      const boot = await evaluate(client, `(async()=>{
        const deadline=Date.now()+${bootTimeoutMs};
        while(!window.__DOKKAEBI_BOOT_OK__&&Date.now()<deadline) await new Promise(r=>setTimeout(r,100));
        return {
          ok:Boolean(window.__DOKKAEBI_BOOT_OK__),
          error:document.querySelector('#boot-error')?.textContent||'',
          hasApi:Boolean(window.__DOKKAEBI_TEST_API__),
          href:location.href,
          readyState:document.readyState,
          title:document.title,
          scripts:[...document.scripts].map(script=>({src:script.src,type:script.type})),
          resources:performance.getEntriesByType('resource').map(entry=>({name:entry.name,initiatorType:entry.initiatorType,duration:Math.round(entry.duration)})).slice(-80),
          bodyText:(document.body?.innerText||'').slice(0,500)
        };
      })()`, bootTimeoutMs + 5000);
      diagnostics.boot = boot;
      if (!boot?.ok || !boot?.hasApi) throw new Error(`Complete game did not boot: ${boot?.error || 'test API unavailable'}`);

      const layout = await evaluate(client, `(async()=>{
        if(${JSON.stringify(scenario.handedness)}==='left') window.__DOKKAEBI_GAME__?.updateControlSetting?.('handedness','left');
        await window.__DOKKAEBI_TEST_API__.startRun();
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        const btn=document.querySelector('#summon-btn');
        const dock=document.querySelector('#action-dock');
        const loading=document.querySelector('#loading');
        const rect=btn?.getBoundingClientRect();
        const dockRect=dock?.getBoundingClientRect();
        const style=btn?getComputedStyle(btn):null;
        const pseudo=btn?getComputedStyle(btn,'::before'):null;
        const vv=window.visualViewport;
        const snapshot=window.__DOKKAEBI_TEST_API__.snapshot();
        return {
          state:snapshot?.state||window.__DOKKAEBI_GAME__?.state||'',
          handedness:document.body.classList.contains('controls-left-handed')?'left':'right',
          viewport:{width:innerWidth,height:innerHeight,scale:vv?.scale||1},
          loadingRetired:Boolean(loading?.hidden)&&!document.documentElement.innerHTML.includes('수호대를 전장으로 부르는 중...'),
          summon:{
            exists:Boolean(btn),
            marker:btn?.dataset.summonVisibilityV143||'',
            rect:rect?{left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height}:null,
            display:style?.display||'',visibility:style?.visibility||'',opacity:Number(style?.opacity||0),touchAction:style?.touchAction||'',
            pseudoContent:pseudo?.content||'',pseudoPointerEvents:pseudo?.pointerEvents||''
          },
          dock:dockRect?{left:dockRect.left,top:dockRect.top,right:dockRect.right,bottom:dockRect.bottom,width:dockRect.width,height:dockRect.height}:null,
          mapTouchReady:document.body.dataset.mapTouchReadyV141||''
        };
      })()`);

      const rect = layout?.summon?.rect;
      const checks = {
        playing: layout?.state === 'playing',
        loadingRetired: layout?.loadingRetired === true,
        summonVisible: Boolean(rect) && layout.summon.display !== 'none' && layout.summon.visibility !== 'hidden' && layout.summon.opacity > 0,
        summonMarker: layout?.summon?.marker === 'enhanced',
        minimumTapTarget: Boolean(rect) && rect.width >= 44 && rect.height >= 44,
        insideViewport: Boolean(rect) && rect.left >= -1 && rect.top >= -1 && rect.right <= layout.viewport.width + 1 && rect.bottom <= layout.viewport.height + 1,
        touchAction: /manipulation/.test(layout?.summon?.touchAction || ''),
        labelPresent: !['', 'none', 'normal', '""'].includes(layout?.summon?.pseudoContent || ''),
        labelNonBlocking: layout?.summon?.pseudoPointerEvents === 'none',
        mapTouchReady: layout?.mapTouchReady === 'true',
        handedness: layout?.handedness === scenario.handedness,
        dockMirrored: scenario.handedness !== 'left' || (layout?.dock && layout.dock.left < layout.viewport.width / 2),
        zoomApplied: scenario.scale === 1 || layout?.viewport?.scale >= 1.45
      };

      const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      const screenshotPath = path.join(outputDir, `${scenario.id}.png`);
      fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
      const passed = Object.values(checks).every(Boolean);
      results.push({ scenario, passed, checks, layout, diagnostics, screenshot: path.relative(root, screenshotPath) });
      console.log(`${passed ? 'PASS' : 'FAIL'} v144 mobile matrix ${scenario.id}`);
    } catch (error) {
      if (client) {
        try {
          const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }, 5000);
          fs.writeFileSync(path.join(outputDir, `${scenario.id}-failure.png`), Buffer.from(screenshot.data, 'base64'));
        } catch {}
      }
      results.push({
        scenario,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        diagnostics,
        chromiumStderr: fs.existsSync(stderrPath) ? fs.readFileSync(stderrPath, 'utf8').slice(-8000) : ''
      });
      console.error(`FAIL v144 mobile matrix ${scenario.id}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      try { client?.close(); } catch {}
      if (child.exitCode === null) child.kill('SIGKILL');
      await new Promise((resolve) => {
        if (child.exitCode !== null) { resolve(); return; }
        const timer = setTimeout(resolve, 2500);
        child.once('exit', () => { clearTimeout(timer); resolve(); });
      });
      try { fs.closeSync(stderr); } catch {}
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try { fs.rmSync(profile, { recursive: true, force: true }); break; }
        catch (error) {
          if (attempt === 4) console.warn(`WARN v144 Chromium profile cleanup: ${error.code || error.message}`);
          else await sleep(100 * (attempt + 1));
        }
      }
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}

const report = {
  id: 'DD-BUILT-GAME-MOBILE-MATRIX-V144',
  releaseVersion: '1.0.44',
  buildTarget: 'complete-vite-dist',
  chromium: command,
  chromiumVersion: browserVersion,
  chromiumFlags: [...chromiumFlags, ...extraFlags],
  timeouts: { bootTimeoutMs, cdpTimeoutMs },
  selectedScenarios: scenarios.map((scenario) => scenario.id),
  serverRequests: requestLog,
  passed: results.every((item) => item.passed),
  results
};
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
else console.log(`PASS v1.0.44 built-game mobile matrix (${results.length} profiles)`);
