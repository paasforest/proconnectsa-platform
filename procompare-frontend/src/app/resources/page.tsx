import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, BookOpen, HelpCircle, Lightbulb, CheckCircle, DollarSign } from "lucide-react"

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
    slug: "plumber-cost-cape-town",
    title: "How Much Does a Plumber Cost in Cape Town? (2026 Guide)",
    description: "Complete guide to plumber costs in Cape Town. Average hourly rates, callout fees, job costs, and how to save money. Get free quotes from verified plumbers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "plumber-cost-johannesburg",
    title: "How Much Does a Plumber Cost in Johannesburg? (2026 Guide)",
    description: "Complete guide to plumber costs in Johannesburg. Average hourly rates, callout fees, job costs, and how to save money. Get free quotes from verified plumbers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "electrician-cost-johannesburg",
    title: "Electrical Installation Cost in Johannesburg (Updated 2026)",
    description: "Complete guide to electrician costs in Johannesburg. Average hourly rates, installation costs, callout fees, and how to save money. Get free quotes from verified electricians.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "electrician-cost-cape-town",
    title: "Electrical Installation Cost in Cape Town (Updated 2026)",
    description: "Complete guide to electrician costs in Cape Town. Average hourly rates, installation costs, callout fees, and how to save money. Get free quotes from verified electricians.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "solar-installation-cost-south-africa",
    title: "Solar Installation Cost in South Africa (2026 Guide)",
    description: "Complete guide to solar installation costs in South Africa. Average prices, system sizes, ROI, and how to save money. Get free quotes from verified solar installers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "cleaning-service-costs",
    title: "Cleaning Service Costs in South Africa (2026 Guide)",
    description: "Complete guide to cleaning service costs in South Africa. Average hourly rates, one-time cleaning prices, and how to save money. Get free quotes from verified cleaners.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "painting-costs",
    title: "Painting Costs in South Africa (2026 Guide)",
    description: "Complete guide to painting costs in South Africa. Average prices per square meter, room costs, and how to save money. Get free quotes from verified painters.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "handyman-costs",
    title: "Handyman Service Costs in South Africa (2026 Guide)",
    description: "Complete guide to handyman costs in South Africa. Average hourly rates, common job costs, and how to save money. Get free quotes from verified handymen.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "painting-cost-durban",
    title: "Painting Costs in Durban (2026 Guide)",
    description: "Complete guide to painting costs in Durban. Average prices per square meter, room costs, and how to save money. Get free quotes from verified painters.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "painting-cost-cape-town",
    title: "Painting Costs in Cape Town (2026 Guide)",
    description: "Complete guide to painting costs in Cape Town. Average prices per square meter, room costs, and how to save money. Get free quotes from verified painters.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "painting-cost-pretoria",
    title: "Painting Costs in Pretoria (2026 Guide)",
    description: "Complete guide to painting costs in Pretoria. Average prices per square meter, room costs, and how to save money. Get free quotes from verified painters.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "renovation-cost-johannesburg",
    title: "Renovation Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to renovation costs in Johannesburg. Average prices for kitchen, bathroom, and home renovations. Get free quotes from verified contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "renovation-cost-cape-town",
    title: "Renovation Costs in Cape Town (2026 Guide)",
    description: "Complete guide to renovation costs in Cape Town. Average prices for kitchen, bathroom, and home renovations. Get free quotes from verified contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "renovation-cost-durban",
    title: "Renovation Costs in Durban (2026 Guide)",
    description: "Complete guide to renovation costs in Durban. Average prices for kitchen, bathroom, and home renovations. Get free quotes from verified contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "cleaning-cost-cape-town",
    title: "Cleaning Service Costs in Cape Town (2026 Guide)",
    description: "Complete guide to cleaning service costs in Cape Town. Average hourly rates, one-time cleaning prices, and how to save money. Get free quotes from verified cleaners.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "cleaning-cost-johannesburg",
    title: "Cleaning Service Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to cleaning service costs in Johannesburg. Average hourly rates, one-time cleaning prices, and how to save money. Get free quotes from verified cleaners.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "handyman-cost-cape-town",
    title: "Handyman Service Costs in Cape Town (2026 Guide)",
    description: "Complete guide to handyman costs in Cape Town. Average hourly rates, common job costs, and how to save money. Get free quotes from verified handymen.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "handyman-cost-johannesburg",
    title: "Handyman Service Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to handyman costs in Johannesburg. Average hourly rates, common job costs, and how to save money. Get free quotes from verified handymen.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "hvac-cost-south-africa",
    title: "HVAC Installation Cost in South Africa (2026 Guide)",
    description: "Complete guide to HVAC installation costs in South Africa. Average prices for air conditioning, heating, and ventilation systems. Get free quotes from verified HVAC installers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "hvac-cost-cape-town",
    title: "HVAC Installation Cost in Cape Town (2026 Guide)",
    description: "Complete guide to HVAC installation costs in Cape Town. Average prices for air conditioning, heating, and ventilation systems. Get free quotes from verified HVAC installers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "hvac-cost-johannesburg",
    title: "HVAC Installation Cost in Johannesburg (2026 Guide)",
    description: "Complete guide to HVAC installation costs in Johannesburg. Average prices for air conditioning, heating, and ventilation systems. Get free quotes from verified HVAC installers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "landscaping-cost-south-africa",
    title: "Landscaping Costs in South Africa (2026 Guide)",
    description: "Complete guide to landscaping costs in South Africa. Average prices for garden design, lawn installation, and maintenance. Get free quotes from verified landscapers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "landscaping-cost-cape-town",
    title: "Landscaping Costs in Cape Town (2026 Guide)",
    description: "Complete guide to landscaping costs in Cape Town. Average prices for garden design, lawn installation, and maintenance. Get free quotes from verified landscapers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "landscaping-cost-johannesburg",
    title: "Landscaping Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to landscaping costs in Johannesburg. Average prices for garden design, lawn installation, and maintenance. Get free quotes from verified landscapers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "roofing-cost-south-africa",
    title: "Roofing Costs in South Africa (2026 Guide)",
    description: "Complete guide to roofing costs in South Africa. Average prices for roof repairs, replacements, and installations. Get free quotes from verified roofers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "roofing-cost-cape-town",
    title: "Roofing Costs in Cape Town (2026 Guide)",
    description: "Complete guide to roofing costs in Cape Town. Average prices for roof repairs, replacements, and installations. Get free quotes from verified roofers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "roofing-cost-johannesburg",
    title: "Roofing Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to roofing costs in Johannesburg. Average prices for roof repairs, replacements, and installations. Get free quotes from verified roofers.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "flooring-cost-south-africa",
    title: "Flooring Costs in South Africa (2026 Guide)",
    description: "Complete guide to flooring costs in South Africa. Average prices for tiles, laminate, hardwood, and carpet installation. Get free quotes from verified flooring contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "flooring-cost-cape-town",
    title: "Flooring Costs in Cape Town (2026 Guide)",
    description: "Complete guide to flooring costs in Cape Town. Average prices for tiles, laminate, hardwood, and carpet installation. Get free quotes from verified flooring contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
  {
    slug: "flooring-cost-johannesburg",
    title: "Flooring Costs in Johannesburg (2026 Guide)",
    description: "Complete guide to flooring costs in Johannesburg. Average prices for tiles, laminate, hardwood, and carpet installation. Get free quotes from verified flooring contractors.",
    category: "Cost Guides",
    icon: DollarSign,
  },
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
