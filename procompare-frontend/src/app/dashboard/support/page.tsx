import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SupportPage from '@/components/dashboard/SupportPage';

export default async function SupportPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <SupportPage />
    </DashboardLayout>
  );
}





