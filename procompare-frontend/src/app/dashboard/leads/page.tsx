'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProviderLeadsInbox from '@/components/dashboard/ProviderLeadsInbox'

function LeadsPage(_props: { user?: unknown }) {
  return (
    <DashboardLayout>
      <ProviderLeadsInbox />
    </DashboardLayout>
  )
}

export default withAuth(LeadsPage, ['provider', 'service_provider'])







