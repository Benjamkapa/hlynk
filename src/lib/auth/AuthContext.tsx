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
    const cached = storage.getItem('user_profile')
    return cached ? JSON.parse(cached) : null
  })
  const [isLoading, setIsLoading] = useState(!storage.getItem('user_profile'))

  useEffect(() => {
    const token = storage.getItem('accessToken')

    const fetchUser = async () => {
      try {
        const res = await authApi.me()
        setUser(res.data)
        storage.setItem('user_profile', JSON.stringify(res.data))
      } catch {
        storage.removeItem('accessToken')
        storage.removeItem('refreshToken')
        storage.removeItem('user_profile')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUser()
      const intervalId = setInterval(fetchUser, 15000)
      return () => clearInterval(intervalId)
    }

    setIsLoading(false)
  }, [])

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('refreshToken', tokens.refreshToken)
    storage.setItem('user_profile', JSON.stringify(userData))
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
    const res = await authApi.me()
    setUser(res.data)
    storage.setItem('user_profile', JSON.stringify(res.data))
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
