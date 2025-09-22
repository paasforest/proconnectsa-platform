'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import MyLeadsPage from '@/components/dashboard/MyLeadsPage'

export default function MyLeadsPageRoute() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your leads...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Only show my leads page for providers
  if (session.user.userType !== 'provider') {
    router.push('/client')
    return null
  }

  return <MyLeadsPage />
}