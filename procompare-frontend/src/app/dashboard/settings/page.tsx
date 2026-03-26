'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SettingsPage from '@/components/dashboard/SettingsPage'

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function SettingsPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  )
}

export default withAuth(SettingsPageRoute, ['provider', 'service_provider'])