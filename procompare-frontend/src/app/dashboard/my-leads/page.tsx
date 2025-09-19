import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import MyLeadsPage from '@/components/dashboard/MyLeadsPage';

export default async function MyLeadsPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Leads</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">My leads page temporarily simplified for deployment.</p>
        </div>
      </div>
    </div>
  );
}







