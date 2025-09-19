import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import SupportPage from '@/components/dashboard/SupportPage';

export default async function SupportPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Support</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Support page temporarily simplified for deployment.</p>
        </div>
      </div>
    </div>
  );
}





