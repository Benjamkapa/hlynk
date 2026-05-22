import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, type AuthUser } from '../api/auth'
import { queryClient } from '../query/queryClient'
import { storage } from '../utils/storage'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => void
  logout: () => Promise<void>
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
    // If we have a token but no cached user, we MUST load
    if (token && (!cached || cached === 'undefined')) return true
    // Even if we have a cached user, we might want to show loading to avoid stale gates
    // but for "speed" we usually show cached. Let's force loading ONLY if we are in the initial mount
    return !!token 
  })

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
          // If the server responded with an error (like 401), we logout
          throw new Error('Invalid session')
        }
      } catch (err: any) {
        // IMPORTANT: Only clear tokens if the error is actually an auth error
        // If it's a network error (offline), we keep the user logged in
        if (err.response?.status === 401 || err.response?.status === 403) {
          storage.removeItem('accessToken')
          storage.removeItem('refreshToken')
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
      // Initial fetch attempt
      fetchUser()
      
      // Periodically refresh, but only if online
      const intervalId = setInterval(() => {
        if (navigator.onLine) fetchUser()
      }, 30000) // Increase interval to 30s to save battery/data

      return () => clearInterval(intervalId)
    }

    setIsLoading(false)
  }, [])

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('refreshToken', tokens.refreshToken)
    storage.setItem('user_profile', JSON.stringify(userData))
    // Clear all queries to ensure no stale data from a previous session remains
    queryClient.clear()
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }

    storage.removeItem('accessToken')
    storage.removeItem('refreshToken')
    storage.removeItem('user_profile')
    queryClient.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await authApi.me()
      if (res.success && res.data) {
        setUser(res.data)
        storage.setItem('user_profile', JSON.stringify(res.data))
        // Force re-fetch of all subscription-dependent queries
        queryClient.invalidateQueries()
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
