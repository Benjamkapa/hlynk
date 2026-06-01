import { api } from './client'

export const providersApi = {
  getMyProfile: () => api.get('/providers/me').then(r => r.data),
  updateProfile: (data: any) => api.put('/providers/me', data).then(r => r.data),
  updateSettings: (data: any) => api.put('/providers/me/settings', data).then(r => r.data),
  changePassword: (data: any) => api.post('/providers/me/security/password', data).then(r => r.data),
  deactivateAccount: () => api.post('/providers/me/security/deactivate').then(r => r.data),
  clearData: () => api.post('/providers/me/clear-data').then(r => r.data),
  getActivityLogs: (params?: { page?: number; limit?: number }) => api.get('/providers/me/activity', { params }).then(r => r.data),
  getStats: () => api.get('/providers/stats').then(r => r.data),
  getStaff: () => api.get('/staff').then(r => r.data),
  createStaff: (data: any) => api.post('/staff', data).then(r => r.data),
  updateStaff: (id: string, data: any) => api.put(`/staff/${id}`, data).then(r => r.data),
  deleteStaff: (id: string) => api.delete(`/staff/${id}`).then(r => r.data),
  uploadPhoto: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/providers/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
  submitReview: (data: { rating: number, reviewText: string }) => api.post('/platform/reviews', data).then(r => r.data),
  getReviews: () => api.get('/providers/reviews').then(r => r.data),
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
  list: (params?: { customerId?: string; page?: number; search?: string; date?: string; status?: string; limit?: number; sortBy?: string; sortOrder?: string; includeStats?: boolean }) => api.get('/sales', { params }).then(r => r.data),
  create: (data: any) => api.post('/sales', data).then(r => r.data),
  getDetails: (id: string) => api.get(`/sales/${id}`).then(r => r.data),
  vendorMpesaPush: (data: { phone: string; amount: number; reference: string; saleId?: string; customerName?: string }) => api.post('/sales/mpesa-push', data).then(r => r.data),
}

export const subscriptionsApi = {
  getMe: () => api.get('/subscriptions/me').then(r => r.data),
  getBillingHistory: (params?: { page?: number; limit?: number; status?: string; plan?: string; sortBy?: string; sortOrder?: string }) => api.get('/subscriptions/history', { params }).then(r => r.data),
  renew: (phone: string) => api.post('/subscriptions/renew', { phone }).then(r => r.data),
  changePlan: (planName: string, phone: string) => api.post('/subscriptions/change-plan', { planName, phone }).then(r => r.data),
  verify: (paymentId: string) => api.get(`/subscriptions/verify/${paymentId}`).then(r => r.data),
  submitManualPayment: (data: { planName: string, mpesaCode: string, amount?: number, phone?: string }) => api.post('/subscriptions/manual', data).then(r => r.data),
  getPayouts: () => api.get('/subscriptions/payouts').then(r => r.data),
  applyPromoCode: (code: string) => api.post('/subscriptions/promo/apply', { code }).then(r => r.data),
}

export const inventoryApi = {
  list: (params?: { page?: number; search?: string; category?: string; limit?: number; sortBy?: string; sortOrder?: string; includeStats?: boolean }) => api.get('/inventory', { params }).then(r => r.data),
  create: (data: any) => api.post('/inventory', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data).then(r => r.data),
  adjustStock: (id: string, quantity: number, reason: string) => api.post(`/inventory/${id}/adjust`, { quantity, reason }).then(r => r.data),
  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/inventory/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
  delete: (id: string) => api.delete(`/inventory/${id}`).then(r => r.data),
}

export const expensesApi = {
  list: (params?: { page?: number; search?: string; category?: string; limit?: number; sortBy?: string; sortOrder?: string }) => api.get('/expenses', { params }).then(r => r.data),
  create: (data: any) => api.post('/expenses', data).then(r => r.data),
  getById: (id: string) => api.get(`/expenses/${id}`).then(r => r.data.data),
  delete: (id: string) => api.delete(`/expenses/${id}`).then(r => r.data),
}

export const customersApi = {
  list: (params?: { page?: number; search?: string; limit?: number; sortBy?: string; sortOrder?: string }) => api.get('/customers', { params }).then(r => r.data),
  create: (data: any) => api.post('/customers', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then(r => r.data),
  getSales: (id: string) => api.get('/sales', { params: { customerId: id } }).then(r => r.data),
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
  getMpesaLogs: (params?: { page?: number; limit?: number; sortOrder?: string }) =>
    api.get('/payments/mpesa/logs', { params }).then(r => r.data),
}

export const adminApi = {
  getStats: (timeframe?: string) => api.get('/admin/stats', { params: { timeframe } }).then(r => r.data),
  getHealth: () => api.get('/admin/health').then(r => r.data),
  getSystemHealth: () => api.get('/admin/health').then(r => r.data),
  getTenants: (params?: { page?: number; search?: string; status?: string; planName?: string; limit?: number }) =>
    api.get('/admin/tenants', { params }).then(r => r.data),
  suspendTenant: (id: string) => api.put(`/admin/tenants/${id}/suspend`).then(r => r.data),
  activateTenant: (id: string) => api.put(`/admin/tenants/${id}/activate`).then(r => r.data),
  upgradePlan: (id: string, planName: string) =>
    api.put(`/admin/tenants/${id}/upgrade`, { planName }).then(r => r.data),
  createTenant: (data: any) => api.post('/admin/tenants', data).then(r => r.data),
  getUsers: (params?: { page?: number; search?: string; role?: string; limit?: number }) => api.get('/admin/users', { params }).then(r => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then(r => r.data),
  getSubscriptions: (params?: { page?: number; search?: string; status?: string; planName?: string; limit?: number }) => api.get('/admin/subscriptions', { params }).then(r => r.data),
  updateTenant: (id: string, data: any) => api.put(`/admin/tenants/${id}`, data).then(r => r.data),
  getSessions: () => api.get('/admin/sessions').then(r => r.data),
  terminateSession: (id: string) => api.put(`/admin/sessions/${id}/terminate`).then(r => r.data),
  getUserActivity: (userId: string) => api.get(`/admin/users/${userId}/activity`).then(r => r.data),
  impersonateUser: (userId: string) => api.post(`/admin/users/${userId}/impersonate`).then(r => r.data),
  deleteTenant: (id: string) => api.delete(`/admin/tenants/${id}`).then(r => r.data),
  resolveAllTickets: () => api.post('/admin/support/resolve-all').then(r => r.data),
  restartCluster: () => api.post('/admin/system/restart').then(r => r.data),
  getSystemEvents: (params?: any) => api.get('/admin/system-events', { params }).then(r => r.data),
  pruneSystemEvents: (days: number) => api.post('/admin/system-events/prune', { days }).then(r => r.data),
  runReportQuery: (data: any) => api.post('/admin/reports/query', data).then(r => r.data),
  getSchedules: () => api.get('/admin/schedules').then(r => r.data),
  getSettings: () => api.get('/admin/settings').then(r => r.data),
  updateSettings: (data: any) => api.put('/admin/settings', data).then(r => r.data),
  getActivityLogs: (params?: { page?: number; limit?: number; search?: string; category?: string }) => api.get('/admin/activity', { params }).then(r => r.data),
  getTransactions: (params?: { page?: number; limit?: number; status?: string; method?: string; search?: string; type?: string }) => api.get('/admin/transactions', { params }).then(r => r.data),
  getTransactionDetail: (id: string) => api.get(`/admin/transactions/${id}`).then(r => r.data),
  updateProfile: (data: any) => api.put('/admin/me', data).then(r => r.data),
  uploadPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post('/admin/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  },
  generatePromoCode: (data: { planName: string, durationDays: number, maxUses?: number, assignedPhone?: string }) =>
    api.post('/subscriptions/promo/generate', data).then(r => r.data),
  getReviews: (params?: { page?: number; limit?: number; status?: number }) => api.get('/admin/reviews', { params }).then(r => r.data),
  updateReviewStatus: (id: string, status: number) => api.patch(`/admin/reviews/${id}`, { status }).then(r => r.data),
  getPayouts: () => api.get('/admin/payouts').then(r => r.data),
  markPayoutPaid: (tenantId: string) => api.post(`/admin/payouts/${tenantId}/mark-paid`).then(r => r.data),
}

