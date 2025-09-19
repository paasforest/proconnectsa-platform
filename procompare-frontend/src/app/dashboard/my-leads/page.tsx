import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MyLeadsPage from '@/components/dashboard/MyLeadsPage';

export default async function MyLeadsPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <MyLeadsPage />
    </DashboardLayout>
  );
}







