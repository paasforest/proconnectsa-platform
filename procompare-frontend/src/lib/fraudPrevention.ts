import { Lead } from '@/types'

export interface FraudScore {
  total_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
  recommendations: string[]
}

export interface FraudDetectionResult {
  is_fraud: boolean
  fraud_score: FraudScore
  verification_required: boolean
  manual_review_required: boolean
  auto_approve: boolean
}

/**
 * Fraud Prevention Service
 * Prevents fake leads and abuse like the Bark.com problem
 */
export class FraudPreventionService {
  private static readonly FRAUD_THRESHOLDS = {
    low: 30,
    medium: 60,
    high: 80,
    critical: 90
  }

  private static readonly RISK_FACTORS = {
    // Contact information validation
    invalid_phone: 20,
    invalid_email: 15,
    disposable_email: 25,
    voip_number: 10,
    
    // Location validation
    invalid_address: 15,
    suspicious_location: 10,
    location_mismatch: 20,
    
    // Behavioral patterns
    rapid_submissions: 30,
    duplicate_content: 25,
    suspicious_timing: 15,
    low_quality_description: 10,
    
    // Technical indicators
    suspicious_ip: 20,
    bot_indicators: 30,
    proxy_detection: 25,
    
    // Content analysis
    spam_keywords: 20,
    suspicious_patterns: 15,
    fake_urgency: 10
  }

  /**
   * Analyze a lead for fraud indicators
   */
  static analyzeLead(lead: Lead, userHistory?: any[]): FraudDetectionResult {
    const fraudScore = this.calculateFraudScore(lead, userHistory)
    
    const is_fraud = fraudScore.total_score >= this.FRAUD_THRESHOLDS.critical
    const verification_required = fraudScore.total_score >= this.FRAUD_THRESHOLDS.medium
    const manual_review_required = fraudScore.total_score >= this.FRAUD_THRESHOLDS.high
    const auto_approve = fraudScore.total_score < this.FRAUD_THRESHOLDS.low

    return {
      is_fraud,
      fraud_score: fraudScore,
      verification_required,
      manual_review_required,
      auto_approve
    }
  }

  /**
   * Calculate comprehensive fraud score
   */
  private static calculateFraudScore(lead: Lead, userHistory?: any[]): FraudScore {
    let totalScore = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    // Contact information validation
    const contactScore = this.validateContactInfo(lead)
    totalScore += contactScore.score
    reasons.push(...contactScore.reasons)
    recommendations.push(...contactScore.recommendations)

    // Location validation
    const locationScore = this.validateLocation(lead)
    totalScore += locationScore.score
    reasons.push(...locationScore.reasons)
    recommendations.push(...locationScore.recommendations)

    // Behavioral analysis
    const behaviorScore = this.analyzeBehavior(lead, userHistory)
    totalScore += behaviorScore.score
    reasons.push(...behaviorScore.reasons)
    recommendations.push(...behaviorScore.recommendations)

    // Content analysis
    const contentScore = this.analyzeContent(lead)
    totalScore += contentScore.score
    reasons.push(...contentScore.reasons)
    recommendations.push(...contentScore.recommendations)

    // Technical analysis
    const technicalScore = this.analyzeTechnical(lead)
    totalScore += technicalScore.score
    reasons.push(...technicalScore.reasons)
    recommendations.push(...technicalScore.recommendations)

    const risk_level = this.getRiskLevel(totalScore)

    return {
      total_score: Math.min(totalScore, 100),
      risk_level,
      reasons: [...new Set(reasons)], // Remove duplicates
      recommendations: [...new Set(recommendations)]
    }
  }

  /**
   * Validate contact information
   */
  private static validateContactInfo(lead: Lead): { score: number; reasons: string[]; recommendations: string[] } {
    let score = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    // Phone validation
    if (!this.isValidPhoneNumber(lead.contact_phone)) {
      score += this.RISK_FACTORS.invalid_phone
      reasons.push('Invalid phone number format')
      recommendations.push('Verify phone number with SMS')
    }

    // Email validation
    if (!this.isValidEmail(lead.contact_email)) {
      score += this.RISK_FACTORS.invalid_email
      reasons.push('Invalid email format')
      recommendations.push('Verify email address')
    }

    // Disposable email check
    if (this.isDisposableEmail(lead.contact_email)) {
      score += this.RISK_FACTORS.disposable_email
      reasons.push('Disposable email detected')
      recommendations.push('Require verified email address')
    }

    // VoIP number check
    if (this.isVoIPNumber(lead.contact_phone)) {
      score += this.RISK_FACTORS.voip_number
      reasons.push('VoIP number detected')
      recommendations.push('Verify with alternative contact method')
    }

    return { score, reasons, recommendations }
  }

  /**
   * Validate location information
   */
  private static validateLocation(lead: Lead): { score: number; reasons: string[]; recommendations: string[] } {
    let score = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    // Address validation
    if (!this.isValidAddress(lead.address)) {
      score += this.RISK_FACTORS.invalid_address
      reasons.push('Invalid or incomplete address')
      recommendations.push('Verify address with location service')
    }

    // Suspicious location patterns
    if (this.isSuspiciousLocation(lead.location_suburb, lead.location_city)) {
      score += this.RISK_FACTORS.suspicious_location
      reasons.push('Suspicious location pattern')
      recommendations.push('Manual location verification')
    }

    // Location mismatch
    if (this.hasLocationMismatch(lead.address, lead.location_suburb, lead.location_city)) {
      score += this.RISK_FACTORS.location_mismatch
      reasons.push('Address and location mismatch')
      recommendations.push('Verify location consistency')
    }

    return { score, reasons, recommendations }
  }

  /**
   * Analyze behavioral patterns
   */
  private static analyzeBehavior(lead: Lead, userHistory?: any[]): { score: number; reasons: string[]; recommendations: string[] } {
    let score = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    if (!userHistory) return { score, reasons, recommendations }

    // Rapid submissions
    const recentSubmissions = this.getRecentSubmissions(userHistory, 24) // Last 24 hours
    if (recentSubmissions > 3) {
      score += this.RISK_FACTORS.rapid_submissions
      reasons.push(`Too many submissions in 24h (${recentSubmissions})`)
      recommendations.push('Implement rate limiting')
    }

    // Duplicate content
    if (this.hasDuplicateContent(lead, userHistory)) {
      score += this.RISK_FACTORS.duplicate_content
      reasons.push('Duplicate content detected')
      recommendations.push('Require unique descriptions')
    }

    // Suspicious timing
    if (this.isSuspiciousTiming(lead)) {
      score += this.RISK_FACTORS.suspicious_timing
      reasons.push('Suspicious submission timing')
      recommendations.push('Review submission patterns')
    }

    return { score, reasons, recommendations }
  }

  /**
   * Analyze content quality
   */
  private static analyzeContent(lead: Lead): { score: number; reasons: string[]; recommendations: string[] } {
    let score = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    // Low quality description
    if (this.isLowQualityDescription(lead.description)) {
      score += this.RISK_FACTORS.low_quality_description
      reasons.push('Low quality description')
      recommendations.push('Require more detailed descriptions')
    }

    // Spam keywords
    if (this.containsSpamKeywords(lead.description)) {
      score += this.RISK_FACTORS.spam_keywords
      reasons.push('Spam keywords detected')
      recommendations.push('Content moderation required')
    }

    // Suspicious patterns
    if (this.hasSuspiciousPatterns(lead)) {
      score += this.RISK_FACTORS.suspicious_patterns
      reasons.push('Suspicious content patterns')
      recommendations.push('Manual content review')
    }

    // Fake urgency
    if (this.hasFakeUrgency(lead)) {
      score += this.RISK_FACTORS.fake_urgency
      reasons.push('Fake urgency indicators')
      recommendations.push('Verify urgency claims')
    }

    return { score, reasons, recommendations }
  }

  /**
   * Analyze technical indicators
   */
  private static analyzeTechnical(lead: Lead): { score: number; reasons: string[]; recommendations: string[] } {
    let score = 0
    const reasons: string[] = []
    const recommendations: string[] = []

    // This would integrate with your backend to check:
    // - IP address reputation
    // - User agent analysis
    // - Request patterns
    // - Device fingerprinting

    // For now, return basic analysis
    return { score, reasons, recommendations }
  }

  /**
   * Get risk level based on score
   */
  private static getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.FRAUD_THRESHOLDS.critical) return 'critical'
    if (score >= this.FRAUD_THRESHOLDS.high) return 'high'
    if (score >= this.FRAUD_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  // Validation helper methods
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+27|0)[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'temp-mail.org', 'throwaway.email'
    ]
    const domain = email.split('@')[1]?.toLowerCase()
    return disposableDomains.includes(domain || '')
  }

  private static isVoIPNumber(phone: string): boolean {
    // This would integrate with a VoIP detection service
    // For now, return false
    return false
  }

  private static isValidAddress(address: string): boolean {
    return address.length > 10 && address.includes(' ')
  }

  private static isSuspiciousLocation(suburb: string, city: string): boolean {
    // Check for suspicious patterns like "Test", "Fake", etc.
    const suspiciousWords = ['test', 'fake', 'dummy', 'example']
    const location = `${suburb} ${city}`.toLowerCase()
    return suspiciousWords.some(word => location.includes(word))
  }

  private static hasLocationMismatch(address: string, suburb: string, city: string): boolean {
    // This would integrate with a geocoding service
    // For now, return false
    return false
  }

  private static getRecentSubmissions(userHistory: any[], hours: number): number {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return userHistory.filter(entry => new Date(entry.created_at) > cutoff).length
  }

  private static hasDuplicateContent(lead: Lead, userHistory: any[]): boolean {
    const recentLeads = userHistory.slice(0, 10) // Check last 10 leads
    return recentLeads.some(entry => 
      entry.description === lead.description ||
      entry.title === lead.title
    )
  }

  private static isSuspiciousTiming(lead: Lead): boolean {
    const hour = new Date().getHours()
    // Suspicious if submitted between 2-5 AM
    return hour >= 2 && hour <= 5
  }

  private static isLowQualityDescription(description: string): boolean {
    return description.length < 50 || 
           description.split(' ').length < 10 ||
           !description.includes(' ')
  }

  private static containsSpamKeywords(description: string): boolean {
    const spamKeywords = [
      'click here', 'free money', 'make money fast',
      'work from home', 'get rich quick', 'guaranteed'
    ]
    const text = description.toLowerCase()
    return spamKeywords.some(keyword => text.includes(keyword))
  }

  private static hasSuspiciousPatterns(lead: Lead): boolean {
    // Check for patterns like all caps, excessive punctuation, etc.
    const description = lead.description
    const hasAllCaps = description === description.toUpperCase() && description.length > 20
    const hasExcessivePunctuation = (description.match(/[!]{2,}/g) || []).length > 2
    
    return hasAllCaps || hasExcessivePunctuation
  }

  private static hasFakeUrgency(lead: Lead): boolean {
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'emergency']
    const description = lead.description.toLowerCase()
    const hasUrgencyKeywords = urgencyKeywords.some(keyword => description.includes(keyword))
    
    // If marked as flexible but has urgency keywords, it's suspicious
    return lead.urgency === 'flexible' && hasUrgencyKeywords
  }

  /**
   * Get fraud prevention recommendations
   */
  static getFraudPreventionRecommendations(): string[] {
    return [
      'Implement phone number verification via SMS',
      'Require email verification before lead activation',
      'Add CAPTCHA to lead submission forms',
      'Implement rate limiting (max 3 leads per 24h)',
      'Add location verification via GPS',
      'Require minimum description length (100+ characters)',
      'Implement IP reputation checking',
      'Add device fingerprinting',
      'Require photo uploads for verification',
      'Implement manual review for high-risk leads'
    ]
  }
}





