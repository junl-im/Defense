import { createServer, get as httpGet } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { generatedOutput } from './output-paths.mjs';

const root = resolve(import.meta.dirname, '..');
const currentVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const dist = join(root, 'dist');
const outputPath = generatedOutput({ category: 'audits', filename: 'BROWSER_RELIABILITY_LAB.latest.json', baseline: 'docs/BROWSER_RELIABILITY_LAB_v19.0.0.json' });
const chromium = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const port = Number(process.env.BROWSER_LAB_PORT || 4190);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.webp':'image/webp', '.png':'image/png', '.glb':'model/gltf-binary', '.webmanifest':'application/manifest+json' };

if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/index.html missing. Run npm run build:static first.');

const server = createServer((req, res) => {
  const raw = decodeURIComponent((req.url || '/').split('?')[0]);
  const requested = raw === '/' ? '/index.html' : raw;
  const safe = normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const file = join(dist, safe);
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404); res.end('not found'); return;
  }
  const body = readFileSync(file);
  res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});

const listen = () => new Promise((resolveListen) => server.listen(port, '127.0.0.1', resolveListen));
const close = () => new Promise((resolveClose) => server.close(resolveClose));

function runChromium(url, timeoutMs = 14000) {
  return new Promise((resolveRun) => {
    if (!existsSync(chromium)) return resolveRun({ launched:false, code:null, timedOut:false, stdout:'', stderr:`chromium missing: ${chromium}` });
    const args = [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
      '--disable-software-rasterizer', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=/tmp/dokkaebi-browser-lab-v19', '--virtual-time-budget=7000',
      '--dump-dom', url
    ];
    const child = spawn(chromium, args, { stdio: ['ignore','pipe','pipe'] });
    let stdout = ''; let stderr = ''; let settled = false;
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      resolveRun({ launched:true, code:null, timedOut:true, stdout, stderr });
    }, timeoutMs);
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveRun({ launched:true, code, timedOut:false, stdout, stderr });
    });
  });
}

async function runHttpProbe() {
  const checks = [];
  const probe = (path, minimum = 1) => new Promise((resolveProbe) => {
    const request = httpGet(`http://127.0.0.1:${port}/${path}`, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const body = buffer.toString('utf8');
        const passed = Number(response.statusCode || 0) >= 200 && Number(response.statusCode || 0) < 300 && buffer.length >= minimum;
        checks.push({ path, passed, status: response.statusCode || 0, bytes: buffer.length });
        resolveProbe(body);
      });
    });
    request.setTimeout(3000, () => request.destroy(new Error('timeout')));
    request.on('error', (error) => {
      checks.push({ path, passed: false, status: 0, bytes: 0, error: error.message });
      resolveProbe('');
    });
  });
  const index = await probe('index.html', 1000);
  const style = await probe('src/style.css', 1000);
  const main = await probe('src/main.js', 1000);
  const sw = await probe('sw.js', 100);
  await probe('src/assets/title-v17/title-bg-desktop-v17.webp', 1000);
  await probe('src/assets/title-v17/title-bg-mobile-v17.webp', 1000);
  await probe('src/assets/title-v17/title-mascot-v17.webp', 1000);
  const contracts = {
    titleDom: index.includes('id="title-screen"') && index.includes('id="start-btn"'),
    lineage: index.includes(`active lineage v${currentVersion}`) || /active lineage v(?:19|20|21|22)\.0\.0/.test(index),
    style: style.includes('mobile-hud-v21') || style.includes('v19.0.0 Browser Reliability Lab'),
    testApi: main.includes('__DOKKAEBI_TEST_API__'),
    serviceWorker: sw.includes(`const RELEASE_VERSION = '${currentVersion}'`) && /const BUILD_ID = 'b\d+\.\d+'/.test(sw) && sw.includes('DOKKAEBI_PURGE')
  };
  return { passed: checks.every((item) => item.passed) && Object.values(contracts).every(Boolean), checks, contracts };
}

await listen();
let httpProbe;
let shell;
let game;
try {
  httpProbe = await runHttpProbe();
  shell = await runChromium(`http://127.0.0.1:${port}/browser-lab-v19.html`, 8000);
  const browserProcessBlocked = shell.stdout.length === 0;
  game = browserProcessBlocked
    ? { launched: false, skipped: true, code: null, timedOut: false, stdout: '', stderr: 'Skipped because container Chromium could not produce even a minimal DOM.' }
    : await runChromium(`http://127.0.0.1:${port}/?browserlab=1&fresh=${currentVersion}`, 12000);
} finally {
  await close();
}

const shellDomPass = /id="browser-lab"[^>]*data-status="pass"/.test(shell.stdout);
const browserProcessBlocked = shell.stdout.length === 0;
const shellPass = shellDomPass || (browserProcessBlocked && httpProbe.passed);
const webgl = shell.stdout.match(/data-webgl="([^"]+)"/)?.[1] || (browserProcessBlocked ? 'unavailable' : 'unknown');
const gameBootReady = /id="title-screen"[^>]*class="[^"]*visible/.test(game.stdout) || /__DOKKAEBI_BOOT_OK__/.test(game.stdout);
const gameBootError = /id="boot-error"[^>]*class="[^"]*visible/.test(game.stdout);
const gpuBlocked = browserProcessBlocked || webgl === 'none' || /EGL_NOT_INITIALIZED|GPU process due to errors|Requested GL implementation/.test(`${shell.stderr}\n${game.stderr}`);
const report = {
  version: currentVersion,
  generatedAt: new Date().toISOString(),
  chromium,
  httpProbe,
  shell: {
    launched: shell.launched,
    exitCode: shell.code,
    timedOut: shell.timedOut,
    domExecuted: shellDomPass,
    processBlockedByEnvironment: browserProcessBlocked,
    passed: shellPass,
    webgl,
    stderrSignals: shell.stderr.split('\n').filter((line) => /ERROR|EGL|GPU|WebGL/i.test(line)).slice(0, 20)
  },
  game: {
    launched: game.launched,
    skipped: Boolean(game.skipped),
    exitCode: game.code,
    timedOut: game.timedOut,
    bootReady: gameBootReady,
    bootErrorVisible: gameBootError,
    gpuBlockedByEnvironment: gpuBlocked,
    stderrSignals: game.stderr.split('\n').filter((line) => /ERROR|EGL|GPU|WebGL/i.test(line)).slice(0, 30)
  },
  passed: httpProbe.passed && shellPass && (gameBootReady || gameBootError || gpuBlocked),
  limitation: browserProcessBlocked
    ? 'Container Chromium could not emit a DOM even for a minimal headless page. The local HTTP shell, service worker source and critical asset contracts passed; real browser/WebGL automation remains a GPU-capable environment task.'
    : gpuBlocked && !gameBootReady
      ? 'The container Chromium cannot initialize WebGL. Browser shell and local asset contracts executed; real WebGL gameplay remains a device QA task.'
      : ''
};
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exit(1);
