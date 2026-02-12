import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Sun } from "lucide-react"
import { SocialShare } from "@/components/sharing/SocialShare"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Solar Installation Cost in South Africa (2026 Guide) | ProConnectSA",
  description: "Complete guide to solar installation costs in South Africa. Average prices, system sizes, ROI, and how to save money. Get free quotes from verified solar installers.",
  openGraph: {
    title: "Solar Installation Cost in South Africa (2026 Guide) | ProConnectSA",
    description: "Average solar installation costs, system prices, and ROI in South Africa. Compare quotes from verified solar installers.",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SolarInstallationCostPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Solar Installation Cost in South Africa (2026 Guide)",
    description: "Complete guide to solar installation costs, system prices, and ROI in South Africa",
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
      "@id": "https://www.proconnectsa.co.za/resources/solar-installation-cost-south-africa",
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does solar installation cost in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Solar installation costs in South Africa range from R15,000-R50,000+ depending on system size. A 3kW system costs R40,000-R80,000, a 5kW system costs R60,000-R120,000, and a 10kW system costs R120,000-R250,000+. Prices include panels, inverter, installation, and basic components.",
        },
      },
      {
        "@type": "Question",
        name: "What factors affect solar installation costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several factors affect solar costs: system size (kW), panel quality, inverter type, roof complexity, location, installation difficulty, battery storage (optional), and installer experience. Larger systems and premium components cost more but provide better ROI.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to recoup solar installation costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most solar installations pay for themselves within 5-8 years through electricity bill savings. With rising electricity costs, ROI is improving. Systems typically last 20-25 years, providing significant long-term savings.",
        },
      },
      {
        "@type": "Question",
        name: "Are there government incentives for solar in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, there are tax incentives and rebates available. Homeowners can claim tax deductions on solar installations, and some municipalities offer rebates. Always check current incentives and get quotes from registered installers.",
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
                <span className="text-gray-900 font-medium">Solar Installation Cost</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Solar Installation Cost in South Africa (2026 Guide)
              </h1>
              <p className="text-gray-700 text-lg md:text-xl mb-4">
                Considering solar power for your home? Solar installation costs in South Africa range from R40,000-R250,000+ depending on system size. This comprehensive guide breaks down all costs, from small residential systems to large commercial installations, so you can make an informed decision.
              </p>
              <p className="text-gray-600 text-base mb-6">
                With rising electricity costs and load shedding, solar power is becoming increasingly popular. Whether you're in <Link href="/johannesburg/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or <Link href="/pretoria/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, understanding solar costs helps you budget accurately. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Get free quotes from verified solar installers</Link> to compare pricing and find the best system for your needs.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <SocialShare 
                  url="https://www.proconnectsa.co.za/resources/solar-installation-cost-south-africa"
                  title="Solar Installation Cost in South Africa (2026 Guide)"
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
                    <div className="text-sm text-gray-600 mb-1">3kW System</div>
                    <div className="text-2xl font-bold text-emerald-700">R40k-R80k</div>
                    <div className="text-xs text-gray-500 mt-1">Small home</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">5kW System</div>
                    <div className="text-2xl font-bold text-emerald-700">R60k-R120k</div>
                    <div className="text-xs text-gray-500 mt-1">Medium home</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">10kW System</div>
                    <div className="text-2xl font-bold text-emerald-700">R120k-R250k+</div>
                    <div className="text-xs text-gray-500 mt-1">Large home</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Want to compare actual quotes?</strong> <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get free quotes from verified solar installers</Link> to see real pricing for your specific needs.
                  </p>
                </div>
              </div>

              {/* Average Costs Overview */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Average Solar Installation Costs in South Africa</h2>
                <p className="text-gray-700 mb-4">
                  Solar installation costs vary significantly based on system size, component quality, and installation complexity. A basic 3kW residential system typically costs R40,000-R80,000, while a 5kW system costs R60,000-R120,000. Larger 10kW+ systems can cost R120,000-R250,000 or more.
                </p>
                <p className="text-gray-700 mb-4">
                  These prices include solar panels, inverter, mounting hardware, installation labor, and basic electrical work. Additional costs may include battery storage (R30,000-R100,000+), roof reinforcement, and electrical upgrades. Location also affects pricing - installers in major cities like <Link href="/johannesburg/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, and <Link href="/pretoria/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link> may have different rates.
                </p>
                <p className="text-gray-700">
                  The best way to ensure you're getting fair pricing is to <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">compare quotes from multiple verified solar installers</Link>. This allows you to see real pricing for your specific needs and choose the best value.
                </p>
              </div>

              {/* Cost Breakdown by System Size */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Cost Breakdown by System Size</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-yellow-600" />
                        3kW System (Small Home)
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Ideal for small homes or apartments with low electricity usage. Costs typically range from R40,000-R80,000 including installation.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Solar panels: R20,000-R35,000</li>
                        <li>Inverter: R8,000-R15,000</li>
                        <li>Installation: R8,000-R20,000</li>
                        <li>Mounting & wiring: R4,000-R10,000</li>
                      </ul>
                      <p className="text-gray-700">
                        Suitable for 1-2 bedroom homes. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for 3kW solar systems</Link> from verified installers.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-yellow-600" />
                        5kW System (Medium Home)
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Most popular choice for medium-sized homes. Costs typically range from R60,000-R120,000 including installation.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Solar panels: R30,000-R55,000</li>
                        <li>Inverter: R12,000-R25,000</li>
                        <li>Installation: R12,000-R25,000</li>
                        <li>Mounting & wiring: R6,000-R15,000</li>
                      </ul>
                      <p className="text-gray-700">
                        Suitable for 3-4 bedroom homes. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for 5kW solar systems</Link> from verified installers.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-yellow-600" />
                        10kW System (Large Home)
                      </h3>
                      <p className="text-gray-700 mb-3">
                        For large homes or small businesses. Costs typically range from R120,000-R250,000+ including installation.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        <li>Solar panels: R60,000-R120,000</li>
                        <li>Inverter: R25,000-R50,000</li>
                        <li>Installation: R25,000-R50,000</li>
                        <li>Mounting & wiring: R10,000-R30,000</li>
                      </ul>
                      <p className="text-gray-700">
                        Suitable for 5+ bedroom homes or small businesses. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes for 10kW solar systems</Link> from verified installers.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Factors Affecting Cost */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Factors Affecting Solar Installation Costs</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">System Size</h3>
                    <p className="text-gray-700">
                      Larger systems cost more but provide better ROI and more electricity generation. Choose a size that matches your electricity usage and budget.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Panel Quality</h3>
                    <p className="text-gray-700">
                      Premium panels with higher efficiency and longer warranties cost more but generate more electricity and last longer. Budget panels are cheaper but may need replacement sooner.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Inverter Type</h3>
                    <p className="text-gray-700">
                      String inverters are cheaper, while micro-inverters and hybrid inverters cost more but offer better performance and battery compatibility.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Battery Storage</h3>
                    <p className="text-gray-700">
                      Adding battery storage adds R30,000-R100,000+ but allows you to store excess solar power for use during load shedding or at night. Essential for off-grid systems.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Roof Complexity</h3>
                    <p className="text-gray-700">
                      Complex roofs, multiple levels, or difficult access increase installation costs. Flat roofs may require additional mounting structures.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-700">
                      Installation costs vary by location. <Link href="/johannesburg/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Compare solar installers in Johannesburg</Link>, <Link href="/cape-town/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Cape Town</Link>, and other cities to find competitive rates.
                    </p>
                  </div>
                </div>
              </div>

              {/* ROI and Savings */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">ROI and Long-Term Savings</h2>
                <p className="text-gray-700 mb-4">
                  Most solar installations pay for themselves within 5-8 years through electricity bill savings. With electricity costs rising annually, ROI is improving. Solar systems typically last 20-25 years, providing significant long-term savings.
                </p>
                <p className="text-gray-700 mb-4">
                  A 5kW system can save R1,500-R3,000 per month on electricity bills, depending on usage and location. Over 20 years, this translates to R360,000-R720,000 in savings, far exceeding the initial installation cost.
                </p>
                <p className="text-gray-700">
                  Additionally, solar installations increase property value and provide energy independence during load shedding. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Get quotes from verified solar installers</Link> to calculate your specific ROI.
                </p>
              </div>

              {/* How to Save Money */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How to Save Money on Solar Installation</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Multiple Quotes</h3>
                      <p className="text-gray-700">
                        Always get quotes from at least 3 different installers. Pricing can vary significantly, and comparing quotes helps you find the best value. <Link href="/services/solar-installation" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">Use ProConnectSA to compare quotes from verified solar installers</Link> - it's free and takes just 60 seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Check for Incentives</h3>
                      <p className="text-gray-700">
                        Research current government incentives, tax deductions, and municipal rebates. These can significantly reduce your upfront costs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Start Small</h3>
                      <p className="text-gray-700">
                        Consider starting with a smaller system and expanding later. This spreads costs over time and allows you to learn your actual usage patterns.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Choose Quality Components</h3>
                      <p className="text-gray-700">
                        While premium components cost more upfront, they provide better performance and longer warranties, resulting in better long-term value.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Get Quotes from Verified Solar Installers?
                </h2>
                <p className="text-gray-700 text-lg mb-6 text-center max-w-2xl mx-auto">
                  Compare quotes from up to 3 verified solar installers. See real pricing for your specific needs, compare system options, and choose the best fit—all free with no obligation to hire.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Verified Installers
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
                    href="/services/solar-installation"
                    className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Free Solar Installation Quotes →
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
