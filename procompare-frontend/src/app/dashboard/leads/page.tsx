'use client'

import { withAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  MapPin, 
  Clock, 
  DollarSign, 
  Eye, 
  Phone, 
  Mail, 
  Star,
  Filter,
  Search,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Building2,
  Home,
  Tag,
  CreditCard,
  Lock,
  RefreshCw,
  Unlock
} from 'lucide-react'
import { apiClient } from '@/lib/api-simple'

interface Lead {
  id: string
  title: string
  description: string
  location: string
  city: string
  area: string
  budget: string
  urgency: 'low' | 'medium' | 'high'
  service_type: string
  credits_required: number
  created_at: string
  client_name?: string
  phone_available: boolean
  email_available: boolean
  verified: boolean
  lead_score: number
  response_count: number
  time_ago: string
  category: 'residential' | 'commercial' | 'premium'
  job_size: 'small' | 'medium' | 'large'
  timeline: string
  additional_details?: string
  qa?: Array<{ question: string; answer: string }>
}

function LeadsPage({ user }: { user: any }) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [unlockingLead, setUnlockingLead] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        
        // Fetch real leads from API
        const response = await apiClient.get('/api/leads/wallet/available/')
        const leadsData = response.data?.leads || response.leads || response || []
        
        // For new providers or providers with no service categories, show empty state
        setLeads(leadsData)
        
      } catch (error) {
        console.error('Failed to fetch leads:', error)
        // For new providers, show empty state instead of mock data
        setLeads([])
      } finally {
        setLoading(false)
      }
    }

    if (user && user.user_type === 'service_provider') {
      fetchLeads()
    }
  }, [user])

  useEffect(() => {
    let filtered = leads

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.service_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLeads(filtered)
  }, [leads, searchTerm])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUnlockLead = async (leadId: string) => {
    try {
      setUnlockingLead(leadId)
      
      // Call the unlock API endpoint
      const response = await apiClient.post(`/api/wallet/unlock-lead/${leadId}/`)
      
      if (response.success) {
        // Update the lead in the state to show it's unlocked
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId 
              ? { ...lead, isUnlocked: true, ...response.unlocked_data }
              : lead
          )
        )
        
        // Show success message
        console.log('Lead unlocked successfully!')
      }
    } catch (error) {
      console.error('Failed to unlock lead:', error)
      // Show error message to user
    } finally {
      setUnlockingLead(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Available Leads</h1>
                <p className="text-gray-600">
                  Find new opportunities for your business • {filteredLeads.length} leads available
                </p>
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leads by title, location, or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Bark-Style Leads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{lead.title}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{lead.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Tag className="w-4 h-4" />
                        <span>{lead.category}</span>
                      </div>
                    </div>
                    <Badge className={getUrgencyColor(lead.urgency)}>
                      {lead.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm line-clamp-3">{lead.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">R{lead.budget}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">{lead.credits || 1} credits</span>
                      </div>
                    </div>
                    
                    {/* Bark-style Competition Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{lead.responses_count || 0} responses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{lead.views_count || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{lead.timeAgo}</span>
                      </div>
                    </div>
                    
                    {/* Contact Details - Locked State */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <p className="text-gray-500">Contact Details Locked</p>
                            <p className="text-xs text-gray-400">Unlock to see phone & email</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUnlockLead(lead.id)}
                          disabled={unlockingLead === lead.id || lead.isUnlocked}
                        >
                          {unlockingLead === lead.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Unlock className="w-4 h-4 mr-2" />
                          )}
                          {unlockingLead === lead.id ? 'Unlocking...' : 'Unlock Lead'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                      className="w-full mt-3"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No leads found' : 'Welcome to your leads dashboard!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Complete your profile and add your service categories to start receiving leads'
                }
              </p>
              {searchTerm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete Your Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withAuth(LeadsPage, ['service_provider'])

// Mock data for demo purposes
function getMockLeads(): Lead[] {
  return [
    {
      id: '1',
      title: 'Kitchen Plumbing Repair',
      description: 'Need urgent repair for kitchen sink and garbage disposal. Water is backing up and causing issues.',
      location: 'Sandton, Johannesburg',
      city: 'Johannesburg',
      area: 'Sandton',
      budget: 'R3,500 - R5,000',
      urgency: 'high',
      service_type: 'plumbing',
      credits_required: 15,
      created_at: '2024-01-15T10:30:00Z',
      phone_available: true,
      email_available: true,
      verified: true,
      lead_score: 85,
      response_count: 3,
      time_ago: '2 hours ago',
      category: 'residential',
      job_size: 'small',
      timeline: 'ASAP'
    },
    {
      id: '2',
      title: 'Office Building Electrical Upgrade',
      description: 'Complete electrical upgrade for 10-story office building. Need certified electrician with commercial experience.',
      location: 'Cape Town CBD',
      city: 'Cape Town',
      area: 'CBD',
      budget: 'R50,000 - R80,000',
      urgency: 'medium',
      service_type: 'electrical',
      credits_required: 50,
      created_at: '2024-01-15T09:15:00Z',
      phone_available: true,
      email_available: true,
      verified: true,
      lead_score: 92,
      response_count: 1,
      time_ago: '3 hours ago',
      category: 'commercial',
      job_size: 'large',
      timeline: 'Within 2 weeks'
    },
    {
      id: '3',
      title: 'HVAC System Installation',
      description: 'Install new central air conditioning system for residential home. 4-bedroom house with existing ductwork.',
      location: 'Durban North',
      city: 'Durban',
      area: 'North',
      budget: 'R25,000 - R35,000',
      urgency: 'medium',
      service_type: 'hvac',
      credits_required: 30,
      created_at: '2024-01-15T08:45:00Z',
      phone_available: false,
      email_available: true,
      verified: false,
      lead_score: 78,
      response_count: 5,
      time_ago: '4 hours ago',
      category: 'residential',
      job_size: 'medium',
      timeline: 'Within 1 month'
    },
    {
      id: '4',
      title: 'Luxury Home Painting Project',
      description: 'Interior and exterior painting for luxury home in Clifton. High-end finish required.',
      location: 'Clifton, Cape Town',
      city: 'Cape Town',
      area: 'Clifton',
      budget: 'R40,000 - R60,000',
      urgency: 'low',
      service_type: 'painting',
      credits_required: 35,
      created_at: '2024-01-15T07:30:00Z',
      phone_available: true,
      email_available: true,
      verified: true,
      lead_score: 88,
      response_count: 2,
      time_ago: '5 hours ago',
      category: 'premium',
      job_size: 'large',
      timeline: 'Flexible'
    }
  ]
}







