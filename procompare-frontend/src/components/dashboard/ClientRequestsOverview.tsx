'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  MessageSquare,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone
} from 'lucide-react'

interface ServiceRequest {
  id: number
  title: string
  description: string
  category: string
  location: string
  budget: string
  status: 'active' | 'completed' | 'pending' | 'cancelled'
  created_at: string
  provider_count: number
  last_activity: string
}

export default function ClientRequestsOverview() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  const authUser = user

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // For now, show mock data since we don't have the backend endpoint
        const mockRequests: ServiceRequest[] = [
          {
            id: 1,
            title: "House Cleaning Service",
            description: "Need regular weekly cleaning for a 3-bedroom house in Cape Town",
            category: "Home Cleaning",
            location: "Cape Town, Western Cape",
            budget: "R800 - R1200",
            status: "active",
            created_at: "2024-01-15",
            provider_count: 5,
            last_activity: "2 hours ago"
          },
          {
            id: 2,
            title: "Garden Landscaping",
            description: "Complete garden makeover including plants, irrigation, and lighting",
            category: "Landscaping",
            location: "Johannesburg, Gauteng",
            budget: "R15000 - R25000",
            status: "pending",
            created_at: "2024-01-10",
            provider_count: 3,
            last_activity: "1 day ago"
          },
          {
            id: 3,
            title: "Plumbing Repair",
            description: "Kitchen sink leak and bathroom tap replacement",
            category: "Plumbing",
            location: "Durban, KwaZulu-Natal",
            budget: "R2000 - R3500",
            status: "completed",
            created_at: "2024-01-05",
            provider_count: 4,
            last_activity: "3 days ago"
          }
        ]
        
        setRequests(mockRequests)
      } catch (error) {
        console.error('Failed to fetch requests:', error)
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchRequests()
    }
  }, [authUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your service requests with local providers
          </p>
        </div>
        <Button 
          onClick={() => router.push('/request-quote')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by submitting your first service request
            </p>
            <Button 
              onClick={() => router.push('/request-quote')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.title}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {request.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        {request.budget}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        {request.provider_count} providers interested
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    <span>Last activity: {request.last_activity}</span>
                  </div>
                  <span className="text-blue-600 font-medium">
                    {request.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push('/request-quote')}
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="font-medium">New Service Request</span>
              <span className="text-sm text-gray-600">Get quotes from providers</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push('/client/support')}
            >
              <Phone className="h-6 w-6 text-green-600" />
              <span className="font-medium">Contact Support</span>
              <span className="text-sm text-gray-600">Get help with your requests</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push('/client/settings')}
            >
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Account Settings</span>
              <span className="text-sm text-gray-600">Manage your preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








