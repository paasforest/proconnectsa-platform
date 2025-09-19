import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeadsPage from '@/components/dashboard/LeadsPage';

export default async function LeadsPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <LeadsPage />
    </DashboardLayout>
  );
}







