import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Trees } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Landscaping Costs in South Africa (2026 Guide) | ProConnectSA",
  description: "Complete guide to landscaping costs in South Africa. Average prices for garden design, lawn installation, and maintenance. Get free quotes from verified landscapers.",
  openGraph: {
    title: "Landscaping Costs in South Africa (2026 Guide) | ProConnectSA",
    description: "Average landscaping costs, garden design prices, and maintenance costs in South Africa. Compare quotes from verified landscapers.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandscapingCostPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Landscaping Costs in South Africa (2026 Guide)",
    description: "Complete guide to landscaping costs, garden design prices, and maintenance costs in South Africa",
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
      "@id": "https://www.proconnectsa.co.za/resources/landscaping-cost-south-africa",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does landscaping cost in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Landscaping costs in South Africa range from R50-R150 per square meter for basic design and installation. A small garden (50m²) costs R5,000-R15,000, while a large garden (500m²+) costs R50,000-R150,000+. Maintenance costs R500-R2,000 per month.",
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
                <span className="text-gray-900 font-medium">Landscaping Cost</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Landscaping Costs in South Africa (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Planning landscaping? Costs range from R50-R150 per square meter for design and installation. This guide breaks down all landscaping costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need garden design in <Link href="/johannesburg/landscaping" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, lawn installation in <Link href="/cape-town/landscaping" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or maintenance services, understanding landscaping costs helps you make informed decisions. <Link href="/services/landscaping" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified landscapers</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/landscaping-cost-south-africa"
                  title="Landscaping Costs in South Africa (2026 Guide)"
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
                    <div className="text-sm text-gray-600 mb-1">Per Square Meter</div>
                    <div className="text-2xl font-bold text-emerald-700">R50-R150</div>
                    <div className="text-xs text-gray-500 mt-1">Design & install</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Small Garden</div>
                    <div className="text-2xl font-bold text-emerald-700">R5k-R15k</div>
                    <div className="text-xs text-gray-500 mt-1">50m²</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Monthly Maintenance</div>
                    <div className="text-2xl font-bold text-emerald-700">R500-R2k</div>
                    <div className="text-xs text-gray-500 mt-1">Ongoing</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/services/landscaping" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified landscapers</Link> to see real pricing for your specific project.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Landscapers?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified landscapers. See real pricing for your project, compare designs, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/services/landscaping"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Landscaping Quotes →
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
