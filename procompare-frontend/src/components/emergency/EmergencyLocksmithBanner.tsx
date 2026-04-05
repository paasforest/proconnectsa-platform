import { VULA24_EMERGENCY_BANNER_URL } from "@/lib/vula24-locksmith"

/**
 * Full-width urgency strip for Vula24 emergency locksmith funnel.
 * Place as the first child of the page layout (above the header).
 */
export function EmergencyLocksmithBanner() {
  return (
    <div
      className="w-full border-b border-amber-800/30 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 text-white shadow-md"
      role="region"
      aria-label="Emergency locksmith partner"
    >
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-lg font-bold leading-tight tracking-tight md:text-xl">
            Locked Out? Get a Locksmith in 15 Minutes
          </p>
          <p className="mt-1 text-sm text-amber-50/95 md:text-base">
            Available 24/7 in Gauteng &amp; Western Cape
          </p>
        </div>
        <div className="flex shrink-0 justify-center sm:justify-end">
          <a
            href={VULA24_EMERGENCY_BANNER_URL}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get Help Now →
          </a>
        </div>
      </div>
    </div>
  )
}
