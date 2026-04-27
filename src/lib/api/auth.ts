import { api } from './client'

export interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
  role: 'CUSTOMER' | 'PROVIDER' | 'SUPER_ADMIN'
  tenantId: string
  tenantSlug: string
  businessName: string
  avatar?: string
  phoneVerified: boolean
  subscription?: {
    planName: string
    status: string
    trialEndDate: string
    endDate?: string
  }
}

export const authApi = {
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  verifyOtp: (data: { phone: string; otp: string }) => api.post('/auth/verify-otp', data).then(r => r.data),
  login: (data: { phone: string; password: string }) => api.post('/auth/login', data).then(r => r.data),
  forgotPassword: (data: { phone: string }) => api.post('/auth/forgot-password', data).then(r => r.data),
  resetPassword: (data: { phone: string; otp: string; newPassword: string }) => api.post('/auth/reset-password', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me: (): Promise<{ success: boolean; data: AuthUser }> => api.get('/auth/me').then(r => r.data),
}
