'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Eye, 
  Lock,
  Crown,
  CreditCard
} from 'lucide-react'
import { Lead, ProviderProfile, LeadVisibility } from '@/types'
import { LeadVisibilityService } from '@/lib/leadVisibility'
import { format } from 'date-fns'
import LeadDetail from './LeadDetail'
import CreditPurchaseModal from './CreditPurchaseModal'

interface LeadListProps {
  leads: Lead[]
  providerProfile: ProviderProfile
  onPurchaseCredits?: (leadId: string, creditCost: number) => Promise<void>
  onUpgradeSubscription?: () => void
}

export default function LeadList({ 
  leads, 
  providerProfile, 
  onPurchaseCredits,
  onUpgradeSubscription 
}: LeadListProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [filterBudget, setFilterBudget] = useState('all')
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.location_suburb.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || lead.service_category === filterCategory
    const matchesUrgency = filterUrgency === 'all' || lead.urgency === filterUrgency
    const matchesBudget = filterBudget === 'all' || lead.budget_range === filterBudget
    
    return matchesSearch && matchesCategory && matchesUrgency && matchesBudget
  })
  
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
  }
  
  const handlePurchaseCredits = async (leadId: string, creditCost: number) => {
    if (onPurchaseCredits) {
      await onPurchaseCredits(leadId, creditCost)
      setShowCreditModal(false)
      // Refresh lead data or update UI
    }
  }
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive'
      case 'this_week': return 'default'
      case 'this_month': return 'secondary'
      default: return 'outline'
    }
  }
  
  const getBudgetDisplay = (budgetRange: string) => {
    const budgetMap: Record<string, string> = {
      'under_1000': 'Under R1,000',
      '1000_5000': 'R1,000 - R5,000',
      '5000_15000': 'R5,000 - R15,000',
      '15000_50000': 'R15,000 - R50,000',
      'over_50000': 'Over R50,000',
      'no_budget': 'Need Quote First'
    }
    return budgetMap[budgetRange] || budgetRange
  }
  
  const getAccessIcon = (lead: Lead) => {
    const visibility = LeadVisibilityService.getLeadVisibility(lead, providerProfile)
    
    if (visibility.subscription_tier) {
      return <Crown className="h-4 w-4 text-green-600" />
    } else if (visibility.has_sufficient_credits) {
      return <CreditCard className="h-4 w-4 text-blue-600" />
    } else {
      return <Lock className="h-4 w-4 text-orange-600" />
    }
  }
  
  if (selectedLead) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedLead(null)}
          className="mb-4"
        >
          ← Back to Leads
        </Button>
        <LeadDetail
          lead={selectedLead}
          providerProfile={providerProfile}
          onPurchaseCredits={onPurchaseCredits}
          onUpgradeSubscription={onUpgradeSubscription}
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Available Leads</h1>
          <p className="text-gray-600">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {providerProfile.credit_balance} Credits
          </Badge>
          {providerProfile.subscription_tier && (
            <Badge variant="default" className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              {providerProfile.subscription_tier.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger>
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
            
            <Select value={filterBudget} onValueChange={setFilterBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under_1000">Under R1,000</SelectItem>
                <SelectItem value="1000_5000">R1,000 - R5,000</SelectItem>
                <SelectItem value="5000_15000">R5,000 - R15,000</SelectItem>
                <SelectItem value="15000_50000">R15,000 - R50,000</SelectItem>
                <SelectItem value="over_50000">Over R50,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => {
          const visibility = LeadVisibilityService.getLeadVisibility(lead, providerProfile)
          
          return (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{lead.title}</CardTitle>
                  {getAccessIcon(lead)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getUrgencyColor(lead.urgency)}>
                    {lead.urgency.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {lead.service_category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-gray-700 line-clamp-3">{lead.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{lead.location_suburb}, {lead.location_city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>{getBudgetDisplay(lead.budget_range)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                
                {/* Access Status */}
                <div className="pt-3 border-t">
                  {visibility.can_view_contact_details ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Eye className="h-4 w-4" />
                      <span>Full access available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <Lock className="h-4 w-4" />
                      <span>R{visibility.credit_required} to unlock</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleViewLead(lead)}
                  className="w-full"
                  variant={visibility.can_view_contact_details ? "default" : "outline"}
                >
                  {visibility.can_view_contact_details ? 'View Details' : 'View & Unlock'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>Try adjusting your search criteria or check back later for new leads.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        lead={selectedLead!}
        creditCost={selectedLead ? LeadVisibilityService.calculateCreditCost(selectedLead) : 250}
        onPurchase={handlePurchaseCredits}
      />
    </div>
  )
}






