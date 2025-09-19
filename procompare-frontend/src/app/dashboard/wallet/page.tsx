import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import DashboardLayout from '@/components/dashboard/DashboardLayout';
// import WalletPage from '@/components/dashboard/WalletPage';

export default async function WalletPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Wallet</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Wallet page temporarily simplified for deployment.</p>
        </div>
      </div>
    </div>
  );
}







