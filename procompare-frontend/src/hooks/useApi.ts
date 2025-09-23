import { useSession } from 'next-auth/react'
import { apiCall, ApiResponse } from '@/lib/api'

export function useApi() {
  const { data: session } = useSession()

  const makeApiCall = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!session?.accessToken) {
      throw new Error('No authentication token available')
    }

    return apiCall<T>(endpoint, session.accessToken, options)
  }

  return {
    makeApiCall,
    isAuthenticated: !!session?.accessToken,
    user: session?.user,
  }
}


