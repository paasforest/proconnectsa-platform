import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout'
// import ClientRequestsPage from '@/components/dashboard/ClientRequestsPage'

export default async function ClientRequestsPageRoute() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.userType !== 'client') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Requests</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Client requests page temporarily simplified for deployment.</p>
        </div>
      </div>
    </div>
  )
}


