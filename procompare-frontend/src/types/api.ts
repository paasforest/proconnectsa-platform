// API Response Types for Flask Backend

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'provider' | 'admin';
  phone?: string;
  city?: string;
  province?: string;
  country: string;
  credits: number;
  wallet_balance: number;
  created_at: string;
  is_active: boolean;
  email_verified: boolean;
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse extends ApiResponse {
  data: {
    user: User;
  };
}

export interface ProfileResponse extends ApiResponse {
  data: User;
}

export interface StatsResponse extends ApiResponse {
  data: {
    active_leads: number;
    completed_leads: number;
    pending_leads: number;
    credit_balance: number;
    total_earnings: number;
    conversion_rate: number;
  };
}

export interface WalletResponse extends ApiResponse {
  data: {
    balance: number;
    currency: string;
    last_updated: string;
  };
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionsResponse extends ApiResponse {
  data: {
    transactions: Transaction[];
    total: number;
  };
}

export interface Lead {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  user_id?: number;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
  expires_at?: string;
  access_cost?: number;
}

export interface CreateLeadResponse extends ApiResponse {
  data: {
    lead: Lead;
  };
}

export interface AvailableLeadsResponse extends ApiResponse {
  data: {
    leads: Lead[];
    total: number;
  };
}

export interface PurchaseAccessResponse extends ApiResponse {
  data: {
    lead_id: number;
    access_granted: boolean;
    cost: number;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface NotificationsResponse extends ApiResponse {
  data: {
    notifications: Notification[];
    unread_count: number;
  };
}

export interface TopUpResponse extends ApiResponse {
  data: {
    amount: number;
    customer_code: string;
    account_details: {
      bank_name: string;
      account_holder: string;
      account_number: string;
      branch_code: string;
    };
    instructions: string;
  };
}

// Registration form data
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'provider';
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}

// Lead creation data
export interface CreateLeadData {
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
}

// Top-up data
export interface TopUpData {
  amount: number;
}

