'use client'

import { withAuth } from '@/components/AuthProvider';
import WalletLeadDashboard from '@/components/dashboard/WalletLeadDashboard';

function LeadsDashboardPage({ user }: { user: any }) {
  return <WalletLeadDashboard />;
}

export default withAuth(LeadsDashboardPage, ['provider', 'service_provider']);
