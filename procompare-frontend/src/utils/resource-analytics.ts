export type ResourceGuideCtaKind =
  | 'hero'
  | 'quick_price'
  | 'quote_block'
  | 'footer'
  | 'intro_inline'

/**
 * Fires GA4-compatible events when users click resource guide CTAs.
 * Configure a custom event "resource_guide_cta_click" in GA4 / GTM to build funnels.
 */
export function trackResourceGuideCta(payload: {
  guideSlug: string
  ctaKind: ResourceGuideCtaKind
  href: string
}): void {
  if (typeof window === 'undefined') return
  const w = window as Window & {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
  const eventParams = {
    event_category: 'Resource Guide',
    event_label: payload.guideSlug,
    cta_kind: payload.ctaKind,
    link_url: payload.href,
  }
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'resource_guide_cta_click', eventParams)
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: 'resource_guide_cta_click', ...eventParams })
  }
}

/** Fires when the public quote form submits successfully (conversion). */
export function trackPublicLeadSubmit(payload: { serviceSlug: string }): void {
  if (typeof window === 'undefined') return
  const w = window as Window & {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
  const eventParams = {
    event_category: 'Lead Form',
    event_label: payload.serviceSlug,
  }
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'public_lead_submit', eventParams)
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: 'public_lead_submit', ...eventParams })
  }
}
