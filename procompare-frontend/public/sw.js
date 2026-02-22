// Service Worker for ProConnectSA PWA
// Version: 1.0.2 - Added push notification handling

const CACHE_NAME = 'proconnectsa-v1';
const RUNTIME_CACHE = 'proconnectsa-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (API calls to external domains)
  if (!url.origin.startsWith(self.location.origin)) {
    return;
  }

  // IMPORTANT: Skip API routes - they should always go to network
  // API routes should never be cached
  if (url.pathname.startsWith('/api/')) {
    return; // Let the browser handle API calls normally
  }

  // Skip service worker and manifest requests
  if (url.pathname === '/sw.js' || url.pathname === '/manifest.json') {
    return;
  }

  // Only cache static assets and pages
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache HTML pages and static assets (images, CSS, JS)
            const shouldCache = 
              event.request.destination === 'document' || // HTML pages
              event.request.destination === 'image' ||     // Images
              event.request.destination === 'style' ||     // CSS
              event.request.destination === 'script' ||   // JavaScript
              event.request.destination === 'font';        // Fonts

            if (shouldCache) {
              // Clone the response for caching
              const responseToCache = response.clone();

              // Cache the response
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // If network fails and no cache, return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            // For other requests, let the error propagate
            throw error;
          });
      })
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'ProConnectSA',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'proconnectsa-notification',
    data: {},
  };

  // Parse push data
  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        notificationData = {
          ...notificationData,
          title: payload.notification.title || notificationData.title,
          body: payload.notification.body || notificationData.body,
          icon: payload.notification.icon || notificationData.icon,
          badge: payload.notification.badge || notificationData.badge,
        };
      }
      if (payload.data) {
        notificationData.data = payload.data;
        notificationData.tag = payload.data.lead_id || payload.data.type || notificationData.tag;
      }
    } catch (e) {
      // If JSON parsing fails, try text
      const text = event.data.text();
      if (text) {
        notificationData.body = text;
      }
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  // Get notification data
  const data = event.notification.data || {};
  const leadId = data.lead_id;
  const action = data.action || 'view_dashboard';

  // Determine URL based on action
  let url = '/dashboard';
  if (leadId && action === 'view_lead') {
    url = `/dashboard/leads/${leadId}`;
  } else if (action === 'view_notifications') {
    url = '/dashboard/notifications';
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
