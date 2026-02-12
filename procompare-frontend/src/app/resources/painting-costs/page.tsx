import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Paintbrush } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Painting Costs in South Africa (2026 Guide) | ProConnectSA",
  description: "Complete guide to painting costs in South Africa. Average prices per square meter, room costs, and how to save money. Get free quotes from verified painters.",
  openGraph: {
    title: "Painting Costs in South Africa (2026 Guide) | ProConnectSA",
    description: "Average painting costs, prices per square meter, and room pricing in South Africa. Compare quotes from verified painters.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PaintingCostsPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Painting Costs in South Africa (2026 Guide)",
    description: "Complete guide to painting costs, prices per square meter, and room pricing in South Africa",
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
      "@id": "https://www.proconnectsa.co.za/resources/painting-costs",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does painting cost per square meter in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average painting costs range from R25-R60 per square meter for interior walls and R30-R70 per square meter for exterior walls. This includes labor and materials. Room painting costs R1,500-R5,000+ depending on size.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect painting costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect painting costs: surface preparation needed, number of coats, paint quality, ceiling height, accessibility, location, and painter experience. Exterior painting and high ceilings cost more.",
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
                <span className="text-gray-900 font-medium">Painting Costs</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Painting Costs in South Africa (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Planning a painting project? Average costs range from R25-R60 per square meter for interior walls and R30-R70 for exterior walls. This guide breaks down all painting costs so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need interior painting in <Link href="/johannesburg/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, exterior painting in <Link href="/cape-town/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or a complete repaint, understanding painting costs helps you make informed decisions. <Link href="/services/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified painters</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/painting-costs"
                  title="Painting Costs in South Africa (2026 Guide)"
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
                    <div className="text-sm text-gray-600 mb-1">Interior (per m²)</div>
                    <div className="text-2xl font-bold text-emerald-700">R25-R60</div>
                    <div className="text-xs text-gray-500 mt-1">Walls only</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Exterior (per m²)</div>
                    <div className="text-2xl font-bold text-emerald-700">R30-R70</div>
                    <div className="text-xs text-gray-500 mt-1">Including prep</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Room Painting</div>
                    <div className="text-2xl font-bold text-emerald-700">R1,500-R5,000+</div>
                    <div className="text-xs text-gray-500 mt-1">Size dependent</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/services/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified painters</Link> to see real pricing for your specific project.
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Painting Cost Breakdown</h2>
                <p className="text-gray-700 mb-4">
                  Painting costs vary based on surface area, preparation needed, paint quality, and location. Interior painting is generally cheaper than exterior painting due to easier access and less surface preparation.
                </p>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Interior Room Painting</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                        <li>Small room (10-15m²): R1,500-R2,500</li>
                        <li>Medium room (20-30m²): R2,000-R3,500</li>
                        <li>Large room (35-50m²): R3,000-R5,000</li>
                        <li>Entire house: R15,000-R50,000+</li>
                      </ul>
                      <p className="text-gray-700">
                        <Link href="/services/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for interior painting</Link> from verified professionals.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Exterior Painting</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                        <li>Small house: R8,000-R15,000</li>
                        <li>Medium house: R15,000-R25,000</li>
                        <li>Large house: R25,000-R40,000+</li>
                      </ul>
                      <p className="text-gray-700">
                        <Link href="/services/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for exterior painting</Link> from verified professionals.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Painting</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different painters. <Link href="/services/painting" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified painters</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Do Preparation Yourself</h3>
                      <p className="text-gray-700">
                        Save money by doing surface preparation yourself - filling holes, sanding, and cleaning surfaces before painters arrive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Painters?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified painters. See real pricing for your project, compare services, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="text-center">
                  <Link
                    href="/services/painting"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Painting Quotes →
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
