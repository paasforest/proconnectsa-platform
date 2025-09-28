'use client'

import { withAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, Target } from 'lucide-react'

function LeadsPage({ user }: { user: any }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new Bark-style dashboard
    router.replace('/dashboard/leads-dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Target className="h-5 w-5" />
          <span>Redirecting to new leads dashboard...</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default withAuth(LeadsPage, ['provider', 'service_provider'])







