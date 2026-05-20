import { api } from './client'

export interface PlatformReview {
  id: string
  userId: string
  tenantId: string
  name: string
  businessName: string
  role: string
  rating: number
  comment: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface PlatformReviewsResponse {
  success: boolean
  items: PlatformReview[]
  summary: {
    averageRating: number
    totalReviews: number
  }
}

export const platformApi = {
  getReviews: (params?: { limit?: number }) =>
    api.get('/platform/reviews', { params }).then((r) => r.data as PlatformReviewsResponse),
  getMyReview: () =>
    api.get('/platform/reviews/me').then((r) => r.data as { success: boolean; data: PlatformReview | null }),
  submitReview: (data: { rating: number; comment: string }) =>
    api.post('/platform/reviews', data).then((r) => r.data as { success: boolean; data: PlatformReview }),
  getStats: () =>
    api.get('/platform/stats').then((r) => r.data as { success: boolean; data: { totalBusinesses: number; averageRating: number; totalReviews: number } }),
  
  // --- Notifications ---
  getNotifications: () =>
    api.get('/platform/notifications').then((r) => r.data as { success: boolean; data: any[] }),
  markAsRead: (id: string) =>
    api.patch(`/platform/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () =>
    api.post('/platform/notifications/read-all').then((r) => r.data),
  deleteAllNotifications: () =>
    api.delete('/platform/notifications').then((r) => r.data),
}
