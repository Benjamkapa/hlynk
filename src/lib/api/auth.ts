import { api } from './client'

export interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
  role: 'CUSTOMER' | 'PROVIDER' | 'SUPER_ADMIN' | 'STAFF'
  tenantId: string
  tenantSlug: string
  businessName: string
  avatar?: string
  photoUrl?: string
  phoneVerified: boolean
  subscription?: {
    planName: string
    status: string
    trialEndDate: string
    endDate?: string
  }
  hasGoogleAuth?: boolean
  usesPasswordAuth?: boolean
  permissions?: string[]
}

export interface RegisterPayload {
  businessName: string
  ownerName: string
  phone: string
  email: string
  password: string
  category: string
  county: string
  location: string
  planName: 'LITE' | 'PLUS' | 'MAX'
}

export interface GoogleRegistrationPayload {
  businessName: string
  ownerName: string
  phone: string
  category: string
  county: string
  location: string
  planName: 'LITE' | 'PLUS' | 'MAX'
}

export const authApi = {
  register: (data: RegisterPayload) => api.post('/auth/register', data).then(r => r.data),
  verifyOtp: (data: { phone: string; otp: string }) => api.post('/auth/verify-otp', data).then(r => r.data),
  login: (data: { identifier: string; password: string }) => 
    api.post('/auth/login', { ...data, userAgent: navigator.userAgent }).then(r => r.data),
  googleAuth: (data: { credential: string; registration?: GoogleRegistrationPayload }) =>
    api.post('/auth/google', { ...data, userAgent: navigator.userAgent }).then(r => r.data),
  forgotPassword: (data: { phone: string }) => api.post('/auth/forgot-password', data).then(r => r.data),
  resetPassword: (data: { phone: string; otp: string; newPassword: string }) => api.post('/auth/reset-password', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me: (): Promise<{ success: boolean; data: AuthUser }> => api.get('/auth/me').then(r => r.data),
}
