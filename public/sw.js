const RESET_VERSION = '18.0.0';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map((client) => {
      const url = new URL(client.url);
      if (url.searchParams.get('fresh') === RESET_VERSION) return undefined;
      url.searchParams.set('fresh', RESET_VERSION);
      return client.navigate(url.toString());
    }));
    await self.registration.unregister();
  })());
});
