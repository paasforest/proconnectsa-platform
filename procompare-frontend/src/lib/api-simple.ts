// Simple API client to replace @/lib/api during deployment
// This provides the same interface but with minimal functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'

export class SimpleApiClient {
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as any)['Authorization'] = `Token ${this.token}`
    }

    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`)
        // Attach response data to error for better error handling
        ;(error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: data
        }
        throw error
      }

      return data as T
    } catch (error) {
      throw error
    }
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

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
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
    return this.request('/api/auth/leads/categories/')
  }

  async createLead(leadData: any) {
    return this.request('/api/leads/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  }

  async createPublicLead(leadData: any) {
    // Map the leadData to Django backend format with correct field values
    const djangoData = {
      service_category_id: leadData.service_category_id || 1,
      title: leadData.title || leadData.project_title || 'Service Request',
      description: leadData.description || leadData.project_description || 'Service description',
      location_address: leadData.location_address || leadData.location || 'Address not provided',
      location_suburb: leadData.location_suburb || 'Suburb not specified',
      location_city: leadData.location_city || 'Cape Town',
      latitude: leadData.latitude || null,
      longitude: leadData.longitude || null,
      budget_range: leadData.budget_range || '1000_5000',
      urgency: leadData.urgency || 'flexible',
      preferred_contact_time: leadData.preferred_contact_time || 'morning',
      additional_requirements: leadData.additional_requirements || '',
      hiring_intent: leadData.hiring_intent || 'ready_to_hire',
      hiring_timeline: leadData.hiring_timeline || 'asap',
      research_purpose: leadData.research_purpose || '',
      source: leadData.source || 'website',
      client_name: leadData.client_name || leadData.contact_name || 'Anonymous Client',
      client_email: leadData.client_email || leadData.contact_email || 'client@example.com',
      client_phone: leadData.client_phone || leadData.contact_phone || '+27123456789'
    };

    console.log('🚀 Creating lead via Django backend:', djangoData);

    // Call Django backend directly
    return this.request('/api/leads/create-public/', {
      method: 'POST',
      body: JSON.stringify(djangoData),
    });
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
    return this.request('/api/notifications/')
  }

  async markNotificationRead(id: string) {
    return this.request(`/api/notifications/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    })
  }

  // Payment endpoints
  async getCreditBalance() {
    return this.request('/api/wallet/')
  }

  async getTransactions() {
    return this.request('/api/wallet/transactions/')
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

export const apiClient = new SimpleApiClient()
