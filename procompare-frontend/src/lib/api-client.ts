// API client for ProConnectSA Flask backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/api/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_type: string;
    phone?: string;
    city?: string;
    province?: string;
  }) {
    return this.request('/api/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User Profile & Stats
  async getProfile() {
    return this.request('/api/auth/profile/');
  }

  async getStats() {
    return this.request('/api/auth/stats/');
  }

  // Wallet
  async getWallet() {
    return this.request('/api/wallet/');
  }

  async getTransactions() {
    return this.request('/api/wallet/transactions/');
  }

  async topUpWallet(amount: number) {
    return this.request('/api/wallet/top-up/', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Leads
  async createLead(leadData: {
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
  }) {
    return this.request('/api/leads/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async getAvailableLeads() {
    return this.request('/api/leads/wallet/available/');
  }

  async purchaseLeadAccess(leadId: number) {
    return this.request(`/api/leads/${leadId}/purchase-access/`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/api/notifications/');
  }

  async markNotificationRead(notificationId: number) {
    return this.request(`/api/notifications/${notificationId}/read/`, {
      method: 'POST',
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  logout() {
    this.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;