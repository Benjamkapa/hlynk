import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, type AuthUser } from '../api/auth'
import { queryClient } from '../query/queryClient'
import { storage } from '../utils/storage'
import { verifyOfflinePin, clearOfflinePin } from '../offline/offlinePin'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isLocked: boolean
  login: (tokens: { accessToken: string; refreshToken?: string }, user: AuthUser) => void
  logout: (opts?: { force?: boolean }) => Promise<void>
  lock: () => void
  unlock: (pin: string) => Promise<boolean>
  refreshUser: () => Promise<void>
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
  const [isLocked, setIsLocked] = useState(() => storage.getItem('session_locked') === 'true')

  useEffect(() => {
    const token = storage.getItem('accessToken')

    const fetchUser = async () => {
      // If we are offline, don't even try to reach the server, just keep using cached profile
      if (!navigator.onLine && user) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authApi.me()
        if (res.success && res.data) {
          setUser(res.data)
          storage.setItem('user_profile', JSON.stringify(res.data))
        } else {
          throw new Error('Invalid session')
        }
      } catch (err: any) {
        // Only clear tokens if the error is actually an auth error
        if (err.response?.status === 401 || err.response?.status === 403) {
          storage.removeItem('accessToken')
          storage.removeItem('user_profile')
          setUser(null)
        } else {
          console.log('[Auth] Network error or server unreachable. Preserving offline session.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUser()

      const intervalId = setInterval(() => {
        if (navigator.onLine) fetchUser()
      }, 30000)

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
  }

  /**
   * Logout with offline-awareness.
   * - When ONLINE: full logout — clears all tokens, session and PIN.
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

    clearOfflinePin()
    storage.removeItem('accessToken')
    storage.removeItem('user_profile')
    storage.removeItem('session_locked')
    queryClient.clear()
    setIsLocked(false)
    setUser(null)
  }

  /** Lock the screen without ending the session */
  const lock = () => {
    setIsLocked(true)
    storage.setItem('session_locked', 'true')
  }

  /**
   * Attempt to unlock the session with a PIN.
   * Returns true on success, false on wrong PIN.
   */
  const unlock = async (pin: string): Promise<boolean> => {
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
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isLocked, login, logout, lock, unlock, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
