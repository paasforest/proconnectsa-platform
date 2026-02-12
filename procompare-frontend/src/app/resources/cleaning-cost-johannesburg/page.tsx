import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Sparkles } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Cleaning Service Costs in Johannesburg (2026 Guide) | ProConnectSA",
  description: "Complete guide to cleaning service costs in Johannesburg. Average hourly rates, one-time cleaning prices, and how to save money. Get free quotes from verified cleaners.",
  openGraph: {
    title: "Cleaning Service Costs in Johannesburg (2026 Guide) | ProConnectSA",
    description: "Average cleaning service costs, hourly rates, and pricing in Johannesburg. Compare quotes from verified cleaning professionals.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CleaningCostJohannesburgPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cleaning Service Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to cleaning service costs, hourly rates, and pricing in Johannesburg",
    author: {
      "@type": "Organization",
      name: "ProConnectSA",
    },
    publisher: {
      "@type": "Organization",
      name: "ProConnectSA",
      logo: {
        "@type": "ImageObject",
        url: "https://www.proconnectsa.co.za/logo.png",
      },
    },
    datePublished: "2026-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.proconnectsa.co.za/resources/cleaning-cost-johannesburg",
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-gray-900">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/resources" className="hover:text-gray-900">Resources</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Cleaning Cost Johannesburg</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Cleaning Service Costs in Johannesburg (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Looking for cleaning services in Johannesburg? Average hourly rates range from R80-R200 per hour, with one-time deep cleaning costing R500-R2,500 depending on property size. This guide breaks down all cleaning costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need regular cleaning in <Link href="/johannesburg/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, deep cleaning, or move-in/out cleaning, understanding cleaning costs helps you make informed decisions. <Link href="/johannesburg/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified cleaning services in Johannesburg</Link> to compare pricing and find the best rates.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                  Quick Cost Overview
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Hourly Rate</div>
                    <div className="text-2xl font-bold text-emerald-700">R80-R200</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">One-Time Deep Clean</div>
                    <div className="text-2xl font-bold text-emerald-700">R500-R2,500</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Regular Cleaning</div>
                    <div className="text-2xl font-bold text-emerald-700">R400-R1,500</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/johannesburg/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified cleaning services in Johannesburg</Link> to see real pricing for your specific needs.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Cleaning Services in Johannesburg?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified cleaning services in Johannesburg. See real pricing for your property size, compare services, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/johannesburg/cleaning"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Cleaning Service Quotes in Johannesburg →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
