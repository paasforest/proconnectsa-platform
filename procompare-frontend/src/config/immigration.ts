/**
 * Immigration AI Configuration
 * External Immigration AI website URL
 */
export const IMMIGRATION_AI_URL = process.env.NEXT_PUBLIC_IMMIGRATION_AI_URL || 'https://www.immigrationai.co.za';

/**
 * Analytics event names for tracking
 */
export const ANALYTICS_EVENTS = {
  IMMIGRATION_CTA_CLICK: 'immigration_ai_cta_click',
  IMMIGRATION_PAGE_VIEW: 'immigration_ai_page_view',
  IMMIGRATION_ELIGIBILITY_CHECK: 'immigration_eligibility_check',
} as const;

