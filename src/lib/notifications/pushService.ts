import { api } from '../api/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Wraps navigator.serviceWorker.ready with a timeout so it never hangs forever */
function swReady(timeoutMs = 60_000): Promise<ServiceWorkerRegistration> {
  console.log('[PushService] Waiting for service worker to be ready...');
  
  return Promise.race([
    navigator.serviceWorker.ready.then(reg => {
      console.log('[PushService] Service worker is ready:', reg.active?.state);
      return reg;
    }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => {
          console.error('[PushService] Service worker ready timeout exceeded');
          reject(new Error('Service worker took too long to activate. Please ensure you are online and refresh.'));
        },
        timeoutMs,
      )
    ),
  ]);
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  // Explicitly request permission before trying to subscribe
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied.');
  }

  try {
    const registration = await swReady();

    // Get existing subscription OR create a new one
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID Public Key is missing in frontend configuration.');
      }
      console.log('[PushService] Creating new browser subscription...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } else {
      console.log('[PushService] Browser already has subscription — re-syncing to backend...');
    }

    // ALWAYS sync to backend (fixes "No subscriptions found" when browser
    // already had a subscription from a prior session but DB was wiped)
    const syncRes = await api.post('/notifications/subscribe', {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
          auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))),
        },
      },
    });
    console.log('[PushService] Backend sync response:', syncRes?.data);

    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    throw error;
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await swReady();
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
  }
}

export async function getPushSubscriptionState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  try {
    const registration = await swReady(5_000);
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) return 'subscribed';
  } catch {
    // SW not ready yet — treat as not subscribed
  }

  return 'prompt';
}
