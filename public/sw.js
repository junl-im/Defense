const CACHE_VERSION = 'kingdom-seed-v2.34-shell';
const CACHE_LIMIT = 80;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= CACHE_LIMIT) return;
  await Promise.all(keys.slice(0, keys.length - CACHE_LIMIT).map((request) => cache.delete(request)));
}

function shouldCache(request, response) {
  if (request.method !== 'GET' || !response || response.status !== 200) return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (/\/assets\/ui\/v2_(16|17|18|19|20|21|22|24|25|26|27|28|29|30|31|32|33|34)\//.test(url.pathname)) return false;
  if (/\/assets\/effects\/fx_(meteor_impact|arcane_surge|holy_gate|earth_stomp|boss_arena|projectile_trail|tower_impact)/.test(url.pathname)) return false;
  if (/\/assets\/(audio|sprites)\//.test(url.pathname)) return false;
  return /\.(js|css|webp|png|json|webmanifest|woff2?)$/i.test(url.pathname);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('kingdom-seed-') && !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then(async (response) => {
      if (shouldCache(request, response.clone())) {
        await cache.put(request, response.clone());
        await trimCache(cache);
      }
      return response;
    }).catch(() => cached);
    return cached || network;
  })());
});
