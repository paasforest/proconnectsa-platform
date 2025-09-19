import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { userStore } from "@/lib/user-store"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default async function DashboardPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Redirect clients to their dashboard
  if (session.user.userType === 'client') {
    redirect('/client');
  }

  // Redirect admins to admin dashboard
  if (session.user.userType === 'admin') {
    redirect('/admin');
  }

  // Default to provider dashboard
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}



