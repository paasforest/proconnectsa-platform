// API utility functions for Django backend integration

// Secure API configuration - use environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any
}

export interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    user_type: string
    subscription_tier?: string
  }
  token: string
  message: string
}

// Login function that uses frontend proxy route
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/backend-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

// API call function that uses Django token format
export async function apiCall<T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`, // Django REST Framework format
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`)
  }

  return response.json()
}

// Get user profile using Django token
export async function getUserProfile(token: string) {
  return apiCall('/api/auth/profile/', token)
}

// Get wallet information
export async function getWalletInfo(token: string) {
  return apiCall('/api/leads/wallet/available/', token)
}