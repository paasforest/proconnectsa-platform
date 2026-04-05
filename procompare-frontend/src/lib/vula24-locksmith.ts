/** Exact UTM for emergency locksmith funnel (TASK 1 banner). */
export const VULA24_EMERGENCY_BANNER_URL =
  "https://www.vula24.co.za/?utm_source=proconnectsa&utm_medium=emergency_banner&utm_campaign=locksmith_funnel"

/** Exact UTM for quote-flow redirect to Vula24 (TASK 2). */
export const VULA24_SERVICE_REDIRECT_URL =
  "https://www.vula24.co.za/?utm_source=proconnectsa&utm_medium=service_redirect&utm_campaign=locksmith_funnel"

/** Footer partner link (TASK 3). */
export const VULA24_FOOTER_URL =
  "https://www.vula24.co.za/?utm_source=proconnectsa&utm_medium=footer&utm_campaign=locksmith_funnel"

/** Resource guide hero/footer CTAs (TASK 4). */
export const VULA24_GUIDE_CTA_URL =
  "https://www.vula24.co.za/?utm_source=proconnectsa&utm_medium=guide&utm_campaign=locksmith_funnel"

/** Inline conversion link in locksmith cost guide body. */
export const VULA24_GUIDE_INLINE_CTA_URL =
  "https://www.vula24.co.za/?utm_source=proconnectsa&utm_medium=inline_cta&utm_campaign=locksmith_cost_guide"

export function isVula24EmergencyBannerProvince(provinceSlug: string): boolean {
  return provinceSlug === "gauteng" || provinceSlug === "western-cape"
}

export function isLocksmithServiceSlug(slug: string): boolean {
  const s = slug.toLowerCase()
  return s === "locksmith" || s === "emergency-locksmith"
}

/** True when the API category is locksmith (slug or display name). */
export function isLocksmithCategoryMatch(c: { slug: string; name: string } | null): boolean {
  if (!c) return false
  if (isLocksmithServiceSlug(c.slug)) return true
  const n = c.name.trim().toLowerCase()
  return n.includes("emergency locksmith") || n.includes("locksmith")
}
