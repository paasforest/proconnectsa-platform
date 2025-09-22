'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout'
import ClientRequestsOverview from '@/components/dashboard/ClientRequestsOverview'

export default function ClientRequestsPage() {
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Only show client requests for clients
  if (session.user.userType !== 'client') {
    router.push('/dashboard')
    return null
  }

  return (
    <ClientDashboardLayout>
      <ClientRequestsOverview />
    </ClientDashboardLayout>
  )
}


