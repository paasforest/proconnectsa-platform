import { handleApiError, ApiError } from './error-handler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {}

    // Copy existing headers
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers)
      }
    }

    // Only set Content-Type for requests with body
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }
      
      const error = new Error(errorData.message || `API Error: ${response.status}`)
      ;(error as any).response = { status: response.status, data: errorData }
      throw error
    }

    return response.json()
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/api/auth/logout/', {
      method: 'POST',
    })
  }

  // Lead endpoints
  async getServiceCategories() {
    return this.request('/api/leads/categories/')
  }

  async createLead(leadData: any) {
    return this.request('/api/leads/create/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  }

  async createPublicLead(leadData: any) {
    return this.request('/api/leads/create-public/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  }

  async getLeads(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/api/leads/${queryString}`)
  }

  async getLead(id: string) {
    return this.request(`/api/leads/${id}/`)
  }

  async getAvailableLeads(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/api/leads/wallet/available/${queryString}`)
  }

  async verifyLeadSMS(leadId: string, verificationCode: string) {
    return this.request(`/api/leads/${leadId}/verify-sms/`, {
      method: 'POST',
      body: JSON.stringify({ verification_code: verificationCode }),
    })
  }

  async getLeadAssignments(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/api/leads/assignments/${queryString}`)
  }

  async updateLeadAssignment(assignmentId: string, data: any) {
    return this.request(`/api/leads/assignments/${assignmentId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Provider endpoints
  async getProviderProfile() {
    return this.request('/api/auth/provider-profile/')
  }

  async updateProviderProfile(data: any) {
    return this.request('/api/auth/provider-profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/api/notifications/')
  }

  async getNotificationCount() {
    return this.request('/api/notifications/count/')
  }

  async markNotificationRead(id: string) {
    return this.request(`/api/notifications/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    })
  }

  // Payment endpoints
  async getCreditBalance() {
    return this.request('/api/payments/balance/')
  }

  async getTransactions() {
    return this.request('/api/payments/transactions/')
  }

  async purchaseCredits(amount: number, paymentMethod: string, paymentReference?: string) {
    return this.request('/api/payments/purchase/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference || '',
      }),
    })
  }

  // Manual deposit endpoints
  async createManualDeposit(amount: number, creditsToActivate: number) {
    return this.request('/api/payments/manual-deposits/create/', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        credits_to_activate: creditsToActivate,
      }),
    })
  }

  async getManualDeposits() {
    return this.request('/api/payments/manual-deposits/')
  }

  async getManualDeposit(id: string) {
    return this.request(`/api/payments/manual-deposits/${id}/`)
  }

  async uploadDepositSlip(depositId: string, file: File) {
    const formData = new FormData()
    formData.append('deposit_slip', file)
    
    return this.request(`/api/payments/manual-deposits/${depositId}/upload-slip/`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    })
  }

  // Lead Visibility endpoints
  async getLeadVisibility(leadId: string) {
    return this.request(`/api/leads/${leadId}/visibility/`)
  }

  async purchaseLeadAccess(leadId: string, creditCost: number, paymentMethod: string) {
    return this.request(`/api/leads/${leadId}/purchase-access/`, {
      method: 'POST',
      body: JSON.stringify({
        credit_cost: creditCost,
        payment_method: paymentMethod
      }),
    })
  }

  // Subscription endpoints
  async getSubscriptionPlans() {
    return this.request('/api/subscriptions/plans/')
  }

  async upgradeSubscription(planId: string) {
    return this.request('/api/subscriptions/upgrade/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    })
  }
}

export const apiClient = new ApiClient()





