import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, type AuthUser } from '../api/auth'
import { queryClient } from '../query/queryClient'

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
    const cached = localStorage.getItem('user_profile')
    return cached ? JSON.parse(cached) : null
  })
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('user_profile'))

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    
    const fetchUser = async () => {
      try {
        const res = await authApi.me()
        setUser(res.data)
        localStorage.setItem('user_profile', JSON.stringify(res.data))
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_profile')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUser()
      // Global polling to keep subscription and user state in sync
      const intervalId = setInterval(fetchUser, 15000)
      return () => clearInterval(intervalId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('user_profile', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user_profile')
    queryClient.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await authApi.me()
    setUser(res.data)
    localStorage.setItem('user_profile', JSON.stringify(res.data))
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
