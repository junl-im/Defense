/* Rani Kingdom v5.27: network-first PWA registration.
   NEVER cache the ~160 MB 2.5D world, gameplay APIs, or user saves.
   This worker supplies installability and keeps all requests online. */
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate')return;
 event.respondWith(fetch(event.request)); // no stale game or silent offline promises
});
