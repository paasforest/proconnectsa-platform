// src/lib/auth-utils.ts - Authentication utilities
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'client' | 'provider' | 'service_provider';
  credits?: number;
  wallet_balance?: number;
}

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr) as User;
    return user;
  } catch (error) {
    return null;
  }
};

export const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const redirectToDashboard = (userType: string) => {
  switch (userType) {
    case 'admin':
      return '/admin/dashboard';
    case 'client':
      return '/client'; 
    case 'provider':
    case 'service_provider':
      return '/provider-dashboard'; // Service providers use the provider dashboard with DashboardLayout
    default:
      return '/dashboard'; // Fallback
  }
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};