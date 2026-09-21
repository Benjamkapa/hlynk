/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

const _self = (self as unknown) as ServiceWorkerGlobalScope & { clients: Clients };

// 1. Clean up outdated caches from previous builds
cleanupOutdatedCaches();

// 2. Precache static assets generated during Vite build
// Required by VitePWA's injectManifest strategy — do NOT remove
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST || []);

// 3. Handle SPA Navigation fallback when offline or launching installed PWA standalone
// Returns the precached index.html for all document navigations (e.g., /login, /dashboard, /stay/xyz)
try {
  const handler = createHandlerBoundToURL('/index.html');
  const navigationRoute = new NavigationRoute(handler, {
    denylist: [/^\/api\//, /\.[a-z0-9]+$/i], // Ignore API calls and asset file requests
  });
  registerRoute(navigationRoute);
} catch (e) {
  console.warn('[SW] Could not register navigation route fallback:', e);
}

// 4. Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

// 5. Cache external avatars and images
registerRoute(
  /^https:\/\/ui-avatars\.com\/api\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'ui-avatars-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

registerRoute(
  /\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/i,
  new StaleWhileRevalidate({
    cacheName: 'app-images-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// Require skipWaiting and claim to ensure SW activates immediately
_self.skipWaiting();

_self.addEventListener('activate', (event) => {
  event.waitUntil(_self.clients.claim());
});

_self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    // Use absolute URL for icon — iOS PWA silently rejects relative paths
    const origin = _self.location.origin;
    const iconPath = data.icon || '/logo.png';
    const iconUrl = iconPath.startsWith('http') ? iconPath : `${origin}${iconPath}`;

    const options: NotificationOptions = {
      body: data.body,
      icon: iconUrl,
      // NOTE: 'badge' is intentionally omitted — iOS ignores it and
      // older iOS versions silently drop the notification when it's present
      data: data.data || {},
    };

    // 1. Show the system notification
    event.waitUntil(
      _self.registration.showNotification(data.title, options)
    );

    // 2. Broadcast to all open tabs for in-app toasts
    _self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION',
          payload: { 
            title: data.title, 
            body: data.body, 
            data: data.data,
            type: data.type || 'info'
          }
        });
      });
    });
  }
});

_self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    _self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i] as WindowClient;
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (_self.clients.openWindow) {
        return _self.clients.openWindow(urlToOpen);
      }
    })
  );
});

