import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Sparkles } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Cleaning Service Costs in South Africa (2026 Guide) | ProConnectSA",
  description: "Complete guide to cleaning service costs in South Africa. Average hourly rates, one-time cleaning prices, and how to save money. Get free quotes from verified cleaners.",
  openGraph: {
    title: "Cleaning Service Costs in South Africa (2026 Guide) | ProConnectSA",
    description: "Average cleaning service costs, hourly rates, and pricing in South Africa. Compare quotes from verified cleaning professionals.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CleaningServiceCostsPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cleaning Service Costs in South Africa (2026 Guide)",
    description: "Complete guide to cleaning service costs, hourly rates, and pricing in South Africa",
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
      "@id": "https://www.proconnectsa.co.za/resources/cleaning-service-costs",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does a cleaning service cost per hour in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average cleaning service hourly rates in South Africa range from R80-R200 per hour. One-time deep cleaning costs R500-R2,500 depending on property size. Regular weekly/monthly cleaning costs R400-R1,500 per visit.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect cleaning service costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect cleaning costs: property size, cleaning type (regular vs deep clean), frequency, location, special requirements (windows, carpets, ovens), and cleaner experience. Larger properties and deep cleaning cost more.",
        },
      },
      {
        "@type": "Question",
        name: "How much does a one-time deep clean cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "One-time deep cleaning costs R500-R2,500 depending on property size. A 1-bedroom apartment costs R500-R800, a 3-bedroom house costs R1,000-R1,800, and larger properties cost R1,500-R2,500+. Always get multiple quotes for accurate pricing.",
        },
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-gray-900">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/resources" className="hover:text-gray-900">Resources</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Cleaning Service Costs</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Cleaning Service Costs in South Africa (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Looking for cleaning services? Average hourly rates range from R80-R200 per hour, with one-time deep cleaning costing R500-R2,500 depending on property size. This guide breaks down all cleaning costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need regular cleaning in <Link href="/johannesburg/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or <Link href="/durban/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, understanding cleaning costs helps you make informed decisions. <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified cleaning services</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/cleaning-service-costs"
                  title="Cleaning Service Costs in South Africa (2026 Guide)"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Quick Cost Overview */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                  Quick Cost Overview
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Hourly Rate</div>
                    <div className="text-2xl font-bold text-emerald-700">R80-R200</div>
                    <div className="text-xs text-gray-500 mt-1">Per cleaner</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">One-Time Deep Clean</div>
                    <div className="text-2xl font-bold text-emerald-700">R500-R2,500</div>
                    <div className="text-xs text-gray-500 mt-1">Property size dependent</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Regular Cleaning</div>
                    <div className="text-2xl font-bold text-emerald-700">R400-R1,500</div>
                    <div className="text-xs text-gray-500 mt-1">Per visit</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified cleaning services</Link> to see real pricing for your specific needs.
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Cleaning Service Cost Breakdown</h2>
                <p className="text-gray-700 mb-4">
                  Cleaning costs vary based on property size, cleaning type, frequency, and location. Regular cleaning is more cost-effective than one-time deep cleaning, and larger properties cost more to clean.
                </p>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Time Deep Cleaning</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                        <li>1-bedroom apartment: R500-R800</li>
                        <li>2-bedroom apartment: R700-R1,200</li>
                        <li>3-bedroom house: R1,000-R1,800</li>
                        <li>4-5 bedroom house: R1,500-R2,500</li>
                        <li>Large properties: R2,000-R3,500+</li>
                      </ul>
                      <p className="text-gray-700">
                        Deep cleaning includes detailed scrubbing, window cleaning, oven cleaning, and thorough dusting. <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for deep cleaning services</Link> from verified professionals.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Cleaning (Weekly/Monthly)</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                        <li>1-bedroom apartment: R400-R700 per visit</li>
                        <li>2-bedroom apartment: R500-R900 per visit</li>
                        <li>3-bedroom house: R700-R1,200 per visit</li>
                        <li>4-5 bedroom house: R1,000-R1,500 per visit</li>
                      </ul>
                      <p className="text-gray-700">
                        Regular cleaning includes vacuuming, mopping, dusting, and bathroom cleaning. <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Find regular cleaning services</Link> in your area.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Cleaning Services</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different cleaners. <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified cleaning services</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Choose Regular Cleaning</h3>
                      <p className="text-gray-700">
                        Regular weekly or monthly cleaning is more cost-effective than one-time deep cleans and keeps your property consistently clean.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Cleaning Services?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified cleaning services. See real pricing for your property size, compare services, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/services/cleaning"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Cleaning Service Quotes →
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
