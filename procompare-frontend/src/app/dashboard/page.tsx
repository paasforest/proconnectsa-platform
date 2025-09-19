import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { userStore } from "@/lib/user-store"
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import DashboardOverview from '@/components/dashboard/DashboardOverview';

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Provider Dashboard</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">Dashboard temporarily simplified for deployment.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Leads</h3>
              <p className="text-blue-700 text-sm">Manage your leads</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Services</h3>
              <p className="text-green-700 text-sm">Manage your services</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Wallet</h3>
              <p className="text-purple-700 text-sm">Manage your credits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



