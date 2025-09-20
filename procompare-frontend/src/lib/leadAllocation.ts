import { Lead, ProviderProfile } from '@/types'

export interface LeadAllocationResult {
  provider: ProviderProfile
  score: number
  reasons: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface AllocationCriteria {
  location_match: number
  service_match: number
  availability: number
  rating: number
  response_time: number
  subscription_tier: number
  workload: number
}

/**
 * Lead Allocation Service
 * Intelligently matches leads with the best providers based on multiple criteria
 */
export class LeadAllocationService {
  private static readonly ALLOCATION_WEIGHTS: AllocationCriteria = {
    location_match: 25,    // 25% - Geographic proximity
    service_match: 20,     // 20% - Service category match
    availability: 15,      // 15% - Provider availability
    rating: 15,           // 15% - Provider rating
    response_time: 10,     // 10% - Response time
    subscription_tier: 10, // 10% - Subscription tier priority
    workload: 5           // 5% - Current workload
  }

  /**
   * Allocate a lead to the best matching providers
   */
  static allocateLead(
    lead: Lead, 
    availableProviders: ProviderProfile[],
    maxProviders: number = 5
  ): LeadAllocationResult[] {
    if (availableProviders.length === 0) {
      return []
    }

    // Filter providers by basic criteria
    const eligibleProviders = this.filterEligibleProviders(lead, availableProviders)
    
    if (eligibleProviders.length === 0) {
      return []
    }

    // Score each provider
    const scoredProviders = eligibleProviders.map(provider => ({
      provider,
      score: this.calculateProviderScore(lead, provider),
      reasons: this.getScoreReasons(lead, provider),
      priority: this.calculatePriority(lead, provider)
    }))

    // Sort by score (highest first)
    scoredProviders.sort((a, b) => b.score - a.score)

    // Return top providers
    return scoredProviders.slice(0, maxProviders)
  }

  /**
   * Filter providers based on basic eligibility criteria
   */
  private static filterEligibleProviders(
    lead: Lead, 
    providers: ProviderProfile[]
  ): ProviderProfile[] {
    return providers.filter(provider => {
      // Must be verified
      if (provider.verification_status !== 'verified') {
        return false
      }

      // Must be active (not suspended)
      if (provider.verification_status === 'suspended') {
        return false
      }

      // Must serve the lead's location
      if (!this.providerServesLocation(provider, lead.location_suburb, lead.location_city)) {
        return false
      }

      // Must have available credits or be a subscriber
      if (!this.hasAvailableAccess(provider)) {
        return false
      }

      // Must be within travel distance
      if (!this.isWithinTravelDistance(provider, lead)) {
        return false
      }

      return true
    })
  }

  /**
   * Calculate comprehensive provider score using hybrid scoring
   */
  private static calculateProviderScore(lead: Lead, provider: ProviderProfile): number {
    const scores = {
      location_match: this.calculateLocationScore(lead, provider),
      service_match: this.calculateServiceScore(lead, provider),
      availability: this.calculateAvailabilityScore(provider),
      rating: this.calculateRatingScore(provider),
      response_time: this.calculateResponseTimeScore(provider),
      subscription_tier: this.calculateSubscriptionScore(provider),
      workload: this.calculateWorkloadScore(provider)
    }

    // Calculate weighted score
    let totalScore = 0
    Object.entries(scores).forEach(([key, score]) => {
      const weight = this.ALLOCATION_WEIGHTS[key as keyof AllocationCriteria]
      totalScore += score * (weight / 100)
    })

    // Apply hybrid scoring enhancement if available
    const hybridEnhancement = this.calculateHybridEnhancement(lead, provider)
    totalScore = totalScore * (1 + hybridEnhancement)

    return Math.round(Math.min(100, Math.max(0, totalScore)))
  }

  /**
   * Calculate hybrid scoring enhancement based on ML readiness
   */
  private static calculateHybridEnhancement(lead: Lead, provider: ProviderProfile): number {
    // This would be enhanced with actual ML confidence scores
    // For now, return a small enhancement based on lead quality
    const leadQuality = lead.verification_score || 50
    const providerRating = provider.average_rating || 0
    
    // Simple enhancement: better leads and providers get slight boost
    if (leadQuality > 80 && providerRating > 4.5) {
      return 0.1  // 10% boost
    } else if (leadQuality > 60 && providerRating > 4.0) {
      return 0.05  // 5% boost
    }
    
    return 0  // No enhancement
  }

  /**
   * Calculate location match score (0-100)
   */
  private static calculateLocationScore(lead: Lead, provider: ProviderProfile): number {
    const leadLocation = `${lead.location_suburb}, ${lead.location_city}`.toLowerCase()
    
    // Exact suburb match
    if (provider.service_areas.some(area => 
      area.toLowerCase().includes(lead.location_suburb.toLowerCase())
    )) {
      return 100
    }

    // City match
    if (provider.service_areas.some(area => 
      area.toLowerCase().includes(lead.location_city.toLowerCase())
    )) {
      return 80
    }

    // Partial match
    if (provider.service_areas.some(area => 
      area.toLowerCase().includes(lead.location_suburb.split(' ')[0].toLowerCase())
    )) {
      return 60
    }

    return 40 // Default score for same city
  }

  /**
   * Calculate service category match score (0-100)
   */
  private static calculateServiceScore(lead: Lead, provider: ProviderProfile): number {
    // This would need to be enhanced based on your service category mapping
    // For now, return a base score
    return 85
  }

  /**
   * Calculate availability score (0-100)
   */
  private static calculateAvailabilityScore(provider: ProviderProfile): number {
    // Check if provider is currently available
    const now = new Date()
    const lastActive = new Date(provider.updated_at)
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

    if (hoursSinceActive < 1) return 100
    if (hoursSinceActive < 24) return 90
    if (hoursSinceActive < 72) return 70
    return 50
  }

  /**
   * Calculate rating score (0-100)
   */
  private static calculateRatingScore(provider: ProviderProfile): number {
    if (provider.total_reviews === 0) return 50 // Neutral score for no reviews
    
    const rating = provider.average_rating
    if (rating >= 4.8) return 100
    if (rating >= 4.5) return 90
    if (rating >= 4.0) return 80
    if (rating >= 3.5) return 70
    if (rating >= 3.0) return 60
    return 40
  }

  /**
   * Calculate response time score (0-100)
   */
  private static calculateResponseTimeScore(provider: ProviderProfile): number {
    const responseTime = provider.response_time_hours
    
    if (responseTime <= 1) return 100
    if (responseTime <= 2) return 90
    if (responseTime <= 4) return 80
    if (responseTime <= 8) return 70
    if (responseTime <= 24) return 60
    return 40
  }

  /**
   * Calculate subscription tier score (0-100)
   */
  private static calculateSubscriptionScore(provider: ProviderProfile): number {
    if (!provider.subscription_tier) return 30 // Pay-as-you-go gets lower priority
    
    const tierScores = {
      basic: 60,
      advanced: 75,
      pro: 90,
      enterprise: 100
    }
    
    return tierScores[provider.subscription_tier] || 30
  }

  /**
   * Calculate workload score (0-100)
   */
  private static calculateWorkloadScore(provider: ProviderProfile): number {
    const monthlyLimit = provider.monthly_lead_limit || 50
    const used = provider.leads_used_this_month || 0
    const utilization = (used / monthlyLimit) * 100
    
    if (utilization < 50) return 100
    if (utilization < 70) return 80
    if (utilization < 90) return 60
    return 40
  }

  /**
   * Calculate priority level
   */
  private static calculatePriority(lead: Lead, provider: ProviderProfile): 'high' | 'medium' | 'low' {
    const score = this.calculateProviderScore(lead, provider)
    
    if (score >= 85) return 'high'
    if (score >= 70) return 'medium'
    return 'low'
  }

  /**
   * Get reasons for the score
   */
  private static getScoreReasons(lead: Lead, provider: ProviderProfile): string[] {
    const reasons: string[] = []
    
    // Location reasons
    if (this.calculateLocationScore(lead, provider) >= 90) {
      reasons.push('Perfect location match')
    } else if (this.calculateLocationScore(lead, provider) >= 70) {
      reasons.push('Good location match')
    }
    
    // Rating reasons
    if (provider.average_rating >= 4.8) {
      reasons.push('Excellent rating')
    } else if (provider.average_rating >= 4.5) {
      reasons.push('High rating')
    }
    
    // Response time reasons
    if (provider.response_time_hours <= 2) {
      reasons.push('Fast response time')
    }
    
    // Subscription reasons
    if (provider.subscription_tier) {
      reasons.push(`${provider.subscription_tier} subscriber`)
    }
    
    // Availability reasons
    const now = new Date()
    const lastActive = new Date(provider.updated_at)
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceActive < 1) {
      reasons.push('Currently active')
    }
    
    return reasons
  }

  /**
   * Check if provider serves the location
   */
  private static providerServesLocation(
    provider: ProviderProfile, 
    suburb: string, 
    city: string
  ): boolean {
    const location = `${suburb}, ${city}`.toLowerCase()
    
    return provider.service_areas.some(area => 
      area.toLowerCase().includes(suburb.toLowerCase()) ||
      area.toLowerCase().includes(city.toLowerCase())
    )
  }

  /**
   * Check if provider has available access
   */
  private static hasAvailableAccess(provider: ProviderProfile): boolean {
    // Subscribers always have access
    if (provider.subscription_tier) {
      return true
    }
    
    // Pay-as-you-go needs credits
    return provider.credit_balance > 0
  }

  /**
   * Check if provider is within travel distance
   */
  private static isWithinTravelDistance(provider: ProviderProfile, lead: Lead): boolean {
    // This would need actual distance calculation
    // For now, assume all providers in the same city are within range
    return true
  }

  /**
   * Get allocation summary
   */
  static getAllocationSummary(results: LeadAllocationResult[]): {
    total_providers: number
    high_priority: number
    medium_priority: number
    low_priority: number
    average_score: number
    top_reasons: string[]
  } {
    const total_providers = results.length
    const high_priority = results.filter(r => r.priority === 'high').length
    const medium_priority = results.filter(r => r.priority === 'medium').length
    const low_priority = results.filter(r => r.priority === 'low').length
    const average_score = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0
    
    // Get most common reasons
    const allReasons = results.flatMap(r => r.reasons)
    const reasonCounts = allReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const top_reasons = Object.entries(reasonCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([reason]) => reason)

    return {
      total_providers,
      high_priority,
      medium_priority,
      low_priority,
      average_score,
      top_reasons
    }
  }
}






