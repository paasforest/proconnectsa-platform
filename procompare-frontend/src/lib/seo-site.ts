/**
 * Canonical public site origin. Must stay aligned with:
 * - `metadataBase` in `app/layout.tsx`
 * - Primary domain in Vercel / DNS (www)
 */
export const SITE_ORIGIN = "https://www.proconnectsa.co.za" as const

/** Absolute URL for a path (e.g. `/services/plumbing` → full https URL). */
export function siteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_ORIGIN}${normalized}`
}
