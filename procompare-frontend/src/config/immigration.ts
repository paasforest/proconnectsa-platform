/**
 * Immigration AI Configuration
 * External Immigration AI website URL
 */
export const IMMIGRATION_AI_URL = process.env.NEXT_PUBLIC_IMMIGRATION_AI_URL || 'https://www.immigrationai.co.za';

/**
 * Build Immigration AI URL with tracking parameters
 * @param planSlug - Optional plan identifier (starter, entry, professional, enterprise)
 * @param source - Source identifier for tracking (default: 'proconnectsa')
 * @returns Full URL with UTM parameters and plan
 */
export function buildImmigrationAIUrl(planSlug?: string, source: string = 'proconnectsa'): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: 'website',
    utm_campaign: 'immigration_integration',
    utm_content: planSlug || 'general',
  });
  
  if (planSlug) {
    params.set('plan', planSlug);
  }
  
  return `${IMMIGRATION_AI_URL}?${params.toString()}`;
}

/**
 * Plan mapping: Maps ProConnectSA plan names to Immigration AI plan identifiers
 * These plan slugs are passed as URL parameters to pre-select the plan on Immigration AI website
 */
export const IMMIGRATION_PLAN_MAPPING: Record<string, string> = {
  'Starter Plan': 'starter',
  'Entry Plan': 'entry',
  'Professional Plan': 'professional',
  'Enterprise Plan': 'enterprise',
  // Alternative mappings (in case Immigration AI uses different identifiers)
  'starter': 'starter',
  'entry': 'entry',
  'professional': 'professional',
  'enterprise': 'enterprise',
};

/**
 * Analytics event names for tracking
 */
export const ANALYTICS_EVENTS = {
  IMMIGRATION_CTA_CLICK: 'immigration_ai_cta_click',
  IMMIGRATION_PAGE_VIEW: 'immigration_ai_page_view',
  IMMIGRATION_ELIGIBILITY_CHECK: 'immigration_eligibility_check',
} as const;

