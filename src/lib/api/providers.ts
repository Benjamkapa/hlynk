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
  // Inventory aliases
  getProducts: (params?: any) => inventoryApi.list(params),
  updateProduct: (id: string, data: any) => inventoryApi.update(id, data),
  deleteProduct: (id: string) => inventoryApi.delete(id),
  getRestockHistory: (params?: any) => api.get('/inventory/restock/history', { params }).then(r => r.data),
  // Expense aliases
  getExpenses: (params?: any) => expensesApi.list(params),
  createExpense: (data: any) => expensesApi.create(data),
  deleteExpense: (id: string) => expensesApi.delete(id),
  getSales: (params?: any) => salesApi.list(params),
  getCustomers: (params?: any) => customersApi.list(params),
  getServices: () => servicesApi.list(),
  getRequests: (params?: any) => requestsApi.list(params),
}

export const salesApi = {
  list: (params?: { page?: number; search?: string; limit?: number }) => api.get('/sales', { params }).then(r => r.data),
  create: (data: any) => api.post('/sales', data).then(r => r.data),
  getDetails: (id: string) => api.get(`/sales/${id}`).then(r => r.data),
}

export const inventoryApi = {
  list: (params?: { page?: number; search?: string; category?: string; limit?: number }) => api.get('/inventory', { params }).then(r => r.data),
  create: (data: any) => api.post('/inventory', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data).then(r => r.data),
  adjustStock: (id: string, quantity: number, reason: string) => api.post(`/inventory/${id}/adjust`, { quantity, reason }).then(r => r.data),
  delete: (id: string) => api.delete(`/inventory/${id}`).then(r => r.data),
}

export const expensesApi = {
  list: (params?: { page?: number; search?: string; category?: string; limit?: number }) => api.get('/expenses', { params }).then(r => r.data),
  create: (data: any) => api.post('/expenses', data).then(r => r.data),
  delete: (id: string) => api.delete(`/expenses/${id}`).then(r => r.data),
}

export const customersApi = {
  list: (params?: { page?: number; search?: string }) => api.get('/customers', { params }).then(r => r.data),
  create: (data: any) => api.post('/customers', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(r => r.data),
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

export const paymentsApi = {
  stkPush: (data: { phone: string; amount: number; reference: string }) => 
    api.post('/payments/mpesa/stk-push', data).then(r => r.data),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getTenants: (params?: { page?: number; search?: string; limit?: number }) =>
    api.get('/admin/tenants', { params }).then(r => r.data),
  suspendTenant: (id: string) => api.put(`/admin/tenants/${id}/suspend`).then(r => r.data),
  activateTenant: (id: string) => api.put(`/admin/tenants/${id}/activate`).then(r => r.data),
  upgradePlan: (id: string, planName: string) =>
    api.put(`/admin/tenants/${id}/upgrade`, { planName }).then(r => r.data),
  createTenant: (data: any) => api.post('/admin/tenants', data).then(r => r.data),
  getSystemHealth: () => api.get('/admin/system-health').then(r => r.data),
}
