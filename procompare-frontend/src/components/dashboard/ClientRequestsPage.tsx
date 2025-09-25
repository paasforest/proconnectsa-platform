'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Eye,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar
} from 'lucide-react'
import { apiClient } from '@/lib/api-simple'

interface ProviderInterest {
  provider_name: string
  provider_email: string
  assigned_at: string
  status: string
  has_unlocked: boolean
  viewed_at?: string
  contacted_at?: string
}

interface ClientLead {
  id: string
  title: string
  description: string
  service_category: string
  location: string
  budget_range: string
  urgency: string
  status: string
  created_at: string
  provider_interest_count: number
  providers_unlocked_count: number
  provider_interest: ProviderInterest[]
  next_steps: string
}

export default function ClientRequestsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [leads, setLeads] = useState<ClientLead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeads = async () => {
    try {
      if (token) {
        apiClient.setToken(token)
      }
      
      const response = await apiClient.get('/api/client/leads/')
      setLeads(response.leads || [])
    } catch (error) {
      console.error('Failed to fetch client leads:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeads()
  }

  const handleResubmit = async (leadId: string) => {
    try {
      if (token) {
        apiClient.setToken(token)
      }
      
      await apiClient.post(`/api/client/leads/${leadId}/resubmit/`)
      
      // Refresh the leads list
      await fetchLeads()
      
      // Show success message (you might want to add a toast notification)
      alert('Similar request created successfully!')
    } catch (error) {
      console.error('Failed to resubmit lead:', error)
      alert('Failed to create similar request. Please try again.')
    }
  }

  useEffect(() => {
    if (token) {
      fetchLeads()
    }
  }, [token])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'assigned':
        return 'blue'
      case 'completed':
        return 'green'
      case 'cancelled':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Finding Providers'
      case 'assigned':
        return 'Providers Interested'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <div className="space-y-4">
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
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-gray-600">Track your requests and provider responses</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/request-quote')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* No Requests State */}
      {leads.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No service requests yet
            </h3>
            <p className="text-gray-600 mb-6">
              Submit your first service request to get quotes from local providers
            </p>
            <Button onClick={() => router.push('/request-quote')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Request
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {leads.map((lead) => (
        <Card key={lead.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg mb-1">{lead.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lead.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatTimeAgo(lead.created_at)}
                  </span>
                  <span>Budget: {lead.budget_range}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(lead.status) as any}>
                  {getStatusText(lead.status)}
                </Badge>
                <Badge variant="secondary">
                  {lead.service_category}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {lead.description}
            </p>

            {/* Provider Interest Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Provider Interest</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Users className="h-3 w-3" />
                    {lead.provider_interest_count} interested
                  </span>
                  <span className="flex items-center gap-1 text-green-700">
                    <Phone className="h-3 w-3" />
                    {lead.providers_unlocked_count} unlocked contact
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-blue-800 font-medium">
                {lead.next_steps}
              </div>
            </div>

            {/* Provider Details */}
            {lead.provider_interest.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Provider Activity:</h4>
                {lead.provider_interest.map((provider, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{provider.provider_name}</h5>
                        <p className="text-xs text-gray-600">
                          Interested {formatTimeAgo(provider.assigned_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.has_unlocked && (
                          <Badge variant="default" className="text-xs">
                            <Phone className="h-2 w-2 mr-1" />
                            Will Call
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {provider.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {provider.viewed_at && (
                      <p className="text-xs text-gray-600">
                        <Eye className="h-3 w-3 inline mr-1" />
                        Viewed {formatTimeAgo(provider.viewed_at)}
                      </p>
                    )}
                    
                    {provider.has_unlocked && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                        ✅ This provider has your contact details and should call you soon!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleResubmit(lead.id)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Submit Similar Request
              </Button>
              
              {lead.status === 'completed' && (
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Rate Provider
                </Button>
              )}
              
              {lead.status === 'assigned' && lead.providers_unlocked_count === 0 && (
                <Button variant="outline" size="sm" className="text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  No Calls Yet?
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


