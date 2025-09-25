'use client'

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MyLeadsPage from '@/components/dashboard/MyLeadsPage'

export default function MyLeadsPageRoute() {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  // Only show my leads page for providers
  if (user.user_type !== 'service_provider') {
    router.push('/client')
    return null
  }

  return (
    <DashboardLayout>
      <MyLeadsPage />
    </DashboardLayout>
  )
}