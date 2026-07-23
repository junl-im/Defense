const VERSION = '21.0.0';
const CACHE_PREFIX = 'dokkaebi-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v${VERSION}`;
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './browser-lab-v19.html',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './src/style.css',
  './src/main.js',
  './src/assets/title-v17/title-bg-desktop-v17.webp',
  './src/assets/title-v17/title-bg-mobile-v17.webp',
  './src/assets/title-v17/title-mascot-v17.webp'
];

const isLocal = (request) => new URL(request.url).origin === self.location.origin;

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

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await precache();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await removeOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'DOKKAEBI_GET_VERSION') {
    event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_VERSION', version: VERSION, cacheName: CACHE_NAME });
    return;
  }
  if (data.type === 'DOKKAEBI_PURGE') {
    event.waitUntil((async () => {
      const removed = await removeOldCaches({ includeCurrent: true });
      await precache();
      event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_PURGED', version: VERSION, removed });
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isLocal(request)) return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        if (response.ok) await cache.put('./index.html', response.clone());
        return response;
      } catch {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  const immutable = /\.(?:png|webp|jpg|jpeg|glb|woff2?)$/i.test(url.pathname);
  if (immutable) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      return (await caches.match(request, { ignoreSearch: true })) || Response.error();
    }
  })());
});
