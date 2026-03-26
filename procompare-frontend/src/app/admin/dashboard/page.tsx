'use client';
import { withAuth } from '@/components/AuthProvider';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

function AdminDashboardPage({ user }: { user: any }) {
  // AdminDashboard doesn't need user prop, it uses useSession
  return <AdminDashboard />;
}

export default withAuth(AdminDashboardPage, ['admin', 'support']);






