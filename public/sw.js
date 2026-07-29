const RELEASE_VERSION = '1.0.47';
const BUILD_ID = 'b24.47';
// const VERSION = '23.2.0'; historical lineage marker.
const CACHE_PREFIX = 'dokkaebi-luck-defense-shell-';
const LEGACY_CACHE_PREFIXES = ['dokkaebi-shell-', 'dokkaebi-luck-defense-shell-'];
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const UPGRADE_ASSURANCE_LINEAGE = Object.freeze(['DD-SW-UPGRADE-ASSURANCE-V146', 'DD-SW-UPGRADE-ASSURANCE-V147']);
const UPGRADE_ASSURANCE_ID = UPGRADE_ASSURANCE_LINEAGE.at(-1);
const CLIENT_STORAGE_POLICY = 'preserve-client-storage';
// BEGIN GENERATED RUNTIME MODULE SHELL V135
const GENERATED_MODULE_SHELL_V135 = Object.freeze([
  './src/art-production-gate.js',
  './src/art-style-tokens.js',
  './src/asset-diagnostics.js',
  './src/asset-specs.js',
  './src/battlefield-themes.js',
  './src/bootstrap.js',
  './src/boss-director.js',
  './src/boss-hud-contract.js',
  './src/character-dna.js',
  './src/codex-data.js',
  './src/codex-progression.js',
  './src/codex-viewer.js',
  './src/combat-presentation.js',
  './src/combat/battle-momentum-system.js',
  './src/combat/battlefield-event-director.js',
  './src/combat/boss-break-system.js',
  './src/combat/boss-escalation-director.js',
  './src/combat/combat-readability-director-v21.js',
  './src/combat/combat-telemetry.js',
  './src/combat/elemental-reaction-system.js',
  './src/combat/encounter-director.js',
  './src/combat/guardian-targeting-director-v22.js',
  './src/combat/moonfront-campaign-director.js',
  './src/combat/status-effect-system.js',
  './src/daily-expedition.js',
  './src/enemy-candidate-visuals.js',
  './src/engine/animation-state-system.js',
  './src/engine/asset-catalog.js',
  './src/engine/asset-pipeline.js',
  './src/engine/asset-quality.js',
  './src/engine/blob-shadow-system.js',
  './src/engine/camera-director-v16.js',
  './src/engine/camera-profile.js',
  './src/engine/directional-impostor.js',
  './src/engine/engine-config.js',
  './src/engine/frame-budget-scheduler.js',
  './src/engine/geometry-budget.js',
  './src/engine/index.js',
  './src/engine/instance-batch.js',
  './src/engine/mobile-engine.js',
  './src/engine/object-pool.js',
  './src/engine/performance-monitor.js',
  './src/engine/quality-governor.js',
  './src/engine/render-stats-hud.js',
  './src/engine/runtime-budget-manager.js',
  './src/engine/texture-atlas.js',
  './src/engine/world-chunk-manager.js',
  './src/equipment-system.js',
  './src/expedition-director.js',
  './src/firebase.js',
  './src/game-data.js',
  './src/golden-sample-spec.js',
  './src/golden-slice-certification.js',
  './src/guardian-council-system.js',
  './src/hero-archetype-system.js',
  './src/hero-classes.js',
  './src/hero-mastery.js',
  './src/hero-visual-loadout.js',
  './src/ip-asset-library-v15.js',
  './src/ip-knowledge-megabase-v4.js',
  './src/main.js',
  './src/premium-assets.js',
  './src/production-console.js',
  './src/run-director.js',
  './src/runtime-art-harmonizer.js',
  './src/runtime-lifecycle.js',
  './src/runtime/action-asset-assurance-director-v125.js',
  './src/runtime/app-state-machine-v103.js',
  './src/runtime/app-state-surface-v141.js',
  './src/runtime/art-approval-pipeline-v115.js',
  './src/runtime/asset-approval-pipeline-v117.js',
  './src/runtime/asset-lineage-assurance-director-v131.js',
  './src/runtime/asset-presence-enforcer.js',
  './src/runtime/asset-refinement-assurance-director-v129.js',
  './src/runtime/automation-director-v22.js',
  './src/runtime/battlefield-clarity-director-v122.js',
  './src/runtime/battlefield-prop-system.js',
  './src/runtime/battlefield-sprite-director-v16.js',
  './src/runtime/battlefield-visibility-assurance-director-v128.js',
  './src/runtime/boss-encounter-assurance-director-v126.js',
  './src/runtime/boss-identity-assurance-director-v133.js',
  './src/runtime/boss-tactical-assurance-director-v127.js',
  './src/runtime/browser-reliability-lab.js',
  './src/runtime/bundle-marker-gate-v119.js',
  './src/runtime/combat-art-polish-director-v114.js',
  './src/runtime/combat-art-polish-policy-v114.js',
  './src/runtime/combat-art-runtime-policy-v113.js',
  './src/runtime/combat-visual-director-v112.js',
  './src/runtime/core-foundation-director-v101.js',
  './src/runtime/cross-platform-shell-v112.js',
  './src/runtime/device-trace-assurance-v146.js',
  './src/runtime/failure-digest-v146.js',
  './src/runtime/first-presentation-director-v107.js',
  './src/runtime/hero-hud-polish-v120.js',
  './src/runtime/korean-language-guard.js',
  './src/runtime/live-combat-director-v121.js',
  './src/runtime/long-session-assurance-v145.js',
  './src/runtime/mobile-hud-director-v23.js',
  './src/runtime/mobile-input-recovery-v143.js',
  './src/runtime/native-input-policy-v231.js',
  './src/runtime/release-assurance-director-v124.js',
  './src/runtime/runtime-visual-audit.js',
  './src/runtime/save-schema.js',
  './src/runtime/service-worker-upgrade-assurance-v146.js',
  './src/runtime/silhouette-assurance-director-v132.js',
  './src/runtime/static-deployment-gate-v118.js',
  './src/runtime/summon-button-presentation-v142.js',
  './src/runtime/title-presentation-guard-v123.js',
  './src/runtime/visual-integration-director.js',
  './src/runtime/wave-flow-guard.js',
  './src/runtime/wave-reliability-director.js',
  './src/sound-engine.js',
  './src/stage-progression.js',
  './src/style.css',
  './src/ui-layout-contract.js',
  './src/ui-layout-manager.js',
  './src/version-policy.js',
]);
// END GENERATED RUNTIME MODULE SHELL V135
const SHELL_ASSETS = [
  ...GENERATED_MODULE_SHELL_V135,
  './', './index.html', './manifest.webmanifest', './version.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './static-bootstrap.js', './src/bootstrap.js', './src/style.css', './src/main.js',
  './src/runtime/first-presentation-director-v107.js',
  './src/runtime/visual-integration-director.js',
  './src/runtime/art-approval-pipeline-v115.js',
  './src/runtime/asset-approval-pipeline-v117.js',
  './src/runtime/static-deployment-gate-v118.js',
  './src/runtime/bundle-marker-gate-v119.js',
  './src/runtime/live-combat-director-v121.js',
  './src/runtime/battlefield-clarity-director-v122.js',
  './src/runtime/release-assurance-director-v124.js',
  './src/runtime/action-asset-assurance-director-v125.js',
  './src/runtime/boss-encounter-assurance-director-v126.js',
  './src/runtime/boss-tactical-assurance-director-v127.js',
  './src/runtime/battlefield-visibility-assurance-director-v128.js',
  './src/runtime/asset-refinement-assurance-director-v129.js',
  './src/runtime/asset-lineage-assurance-director-v131.js',
  './src/runtime/silhouette-assurance-director-v132.js',
  './src/runtime/boss-identity-assurance-director-v133.js',
  './src/runtime/title-presentation-guard-v123.js',
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
  './src/runtime/live-combat-director-v121.js',
  './src/runtime/battlefield-clarity-director-v122.js',
  './src/runtime/release-assurance-director-v124.js',
  './src/runtime/action-asset-assurance-director-v125.js',
  './src/runtime/boss-encounter-assurance-director-v126.js',
  './src/runtime/boss-tactical-assurance-director-v127.js',
  './src/runtime/battlefield-visibility-assurance-director-v128.js',
  './src/runtime/asset-refinement-assurance-director-v129.js',
  './src/runtime/title-presentation-guard-v123.js',
  './release-assurance-v124.html',
  './action-asset-lab-v125.html',
  './boss-encounter-lab-v126.html',
  './assets/visual-v126/boss-encounter-manifest-v126.json',
  './assets/visual-v126/boss-encounter-registry-v126.json',
  './boss-tactical-lab-v127.html',
  './battlefield-visibility-lab-v128.html',
  './assets/visual-v128/battlefield-visibility-manifest-v128.json',
  './assets/visual-v128/battlefield-visibility-registry-v128.json',
  './asset-refinement-lab-v129.html',
  './asset-lineage-lab-v131.html',
  './assets/visual-v131/asset-lineage-audit-v131.json',
  './assets/visual-v131/asset-lineage-registry-v131.json',
  './silhouette-assurance-lab-v132.html',
  './boss-identity-lab-v133.html',
  './assets/visual-v133/boss-identity-audit-v133.json',
  './assets/visual-v133/boss-identity-registry-v133.json',
  './assets/visual-v133/boss-identity-manifest-v133.json',
  './assets/visual-v132/silhouette-audit-v132.json',
  './assets/visual-v132/action-evidence-v132.json',
  './assets/visual-v132/silhouette-assurance-registry-v132.json',
  './assets/visual-v132/silhouette-assurance-manifest-v132.json',
  './assets/visual-v129/asset-refinement-profile-v129.json',
  './assets/visual-v129/asset-refinement-manifest-v129.json',
  './assets/visual-v129/asset-refinement-registry-v129.json',
  './assets/visual-v129/directional/guardian-ember-pupu-atlas-low-v129.webp',
  './assets/visual-v129/directional/guardian-ember-pupu-atlas-medium-v129.webp',
  './assets/visual-v129/directional/guardian-ember-pupu-atlas-high-v129.webp',
  './assets/visual-v127/boss-tactical-manifest-v127.json',
  './assets/visual-v127/boss-tactical-registry-v127.json',
  './assets/visual-v125/action-asset-manifest-v125.json',
  './assets/visual-v125/action-asset-registry-v125.json',
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
  './src/assets/ui-v142/random-summon-emblem-v142.png',
  './src/assets/title-v112/title-mascot-v112.webp',
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
  const targets = keys.filter((key) => LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) && (includeCurrent || key !== CACHE_NAME));
  await Promise.all(targets.map((key) => caches.delete(key)));
  return targets;
}
self.addEventListener('install', (event) => event.waitUntil((async () => { await precache(); await self.skipWaiting(); })()));
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  const removedCaches = await removeOldCaches();
  await self.clients.claim();
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) client.postMessage({
    type: 'DOKKAEBI_SW_ACTIVATED',
    version: RELEASE_VERSION,
    buildId: BUILD_ID,
    cacheName: CACHE_NAME,
    removedCaches,
    assuranceId: UPGRADE_ASSURANCE_ID,
    storagePolicy: CLIENT_STORAGE_POLICY
  });
})()));
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'DOKKAEBI_GET_VERSION') {
    event.ports?.[0]?.postMessage({ type: 'DOKKAEBI_VERSION', version: RELEASE_VERSION, buildId: BUILD_ID, cacheName: CACHE_NAME, assuranceId: UPGRADE_ASSURANCE_ID, storagePolicy: CLIENT_STORAGE_POLICY });
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
