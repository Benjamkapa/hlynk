import { api } from './client';

export interface Resource {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  code?: string;
  parentId?: string;
  basePrice: number;
  status: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UniversalEvent {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceTitle?: string;
  resourceType?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  guestName?: string;
  guestPhone?: string;
  eventType: string;
  status: string;
  startTime?: string;
  endTime?: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  payments?: any[];
}

export interface OperationTask {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceTitle?: string;
  resourceType?: string;
  opType: string;
  status: string;
  assignedToUserId?: string;
  assignedUserName?: string;
  estimatedCost: number;
  actualCost: number;
  expenseId?: string;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ─── Resources API ─────────────────────────────────────────────────────────────
export const resourcesApi = {
  getResources: async (params?: { type?: string; status?: string; parentId?: string }) => {
    const res = await api.get<{ success: boolean; data: Resource[] }>('/resources', { params });
    return res.data.data;
  },

  getResourceById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Resource }>(`/resources/${id}`);
    return res.data.data;
  },

  createResource: async (data: Partial<Resource>) => {
    const res = await api.post<{ success: boolean; data: Resource }>('/resources', data);
    return res.data.data;
  },

  updateResource: async (id: string, data: Partial<Resource>) => {
    const res = await api.put<{ success: boolean; data: Resource }>(`/resources/${id}`, data);
    return res.data.data;
  },

  deleteResource: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/resources/${id}`);
    return res.data;
  }
};

// ─── Events API ────────────────────────────────────────────────────────────────
export const eventsApi = {
  getEvents: async (params?: {
    eventType?: string;
    status?: string;
    resourceId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await api.get<{ success: boolean; data: UniversalEvent[] }>('/events', { params });
    return res.data.data;
  },

  getEventById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: UniversalEvent }>(`/events/${id}`);
    return res.data.data;
  },

  createEvent: async (data: Partial<UniversalEvent> & { guestName?: string; guestPhone?: string; paymentMethod?: string }) => {
    const res = await api.post<{ success: boolean; data: UniversalEvent }>('/events', data);
    return res.data.data;
  },

  recordPayment: async (id: string, data: { amount: number; paymentMethod?: string; notes?: string }) => {
    const res = await api.post<{ success: boolean; data: { paidAmount: number; balance: number } }>(`/events/${id}/payments`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<{ success: boolean; message: string }>(`/events/${id}/status`, { status });
    return res.data;
  },

  deleteEvent: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/events/${id}`);
    return res.data;
  }
};

// ─── Operations API ─────────────────────────────────────────────────────────────
export const operationsApi = {
  getOperations: async (params?: { opType?: string; status?: string; resourceId?: string }) => {
    const res = await api.get<{ success: boolean; data: OperationTask[] }>('/operations', { params });
    return res.data.data;
  },

  getOperationById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: OperationTask }>(`/operations/${id}`);
    return res.data.data;
  },

  createOperation: async (data: Partial<OperationTask> & { title?: string }) => {
    const res = await api.post<{ success: boolean; data: OperationTask }>('/operations', data);
    return res.data.data;
  },

  updateOperation: async (id: string, data: Partial<OperationTask>) => {
    const res = await api.put<{ success: boolean; data: any }>(`/operations/${id}`, data);
    return res.data.data;
  },

  deleteOperation: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/operations/${id}`);
    return res.data;
  }
};
