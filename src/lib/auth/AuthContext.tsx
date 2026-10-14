import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, type AuthUser } from '../api/auth'
import { queryClient } from '../query/queryClient'
import { storage } from '../utils/storage'
import { verifyOfflinePin, clearOfflinePin, hasOfflinePin, hasPinBeenPrompted } from '../offline/offlinePin'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isLocked: boolean
  login: (tokens: { accessToken: string; refreshToken?: string }, user: AuthUser) => void
  logout: (opts?: { force?: boolean }) => Promise<void>
  lock: () => void
  unlock: (pin: string) => Promise<boolean>
  refreshUser: () => Promise<any>
  /** Instantly patch specific fields in the cached user (optimistic update) */
  patchUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const cached = storage.getItem('user_profile')
      if (!cached || cached === 'undefined') return null
      return JSON.parse(cached)
    } catch (e) {
      console.error('Failed to parse cached user profile', e)
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(() => {
    const token = storage.getItem('accessToken')
    const cached = storage.getItem('user_profile')
    if (token && (!cached || cached === 'undefined')) return true
    return !!token
  })
  const [isLocked, setIsLocked] = useState(() => {
    // NEVER lock when online! Offline lock screen is strictly for offline mode.
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      storage.removeItem('session_locked')
      return false
    }
    // Only lock if offline AND an existing user profile exists AND explicitly locked
    const cachedUser = storage.getItem('user_profile')
    return !!cachedUser && storage.getItem('session_locked') === 'true'
  })

  useEffect(() => {
    // Only lock on offline if an existing profile exists AND user has set up a PIN
    const handleOffline = () => {
      const hasProfile = !!storage.getItem('user_profile') || !!user
      if (hasProfile && hasPinBeenPrompted() && hasOfflinePin()) {
        setIsLocked(true)
        storage.setItem('session_locked', 'true')
      }
    }

    const handleOnline = () => {
      // NEVER show offline lock when online: automatically clear lock when connection is active
      setIsLocked(false)
      storage.removeItem('session_locked')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // Ensure state is clean if app loaded while online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setIsLocked(false)
      storage.removeItem('session_locked')
    }

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [user])

  useEffect(() => {
    const token = storage.getItem('accessToken')

    const fetchUser = async () => {
      // If we are offline, don't even try to reach the server, just keep using cached profile
      if (!navigator.onLine) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authApi.me()
        if (res.success && res.data) {
          setUser(res.data)
          storage.setItem('user_profile', JSON.stringify(res.data))
        }
      } catch (err: any) {
        // Only clear token if server explicitly returned 401 with unauthorized message AND user is online
        const isAuthError = err.response?.status === 401 && err.response?.data?.message?.toLowerCase().includes('unauthorized')
        const cachedUser = storage.getItem('user_profile')

        if (isAuthError && !cachedUser) {
          storage.removeItem('accessToken')
          storage.removeItem('user_profile')
          setUser(null)
        } else {
          console.log('[Auth] Network error or server unreachable. Preserving session.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUser()

      const intervalId = setInterval(() => {
        if (navigator.onLine) fetchUser()
      }, 60000)

      return () => clearInterval(intervalId)
    }

    setIsLoading(false)
  }, [])

  const login = (tokens: { accessToken: string; refreshToken?: string }, userData: AuthUser) => {
    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('user_profile', JSON.stringify(userData))
    queryClient.clear()
    setIsLocked(false)
    storage.removeItem('session_locked')
    setUser(userData)
    // Note: do NOT auto-create a default PIN here — it causes isLocked to always trigger
    // on any offline event. Users set their PIN explicitly in Settings.
  }

  /**
   * Logout with offline-awareness.
   * - When ONLINE: full logout — clears tokens and session while preserving offline PIN.
   * - When OFFLINE (default): locks the screen instead so the user can
   *   re-authenticate locally via their PIN without needing internet.
   * - Pass { force: true } to force a full logout even when offline
   *   (user accepts they cannot log back in until they are online again).
   */
  const logout = async (opts?: { force?: boolean }) => {
    const isOffline = !navigator.onLine

    if (isOffline && !opts?.force) {
      // Don't destroy the session — just lock the screen
      setIsLocked(true)
      storage.setItem('session_locked', 'true')
      return
    }

    // Full logout (online, or forced)
    try {
      await authApi.logout()
    } catch {
      // ignore network errors
    }

    // Preserving offline PIN across logouts so the user only has to set it once
    storage.removeItem('accessToken')
    storage.removeItem('user_profile')
    storage.removeItem('session_locked')
    queryClient.clear()
    setIsLocked(false)
    setUser(null)
  }

  /** Lock the screen without ending the session — only permitted in offline mode with an existing profile */
  const lock = () => {
    const hasProfile = !!user || !!storage.getItem('user_profile')
    if (!navigator.onLine && hasProfile) {
      setIsLocked(true)
      storage.setItem('session_locked', 'true')
    }
  }

  /**
   * Attempt to unlock the session with a PIN.
   * Returns true on success, false on wrong PIN.
   * If online, always unlocks immediately.
   */
  const unlock = async (pin: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setIsLocked(false)
      storage.removeItem('session_locked')
      return true
    }
    const valid = await verifyOfflinePin(pin)
    if (valid) {
      setIsLocked(false)
      storage.removeItem('session_locked')
    }
    return valid
  }

  const refreshUser = async () => {
    try {
      const res = await authApi.me()
      if (res.success && res.data) {
        setUser(res.data)
        storage.setItem('user_profile', JSON.stringify(res.data))
        queryClient.invalidateQueries()
        return res.data
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err)
      return null
    }
  }

  /** Instantly merge a partial update into the cached user without a network call */
  const patchUser = (patch: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      storage.setItem('user_profile', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isLocked, login, logout, lock, unlock, refreshUser, patchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
