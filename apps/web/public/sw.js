// SpeakFlow Progressive Web App Service Worker (Network-First Auto-Update)
const CACHE_NAME = 'speakflow-v2026-fresh';

// Install: Immediately skip waiting to take over and update
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: Immediately wipe all previous caches and take control of all open client tabs
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
      .then(() => {
        // Broadcast to all open tabs to reload and display the latest version
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'NEW_VERSION_ACTIVATED' });
          });
        });
      })
  );
});

// Fetch: STRICT NETWORK-FIRST. When online, ALWAYS fetch fresh assets from the server!
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip caching for API or external calls
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Only if offline, fallback to cached version
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
