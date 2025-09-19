'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  User, 
  CreditCard,
  Crown,
  Lock,
  CheckCircle
} from 'lucide-react'
import { Lead, LeadVisibility, LeadAccessLevel, ProviderProfile } from '@/types'
import { LeadVisibilityService } from '@/lib/leadVisibility'
import { format } from 'date-fns'

interface LeadDetailProps {
  lead: Lead
  providerProfile: ProviderProfile
  onPurchaseCredits?: (leadId: string, creditCost: number) => void
  onUpgradeSubscription?: () => void
}

export default function LeadDetail({ 
  lead, 
  providerProfile, 
  onPurchaseCredits,
  onUpgradeSubscription 
}: LeadDetailProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  
  const visibility = LeadVisibilityService.getLeadVisibility(lead, providerProfile)
  const accessLevel = LeadVisibilityService.getAccessLevel(visibility)
  const filteredLead = LeadVisibilityService.filterLeadData(lead, visibility)
  
  const handlePurchaseCredits = async () => {
    if (!onPurchaseCredits) return
    
    setIsPurchasing(true)
    try {
      await onPurchaseCredits(lead.id, visibility.credit_required)
    } finally {
      setIsPurchasing(false)
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
  
  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{lead.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getUrgencyColor(lead.urgency)}>
                  {lead.urgency.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {getBudgetDisplay(lead.budget_range)}
                </Badge>
                <Badge variant="secondary">
                  {lead.service_category}
                </Badge>
              </div>
            </div>
            
            {/* Access Level Indicator */}
            <div className="text-right">
              {accessLevel.level === 'subscription' ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Subscriber</span>
                </div>
              ) : accessLevel.level === 'credit_required' ? (
                <div className="flex items-center gap-1 text-blue-600">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Pay-per-lead</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Limited Access</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Lead Description */}
          <div>
            <h3 className="font-semibold mb-2">Job Description</h3>
            <p className="text-gray-700">{lead.description}</p>
          </div>
          
          {/* Additional Requirements */}
          {lead.additional_requirements && (
            <div>
              <h3 className="font-semibold mb-2">Additional Requirements</h3>
              <p className="text-gray-700">{lead.additional_requirements}</p>
            </div>
          )}
          
          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{lead.location_suburb}, {lead.location_city}</p>
                <p className="text-sm text-gray-600">{lead.location_address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Preferred Contact Time</p>
                <p className="text-sm text-gray-600">{lead.preferred_contact_time || 'Flexible'}</p>
              </div>
            </div>
          </div>
          
          {/* Contact Details Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Client Contact Information</h3>
            
            {visibility.can_view_contact_details ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{lead.client_name || 'Client Name'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-mono">{lead.client_phone || 'Client Phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{lead.client_email || 'client@email.com'}</span>
                </div>
                
                {accessLevel.level === 'subscription' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Full access with {visibility.subscription_tier} subscription</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Contact details are hidden. {visibility.upgrade_prompt}
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handlePurchaseCredits}
                    disabled={isPurchasing}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isPurchasing ? 'Processing...' : `Buy Credits (R${visibility.credit_required})`}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onUpgradeSubscription}
                    className="flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade to Subscription
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Lead Metadata */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Posted:</span> {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-medium">Verification Score:</span> {lead.verification_score}/100
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Access Level Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Access Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{accessLevel.description}</p>
            <ul className="space-y-1">
              {accessLevel.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






