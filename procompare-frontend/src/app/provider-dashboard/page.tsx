'use client';

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

function ProviderDashboardPage({ user }: { user: any }) {
  // DashboardLayout and DashboardOverview use useSession, not user prop
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}

export default withAuth(ProviderDashboardPage, ['service_provider']);
