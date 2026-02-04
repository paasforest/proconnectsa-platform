// Simple API client to replace @/lib/api during deployment
// This provides the same interface but with minimal functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'

type ServiceCategory = { id: number; slug: string; name: string }

let _serviceCategoriesPromise: Promise<ServiceCategory[]> | null = null

async function fetchServiceCategories(baseURL: string): Promise<ServiceCategory[]> {
  if (_serviceCategoriesPromise) return _serviceCategoriesPromise

  _serviceCategoriesPromise = (async () => {
    const res = await fetch(`${baseURL}/api/leads/categories/`, { method: 'GET' })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
    return items
      .filter((c: any) => c && c.id && c.slug)
      .map((c: any) => ({ id: Number(c.id), slug: String(c.slug), name: String(c.name || c.slug) }))
  })()

  return _serviceCategoriesPromise
}

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
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const headers: HeadersInit = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    }

    if (this.token) {
      (headers as any)['Authorization'] = `Token ${this.token}`
    }

    // Add API key for public endpoints
    if (endpoint.includes('/create-public/') || endpoint.includes('/leads/create-public/')) {
      (headers as any)['X-API-Key'] = 'proconnectsa_lead_creation_2024'
    }

    const url = `${this.baseURL}${endpoint}`
    
    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body as string) : '');
      
      const response = await fetch(url, {
        ...options,
        headers,
        // Add credentials for CORS
        credentials: 'include',
      })

      // Check if response is JSON before parsing
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

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
    } catch (error: any) {
      // Enhanced error logging
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
      
      // Re-throw with more context
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
        (networkError as any).originalError = error;
        throw networkError;
      }
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
    return this.request<any>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request<any>('/api/auth/register/', {
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
    return this.request('/api/leads/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  }

  async createPublicLead(leadData: any) {
    // Resolve service category IDs dynamically from backend (production IDs vary).
    const categories = await fetchServiceCategories(this.baseURL)
    const slugToId: Record<string, number> = {}
    for (const c of categories) slugToId[c.slug] = c.id

    const normalizeSlug = (s: string) =>
      (s || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\\s-]/g, '')
        .replace(/[\\s_]+/g, '-')
        .replace(/-+/g, '-')

    const inferSlug = () => {
      // Prefer explicit slug-like inputs
      const direct = String(leadData.service_category || leadData.service_type || '').trim()
      const maybeSlug = normalizeSlug(direct)
      if (maybeSlug && slugToId[maybeSlug]) return maybeSlug

      // Common UI labels -> backend slugs
      const map: Record<string, string> = {
        plumbing: 'plumbing',
        electrical: 'electrical',
        hvac: 'hvac',
        painting: 'painting',
        roofing: 'roofing',
        flooring: 'flooring',
        landscaping: 'landscaping',
        cleaning: 'cleaning',
        automotive: 'automotive',
        handyman: 'handyman',
        renovations: 'renovations',
        renovation: 'renovations',
        pool: 'pool-maintenance',
        'pool-maintenance': 'pool-maintenance',
        appliance: 'appliance-repair',
        'appliance-repair': 'appliance-repair',
        security: 'security',
      }
      if (map[maybeSlug] && slugToId[map[maybeSlug]]) return map[maybeSlug]

      // fallback: first active category if available
      return categories[0]?.slug || ''
    }

    const providedId = Number(leadData.service_category_id) || 0
    const validIds = new Set(categories.map((c) => c.id))
    const service_category_id =
      (providedId && validIds.has(providedId) ? providedId : 0) ||
      slugToId[inferSlug()] ||
      categories[0]?.id ||
      0

    // Convert budget range format from "R500 - R1,500" to "500_1500"
    const convertBudgetRange = (budgetStr: string): string => {
      if (!budgetStr) return '1000_5000';
      
      // Extract numbers from budget string, handling commas
      const numbers = budgetStr.match(/\d+(?:,\d{3})*/g);
      
      if (numbers && numbers.length >= 2) {
        // Remove commas and parse
        const min = parseInt(numbers[0].replace(/,/g, ''));
        const max = parseInt(numbers[1].replace(/,/g, ''));
        
        console.log(`Budget conversion: "${budgetStr}" -> min: ${min}, max: ${max}`);
        
        // Map to valid choices
        if (min < 1000) return 'under_1000';
        if (min >= 1000 && max <= 5000) return '1000_5000';
        if (min >= 5000 && max <= 15000) return '5000_15000';
        if (min >= 15000 && max <= 50000) return '15000_50000';
        if (min >= 50000) return 'over_50000';
      }
      
      return '1000_5000'; // default
    };

    // Map the leadData to Django backend format with correct field values
    const djangoData = {
      service_category_id,
      title: leadData.title || leadData.project_title || 'Service Request',
      description: leadData.description || leadData.project_description || 'Service description',
      location_address: leadData.location_address || leadData.location || 'Address not provided',
      location_suburb: leadData.location_suburb || 'Suburb not specified',
      location_city: leadData.location_city || leadData.location || 'Cape Town',
      latitude: leadData.latitude || null,
      longitude: leadData.longitude || null,
      budget_range: convertBudgetRange(leadData.budget_range),
      urgency: (leadData.urgency === 'urgent' ? 'asap' : leadData.urgency) || 'flexible',
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
    return this.request<any>('/api/payments/manual-deposits/create/', {
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
    
    return this.request<any>(`/api/payments/manual-deposits/${depositId}/upload-slip/`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    })
  }

  // Verification documents (provider)
  async getVerificationDocuments() {
    return this.request<any>('/api/auth/provider-profile/documents/')
  }

  async uploadVerificationDocument(documentType: string, file: File) {
    const formData = new FormData()
    formData.append('document_type', documentType)
    formData.append('file', file)
    return this.request<any>('/api/auth/provider-profile/documents/upload/', {
      method: 'POST',
      body: formData,
    })
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData()
    // Backend expects request.FILES['image']
    formData.append('image', file)
    return this.request<any>('/api/auth/settings/upload-image/', {
      method: 'POST',
      body: formData,
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
