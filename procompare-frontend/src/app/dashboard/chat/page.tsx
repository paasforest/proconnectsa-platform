'use client'

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatPage from '@/components/dashboard/ChatPage'

export default function ChatPageRoute() {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [status, router])

  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Only show chat page for providers
  if (user.userType !== 'provider') {
    router.push('/client')
    return null
  }

  return <ChatPage />
}