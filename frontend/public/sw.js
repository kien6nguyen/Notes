const CACHE_NAME = 'notes-app-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy: Network-first for API, Cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests: ALWAYS network-first, NO caching for auth-sensitive endpoints
  // Caching API responses causes issues with token changes and auth state
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Offline: return cached API response only as fallback
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true, message: 'You are offline' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // Static assets: Cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Listen for sync events (for offline note saving)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncPendingNotes());
  }
});

async function syncPendingNotes() {
  // Get pending changes from IndexedDB when back online
  // This is a placeholder - actual implementation depends on the offline queue
  console.log('[SW] Syncing pending notes...');
}

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Notes App', body: 'You have updates' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })
  );
});
