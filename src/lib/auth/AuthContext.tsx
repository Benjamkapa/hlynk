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
    return !!(token || cached)
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
    // If offline, fall back to cached profile immediately — no network calls
    if (!navigator.onLine) {
      setIsLoading(false)
      return
    }

    const token = storage.getItem('accessToken')
    const cached = storage.getItem('user_profile')

    // If unauthenticated guest (no token and no cached profile), finish immediately
    if (!token && !cached) {
      setIsLoading(false)
      return
    }

    let intervalId: ReturnType<typeof setInterval>

    const fetchUser = async () => {
      if (!navigator.onLine) return
      try {
        const res = await authApi.me()
        if (res.success && res.data) {
          setUser(res.data)
          storage.setItem('user_profile', JSON.stringify(res.data))
        }
      } catch (err: any) {
        const status = err.response?.status
        const cachedUser = storage.getItem('user_profile')

        if (status === 401) {
          // Access token expired or missing — try a silent refresh via httpOnly cookie + stored refresh token
          try {
            const { default: axios } = await import('axios')
            const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
            const storedRefreshToken = storage.getItem('refreshToken')
            const { data } = await axios.post(
              `${API_URL}/api/v1/auth/refresh`,
              { refreshToken: storedRefreshToken || undefined },
              { withCredentials: true }
            )
            const newToken = data?.data?.accessToken
            const newRefreshToken = data?.data?.refreshToken
            if (newToken) {
              storage.setItem('accessToken', newToken)
              if (newRefreshToken) storage.setItem('refreshToken', newRefreshToken)
              // Retry fetching user with the new token
              const { api } = await import('../api/client')
              const retry = await api.get('/auth/me')
              if (retry.data?.success && retry.data?.data) {
                setUser(retry.data.data)
                storage.setItem('user_profile', JSON.stringify(retry.data.data))
                return
              }
            }
          } catch (_refreshErr) {
            // Refresh token is expired or invalid — only now is the user truly logged out
          }
          // Only clear state if there's no cached profile to fall back on
          if (!cachedUser) {
            storage.removeItem('accessToken')
            storage.removeItem('refreshToken')
            storage.removeItem('user_profile')
            setUser(null)
          } else {
            console.log('[Auth] Refresh failed but cached profile exists. Preserving session.')
          }
        } else {
          // Network error or server unreachable — keep whatever we have
          console.log('[Auth] Network error or server unreachable. Preserving session.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    // Revalidate on tab focus so the token refreshes when the user returns to the tab
    const handleFocus = () => { if (navigator.onLine) fetchUser() }
    window.addEventListener('focus', handleFocus)

    // Poll every 5 minutes (instead of every 60s) to keep the session alive in the background
    if (token) {
      intervalId = setInterval(() => {
        if (navigator.onLine) fetchUser()
      }, 300000)
    }

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const login = (tokens: { accessToken: string; refreshToken?: string }, userData: AuthUser) => {
    storage.setItem('accessToken', tokens.accessToken)
    // Persist refresh token so the session survives browser restarts
    if (tokens.refreshToken) storage.setItem('refreshToken', tokens.refreshToken)
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
    storage.removeItem('refreshToken')
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
