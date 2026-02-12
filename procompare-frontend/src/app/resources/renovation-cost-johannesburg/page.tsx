import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Home } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Renovation Costs in Johannesburg (2026 Guide) | ProConnectSA",
  description: "Complete guide to renovation costs in Johannesburg. Average prices for kitchen, bathroom, and home renovations. Get free quotes from verified contractors.",
  openGraph: {
    title: "Renovation Costs in Johannesburg (2026 Guide) | ProConnectSA",
    description: "Average renovation costs, kitchen and bathroom prices, and project costs in Johannesburg. Compare quotes from verified contractors.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RenovationCostJohannesburgPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Renovation Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to renovation costs, kitchen and bathroom prices, and project costs in Johannesburg",
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
      "@id": "https://www.proconnectsa.co.za/resources/renovation-cost-johannesburg",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does a kitchen renovation cost in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kitchen renovation costs in Johannesburg range from R50,000-R200,000+ depending on size, materials, and scope. A basic kitchen refresh costs R50,000-R80,000, while a complete renovation with new appliances costs R100,000-R200,000+.",
        },
      },
      {
        "@type": "Question",
        name: "How much does a bathroom renovation cost in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bathroom renovation costs in Johannesburg range from R30,000-R100,000+ depending on size and materials. A basic bathroom refresh costs R30,000-R50,000, while a complete renovation costs R60,000-R100,000+.",
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
                <span className="text-gray-900 font-medium">Renovation Cost Johannesburg</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Renovation Costs in Johannesburg (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Planning a renovation in Johannesburg? Kitchen renovations cost R50,000-R200,000+, bathroom renovations cost R30,000-R100,000+, and complete home renovations cost R200,000-R500,000+. This guide breaks down all renovation costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need a kitchen renovation in <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, bathroom renovation, or complete home makeover, understanding renovation costs helps you make informed decisions. <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified contractors in Johannesburg</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/renovation-cost-johannesburg"
                  title="Renovation Costs in Johannesburg (2026 Guide)"
                />
              </div>
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
                    <div className="text-sm text-gray-600 mb-1">Kitchen Renovation</div>
                    <div className="text-2xl font-bold text-emerald-700">R50k-R200k+</div>
                    <div className="text-xs text-gray-500 mt-1">Complete renovation</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Bathroom Renovation</div>
                    <div className="text-2xl font-bold text-emerald-700">R30k-R100k+</div>
                    <div className="text-xs text-gray-500 mt-1">Complete renovation</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Home Renovation</div>
                    <div className="text-2xl font-bold text-emerald-700">R200k-R500k+</div>
                    <div className="text-xs text-gray-500 mt-1">Complete home</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified contractors in Johannesburg</Link> to see real pricing for your specific project.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Renovation Cost Breakdown in Johannesburg</h2>
                <p className="text-gray-700 mb-4">
                  Renovation costs in Johannesburg vary significantly based on project scope, materials, and location. Areas like <Link href="/sandton/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Sandton</Link> and <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Rosebank</Link> may have slightly higher rates than other areas.
                </p>
                <p className="text-gray-700">
                  The best way to ensure you're getting fair pricing is to <Link href="/johannesburg/handyman" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">compare quotes from multiple verified contractors in Johannesburg</Link>. This allows you to see real pricing for your specific project and choose the best value.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Contractors in Johannesburg?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified contractors in Johannesburg. See real pricing for your renovation project, compare services, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/johannesburg/handyman"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Renovation Quotes in Johannesburg →
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
