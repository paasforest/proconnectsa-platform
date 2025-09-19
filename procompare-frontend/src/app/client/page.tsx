import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout'
import ClientDashboardOverview from '@/components/dashboard/ClientDashboardOverview'

export default async function ClientDashboardPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Check if user is a client
  if (session.user.userType !== 'client') {
    // Redirect providers to their dashboard
    redirect('/dashboard')
  }

  return (
    <ClientDashboardLayout>
      <ClientDashboardOverview />
    </ClientDashboardLayout>
  )
}


