'use client'

import { useState, useEffect } from 'react'
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
  Users,
  Eye,
  Timer
} from 'lucide-react'
import { Lead, LeadVisibility, CreditPurchase } from '@/types'
import { CreditPurchaseModal } from './CreditPurchaseModal'
import { QuoteForm } from '../quotes/QuoteForm'

interface BarkLeadFeedProps {
  leads: Lead[]
  userRole: 'client' | 'provider'
  subscriptionTier?: 'basic' | 'advanced' | 'pro' | 'enterprise' | 'pay_as_you_go'
  onClaimLead?: (leadId: string) => void
  onSendQuote?: (leadId: string, quote: any) => void
  creditBalance?: number
}

export default function BarkLeadFeed({ 
  leads, 
  userRole, 
  subscriptionTier = 'pay_as_you_go',
  onClaimLead,
  onSendQuote,
  creditBalance = 0
}: BarkLeadFeedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [showQuoteForm, setShowQuoteForm] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [claimingLead, setClaimingLead] = useState<string | null>(null)

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || lead.category === filterCategory
    const matchesUrgency = filterUrgency === 'all' || lead.urgency === filterUrgency
    
    return matchesSearch && matchesCategory && matchesUrgency
  })

  const handleClaimLead = async (lead: Lead) => {
    if (!onClaimLead) return
    
    setClaimingLead(lead.id)
    try {
      await onClaimLead(lead.id)
    } finally {
      setClaimingLead(null)
    }
  }

  const handleUnlockContact = (lead: Lead) => {
    setSelectedLead(lead)
    setShowCreditModal(true)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'this_week': return 'bg-orange-100 text-orange-800'
      case 'this_month': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClaimStatusColor = (claimStatus: string) => {
    if (claimStatus === 'Fully Claimed') return 'bg-red-100 text-red-800'
    if (claimStatus === 'Available') return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getBudgetDisplay = (budget: string) => {
    const budgetMap: { [key: string]: string } = {
      'under_1000': 'Under R1,000',
      '1000_5000': 'R1,000 - R5,000',
      '5000_15000': 'R5,000 - R15,000',
      '15000_50000': 'R15,000 - R50,000',
      'over_50000': 'Over R50,000',
      'no_budget': 'Need Quote First'
    }
    return budgetMap[budget] || budget
  }

  return (
    <div className="space-y-6">
      {/* Header with Credit Balance */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Leads</h2>
          <p className="text-gray-600">Claim leads before they're taken by other providers</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-600">
            {creditBalance} credits
          </div>
          <p className="text-xs text-gray-500">
            R50 per lead
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="handyman">Handyman</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterUrgency} onValueChange={setFilterUrgency}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="relative overflow-hidden">
            {/* Claim Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className={getClaimStatusColor(lead.claim_status || 'Available')}>
                {lead.claim_status || 'Available'}
              </Badge>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {lead.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600">
                    {lead.service_category || lead.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Lead Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{getBudgetDisplay(lead.budget_range || lead.budget)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{lead.urgency}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{lead.assigned_count || 0}/{lead.max_providers || 3} claimed</span>
                </div>
              </div>

              {/* Bark-style Competition Stats */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{lead.views_count || 0} professionals viewed</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{lead.responses_count || 0} responded</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 line-clamp-3">
                {lead.description}
              </p>

              {/* Quality Score */}
              {lead.verification_score && (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Quality: {lead.verification_score}%
                  </span>
                </div>
              )}

              {/* Pricing Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Cost to Claim</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    R{lead.credit_cost || 50}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {lead.pricing_reasoning || 'Dynamic pricing based on demand and quality'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {lead.can_claim ? (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleClaimLead(lead)}
                    disabled={claimingLead === lead.id}
                  >
                    {claimingLead === lead.id ? (
                      <>
                        <Timer className="h-4 w-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Claim Lead (R{lead.credit_cost || 50})
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 bg-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {lead.claim_status === 'Fully Claimed' ? 'Fully Claimed' : 'Already Claimed'}
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Remaining Slots Indicator */}
              {lead.remaining_slots && lead.remaining_slots > 0 && (
                <div className="text-center">
                  <p className="text-xs text-orange-600 font-medium">
                    Only {lead.remaining_slots} slot{lead.remaining_slots > 1 ? 's' : ''} remaining!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new leads.
          </p>
        </div>
      )}

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        lead={selectedLead!}
        creditCost={selectedLead ? (selectedLead.credit_cost || 50) : 50}
        onPurchase={async (purchase) => {
          console.log('Credit purchase:', purchase)
          setShowCreditModal(false)
        }}
      />

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <QuoteForm
          leadId={showQuoteForm}
          onClose={() => setShowQuoteForm(null)}
          onSendQuote={(quote) => {
            if (onSendQuote) {
              onSendQuote(showQuoteForm, quote)
            }
            setShowQuoteForm(null)
          }}
        />
      )}
    </div>
  )
}
