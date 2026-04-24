import { api } from './client'

export const providersApi = {
  getMyProfile: () => api.get('/providers/me').then(r => r.data),
  updateProfile: (data: any) => api.put('/providers/me', data).then(r => r.data),
  getStats: () => api.get('/providers/stats').then(r => r.data),
  uploadPhoto: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/providers/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

export const servicesApi = {
  list: () => api.get('/services').then(r => r.data),
  create: (data: any) => api.post('/services', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/services/${id}`).then(r => r.data),
}

export const requestsApi = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/requests', { params }).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/requests/${id}/status`, { status }).then(r => r.data),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getTenants: (params?: { page?: number; search?: string; limit?: number }) =>
    api.get('/admin/tenants', { params }).then(r => r.data),
  suspendTenant: (id: string) => api.put(`/admin/tenants/${id}/suspend`).then(r => r.data),
  activateTenant: (id: string) => api.put(`/admin/tenants/${id}/activate`).then(r => r.data),
  upgradePlan: (id: string, planName: string) =>
    api.put(`/admin/tenants/${id}/upgrade`, { planName }).then(r => r.data),
}
