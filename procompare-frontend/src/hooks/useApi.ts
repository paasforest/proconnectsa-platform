import { useAuth } from '@/components/AuthProvider';
import { apiCall, ApiResponse } from '@/lib/api'

export function useApi() {
  const { user, token } = useAuth()

  const makeApiCall = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!token) {
      throw new Error('No authentication token available')
    }

    return apiCall<T>(endpoint, token, options)
  }

  return {
    makeApiCall,
    isAuthenticated: !!token,
    user: user,
  }
}



