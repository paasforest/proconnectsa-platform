import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Strict admin authentication check
  if (!session || session.user?.userType !== 'admin') {
    redirect('/admin');
  }

  // Additional security verification
  const isAdmin = session.user?.userType === 'admin' && 
                  (session.user?.email === 'admin@example.com' || 
                   session.user?.email?.includes('admin'));

  if (!isAdmin) {
    redirect('/admin');
  }

  return <AdminDashboard />;
}






