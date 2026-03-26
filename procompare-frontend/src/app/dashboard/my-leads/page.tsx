'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MyLeadsPage from '@/components/dashboard/MyLeadsPage'

function MyLeadsPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <MyLeadsPage />
    </DashboardLayout>
  )
}

export default withAuth(MyLeadsPageRoute, ['provider', 'service_provider'])