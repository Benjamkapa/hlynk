/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

// Required by VitePWA's injectManifest strategy — do NOT remove
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST || []);

const _self = (self as unknown) as ServiceWorkerGlobalScope & { clients: Clients };

// Require skipWaiting to prevent the SW from hanging in the wait state
_self.skipWaiting();

_self.addEventListener('activate', (event) => {
  event.waitUntil(_self.clients.claim());
});

_self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/favicon-32x32.png',
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
