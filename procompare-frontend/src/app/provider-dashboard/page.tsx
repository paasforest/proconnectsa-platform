'use client';

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function ProviderDashboardPage({ user }: { user: any }) {
  // DashboardLayout and DashboardOverview use useSession, not user prop
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}

export default withAuth(ProviderDashboardPage, ['provider', 'service_provider']);
