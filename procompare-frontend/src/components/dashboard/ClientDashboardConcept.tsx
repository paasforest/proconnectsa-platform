/**
 * Client Dashboard Concept - Basic Version
 * Shows what a simple but effective client dashboard would look like
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Star, 
  MapPin, 
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'

// Mock client data
const mockClientData = {
  name: "Sarah Johnson",
  activeLeads: [
    {
      id: "1",
      title: "Kitchen Plumbing Repair",
      description: "Kitchen sink is leaking, need urgent repair",
      category: "Plumbing",
      location: "Sea Point, Cape Town",
      budget: "R1,000 - R5,000",
      status: "active",
      created: "2 hours ago",
      providerInterest: 5,
      quotes: [
        {
          provider: "Mike's Plumbing Pro",
          rating: 4.8,
          reviews: 127,
          quote: "R2,500",
          response: "I can fix this today. Kitchen leaks are my specialty!",
          phone: "+27123456789"
        },
        {
          provider: "Cape Town Plumbers",
          rating: 4.6,
          reviews: 89,
          quote: "R3,200",
          response: "Professional service with 2-year warranty included.",
          phone: "+27987654321"
        }
      ]
    },
    {
      id: "2", 
      title: "Garden Landscaping",
      description: "Need complete garden makeover for small backyard",
      category: "Landscaping",
      location: "Claremont, Cape Town",
      budget: "R5,000 - R15,000",
      status: "waiting",
      created: "1 day ago",
      providerInterest: 2,
      quotes: []
    }
  ],
  completedJobs: [
    {
      id: "3",
      title: "Electrical Installation",
      provider: "Spark Electric Solutions",
      completed: "2 weeks ago",
      rating: 5,
      cost: "R4,500"
    }
  ]
}

export default function ClientDashboardConcept() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {mockClientData.name}!</h1>
          <p className="text-gray-600">Track your service requests and connect with providers</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Service Request
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{mockClientData.activeLeads.length}</div>
            <div className="text-sm text-gray-600">Active Requests</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm text-gray-600">Providers Interested</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-gray-600">Quotes Received</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{mockClientData.completedJobs.length}</div>
            <div className="text-sm text-gray-600">Jobs Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Service Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Active Service Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockClientData.activeLeads.map((lead) => (
            <div key={lead.id} className="border rounded-lg p-4 space-y-4">
              
              {/* Lead Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{lead.title}</h3>
                  <p className="text-gray-600 text-sm">{lead.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.location}
                    </span>
                    <span>Budget: {lead.budget}</span>
                    <span>Posted {lead.created}</span>
                  </div>
                </div>
                <Badge variant={lead.status === 'active' ? 'default' : 'secondary'}>
                  {lead.status === 'active' ? 'Receiving Quotes' : 'Waiting for Interest'}
                </Badge>
              </div>

              {/* Provider Interest */}
              <div className="bg-blue-50 rounded-md p-3">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <Users className="h-4 w-4" />
                  {lead.providerInterest} providers are interested in your request
                </div>
              </div>

              {/* Quotes */}
              {lead.quotes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Quotes Received:</h4>
                  {lead.quotes.map((quote, index) => (
                    <div key={index} className="border border-green-200 rounded-md p-3 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{quote.provider}</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {quote.rating} ({quote.reviews} reviews)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-700">{quote.quote}</div>
                          <Badge variant="outline" className="text-xs">Quote</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{quote.response}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Call Provider
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Edit Request
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Cancel Request
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Completed Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockClientData.completedJobs.map((job) => (
            <div key={job.id} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-sm text-gray-600">
                  Completed by {job.provider} • {job.completed}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">{job.cost}</div>
                <div className="flex items-center gap-1">
                  {[...Array(job.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Benefits Callout */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">Why This Client Dashboard Works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">✅ For Clients:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• See provider interest in real-time</li>
                <li>• Compare quotes side-by-side</li>
                <li>• Track job progress easily</li>
                <li>• Direct contact with providers</li>
                <li>• Build service history</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-2">🚀 For Business:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Higher client engagement</li>
                <li>• Better conversion rates</li>
                <li>• Repeat business tracking</li>
                <li>• Client behavior insights</li>
                <li>• Reduced support tickets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


