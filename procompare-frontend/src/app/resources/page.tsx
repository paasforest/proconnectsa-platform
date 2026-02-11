import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, BookOpen, HelpCircle, Lightbulb, CheckCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Resources & Guides | ProConnectSA - Home Service Tips & Advice",
  description: "Expert guides and resources for finding and hiring service providers in South Africa. Learn how to choose the right plumber, electrician, cleaner, and more.",
  robots: {
    index: true,
    follow: true,
  },
}

const guides = [
  {
    slug: "how-to-choose-a-plumber",
    title: "How to Choose a Plumber in South Africa",
    description: "Complete guide to finding and hiring the right plumber for your needs. What to look for, questions to ask, and red flags to avoid.",
    category: "Plumbing",
    icon: FileText,
  },
  {
    slug: "how-to-choose-an-electrician",
    title: "How to Choose an Electrician: A Complete Guide",
    description: "Essential tips for selecting a qualified electrician. Safety considerations, licensing requirements, and what to expect.",
    category: "Electrical",
    icon: Lightbulb,
  },
  {
    slug: "home-service-cost-guide",
    title: "Home Service Costs Guide: What to Expect",
    description: "Average costs for plumbing, electrical, cleaning, and other home services across South Africa. Budget planning tips.",
    category: "General",
    icon: BookOpen,
  },
  {
    slug: "questions-to-ask-service-providers",
    title: "10 Questions to Ask Before Hiring a Service Provider",
    description: "Essential questions every homeowner should ask before hiring a plumber, electrician, or other service professional.",
    category: "General",
    icon: HelpCircle,
  },
]

export default function ResourcesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I find a reliable service provider?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use ProConnectSA to compare verified professionals. Check reviews, verify credentials, and request multiple quotes before making a decision.",
        },
      },
      {
        "@type": "Question",
        name: "What should I look for when hiring a plumber?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Look for licensed professionals with good reviews, proper insurance, and clear pricing. Always get multiple quotes and verify credentials.",
        },
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Resources & Guides
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Expert guides and resources to help you find and hire the right service providers in South Africa. 
                Whether you need a <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumber</Link>, 
                <Link href="/services/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium"> electrician</Link>, or 
                <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium"> cleaning service</Link>, 
                our guides will help you make informed decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Popular Guides</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {guides.map((guide) => {
                  const Icon = guide.icon
                  return (
                    <Card key={guide.slug} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-100 rounded-lg">
                            <Icon className="w-6 h-6 text-emerald-700" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-emerald-700 font-semibold mb-1">{guide.category}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                            <Link
                              href={`/resources/${guide.slug}`}
                              className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm"
                            >
                              Read Guide →
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-12 bg-white border rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Tips</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Get Multiple Quotes</div>
                        <p className="text-sm text-gray-600">
                          Always request quotes from at least 3 providers. Compare pricing, availability, and reviews before deciding.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Verify Credentials</div>
                        <p className="text-sm text-gray-600">
                          Check that providers are licensed, insured, and have good reviews. All ProConnectSA providers are verified.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Ask Questions</div>
                        <p className="text-sm text-gray-600">
                          Don't hesitate to ask about experience, pricing, timeline, and guarantees. Good providers welcome questions.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Read Reviews</div>
                        <p className="text-sm text-gray-600">
                          Check reviews from previous customers. Look for patterns in feedback and verify the provider's track record.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Find a Service Provider?</h2>
                <p className="text-gray-700 text-sm mb-4">
                  Use ProConnectSA to compare verified professionals in your area. Get free quotes with no obligation to hire.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/services"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Browse Services
                  </Link>
                  <Link
                    href="/providers/browse"
                    className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    Browse Providers
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
