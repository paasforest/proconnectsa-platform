'use client'

import { withAuth } from '@/components/AuthProvider';
import WalletLeadDashboard from '@/components/dashboard/WalletLeadDashboard';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function LeadsDashboardPage({ user }: { user: any }) {
  return <WalletLeadDashboard />;
}

export default withAuth(LeadsDashboardPage, ['provider', 'service_provider']);
