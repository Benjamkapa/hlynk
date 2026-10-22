/// <reference types="vite/client" />
import axios from 'axios'
import { queryClient } from '../query/queryClient'
import { storage } from '../utils/storage'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, 
  withCredentials: true, // required for httpOnly cookies
})

api.interceptors.request.use((config) => {
  const token = storage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function onRefreshFailed() {
  refreshSubscribers = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      // Queue concurrent 401 requests while refresh is in-flight
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true

      try {
        const storedRefreshToken = storage.getItem('refreshToken')
        const { data } = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken || undefined },
          { withCredentials: true }
        )

        const newToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken

        storage.setItem('accessToken', newToken)
        if (newRefreshToken) {
          storage.setItem('refreshToken', newRefreshToken)
        }

        original.headers.Authorization = `Bearer ${newToken}`
        onRefreshed(newToken)
        return api(original)
      } catch (err: any) {
        onRefreshFailed()

        // If device is offline or network error, retain session
        if (!navigator.onLine || !err.response) {
          console.log('[API Client] Offline or network error during refresh. Retaining session.')
          return Promise.reject(error)
        }

        // Only clear if server explicitly rejected the refresh token
        if (err.response?.status === 401 || err.response?.status === 403) {
          storage.removeItem('accessToken')
          storage.removeItem('refreshToken')
          storage.removeItem('user_profile')
          queryClient.clear()

          // Only redirect to /login if not already on an auth or public page to prevent infinite reload loops
          const currentPath = window.location.pathname
          const isAuthOrPublicPage = 
            currentPath === '/login' || 
            currentPath === '/register' || 
            currentPath === '/forgot-password' || 
            currentPath === '/reset-password' || 
            currentPath === '/' || 
            currentPath.startsWith('/stay') ||
            currentPath.startsWith('/shop') ||
            currentPath.startsWith('/store')

          if (!isAuthOrPublicPage) {
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 403 && error.response.data?.code === 'SUBSCRIPTION_EXPIRED') {
      const isSubscriptionPage = window.location.pathname.includes('/dashboard/subscription')
      if (!isSubscriptionPage) {
        window.location.href = '/dashboard/subscription?expired=true'
      }
    }

    return Promise.reject(error)
  },
)
