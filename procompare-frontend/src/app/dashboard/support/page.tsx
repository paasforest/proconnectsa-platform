'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SupportPage from '@/components/dashboard/SupportPage'

function ProviderSupportPage({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <SupportPage />
    </DashboardLayout>
  )
}

export default withAuth(ProviderSupportPage, ['provider', 'service_provider'])





