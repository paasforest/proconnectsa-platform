import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Mail, Phone, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Press & Media | ProConnectSA - Media Kit & Contact Information",
  description: "Media resources, press kit, and contact information for journalists and media professionals covering ProConnectSA.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function PressPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ProConnectSA",
    url: "https://www.proconnectsa.co.za",
    logo: "https://www.proconnectsa.co.za/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+27-67-951-8124",
      contactType: "Media Inquiries",
      email: "press@proconnectsa.co.za",
    },
    sameAs: [
      "https://www.facebook.com/proconnectsa",
      "https://www.twitter.com/proconnectsa",
      "https://www.linkedin.com/company/proconnectsa",
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Press & Media
              </h1>
              <p className="text-gray-600 text-lg">
                Media resources, press releases, and contact information for journalists and media professionals.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About ProConnectSA</h2>
                <p className="text-gray-700 mb-4">
                  ProConnectSA is South Africa's leading local services marketplace, connecting homeowners and businesses with verified service providers across all 9 provinces. We serve major cities including <Link href="/johannesburg/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, <Link href="/durban/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, and <Link href="/pretoria/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>.
                </p>
                <p className="text-gray-700">
                  Our platform helps South Africans find trusted <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumbers</Link>, <Link href="/services/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">electricians</Link>, <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">cleaning services</Link>, and other professionals. We verify all providers and facilitate free quote requests with no obligation to hire.
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Statistics</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">50+</div>
                    <div className="text-sm text-gray-600">Cities Served</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">9</div>
                    <div className="text-sm text-gray-600">Provinces Covered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">15+</div>
                    <div className="text-sm text-gray-600">Service Categories</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Media Contact</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <a href="mailto:press@proconnectsa.co.za" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                        press@proconnectsa.co.za
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Phone</div>
                      <a href="tel:+27679518124" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                        +27 67 951 8124
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Press Resources</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Company Fact Sheet</div>
                        <div className="text-sm text-gray-600">Key facts and statistics about ProConnectSA</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Logo & Brand Assets</div>
                        <div className="text-sm text-gray-600">High-resolution logos and brand guidelines</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Story Ideas</h2>
                <p className="text-gray-700 text-sm mb-4">
                  We're available for interviews and can provide expert commentary on:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• The local services marketplace in South Africa</li>
                  <li>• How technology is transforming home services</li>
                  <li>• Tips for homeowners choosing service providers</li>
                  <li>• Trends in the South African home services industry</li>
                  <li>• How to verify service providers and avoid scams</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
