import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "How to Choose a Plumber in South Africa | Complete Guide | ProConnectSA",
  description: "Complete guide to finding and hiring the right plumber in South Africa. Learn what to look for, questions to ask, red flags to avoid, and average costs.",
  openGraph: {
    title: "How to Choose a Plumber in South Africa | ProConnectSA",
    description: "Expert guide to selecting a qualified plumber. Tips, questions, and what to avoid.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HowToChooseAPlumberPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Choose a Plumber in South Africa",
    description: "Complete guide to finding and hiring the right plumber",
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
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What should I look for when choosing a plumber?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Look for licensed professionals with good reviews, proper insurance, clear pricing, and experience with your type of project. Always verify credentials and get multiple quotes.",
        },
      },
      {
        "@type": "Question",
        name: "How much does a plumber cost in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Plumber costs vary by location and job type. Average hourly rates range from R300-R800. Always get multiple quotes to compare pricing.",
        },
      },
      {
        "@type": "Question",
        name: "What questions should I ask a plumber before hiring?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ask about licensing, insurance, experience with similar projects, timeline, pricing structure, warranty, and references. A good plumber will answer all questions clearly.",
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
                <span className="text-gray-900 font-medium">How to Choose a Plumber</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                How to Choose a Plumber in South Africa
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Complete guide to finding and hiring the right plumber for your needs. Whether you're in <Link href="/johannesburg/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or <Link href="/durban/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, these tips will help you make the right choice.
              </p>
              <SocialShare 
                title="How to Choose a Plumber in South Africa"
                description="Complete guide to finding and hiring the right plumber"
              />
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Verify Licensing and Insurance</h2>
                  <p className="text-gray-700 mb-4">
                    Always verify that your plumber is licensed and insured. In South Africa, qualified plumbers should be registered with the <strong>Plumbing Industry Registration Board (PIRB)</strong>. Ask to see their registration certificate and verify it's current.
                  </p>
                  <p className="text-gray-700">
                    Insurance is crucial—make sure they have public liability insurance. This protects you if something goes wrong during the job. You can find verified, licensed plumbers on <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">ProConnectSA</Link>.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Check Reviews and References</h2>
                  <p className="text-gray-700 mb-4">
                    Read reviews from previous customers. Look for patterns—are customers consistently happy? Do they mention specific strengths or concerns? Check reviews on multiple platforms if possible.
                  </p>
                  <p className="text-gray-700">
                    Ask the plumber for references from recent jobs similar to yours. A reputable plumber will be happy to provide references. You can browse <Link href="/providers/browse?category=plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">verified plumbers with reviews</Link> on our platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Get Multiple Quotes</h2>
                  <p className="text-gray-700 mb-4">
                    Always get quotes from at least 3 different plumbers. This helps you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Compare pricing fairly</li>
                    <li>Understand what's included in the price</li>
                    <li>Gauge professionalism and communication</li>
                    <li>Identify any red flags early</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Use <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">ProConnectSA to request free quotes</Link> from multiple verified plumbers in your area. No obligation to hire.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ask the Right Questions</h2>
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Essential Questions to Ask:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Are you licensed and insured? Can I see proof?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>How long have you been in business?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Have you done similar work before? Can you show examples?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>What's included in the quote? Are there any hidden costs?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>How long will the job take?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Do you offer a warranty or guarantee on your work?</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Understand Pricing</h2>
                  <p className="text-gray-700 mb-4">
                    Plumber costs in South Africa vary by location and job complexity:
                  </p>
                  <div className="bg-gray-50 border rounded-xl p-6 mb-4">
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Hourly rates:</strong> R300 - R800 per hour (varies by city and experience)</li>
                      <li><strong>Call-out fees:</strong> R200 - R500 (some plumbers charge this separately)</li>
                      <li><strong>Emergency calls:</strong> Higher rates, often 1.5x - 2x normal rate</li>
                      <li><strong>Materials:</strong> Usually separate from labor costs</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Get detailed quotes that break down labor, materials, and any additional fees. Compare quotes from plumbers in <Link href="/johannesburg/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, and other cities to understand local pricing.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Red Flags to Avoid</h2>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Warning Signs:
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Refuses to provide proof of licensing or insurance</li>
                      <li>• Pressure to make an immediate decision</li>
                      <li>• Unusually low quote (could indicate poor quality or hidden costs)</li>
                      <li>• Asks for full payment upfront</li>
                      <li>• No reviews or references available</li>
                      <li>• Unprofessional communication or appearance</li>
                      <li>• Won't provide a written quote</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Local vs. National Companies</h2>
                  <p className="text-gray-700 mb-4">
                    Both local plumbers and national companies have advantages:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Local Plumbers</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Often more affordable</li>
                          <li>✓ Faster response times</li>
                          <li>✓ Better knowledge of local regulations</li>
                          <li>✓ Personal service</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">National Companies</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>✓ Established reputation</li>
                          <li>✓ More resources for complex jobs</li>
                          <li>✓ Standardized processes</li>
                          <li>✓ May offer warranties</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Ready to Find a Plumber?</h2>
                  <p className="text-gray-700 mb-4">
                    Use ProConnectSA to compare verified plumbers in your area. Get free quotes from multiple professionals with no obligation to hire.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/services/plumbing"
                      className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      Find Plumbers Near You
                    </Link>
                    <Link
                      href="/johannesburg/plumbing"
                      className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium"
                    >
                      Plumbers in Johannesburg
                    </Link>
                    <Link
                      href="/cape-town/plumbing"
                      className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium"
                    >
                      Plumbers in Cape Town
                    </Link>
                  </div>
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
