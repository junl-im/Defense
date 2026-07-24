const RELEASE_VERSION = '1.0.13';
const BUILD_ID = 'b24.13';
// const VERSION = '23.1.0'; historical lineage marker.
const CACHE_PREFIX = 'dokkaebi-shell-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const SHELL_ASSETS = [
  './', './index.html', './manifest.webmanifest', './version.json', './browser-lab-v19.html',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './static-bootstrap.js', './src/bootstrap.js', './src/style.css', './src/main.js',
  './src/ip-knowledge-megabase-v4.js', './ip-mega-library-v4.html',
  './assets/ip-mega-v4/data/ip-mega-index-v4.json',
  './assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  './assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
  './assets/ip-mega-v4/reference/art-production-board-v4.webp',
  './src/runtime/first-presentation-director-v107.js',
  './src/runtime/combat-visual-director-v112.js',
  './src/runtime/combat-art-runtime-policy-v113.js',
  './src/runtime/cross-platform-shell-v112.js',
  './p0-directional-library-v112.html',
  './assets/visual-v112/directional/p0-directional-manifest-v112.json',
  './assets/visual-v112/directional/hero-warrior-atlas-v112.webp',
  './assets/visual-v112/directional/hero-warrior-atlas-medium-v112.webp',
  './assets/visual-v112/directional/hero-warrior-atlas-low-v112.webp',
  './assets/visual-v112/directional/guardian-ember-atlas-v112.webp',
  './assets/visual-v112/directional/guardian-ember-atlas-medium-v112.webp',
  './assets/visual-v112/directional/guardian-ember-atlas-low-v112.webp',
  './assets/visual-v112/directional/monster-imp-atlas-v112.webp',
  './assets/visual-v112/directional/monster-imp-atlas-medium-v112.webp',
  './assets/visual-v112/directional/monster-imp-atlas-low-v112.webp',
  './assets/visual-v112/directional/boss-tiger-atlas-v112.webp',
  './assets/visual-v112/directional/boss-tiger-atlas-medium-v112.webp',
  './assets/visual-v112/directional/boss-tiger-atlas-low-v112.webp',
  './assets/ip-v10/presentation/objects/object_dokkaebi_shrine.png',
  './src/assets/title-v112/title-bg-desktop-v112.webp',
  './src/assets/title-v112/title-bg-desktop-lite-v112.webp',
  './src/assets/title-v112/title-bg-mobile-v112.webp',
  './src/assets/title-v112/title-bg-mobile-lite-v112.webp',
  './src/assets/title-v112/title-mascot-v112.webp',
  './src/assets/title-v112/title-mascot-lite-v112.webp',
  './src/assets/title-v112/visual-polish-manifest-v112.json'
];
const isLocal = (request) => new URL(request.url).origin === self.location.origin;
const isTitleAsset = (pathname) => pathname.includes('/src/assets/title-v112/');
const isMutableCode = (pathname) => /\.(?:js|css|json)$/i.test(pathname) || pathname.endsWith('/static-bootstrap.js');

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(SHELL_ASSETS.map(async (path) => {
    const response = await fetch(new Request(path, { cache: 'reload' }));
    if (response.ok) await cache.put(path, response.clone());
  }));
}
async function removeOldCaches({ includeCurrent = false } = {}) {
  const keys = await caches.keys();
  const targets = keys.filter((key) => key.startsWith(CACHE_PREFIX) && (includeCurrent || key !== CACHE_NAME));
  await Promise.all(targets.map((key) => caches.delete(key)));
  return targets;
}
self.addEventListener('install', (event) => event.waitUntil((async () => { await precache(); await self.skipWaiting(); })()));
self.addEventListener('activate', (event) => event.waitUntil((async () => { await removeOldCaches(); await self.clients.claim(); })()));
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'DOKKAEBI_GET_VERSION') {
    event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_VERSION', version: RELEASE_VERSION, buildId: BUILD_ID, cacheName: CACHE_NAME });
    return;
  }
  if (data.type === 'DOKKAEBI_PURGE') {
    event.waitUntil((async () => {
      const removed = await removeOldCaches({ includeCurrent: true });
      await precache();
      event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_PURGED', version: RELEASE_VERSION, buildId: BUILD_ID, removed });
    })());
  }
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isLocal(request)) return;
  const url = new URL(request.url);
  const networkFirst = request.mode === 'navigate' || isMutableCode(url.pathname) || isTitleAsset(url.pathname);
  if (networkFirst) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (request.mode === 'navigate' ? await caches.match('./index.html') : null) || Response.error();
      }
    })());
    return;
  }
  const immutable = /\.(?:png|webp|jpg|jpeg|glb|woff2?)$/i.test(url.pathname);
  if (immutable) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    })());
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-cache' });
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
