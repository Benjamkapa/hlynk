import { toast } from 'sonner';

// src/lib/notify.ts
/**
 * Show a notification – either a native browser push (if permission granted)
 * or a Sonner toast as a fallback.
 *
 * @param title   Short title shown in both notification types
 * @param message Body text for the toast (browser notifications use it as `body`)
 */
export const notify = (title: string, message: string) => {
  // Try native browser notification first
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message })
      return
    }
    // Request permission once – next time permission will be stored
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification(title, { body: message })
      })
      return
    }
  }

  // Fallback to Sonner toast
  toast.success(`${title}: ${message}`)
}
