import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Wrench } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Handyman Service Costs in South Africa (2026 Guide) | ProConnectSA",
  description: "Complete guide to handyman costs in South Africa. Average hourly rates, common job costs, and how to save money. Get free quotes from verified handymen.",
  openGraph: {
    title: "Handyman Service Costs in South Africa (2026 Guide) | ProConnectSA",
    description: "Average handyman costs, hourly rates, and job pricing in South Africa. Compare quotes from verified handymen.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HandymanCostsPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Handyman Service Costs in South Africa (2026 Guide)",
    description: "Complete guide to handyman costs, hourly rates, and job pricing in South Africa",
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
      "@id": "https://www.proconnectsa.co.za/resources/handyman-costs",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does a handyman cost per hour in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average handyman hourly rates in South Africa range from R200-R500 per hour. Simple jobs cost R300-R800, while complex projects cost R800-R2,500+. Rates vary based on job complexity, materials needed, and handyman experience.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect handyman costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect handyman costs: job complexity, materials needed, time required, location, handyman experience, and urgency. Simple repairs cost less than complex installations or renovations.",
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
                <span className="text-gray-900 font-medium">Handyman Costs</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Handyman Service Costs in South Africa (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Need a handyman? Average hourly rates range from R200-R500 per hour, with simple jobs costing R300-R800 and complex projects costing R800-R2,500+. This guide breaks down all handyman costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need repairs in <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, installations in <Link href="/cape-town/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or general maintenance, understanding handyman costs helps you make informed decisions. <Link href="/services/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified handymen</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/handyman-costs"
                  title="Handyman Service Costs in South Africa (2026 Guide)"
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
                    <div className="text-2xl font-bold text-emerald-700">R200-R500</div>
                    <div className="text-xs text-gray-500 mt-1">Per hour</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Simple Jobs</div>
                    <div className="text-2xl font-bold text-emerald-700">R300-R800</div>
                    <div className="text-xs text-gray-500 mt-1">Basic repairs</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Complex Projects</div>
                    <div className="text-2xl font-bold text-emerald-700">R800-R2,500+</div>
                    <div className="text-xs text-gray-500 mt-1">Installations</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/services/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified handymen</Link> to see real pricing for your specific job.
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Handyman Cost Breakdown</h2>
                <p className="text-gray-700 mb-4">
                  Handyman costs vary based on job complexity, materials needed, and time required. Simple repairs cost less than complex installations or renovations.
                </p>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Handyman Jobs</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                        <li>Furniture assembly: R300-R600</li>
                        <li>Picture hanging: R200-R400</li>
                        <li>Shelving installation: R400-R800</li>
                        <li>Door repairs: R500-R1,200</li>
                        <li>Cabinet installation: R800-R2,000</li>
                        <li>TV mounting: R400-R800</li>
                        <li>General repairs: R300-R1,000</li>
                      </ul>
                      <p className="text-gray-700">
                        <Link href="/services/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for handyman services</Link> from verified professionals.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Handyman Services</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different handymen. <Link href="/services/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified handymen</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Bundle Multiple Jobs</h3>
                      <p className="text-gray-700">
                        Combine multiple small jobs into one visit to save on callout fees and get better rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Handymen?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified handymen. See real pricing for your job, compare services, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/services/handyman"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Handyman Quotes →
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
