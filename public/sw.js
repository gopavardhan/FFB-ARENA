const CACHE_NAME = 'ffb-arena-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/pwd.png',
  '/pwd2.png',
  '/favicon.ico'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Navigation requests -> return cached index.html for SPA fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(async () => {
          // Try cached index first, then offline page
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          return caches.match('/offline.html');
        })
    );
    return;
  }
  // Network-first for API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          // cache GET responses
          if (request.method === 'GET' && resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For other requests, cache-first then network, fallback to offline page
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((networkResp) => {
          const contentType = networkResp.headers.get('content-type') || '';
          if (networkResp && (contentType.includes('image') || contentType.includes('javascript') || contentType.includes('css') || contentType.includes('json'))) {
            const respClone = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
          }
          return networkResp;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FFB ARENA';
  const options = {
    body: data.body || 'New update available',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    data: data.url || '/',
    tag: data.tag || 'notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});

// Background Sync event (one-off)
self.addEventListener('sync', (event) => {
  if (event.tag === 'ffb-sync') {
    event.waitUntil(
      // Example: sync user data or pending requests
      (async () => {
        // Placeholder - implement real sync tasks here
        console.log('Background sync triggered: ffb-sync');
        return true;
      })()
    );
  }
});

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'ffb-periodic-sync') {
    event.waitUntil((async () => {
      // Placeholder: fetch latest feed or notifications
      try {
        const resp = await fetch('/api/refresh-cache');
        if (resp && resp.ok) {
          console.log('Periodic sync fetched updates');
        }
      } catch (err) {
        console.error('Periodic sync failed', err);
      }
    })());
  }
});
