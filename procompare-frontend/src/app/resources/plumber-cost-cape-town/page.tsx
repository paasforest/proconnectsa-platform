import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "How Much Does a Plumber Cost in Cape Town? (2026 Guide) | ProConnectSA",
  description: "Complete guide to plumber costs in Cape Town. Average hourly rates, callout fees, job costs, and how to save money. Get free quotes from verified plumbers.",
  openGraph: {
    title: "Plumber Costs in Cape Town (2026 Guide) | ProConnectSA",
    description: "Average plumber costs, hourly rates, and job pricing in Cape Town. Compare quotes from verified professionals.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PlumberCostCapeTownPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Does a Plumber Cost in Cape Town? (2026 Guide)",
    description: "Complete guide to plumber costs, hourly rates, and pricing in Cape Town",
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
      "@id": "https://www.proconnectsa.co.za/resources/plumber-cost-cape-town",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does a plumber cost per hour in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Average plumber hourly rates in Cape Town range from R350-R750 per hour for regular work. Emergency callouts typically cost R500-R1,200 per hour. Rates vary based on the type of work, time of day, and location within Cape Town.",
        },
      },
      {
        "@type": "Question",
        name: "What is the average callout fee for plumbers in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most plumbers in Cape Town charge a callout fee of R200-R500, which covers the initial visit and assessment. This fee is usually separate from hourly labor costs and may be waived if you proceed with the work.",
        },
      },
      {
        "@type": "Question",
        name: "How much does emergency plumbing cost in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Emergency plumbing in Cape Town typically costs R800-R1,500 for after-hours callouts, plus hourly rates of R500-R1,200. Weekend and public holiday rates are usually higher. Always get quotes from multiple plumbers to compare pricing.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect plumber costs in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect plumber costs: location (city center vs suburbs), time of day (regular hours vs emergency), job complexity, materials needed, and the plumber's experience level. Suburbs like Constantia and Camps Bay may have slightly higher rates than areas like Bellville or Mitchells Plain.",
        },
      },
      {
        "@type": "Question",
        name: "How can I save money on plumbing costs in Cape Town?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Get multiple quotes from different plumbers, compare pricing and availability, plan non-urgent work during regular business hours, and consider bundling multiple jobs together. Use ProConnectSA to compare quotes from verified plumbers in Cape Town.",
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
                <span className="text-gray-900 font-medium">Plumber Cost Cape Town</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                How Much Does a Plumber Cost in Cape Town? (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Planning a plumbing project in Cape Town? The average plumber charges R350-R750 per hour, with emergency callouts costing R500-R1,200 per hour. This comprehensive guide breaks down all costs, from hourly rates to job-specific pricing, so you can budget accurately.
              </p>
              <p className="text-gray-600 text-base mb-6">
                Whether you need a simple repair in <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, emergency plumbing services, or a complete installation, understanding plumber costs helps you make informed decisions. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified plumbers in Cape Town</Link> to compare pricing and find the best rates.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/plumber-cost-cape-town"
                  title="Plumber Costs in Cape Town (2026 Guide)"
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
                    <div className="text-2xl font-bold text-emerald-700">R350-R750</div>
                    <div className="text-xs text-gray-500 mt-1">Regular hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Emergency Rate</div>
                    <div className="text-2xl font-bold text-emerald-700">R500-R1,200</div>
                    <div className="text-xs text-gray-500 mt-1">After hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Callout Fee</div>
                    <div className="text-2xl font-bold text-emerald-700">R200-R500</div>
                    <div className="text-xs text-gray-500 mt-1">Initial visit</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified plumbers in Cape Town</Link> to see real pricing for your specific job.
                  </p>
                </div>
              </div>

              {/* Average Costs Overview */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Average Plumber Costs in Cape Town</h2>
                <p className="text-gray-700 mb-4">
                  Plumber costs in Cape Town vary significantly based on several factors. The average hourly rate ranges from R350-R750 for regular business hours, while emergency and after-hours work typically costs R500-R1,200 per hour. Most plumbers also charge a callout fee of R200-R500 for the initial visit.
                </p>
                <p className="text-gray-700 mb-4">
                  Location within Cape Town also affects pricing. Plumbers serving areas like <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Constantia</Link>, <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Camps Bay</Link>, and the <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">City Bowl</Link> may charge slightly higher rates due to travel time and demand, while areas like <Link href="/bellville/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Bellville</Link> and <Link href="/somerset-west/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Somerset West</Link> often have more competitive rates.
                </p>
                <p className="text-gray-700">
                  The best way to ensure you're getting fair pricing is to <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">compare quotes from multiple verified plumbers in Cape Town</Link>. This allows you to see real pricing for your specific job and choose the best value.
                </p>
              </div>

              {/* Cost Breakdown by Job Type */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Cost Breakdown by Job Type</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Emergency Plumbing
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Emergency plumber costs in Cape Town are significantly higher than regular rates. After-hours callouts typically cost R800-R1,500 for the initial visit, plus hourly rates of R500-R1,200. Weekend and public holiday rates are usually at the higher end of this range.
                      </p>
                      <p className="text-gray-700">
                        Common emergency jobs include burst pipes, blocked drains, water leaks, and gas leaks. If you're facing a plumbing emergency, <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">get emergency plumber quotes in Cape Town</Link> to compare availability and pricing from verified professionals.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Installation Work
                      </h3>
                      <p className="text-gray-700 mb-3">
                        For new installations, plumbers in Cape Town typically charge R450-R900 per hour, depending on the complexity. Common installation jobs include:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Geyser installation: R2,500-R5,000 (labor only)</li>
                        <li>Toilet installation: R800-R1,500</li>
                        <li>Shower installation: R1,500-R3,500</li>
                        <li>Kitchen sink installation: R800-R1,800</li>
                        <li>Water heater installation: R1,200-R2,500</li>
                      </ul>
                      <p className="text-gray-700">
                        These prices exclude materials. For accurate installation quotes, <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">request quotes from verified plumbers in Cape Town</Link> who can assess your specific requirements.
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
                        Regular repair and maintenance work typically costs R350-R750 per hour in Cape Town. Common repair jobs include:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Dripping taps: R300-R600</li>
                        <li>Blocked drains: R400-R800</li>
                        <li>Leaking pipes: R500-R1,200</li>
                        <li>Toilet repairs: R400-R900</li>
                        <li>Geyser repairs: R600-R1,500</li>
                        <li>Water pressure issues: R500-R1,000</li>
                      </ul>
                      <p className="text-gray-700">
                        Regular maintenance can prevent costly emergency repairs. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Find reliable plumbers in Cape Town</Link> for regular maintenance and repairs.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Factors Affecting Cost */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Factors Affecting Plumber Costs in Cape Town</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location and Travel</h3>
                    <p className="text-gray-700">
                      Plumbers serving areas further from the city center may charge travel fees or higher rates. Suburbs like Constantia, Camps Bay, and Sea Point often have slightly higher rates, while areas like Bellville, Mitchells Plain, and Khayelitsha may offer more competitive pricing. Some plumbers include travel within a certain radius in their callout fee.
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
                      Simple jobs like fixing a dripping tap cost less than complex installations or repairs requiring specialized equipment. Jobs that require permits, working in tight spaces, or dealing with old plumbing systems may cost more due to increased time and expertise required.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials and Parts</h3>
                    <p className="text-gray-700">
                      Material costs are separate from labor. High-quality fixtures and fittings cost more, but many plumbers offer to source materials at competitive rates. Always ask for a breakdown of labor vs. materials in your quote.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Plumber Experience</h3>
                    <p className="text-gray-700">
                      More experienced plumbers with specialized certifications may charge higher rates, but often complete work faster and with better quality. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Compare quotes from verified plumbers in Cape Town</Link> to find the right balance of experience and pricing for your needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Plumbing Costs in Cape Town</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different plumbers. Pricing can vary significantly, and comparing quotes helps you find the best value. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified plumbers in Cape Town</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Plan Non-Urgent Work</h3>
                      <p className="text-gray-700">
                        Schedule non-urgent repairs and installations during regular business hours to avoid premium rates. Planning ahead also allows you to compare quotes and choose the best plumber for your budget.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Bundle Multiple Jobs</h3>
                      <p className="text-gray-700">
                        If you have multiple plumbing jobs, combine them into one visit. Many plumbers offer discounts for multiple jobs, and you'll save on callout fees.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Regular Maintenance</h3>
                      <p className="text-gray-700">
                        Regular maintenance prevents costly emergency repairs. Schedule annual check-ups to catch issues early. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Find reliable plumbers in Cape Town</Link> for regular maintenance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Compare Reviews and Credentials</h3>
                      <p className="text-gray-700">
                        Don't just choose the cheapest option. Check reviews, verify credentials, and ensure the plumber is insured. A slightly higher rate from a reputable plumber often saves money in the long run by avoiding repeat repairs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Comparison Table */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Plumber Cost Comparison: Cape Town Areas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Area</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Hourly Rate</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Callout Fee</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">City Bowl / CBD</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R400-R800</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R250-R500</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Higher demand, parking challenges</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Constantia / Camps Bay</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R450-R850</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R300-R600</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Premium areas, higher rates</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Bellville / Parow</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R350-R700</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R200-R450</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">More competitive rates</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Somerset West / Strand</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R350-R750</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R200-R500</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Good availability</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Mitchells Plain / Khayelitsha</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R300-R650</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">R150-R400</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Most competitive rates</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Note:</strong> These are average ranges. Actual costs vary based on the specific job, plumber experience, and current market conditions. <Link href="/cape-town/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes from verified plumbers in Cape Town</Link> for accurate pricing.
                </p>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Plumbers in Cape Town?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified plumbers in Cape Town. See real pricing for your specific job, compare reviews, and choose the best fit—all free with no obligation to hire.
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
                    href="/cape-town/plumbing"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Plumber Quotes in Cape Town →
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
                        <Link href="/resources/how-to-choose-a-plumber" className="hover:text-emerald-700">
                          How to Choose a Plumber in South Africa
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete guide to finding and hiring the right plumber. What to look for, questions to ask, and red flags to avoid.
                      </p>
                      <Link href="/resources/how-to-choose-a-plumber" className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Read Guide →
                      </Link>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link href="/services/plumbing/western-cape" className="hover:text-emerald-700">
                          Plumbing Services Across Western Cape
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Find verified plumbers across all major cities in Western Cape, including Cape Town, Stellenbosch, and Bellville.
                      </p>
                      <Link href="/services/plumbing/western-cape" className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Browse Services →
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
