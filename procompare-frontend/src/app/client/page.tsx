'use client';
import { withAuth } from '@/components/AuthProvider';
import ClientDashboard from '@/components/ClientDashboard'

function ClientDashboardPage({ user }: { user: any }) {
  // ClientDashboard doesn't need user prop, it uses useSession
  return <ClientDashboard />
}

export default withAuth(ClientDashboardPage, ['client']);