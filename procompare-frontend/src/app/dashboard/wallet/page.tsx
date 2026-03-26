'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import WalletPage from '@/components/dashboard/WalletPage'

function WalletPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <WalletPage />
    </DashboardLayout>
  )
}

export default withAuth(WalletPageRoute, ['provider', 'service_provider'])