import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const arrayMatch = sw.match(/const INSTALL_SHELL_ASSETS = Object\.freeze\(\[([\s\S]*?)\n\]\);/);
assert.ok(arrayMatch, 'INSTALL_SHELL_ASSETS missing');
const installAssets = [...arrayMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const required = [
  './',
  './index.html',
  './manifest.webmanifest',
  './version.json',
  './release-identity.generated.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './static-bootstrap.js',
  './assets/game.js',
  './assets/game.css'
];
assert.deepEqual(installAssets, required, 'Vite install shell must contain only the bounded deployable core');
assert.equal(new Set(installAssets).size, installAssets.length, 'install shell contains duplicate paths');
assert.equal(installAssets.some((asset) => asset.startsWith('./src/')), false, 'install shell must not fetch non-deployed source modules');
assert.ok(sw.includes('...GENERATED_MODULE_SHELL_V135,'), 'historical source-module integrity ledger missing');
const precacheStart = sw.indexOf('async function cacheInstallAsset');
const precacheEnd = sw.indexOf('async function removeOldCaches');
assert.ok(precacheStart >= 0 && precacheEnd > precacheStart, 'bounded precache implementation missing');
const precache = sw.slice(precacheStart, precacheEnd);
for (const marker of [
  'new AbortController()',
  'PRECACHE_REQUEST_TIMEOUT_MS',
  'PRECACHE_CONCURRENCY',
  'new Set(INSTALL_SHELL_ASSETS)',
  'await Promise.all(workers)',
  'throw new Error(`precache failed for'
]) assert.ok(precache.includes(marker), `bounded precache marker missing: ${marker}`);
assert.equal(precache.includes('SHELL_ASSETS.map'), false, 'historical source shell must not be fetched during installation');
assert.ok(sw.includes("data.type === 'DOKKAEBI_GET_INSTALL_STATUS'") && sw.includes("type: 'DOKKAEBI_INSTALL_STATUS'"), 'service-worker install diagnostics channel missing');

async function simulateWorker({ hangPath = '' } = {}) {
  const listeners = new Map();
  let activeFetches = 0;
  let maxActiveFetches = 0;
  const fetched = [];
  const cached = [];
  const source = sw.replace('const PRECACHE_REQUEST_TIMEOUT_MS = 12000;', 'const PRECACHE_REQUEST_TIMEOUT_MS = 60;');
  const self = {
    __DOKKAEBI_RELEASE_IDENTITY__: { releaseVersion: '1.0.52', buildId: 'b24.52' },
    location: { origin: 'http://127.0.0.1' },
    clients: { claim: async () => {}, matchAll: async () => [] },
    skipWaiting: async () => {},
    addEventListener(type, listener) { listeners.set(type, listener); }
  };
  class RequestMock {
    constructor(url, init = {}) { this.url = String(url); this.signal = init.signal || null; this.method = 'GET'; }
  }
  class ResponseMock {
    constructor(body = '', { status = 200 } = {}) { this.body = body; this.status = status; this.ok = status >= 200 && status < 300; }
    clone() { return new ResponseMock(this.body, { status: this.status }); }
    static error() { return new ResponseMock('', { status: 500 }); }
  }
  const fetchMock = (request) => {
    const assetPath = typeof request === 'string' ? request : request.url;
    fetched.push(assetPath);
    activeFetches += 1;
    maxActiveFetches = Math.max(maxActiveFetches, activeFetches);
    if (assetPath === hangPath) {
      return new Promise((resolve, reject) => {
        request.signal?.addEventListener('abort', () => {
          activeFetches -= 1;
          reject(new Error(`aborted ${assetPath}`));
        }, { once: true });
      });
    }
    return new Promise((resolve) => setTimeout(() => {
      activeFetches -= 1;
      resolve(new ResponseMock(`asset:${assetPath}`, { status: 200 }));
    }, 4));
  };
  const context = vm.createContext({
    AbortController,
    Error,
    Map,
    MessageChannel,
    Object,
    Promise,
    Request: RequestMock,
    Response: ResponseMock,
    Set,
    URL,
    console,
    fetch: fetchMock,
    importScripts() {},
    setTimeout,
    clearTimeout,
    self,
    caches: {
      async open() { return { async put(assetPath) { cached.push(String(assetPath)); } }; },
      async keys() { return []; },
      async delete() { return true; },
      async match() { return null; }
    }
  });
  vm.runInContext(source, context, { filename: 'public/sw.js' });
  let installPromise;
  listeners.get('install')({ waitUntil(promise) { installPromise = promise; } });
  let installError = null;
  try { await installPromise; } catch (error) { installError = error; }
  let status = null;
  listeners.get('message')({
    data: { type: 'DOKKAEBI_GET_INSTALL_STATUS' },
    ports: [{ postMessage(value) { status = value; } }]
  });
  return { fetched, cached, maxActiveFetches, installError, status };
}

const success = await simulateWorker();
assert.equal(success.installError, null, success.installError?.message);
assert.deepEqual(success.fetched.sort(), [...required].sort(), 'install fetched paths differ from deployable shell');
assert.deepEqual(success.cached.sort(), [...required].sort(), 'install cached paths differ from deployable shell');
assert.ok(success.maxActiveFetches <= 4, `precache concurrency exceeded: ${success.maxActiveFetches}`);
assert.equal(success.status?.phase, 'complete');
assert.equal(success.status?.completed, required.length);
assert.equal(success.status?.failed, 0);

const timeout = await simulateWorker({ hangPath: './assets/game.css' });
assert.ok(timeout.installError, 'hung install request must fail instead of waiting forever');
assert.match(timeout.installError.message, /precache failed for 1\/11 install assets/);
assert.equal(timeout.status?.phase, 'failed');
assert.equal(timeout.status?.failed, 1);
assert.equal(timeout.status?.failures?.[0]?.path, './assets/game.css');
assert.match(timeout.status?.failures?.[0]?.error || '', /aborted/);

console.log(`PASS v1.0.52 bounded service-worker install shell (${installAssets.length} deployable assets; source modules excluded; timeout simulated)`);
