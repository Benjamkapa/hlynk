/// <reference types="vite/client" />
import axios from 'axios'
import { queryClient } from '../query/queryClient'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ─── Request Interceptor — attach access token ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response Interceptor — handle 401 / token refresh ───────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
          { refreshToken },
        )

        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        // Refresh failed — log out
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        queryClient.clear()
        window.location.href = '/login'
      }
    }

    // Handle Subscription Expiry
    if (error.response?.status === 403 && error.response.data?.code === 'SUBSCRIPTION_EXPIRED') {
      const isSubscriptionPage = window.location.pathname.includes('/dashboard/subscription')
      if (!isSubscriptionPage) {
        window.location.href = '/dashboard/subscription?expired=true'
      }
    }

    return Promise.reject(error)
  },
)
