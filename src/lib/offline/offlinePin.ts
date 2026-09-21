/** Offline PIN manager — uses Web Crypto SHA-256 so nothing leaves the device */

const SALT = 'hlynk_pin_v1_2024'
const PIN_KEY = 'hlynk_offline_pin_hash'
const PIN_PROMPTED_KEY = 'hlynk_pin_prompted'
export const DEFAULT_PIN = '123456'

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(SALT + pin + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Save a new offline PIN (hashed) */
export async function saveOfflinePin(pin: string): Promise<void> {
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_KEY, hash)
  localStorage.setItem(PIN_PROMPTED_KEY, 'true')
}

/** Ensure an offline PIN exists, initializing with default PIN '123456' if none set */
export async function ensureDefaultOfflinePin(): Promise<void> {
  if (!hasOfflinePin()) {
    await saveOfflinePin(DEFAULT_PIN)
  }
}

/** Verify if the provided PIN matches the stored one */
export async function verifyOfflinePin(pin: string): Promise<boolean> {
  if (!hasOfflinePin()) {
    await ensureDefaultOfflinePin()
  }
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const hash = await hashPin(pin)
  return hash === stored
}

/** Returns true if the user has already set an offline PIN */
export function hasOfflinePin(): boolean {
  return !!localStorage.getItem(PIN_KEY)
}

/** Returns true if we've already prompted the user to set a PIN */
export function hasPinBeenPrompted(): boolean {
  return localStorage.getItem(PIN_PROMPTED_KEY) === 'true'
}

/** Mark as prompted without saving a PIN (user skipped) */
export function markPinPrompted(): void {
  localStorage.setItem(PIN_PROMPTED_KEY, 'true')
}

/** Clear the PIN (called only when explicitly removed by user in Settings) */
export function clearOfflinePin(): void {
  localStorage.removeItem(PIN_KEY)
}
