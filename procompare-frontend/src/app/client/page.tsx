import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout'
// import ClientDashboardOverview from '@/components/dashboard/ClientDashboardOverview'

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Client Dashboard</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">Client dashboard temporarily simplified for deployment.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">My Requests</h3>
              <p className="text-blue-700 text-sm">View your service requests</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Get Quotes</h3>
              <p className="text-green-700 text-sm">Request quotes from providers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


