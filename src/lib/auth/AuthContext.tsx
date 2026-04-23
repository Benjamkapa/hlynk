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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    setUser(userData)
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    queryClient.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await authApi.me()
    setUser(res.data)
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
