'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface GoogleOAuthButtonProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export default function GoogleOAuthButton({ 
  onSuccess, 
  onError, 
  className = '',
  children 
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      
      // Load Google OAuth script
      if (!window.google) {
        await loadGoogleScript()
      }
      
      // Initialize Google OAuth
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: handleGoogleCallback
      })
      
      // Request authorization code
      client.requestCode()
      
    } catch (error) {
      console.error('Google OAuth error:', error)
      const errorMessage = 'Failed to initialize Google authentication'
      toast.error(errorMessage)
      onError?.(errorMessage)
      setLoading(false)
    }
  }

  const handleGoogleCallback = async (response: any) => {
    try {
      setLoading(true)
      
      // Send authorization code to backend
      const backendResponse = await fetch('/api/auth/google/callback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: response.code,
          redirect_uri: window.location.origin + '/auth/google/callback'
        })
      })
      
      const data = await backendResponse.json()
      
      if (backendResponse.ok) {
        // Store token
        localStorage.setItem('auth_token', data.token)
        
        // Show success message
        toast.success(data.message || 'Successfully signed in with Google!')
        
        // Call success callback
        onSuccess?.(data.user)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
      
    } catch (error) {
      console.error('Google OAuth callback error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google script'))
      document.head.appendChild(script)
    })
  }

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={loading}
      variant="outline"
      className={`w-full ${className}`}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {children || 'Continue with Google'}
    </Button>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any
  }
}









