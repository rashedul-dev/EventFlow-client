// API Configuration and Utilities for EventFlow

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Token management
export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  }
}

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }
}

// Base fetch function with auth
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAccessToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "An error occurred")
    }

    return data
  } catch (error) {
    throw error
  }
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ accessToken: string; refreshToken: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetchApi("/auth/logout", { method: "POST" }),

  getMe: () => fetchApi<any>("/auth/me"),

  forgotPassword: (email: string) =>
    fetchApi("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; password: string }) =>
    fetchApi("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
}

// User API
export const userApi = {
  getProfile: () => fetchApi<any>("/users/profile"),

  updateProfile: (data: any) => fetchApi("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),

  becomeOrganizer: (data: any) => fetchApi("/users/become-organizer", { method: "POST", body: JSON.stringify(data) }),

  getOrganizers: () => fetchApi<any[]>("/users/organizers"),

  getOrganizerById: (id: string) => fetchApi<any>(`/users/organizers/${id}`),
}

// Event API
export const eventApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    category?: string
    city?: string
    status?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/events?${searchParams.toString()}`)
  },

  getBySlug: (slug: string) => fetchApi<any>(`/events/slug/${slug}`),

  getById: (id: string) => fetchApi<any>(`/events/${id}`),

  getMyEvents: () => fetchApi<any[]>("/events/my-events"),

  create: (data: any) => fetchApi("/events", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: any) => fetchApi(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/events/${id}`, { method: "DELETE" }),

  submitForApproval: (id: string) => fetchApi(`/events/${id}/submit`, { method: "POST" }),

  cancel: (id: string) => fetchApi(`/events/${id}/cancel`, { method: "POST" }),

  getSeatingChart: (id: string) => fetchApi<any>(`/events/${id}/seating-chart`),

  getAvailableSeats: (id: string) => fetchApi<any[]>(`/events/${id}/seats/available`),

  joinWaitlist: (id: string, data: { email: string; name?: string; quantity?: number }) =>
    fetchApi(`/events/${id}/waitlist`, { method: "POST", body: JSON.stringify(data) }),

  getAnalytics: (id: string) => fetchApi<any>(`/events/${id}/analytics`),
}

// Ticket API
export const ticketApi = {
  getMyTickets: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/tickets/my-tickets?${searchParams.toString()}`)
  },

  purchase: (data: { eventId: string; tickets: { ticketTypeId: string; quantity: number }[] }) =>
    fetchApi("/tickets/purchase", { method: "POST", body: JSON.stringify(data) }),

  getById: (id: string) => fetchApi<any>(`/tickets/${id}`),

  transfer: (id: string, data: { email: string; name: string }) =>
    fetchApi(`/tickets/${id}/transfer`, { method: "POST", body: JSON.stringify(data) }),

  cancel: (id: string, reason?: string) =>
    fetchApi(`/tickets/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),

  validate: (data: { ticketNumber?: string; qrCode?: string }) =>
    fetchApi("/tickets/validate", { method: "POST", body: JSON.stringify(data) }),

  getEventTickets: (eventId: string, params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/tickets/event/${eventId}?${searchParams.toString()}`)
  },

  checkIn: (eventId: string, data: { ticketNumber?: string; qrCode?: string }) =>
    fetchApi(`/tickets/event/${eventId}/check-in`, { method: "POST", body: JSON.stringify(data) }),
}

// Payment API
export const paymentApi = {
  getMyPayments: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/payments/my-payments?${searchParams.toString()}`)
  },

  createPaymentIntent: (data: { eventId: string; ticketTypeId: string; quantity: number }) =>
    fetchApi<{ clientSecret: string; paymentIntentId: string }>("/payments/intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirmPayment: (data: { paymentIntentId: string }) =>
    fetchApi("/payments/confirm", { method: "POST", body: JSON.stringify(data) }),

  getById: (id: string) => fetchApi<any>(`/payments/${id}`),

  refund: (id: string, data: { amount?: number; reason: string }) =>
    fetchApi(`/payments/${id}/refund`, { method: "POST", body: JSON.stringify(data) }),
}

// Analytics API
export const analyticsApi = {
  getOrganizer: (params?: { startDate?: string; endDate?: string; eventId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any>(`/analytics/organizer?${searchParams.toString()}`)
  },

  getPlatform: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any>(`/analytics/platform?${searchParams.toString()}`)
  },

  export: (params: { format: "csv" | "pdf" | "xlsx"; type: string }) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    return fetchApi<any>(`/analytics/export?${searchParams.toString()}`)
  },
}

// Notification API
export const notificationApi = {
  getAll: (params?: { type?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/notifications?${searchParams.toString()}`)
  },

  markAsRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: "POST" }),

  markAllAsRead: () => fetchApi("/notifications/read-all", { method: "POST" }),

  delete: (id: string) => fetchApi(`/notifications/${id}`, { method: "DELETE" }),

  getPreferences: () => fetchApi<any>("/notifications/preferences"),

  updatePreferences: (data: any) =>
    fetchApi("/notifications/preferences", { method: "PUT", body: JSON.stringify(data) }),
}

// Admin API
export const adminApi = {
  getPendingEvents: () => fetchApi<any[]>("/admin/events/pending"),

  verifyEvent: (id: string, data: { approved: boolean; reason?: string }) =>
    fetchApi(`/admin/events/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),

  getVerificationStats: () => fetchApi<any>("/admin/events/verification-stats"),

  getAllUsers: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any[]>(`/admin/users?${searchParams.toString()}`)
  },

  manageUser: (id: string, data: { action: string; reason?: string }) =>
    fetchApi(`/admin/users/${id}/manage`, { method: "POST", body: JSON.stringify(data) }),

  getUserStatistics: () => fetchApi<any>("/admin/users/statistics"),

  getPlatformAnalytics: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any>(`/admin/analytics?${searchParams.toString()}`)
  },

  getCommissionReport: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return fetchApi<any>(`/admin/reports/commission?${searchParams.toString()}`)
  },
}

export const api = {
  auth: authApi,
  users: userApi,
  events: eventApi,
  tickets: ticketApi,
  payments: paymentApi,
  analytics: analyticsApi,
  notifications: notificationApi,
  admin: adminApi,
}
