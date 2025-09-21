import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import NewProviderDashboard from '@/components/dashboard/NewProviderDashboard'

export default async function DashboardPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Redirect clients to their dashboard
  if (session.user.role === 'client') {
    redirect('/client');
  }

  // Redirect admins to admin dashboard
  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  // Complete personalized provider dashboard with "Chabalala Services" branding
  return <NewProviderDashboard />;
}



