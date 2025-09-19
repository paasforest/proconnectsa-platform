import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WalletPage from '@/components/dashboard/WalletPage';

export default async function WalletPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <WalletPage />
    </DashboardLayout>
  );
}







