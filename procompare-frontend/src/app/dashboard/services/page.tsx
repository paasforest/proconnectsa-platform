'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ServicesPage from '@/components/dashboard/ServicesPage'

function ServicesPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <ServicesPage />
    </DashboardLayout>
  )
}

export default withAuth(ServicesPageRoute, ['provider', 'service_provider'])