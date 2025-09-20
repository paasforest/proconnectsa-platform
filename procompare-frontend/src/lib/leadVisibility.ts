import { Lead, LeadVisibility, LeadAccessLevel, ProviderProfile } from '@/types'

/**
 * Lead Visibility Service
 * Handles access control for lead details based on subscription status
 */
export class LeadVisibilityService {
  /**
   * Determine what a provider can see based on their subscription status
   */
  static getLeadVisibility(
    lead: Lead, 
    providerProfile: ProviderProfile
  ): LeadVisibility {
    const isSubscriber = providerProfile.subscription_tier !== null && 
                        providerProfile.subscription_end_date && 
                        new Date(providerProfile.subscription_end_date) > new Date()
    
    const hasCredits = providerProfile.credit_balance >= (lead.credit_required || 1)
    
    if (isSubscriber) {
      return {
        can_view_contact_details: true,
        credit_required: 0,
        subscription_tier: providerProfile.subscription_tier,
        has_sufficient_credits: true,
        upgrade_prompt: undefined
      }
    }
    
    if (hasCredits) {
      return {
        can_view_contact_details: true,
        credit_required: lead.credit_required || 1,
        has_sufficient_credits: true,
        upgrade_prompt: 'Upgrade to subscription for unlimited access'
      }
    }
    
    return {
      can_view_contact_details: false,
      credit_required: lead.credit_required || 1,
      has_sufficient_credits: false,
      upgrade_prompt: `Purchase ${lead.credit_required || 1} credit(s) to view contact details`
    }
  }
  
  /**
   * Get access level description for UI
   */
  static getAccessLevel(visibility: LeadVisibility): LeadAccessLevel {
    if (visibility.subscription_tier) {
      return {
        level: 'subscription',
        description: 'Full access with subscription',
        features: [
          'View all lead details',
          'Direct contact information',
          'Unlimited leads',
          'Priority support'
        ],
        upgrade_required: false
      }
    }
    
    if (visibility.has_sufficient_credits) {
      return {
        level: 'credit_required',
        description: 'Pay-per-lead access',
        features: [
          'View all lead details',
          'Direct contact information',
          'Pay R50 per lead'
        ],
        upgrade_required: true
      }
    }
    
    return {
      level: 'public',
      description: 'Limited access - upgrade required',
      features: [
        'View lead description',
        'View location and budget',
        'View service category'
      ],
      upgrade_required: true
    }
  }
  
  /**
   * Filter lead data based on visibility
   */
  static filterLeadData(lead: Lead, visibility: LeadVisibility): Partial<Lead> {
    if (visibility.can_view_contact_details) {
      return lead // Return full lead data
    }
    
    // Return limited data for non-subscribers without credits
    const { client_phone, client_email, client_name, ...publicData } = lead
    return {
      ...publicData,
      is_contact_details_visible: false
    }
  }
  
  /**
   * Get upgrade options for pay-as-you-go providers
   */
  static getUpgradeOptions(providerProfile: ProviderProfile) {
    const subscriptionOptions = [
      {
        tier: 'basic',
        name: 'Basic Subscription',
        price: 299,
        features: [
          '10 leads per month',
          'Direct contact details',
          'Priority notifications',
          'Basic analytics',
          'R29.90 per lead (40% savings)',
          'R50 per additional lead'
        ]
      },
      {
        tier: 'advanced',
        name: 'Advanced Subscription',
        price: 599,
        features: [
          '25 leads per month',
          'Advanced analytics',
          'Priority lead assignment',
          'Custom notifications',
          'R23.96 per lead (52% savings)',
          'R50 per additional lead'
        ]
      },
      {
        tier: 'pro',
        name: 'Pro Subscription',
        price: 999,
        features: [
          '50 leads per month',
          'Premium support',
          'Custom integrations',
          'Advanced reporting',
          'R19.98 per lead (60% savings)',
          'R50 per additional lead'
        ]
      },
      {
        tier: 'enterprise',
        name: 'Enterprise Subscription',
        price: 1000,
        features: [
          '50 leads per month',
          'Dedicated account manager',
          'Custom features',
          'White-label options',
          'R20.00 per lead (60% savings)',
          'R50 per additional lead'
        ]
      }
    ]
    
    return subscriptionOptions
  }
  
  /**
   * Calculate credit cost for lead access based on job value
   * 1 credit = R50, but different jobs cost different credits
   */
  static calculateCreditCost(lead: Lead): number {
    // Base credits (not R50, but number of credits)
    let baseCredits = 1
    
    // High-value jobs cost more credits
    if (lead.budget_range === 'over_50000') {
      baseCredits = 8 // R400 for high-value jobs
    } else if (lead.budget_range === '15000_50000') {
      baseCredits = 5 // R250 for medium-high value
    } else if (lead.budget_range === '5000_15000') {
      baseCredits = 3 // R150 for medium value
    } else if (lead.budget_range === '1000_5000') {
      baseCredits = 2 // R100 for low-medium value
    } else {
      baseCredits = 1 // R50 for low value
    }
    
    // Urgent jobs cost extra credits
    if (lead.urgency === 'urgent') {
      baseCredits += 2 // +2 credits for urgent
    } else if (lead.urgency === 'this_week') {
      baseCredits += 1 // +1 credit for this week
    }
    
    // Service category multipliers
    const highValueCategories = ['building', 'renovation', 'electrical', 'plumbing']
    const category = lead.service_category?.toLowerCase() || ''
    
    if (highValueCategories.some(cat => category.includes(cat))) {
      baseCredits = Math.max(baseCredits, 3) // Minimum 3 credits for high-value categories
    }
    
    return baseCredits
  }
}






