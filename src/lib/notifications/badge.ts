/**
 * App Badging API Helper for PWA
 *
 * Controls the notification badge count on the device app icon (home screen / dock / taskbar)
 * on supported platforms:
 * - iOS / iPadOS 16.4+ (when saved to Home Screen as PWA)
 * - Windows (Taskbar pinned PWA)
 * - macOS (Dock via Chrome/Edge/Safari PWA)
 * - Android (supported launchers / status bar badge)
 */

export const isAppBadgeSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
};

/**
 * Set the device PWA icon badge count.
 * If count is 0 or negative, the badge is cleared.
 */
export const setAppBadge = async (count?: number): Promise<void> => {
  if (typeof navigator === 'undefined') return;

  try {
    if (typeof count === 'number' && count > 0) {
      if ('setAppBadge' in navigator) {
        await (navigator as any).setAppBadge(count);
      }
      // Also notify active service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_BADGE',
          count,
        });
      }
    } else {
      await clearAppBadge();
    }
  } catch (err) {
    // Non-fatal: browsers may reject if permissions aren't satisfied
    console.debug('[AppBadge] Failed to set badge:', err);
  }
};

/**
 * Clear the device PWA icon badge.
 */
export const clearAppBadge = async (): Promise<void> => {
  if (typeof navigator === 'undefined') return;

  try {
    if ('clearAppBadge' in navigator) {
      await (navigator as any).clearAppBadge();
    }
    // Also notify active service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_BADGE',
      });
    }
  } catch (err) {
    console.debug('[AppBadge] Failed to clear badge:', err);
  }
};
