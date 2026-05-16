/// <reference types="vite/client" />
import axios from 'axios'
import { queryClient } from '../query/queryClient'
import { storage } from '../utils/storage'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // Increased from 10s to 60s to accommodate slow M-Pesa STK Push API responses
})

api.interceptors.request.use((config) => {
  const token = storage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = storage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
          { refreshToken },
        )

        const newToken = data.data.accessToken
        storage.setItem('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        storage.removeItem('accessToken')
        storage.removeItem('refreshToken')
        storage.removeItem('user_profile')
        queryClient.clear()
        window.location.href = '/login'
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
