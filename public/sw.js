const RELEASE_VERSION = '1.0.19';
const BUILD_ID = 'b24.19';
// const VERSION = '23.1.0'; historical lineage marker.
const CACHE_PREFIX = 'dokkaebi-shell-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const SHELL_ASSETS = [
  './', './index.html', './manifest.webmanifest', './version.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './static-bootstrap.js', './src/bootstrap.js', './src/style.css', './src/main.js',
  './src/runtime/first-presentation-director-v107.js',
  './src/runtime/visual-integration-director.js',
  './src/runtime/art-approval-pipeline-v115.js',
  './src/runtime/asset-approval-pipeline-v117.js',
  './src/runtime/static-deployment-gate-v118.js',
  './src/runtime/bundle-marker-gate-v119.js',
  './src/assets/title-v112/title-bg-desktop-lite-v112.webp',
  './src/assets/title-v112/title-bg-mobile-lite-v112.webp',
  './src/assets/title-v112/title-mascot-lite-v112.webp'
];
// Retained for explicit offline warming and historical release verification.
// These files are no longer fetched during service-worker installation.
const OPTIONAL_WARM_ASSETS = [
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
  './src/runtime/combat-art-polish-policy-v114.js',
  './src/runtime/combat-art-polish-director-v114.js',
  './src/runtime/asset-approval-pipeline-v117.js',
  './src/runtime/static-deployment-gate-v118.js',
  './src/runtime/bundle-marker-gate-v119.js',
  './asset-approval-v117.html',
  './assets/visual-v117/asset-approval-manifest-v117.json',
  './assets/visual-v117/asset-approval-registry-v117.json',
  './assets/visual-v117/directional/guardian-ember-pupu-turntable-v117.webp',
  './assets/visual-v117/directional/guardian-ember-pupu-atlas-low-v117.webp',
  './assets/visual-v117/directional/guardian-ember-pupu-atlas-medium-v117.webp',
  './assets/visual-v117/directional/guardian-ember-pupu-atlas-high-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-stable-low-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-stable-medium-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-stable-high-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-shielded-low-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-shielded-medium-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-shielded-high-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-cracked-low-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-cracked-medium-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-cracked-high-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-critical-low-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-critical-medium-v117.webp',
  './assets/visual-v117/citadel/guardian-citadel-critical-high-v117.webp',
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
  './assets/visual-v114/asset-polish-manifest-v114.json',
  './assets/visual-v114/characters/hero-warrior-low-v114.webp',
  './assets/visual-v114/characters/hero-warrior-medium-v114.webp',
  './assets/visual-v114/characters/hero-warrior-high-v114.webp',
  './assets/visual-v114/characters/hero-archer-low-v114.webp',
  './assets/visual-v114/characters/hero-archer-medium-v114.webp',
  './assets/visual-v114/characters/hero-archer-high-v114.webp',
  './assets/visual-v114/characters/hero-mage-low-v114.webp',
  './assets/visual-v114/characters/hero-mage-medium-v114.webp',
  './assets/visual-v114/characters/hero-mage-high-v114.webp',
  './assets/visual-v114/characters/hero-shaman-low-v114.webp',
  './assets/visual-v114/characters/hero-shaman-medium-v114.webp',
  './assets/visual-v114/characters/hero-shaman-high-v114.webp',
  './assets/visual-v114/characters/hero-taoist-low-v114.webp',
  './assets/visual-v114/characters/hero-taoist-medium-v114.webp',
  './assets/visual-v114/characters/hero-taoist-high-v114.webp',
  './assets/visual-v114/characters/guardian-ember-low-v114.webp',
  './assets/visual-v114/characters/guardian-ember-medium-v114.webp',
  './assets/visual-v114/characters/guardian-ember-high-v114.webp',
  './assets/visual-v114/characters/guardian-frost-low-v114.webp',
  './assets/visual-v114/characters/guardian-frost-medium-v114.webp',
  './assets/visual-v114/characters/guardian-frost-high-v114.webp',
  './assets/visual-v114/characters/guardian-wind-low-v114.webp',
  './assets/visual-v114/characters/guardian-wind-medium-v114.webp',
  './assets/visual-v114/characters/guardian-wind-high-v114.webp',
  './assets/visual-v114/characters/guardian-stone-low-v114.webp',
  './assets/visual-v114/characters/guardian-stone-medium-v114.webp',
  './assets/visual-v114/characters/guardian-stone-high-v114.webp',
  './assets/visual-v114/characters/guardian-bell-low-v114.webp',
  './assets/visual-v114/characters/guardian-bell-medium-v114.webp',
  './assets/visual-v114/characters/guardian-bell-high-v114.webp',
  './assets/visual-v114/characters/guardian-thunder-low-v114.webp',
  './assets/visual-v114/characters/guardian-thunder-medium-v114.webp',
  './assets/visual-v114/characters/guardian-thunder-high-v114.webp',
  './assets/visual-v114/characters/monster-imp-low-v114.webp',
  './assets/visual-v114/characters/monster-imp-medium-v114.webp',
  './assets/visual-v114/characters/monster-imp-high-v114.webp',
  './assets/visual-v114/characters/monster-runner-low-v114.webp',
  './assets/visual-v114/characters/monster-runner-medium-v114.webp',
  './assets/visual-v114/characters/monster-runner-high-v114.webp',
  './assets/visual-v114/characters/monster-brute-low-v114.webp',
  './assets/visual-v114/characters/monster-brute-medium-v114.webp',
  './assets/visual-v114/characters/monster-brute-high-v114.webp',
  './assets/visual-v114/characters/monster-shaman-low-v114.webp',
  './assets/visual-v114/characters/monster-shaman-medium-v114.webp',
  './assets/visual-v114/characters/monster-shaman-high-v114.webp',
  './assets/visual-v114/characters/monster-ghost-low-v114.webp',
  './assets/visual-v114/characters/monster-ghost-medium-v114.webp',
  './assets/visual-v114/characters/monster-ghost-high-v114.webp',
  './assets/visual-v114/characters/monster-skeleton-low-v114.webp',
  './assets/visual-v114/characters/monster-skeleton-medium-v114.webp',
  './assets/visual-v114/characters/monster-skeleton-high-v114.webp',
  './assets/visual-v114/characters/monster-crow-low-v114.webp',
  './assets/visual-v114/characters/monster-crow-medium-v114.webp',
  './assets/visual-v114/characters/monster-crow-high-v114.webp',
  './assets/visual-v114/characters/boss-tiger-low-v114.webp',
  './assets/visual-v114/characters/boss-tiger-medium-v114.webp',
  './assets/visual-v114/characters/boss-tiger-high-v114.webp',
  './assets/visual-v114/characters/boss-serpent-low-v114.webp',
  './assets/visual-v114/characters/boss-serpent-medium-v114.webp',
  './assets/visual-v114/characters/boss-serpent-high-v114.webp',
  './assets/visual-v114/characters/boss-king-low-v114.webp',
  './assets/visual-v114/characters/boss-king-medium-v114.webp',
  './assets/visual-v114/characters/boss-king-high-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-stable-low-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-stable-medium-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-stable-high-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-shielded-low-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-shielded-medium-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-shielded-high-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-cracked-low-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-cracked-medium-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-cracked-high-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-critical-low-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-critical-medium-v114.webp',
  './assets/visual-v114/citadel/guardian-citadel-critical-high-v114.webp',
  './src/assets/title-v112/title-bg-desktop-v112.webp',
  './src/assets/title-v112/title-bg-desktop-lite-v112.webp',
  './src/assets/title-v112/title-bg-mobile-v112.webp',
  './src/assets/title-v112/title-bg-mobile-lite-v112.webp',
  './src/assets/title-v112/title-mascot-v112.webp',
  './src/assets/title-v112/title-mascot-lite-v112.webp',
  './src/assets/title-v112/visual-polish-manifest-v112.json'
];;
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
    return;
  }
  if (data.type === 'DOKKAEBI_WARM_OPTIONAL') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      let warmed = 0;
      for (const path of OPTIONAL_WARM_ASSETS) {
        try {
          const response = await fetch(new Request(path, { cache: 'no-cache' }));
          if (response.ok) { await cache.put(path, response.clone()); warmed += 1; }
        } catch { /* optional warm is best effort */ }
      }
      event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_OPTIONAL_WARMED', warmed });
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
