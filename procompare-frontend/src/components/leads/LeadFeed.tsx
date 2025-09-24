'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  User,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Crown,
  CreditCard,
  Lock,
  ArrowRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Eye
} from 'lucide-react'
import { Lead, LeadVisibility, CreditPurchase } from '@/types'
import { CreditPurchaseModal } from './CreditPurchaseModal'
import { trackLeadViewDebounced } from '@/lib/leadTracking'

interface LeadFeedProps {
  leads: Lead[]
  userRole: 'client' | 'provider'
  subscriptionTier?: 'basic' | 'advanced' | 'pro' | 'enterprise' | 'pay_as_you_go'
  onPurchaseCredits?: (leadId: string) => void
  creditBalance?: number
}

export default function LeadFeed({ 
  leads, 
  userRole, 
  subscriptionTier = 'pay_as_you_go',
  onPurchaseCredits,
  creditBalance = 0
}: LeadFeedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedUrgency, setSelectedUrgency] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const location = `${lead.location_suburb}, ${lead.location_city}`
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || lead.service_category?.toLowerCase() === selectedCategory
    const matchesUrgency = selectedUrgency === 'all' || lead.urgency === selectedUrgency
    
    // Convert budget_range to numeric value for comparison
    const getBudgetValue = (budgetRange: string) => {
      switch (budgetRange) {
        case 'under_1000': return 500
        case '1000_5000': return 3000
        case '5000_15000': return 10000
        case '15000_50000': return 32500
        case 'over_50000': return 75000
        default: return 0
      }
    }
    
    const budgetValue = getBudgetValue(lead.budget_range)
    const matchesBudget = selectedBudget === 'all' || 
      (selectedBudget === 'low' && budgetValue < 1000) ||
      (selectedBudget === 'medium' && budgetValue >= 1000 && budgetValue < 5000) ||
      (selectedBudget === 'high' && budgetValue >= 5000)

    return matchesSearch && matchesCategory && matchesUrgency && matchesBudget
  })

  // Track views when leads are loaded
  useEffect(() => {
    if (filteredLeads.length > 0) {
      filteredLeads.forEach(lead => {
        trackLeadViewDebounced(lead.id);
      });
    }
  }, [filteredLeads]);

  const getUrgencyColor = (urgency: string) => {
    // Use explicit conditional logic to prevent hydration mismatches
    if (urgency === 'urgent') {
      return 'bg-red-500'
    } else if (urgency === 'this_week') {
      return 'bg-orange-500'
    } else if (urgency === 'this_month') {
      return 'bg-yellow-500'
    } else if (urgency === 'flexible') {
      return 'bg-green-500'
    } else {
      return 'bg-gray-500'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgent'
      case 'this_week': return 'High Priority'
      case 'this_month': return 'Medium Priority'
      case 'flexible': return 'Low Priority'
      default: return 'Normal'
    }
  }

  const getBudgetRange = (budgetRange: string) => {
    switch (budgetRange) {
      case 'under_1000': return 'Under R1,000'
      case '1000_5000': return 'R1,000 - R5,000'
      case '5000_15000': return 'R5,000 - R15,000'
      case '15000_50000': return 'R15,000 - R50,000'
      case 'over_50000': return 'Over R50,000'
      case 'no_budget': return 'Need Quote First'
      default: return 'Budget Not Specified'
    }
  }

  const getBudgetValue = (budgetRange: string) => {
    switch (budgetRange) {
      case 'under_1000': return 500
      case '1000_5000': return 3000
      case '5000_15000': return 10000
      case '15000_50000': return 32500
      case 'over_50000': return 75000
      default: return 0
    }
  }

  const canAccessContactDetails = (lead: Lead) => {
    if (userRole === 'client') return true
    if (subscriptionTier === 'pay_as_you_go') return lead.is_contact_details_visible || lead.contact_details_unlocked || false
    return ['basic', 'advanced', 'pro', 'enterprise'].includes(subscriptionTier || '')
  }

  const handleUnlockContact = (lead: Lead) => {
    setSelectedLead(lead)
    setShowCreditModal(true)
  }


  const categories = [
    'all', 'plumbing', 'electrical', 'handyman', 'cleaning', 'painting', 
    'hvac', 'landscaping', 'renovation', 'automotive', 'security', 'pool'
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Available Leads
            </h1>
            <p className="text-gray-600">
              Find quality leads and grow your business
            </p>
          </div>
          
          {userRole === 'provider' && (
            <div className="flex items-center space-x-4">
              {subscriptionTier === 'pay_as_you_go' ? (
                <>
                  <div className="bg-white rounded-lg shadow-sm border p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Credit Balance</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {creditBalance} credits
                    </div>
                    <p className="text-xs text-gray-500">
                      R50 per lead
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <CreditCard className="h-4 w-4" />
                    <span>Pay-as-you-go</span>
                  </Badge>
                </>
              ) : (
                <Badge className="flex items-center space-x-1 bg-blue-600">
                  <Crown className="h-4 w-4" />
                  <span>{subscriptionTier?.toUpperCase()}</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.slice(1).map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger>
              <SelectValue placeholder="All Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedBudget} onValueChange={setSelectedBudget}>
            <SelectTrigger>
              <SelectValue placeholder="All Budgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="low">Under R1,000</SelectItem>
              <SelectItem value="medium">R1,000 - R5,000</SelectItem>
              <SelectItem value="high">R5,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lead Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card 
            key={lead.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => {
              // Handle lead click - could open a modal or navigate to detail page
              console.log('Lead clicked:', lead.id)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getUrgencyColor(lead.urgency)} text-white`}>
                    {getUrgencyText(lead.urgency)}
                  </Badge>
                  <Badge variant="outline">
                    {lead.service_category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {getBudgetRange(lead.budget_range)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Budget
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight mb-2">
                {lead.title}
              </CardTitle>
              
              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                {lead.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Location & Time */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.location_suburb}, {lead.location_city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Credit Cost Display */}
              {!canAccessContactDetails(lead) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Credit Cost</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      R{lead.credit_required || 50}
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    One-time payment to access contact details
                  </p>
                </div>
              )}

              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Client Details</span>
                  </div>
                  {!canAccessContactDetails(lead) && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                {canAccessContactDetails(lead) ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <span>{lead.client_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <span>{lead.client_email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Unlock contact details to see client information
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {!canAccessContactDetails(lead) ? (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUnlockContact(lead)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Unlock Contact (R{lead.credit_required || 50})
                  </Button>
                ) : (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Contact Details Unlocked</span>
                    </div>
                    <p className="text-xs text-green-600 text-center mt-1">
                      Contact client via email or WhatsApp
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </div>
              
              {/* Bark-style Competition Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{lead.views_count || 0} professionals viewed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{lead.responses_count || 0} responded</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or check back later for new leads
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('')
            setSelectedCategory('all')
            setSelectedUrgency('all')
            setSelectedBudget('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreditModal && selectedLead && (
        <CreditPurchaseModal
          isOpen={showCreditModal}
          lead={selectedLead}
          onClose={() => setShowCreditModal(false)}
          onPurchase={async (purchase) => {
            if (onPurchaseCredits) {
              await onPurchaseCredits(purchase.lead_id)
            }
            setShowCreditModal(false)
          }}
        />
      )}

    </div>
  )
}




