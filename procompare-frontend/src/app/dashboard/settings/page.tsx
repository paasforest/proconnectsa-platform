'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SettingsPage from '@/components/dashboard/SettingsPage'

function SettingsPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  )
}

export default withAuth(SettingsPageRoute, ['service_provider'])