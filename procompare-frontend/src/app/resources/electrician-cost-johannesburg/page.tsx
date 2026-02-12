import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp, Zap } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Electrical Installation Cost in Johannesburg (Updated 2026) | ProConnectSA",
  description: "Complete guide to electrician costs in Johannesburg. Average hourly rates, installation costs, callout fees, and how to save money. Get free quotes from verified electricians.",
  openGraph: {
    title: "Electrician Costs in Johannesburg (2026 Guide) | ProConnectSA",
    description: "Average electrician costs, hourly rates, and installation pricing in Johannesburg. Compare quotes from verified professionals.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ElectricianCostJohannesburgPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Electrical Installation Cost in Johannesburg (Updated 2026)",
    description: "Complete guide to electrician costs, hourly rates, and installation pricing in Johannesburg",
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
      "@id": "https://www.proconnectsa.co.za/resources/electrician-cost-johannesburg",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does an electrician cost per hour in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average electrician hourly rates in Johannesburg range from R450-R900 per hour for regular work. Emergency callouts typically cost R650-R1,400 per hour. Rates vary based on the type of work, time of day, and location within Johannesburg.",
        },
      },
      {
        "@type": "Question",
        name: "What is the average callout fee for electricians in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most electricians in Johannesburg charge a callout fee of R300-R600, which covers the initial visit and assessment. This fee is usually separate from hourly labor costs and may be waived if you proceed with the work.",
        },
      },
      {
        "@type": "Question",
        name: "How much does electrical installation cost in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Electrical installation costs vary significantly. A new DB board installation costs R3,500-R8,000, while adding a new power point costs R400-R800. Rewiring a house can cost R15,000-R50,000+ depending on size. Always get multiple quotes for accurate pricing.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect electrician costs in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect electrician costs: location (Sandton vs Soweto), time of day (regular hours vs emergency), job complexity, materials needed, permits required, and the electrician's experience level. Areas like Sandton and Rosebank may have slightly higher rates.",
        },
      },
      {
        "@type": "Question",
        name: "How can I save money on electrical work in Johannesburg?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Get multiple quotes from different electricians, compare pricing and availability, plan non-urgent work during regular business hours, bundle multiple jobs together, and ensure all work is done to code to avoid repeat repairs. Use ProConnectSA to compare quotes from verified electricians in Johannesburg.",
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
                <span className="text-gray-900 font-medium">Electrician Cost Johannesburg</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Electrical Installation Cost in Johannesburg (Updated 2026)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Planning electrical work in Johannesburg? The average electrician charges R450-R900 per hour, with emergency callouts costing R650-R1,400 per hour. This comprehensive guide breaks down all costs, from hourly rates to installation pricing, so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need a simple repair in <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, emergency electrical services, or a complete installation, understanding electrician costs helps you make informed decisions. <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified electricians in Johannesburg</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/electrician-cost-johannesburg"
                  title="Electrician Costs in Johannesburg (2026 Guide)"
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
                    <div className="text-2xl font-bold text-emerald-700">R450-R900</div>
                    <div className="text-xs text-gray-500 mt-1">Regular hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Emergency Rate</div>
                    <div className="text-2xl font-bold text-emerald-700">R650-R1,400</div>
                    <div className="text-xs text-gray-500 mt-1">After hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Callout Fee</div>
                    <div className="text-2xl font-bold text-emerald-700">R300-R600</div>
                    <div className="text-xs text-gray-500 mt-1">Initial visit</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified electricians in Johannesburg</Link> to see real pricing for your specific job.
                  </p>
                </div>
              </div>

              {/* Average Costs Overview */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Average Electrician Costs in Johannesburg</h2>
                <p className="text-gray-700 mb-4">
                  Electrician costs in Johannesburg vary significantly based on several factors. The average hourly rate ranges from R450-R900 for regular business hours, while emergency and after-hours work typically costs R650-R1,400 per hour. Most electricians also charge a callout fee of R300-R600 for the initial visit.
                </p>
                <p className="text-gray-700 mb-4">
                  Location within Johannesburg also affects pricing. Electricians serving areas like <Link href="/sandton/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Sandton</Link>, <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Rosebank</Link>, and <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Fourways</Link> may charge slightly higher rates due to demand and travel time, while areas like <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Soweto</Link> and <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Alexandra</Link> often have more competitive rates.
                </p>
                <p className="text-gray-700">
                  The best way to ensure you're getting fair pricing is to <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">compare quotes from multiple verified electricians in Johannesburg</Link>. This allows you to see real pricing for your specific job and choose the best value.
                </p>
              </div>

              {/* Cost Breakdown by Job Type */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Cost Breakdown by Job Type</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        New Installations
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Electrical installation costs vary significantly based on complexity. Common installation jobs include:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>DB board installation: R3,500-R8,000</li>
                        <li>New power point: R400-R800</li>
                        <li>Light fixture installation: R300-R700</li>
                        <li>Ceiling fan installation: R500-R1,200</li>
                        <li>Security light installation: R600-R1,500</li>
                        <li>Electric fence installation: R2,500-R6,000</li>
                        <li>Solar panel installation: R15,000-R50,000+</li>
                      </ul>
                      <p className="text-gray-700">
                        These prices include labor and basic materials. For accurate installation quotes, <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">request quotes from verified electricians in Johannesburg</Link> who can assess your specific requirements.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Emergency Electrical Work
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Emergency electrician costs in Johannesburg are significantly higher than regular rates. After-hours callouts typically cost R1,000-R1,800 for the initial visit, plus hourly rates of R650-R1,400. Weekend and public holiday rates are usually at the higher end of this range.
                      </p>
                      <p className="text-gray-700">
                        Common emergency jobs include power failures, tripping circuits, electrical fires, exposed wires, and faulty DB boards. If you're facing an electrical emergency, <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">get emergency electrician quotes in Johannesburg</Link> to compare availability and pricing from verified professionals.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Repairs and Maintenance
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Regular repair and maintenance work typically costs R450-R900 per hour in Johannesburg. Common repair jobs include:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Faulty switch replacement: R300-R600</li>
                        <li>Power point repair: R350-R700</li>
                        <li>Circuit breaker reset: R200-R500</li>
                        <li>Light fixture repair: R250-R600</li>
                        <li>Wiring repairs: R500-R1,200</li>
                        <li>DB board repairs: R600-R1,500</li>
                        <li>Electrical safety inspection: R500-R1,000</li>
                      </ul>
                      <p className="text-gray-700">
                        Regular maintenance can prevent costly emergency repairs. <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Find reliable electricians in Johannesburg</Link> for regular maintenance and repairs.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Rewiring and Upgrades
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Complete rewiring is one of the most expensive electrical jobs. Costs vary significantly based on property size:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>1-bedroom apartment: R15,000-R25,000</li>
                        <li>2-3 bedroom house: R25,000-R40,000</li>
                        <li>4-5 bedroom house: R40,000-R60,000</li>
                        <li>Large properties: R60,000-R100,000+</li>
                      </ul>
                      <p className="text-gray-700">
                        Rewiring includes new wiring, DB board upgrade, and all power points. For accurate rewiring quotes, <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">get quotes from verified electricians in Johannesburg</Link> who can assess your property.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Factors Affecting Cost */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Factors Affecting Electrician Costs in Johannesburg</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location and Travel</h3>
                    <p className="text-gray-700">
                      Electricians serving areas further from the city center may charge travel fees or higher rates. Suburbs like Sandton, Rosebank, and Fourways often have slightly higher rates, while areas like Soweto, Alexandra, and Diepsloot may offer more competitive pricing. Some electricians include travel within a certain radius in their callout fee.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Time of Day</h3>
                    <p className="text-gray-700">
                      Regular business hours (Monday-Friday, 8am-5pm) typically have the lowest rates. After-hours, weekends, and public holidays command premium rates, often 50-100% higher than regular rates. Emergency callouts outside business hours are the most expensive.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Complexity</h3>
                    <p className="text-gray-700">
                      Simple jobs like replacing a switch cost less than complex installations or rewiring requiring specialized equipment. Jobs that require permits, working in tight spaces, or dealing with old electrical systems may cost more due to increased time and expertise required.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials and Parts</h3>
                    <p className="text-gray-700">
                      Material costs are separate from labor. High-quality electrical components, cables, and fixtures cost more, but many electricians offer to source materials at competitive rates. Always ask for a breakdown of labor vs. materials in your quote.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Permits and Compliance</h3>
                    <p className="text-gray-700">
                      Some electrical work requires permits and compliance certificates. This adds to the cost but is essential for safety and insurance purposes. Always ensure your electrician is registered and work is done to SANS standards.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Electrician Experience</h3>
                    <p className="text-gray-700">
                      More experienced electricians with specialized certifications may charge higher rates, but often complete work faster and with better quality. <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Compare quotes from verified electricians in Johannesburg</Link> to find the right balance of experience and pricing for your needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Electrical Work in Johannesburg</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different electricians. Pricing can vary significantly, and comparing quotes helps you find the best value. <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified electricians in Johannesburg</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Plan Non-Urgent Work</h3>
                      <p className="text-gray-700">
                        Schedule non-urgent repairs and installations during regular business hours to avoid premium rates. Planning ahead also allows you to compare quotes and choose the best electrician for your budget.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Bundle Multiple Jobs</h3>
                      <p className="text-gray-700">
                        If you have multiple electrical jobs, combine them into one visit. Many electricians offer discounts for multiple jobs, and you'll save on callout fees.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Ensure Code Compliance</h3>
                      <p className="text-gray-700">
                        Always ensure work is done to SANS standards and get compliance certificates. This prevents costly rework and ensures your insurance remains valid. <Link href="/johannesburg/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Find registered electricians in Johannesburg</Link> who provide compliance certificates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Compare Reviews and Credentials</h3>
                      <p className="text-gray-700">
                        Don't just choose the cheapest option. Check reviews, verify credentials, and ensure the electrician is registered. A slightly higher rate from a reputable electrician often saves money in the long run by avoiding repeat repairs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Electricians in Johannesburg?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified electricians in Johannesburg. See real pricing for your specific job, compare reviews, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Verified Professionals
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Free Quotes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    No Obligation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    60 Second Matching
                  </div>
                </div>
                <div className="text-center">
                  <Link
                    href="/johannesburg/electrical"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Electrician Quotes in Johannesburg →
                  </Link>
                </div>
              </div>

              {/* Related Resources */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Related Resources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link href="/services/electrical/gauteng" className="hover:text-emerald-700">
                          Electrical Services Across Gauteng
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Find verified electricians across all major cities in Gauteng, including Johannesburg, Pretoria, and Sandton.
                      </p>
                      <Link href="/services/electrical/gauteng" className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Browse Services →
                      </Link>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link href="/resources/how-to-choose-an-electrician" className="hover:text-emerald-700">
                          How to Choose an Electrician
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete guide to finding and hiring the right electrician. What to look for, questions to ask, and safety considerations.
                      </p>
                      <Link href="/resources/how-to-choose-an-electrician" className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Read Guide →
                      </Link>
                    </CardContent>
                  </Card>
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
