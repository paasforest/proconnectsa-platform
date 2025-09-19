import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ServicesPage from '@/components/dashboard/ServicesPage';

export default async function ServicesPageRoute() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <ServicesPage />
    </DashboardLayout>
  );
}







