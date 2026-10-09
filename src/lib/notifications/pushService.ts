import { api } from '../api/client';

const DEFAULT_VAPID_PUBLIC_KEY = 'BPQGzac32wjotYdyE7LgSjXuyA5oTIVdaekJJYXrd01RUaR65mh95YWcChFaJl7Xt0X7LROIH7M5cZXeCcuEtc8';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;

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
function swReady(timeoutMs = 15_000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready.then(reg => reg),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Service worker took too long to activate. Please reload the page or clear cache.')),
        timeoutMs,
      )
    ),
  ]);
}

export async function subscribeToPushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  // Check secure context
  if (window.isSecureContext === false) {
    throw new Error('Push notifications require a secure context (HTTPS or localhost).');
  }

  // Explicitly request permission before trying to subscribe
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied in browser settings.');
  }

  const keyToUse = VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
  if (!keyToUse) {
    throw new Error('VAPID Public Key configuration is missing.');
  }

  try {
    const registration = await swReady();

    // 1. Inspect any existing subscription
    let subscription: PushSubscription | null = null;
    try {
      subscription = await registration.pushManager.getSubscription();
    } catch (_) {
      subscription = null;
    }

    if (subscription) {
      try {
        const existingKey = subscription.options?.applicationServerKey;
        const targetKey = urlBase64ToUint8Array(keyToUse);
        
        // Check if existing subscription key matches current VAPID public key
        let keysMatch = false;
        if (existingKey) {
          const existingKeyArray = new Uint8Array(existingKey);
          if (existingKeyArray.length === targetKey.length) {
            keysMatch = existingKeyArray.every((val, i) => val === targetKey[i]);
          }
        }

        // If key mismatched, unsubscribe the stale subscription
        if (!keysMatch) {
          console.log('[PushService] Key mismatch on existing subscription — refreshing...');
          await subscription.unsubscribe().catch(() => {});
          subscription = null;
        }
      } catch (keyErr) {
        console.warn('[PushService] Key check warning:', keyErr);
      }
    }

    // 2. Create new subscription if none or refreshed
    if (!subscription) {
      console.log('[PushService] Subscribing with VAPID key...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyToUse),
        });
      } catch (firstErr: any) {
        console.warn('[PushService] First subscribe attempt error:', firstErr?.message);
        
        // Force cleanup any corrupted push registration in browser
        try {
          const oldSub = await registration.pushManager.getSubscription();
          if (oldSub) await oldSub.unsubscribe();
        } catch (_) {}

        // Retry subscription
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(keyToUse),
          });
        } catch (secondErr: any) {
          const errorMsg = String(secondErr?.message || secondErr);
          if (errorMsg.includes('push service error') || errorMsg.includes('Registration failed')) {
            throw new Error('Browser push service temporarily unavailable. If you are using a VPN or strict firewall, Google FCM service may be restricted.');
          }
          throw secondErr;
        }
      }
    }

    if (!subscription) {
      throw new Error('Could not establish browser push subscription.');
    }

    // 3. Sync subscription credentials with backend
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      throw new Error('Subscription encryption keys unavailable from browser.');
    }

    const p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey))));
    const auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey))));

    await api.post('/notifications/subscribe', {
      subscription: {
        endpoint: subscription.endpoint,
        keys: { p256dh, auth },
      },
    });

    return true;
  } catch (error: any) {
    console.error('Push subscription failed:', error);
    throw new Error(error?.message || 'Failed to enable push notifications');
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await swReady(5_000);
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint }).catch(() => {});
    }
  } catch (_) {}
}

export async function resetPushRegistration() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      const sub = await reg.pushManager.getSubscription().catch(() => null);
      if (sub) await sub.unsubscribe().catch(() => {});
      await reg.unregister().catch(() => {});
    }
    window.location.reload();
  } catch (_) {
    window.location.reload();
  }
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone;
}

export async function getPushSubscriptionState(): Promise<'subscribed' | 'denied' | 'prompt' | 'unsupported' | 'ios_browser'> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return 'unsupported';
    }
    
    // Special handling for iOS Safari non-PWA
    if (isIOS() && !isStandalone()) {
      return 'ios_browser';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const registration = await swReady(5_000);
    const subscription = await registration.pushManager.getSubscription().catch(() => null);
    if (subscription) {
      return 'subscribed';
    }
    return 'prompt';
  } catch {
    // If anything fails during state query, fall back to safe prompt state
    return 'prompt';
  }
}
