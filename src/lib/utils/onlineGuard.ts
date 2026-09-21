import { toast } from 'sonner'

/**
 * Checks if the browser is online. If offline, emits a user-friendly error toast
 * and returns false to disallow operations requiring network utility.
 */
export function requireOnline(featureName?: string): boolean {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true
  if (!online) {
    const actionLabel = featureName ? `"${featureName}"` : 'This action'
    toast.error('Online Connection Required', {
      description: `${actionLabel} requires an active internet connection. Please reconnect and try again.`
    })
    return false
  }
  return true
}
