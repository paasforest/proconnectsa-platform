import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout'
import ClientRequestsPage from '@/components/dashboard/ClientRequestsPage'

export default async function ClientRequestsPageRoute() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.userType !== 'client') {
    redirect('/dashboard')
  }

  return (
    <ClientDashboardLayout>
      <ClientRequestsPage />
    </ClientDashboardLayout>
  )
}


