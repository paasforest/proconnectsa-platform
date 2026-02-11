import Link from "next/link"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { PROVINCES } from "@/lib/seo-locations"
import { fetchServiceCategories } from "@/lib/service-categories"

export const dynamic = "force-dynamic"

export default async function Homepage() {
  const categories = await fetchServiceCategories()

  // Structured data for SEO - Local Services Marketplace
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ProConnectSA",
    "description": "Find trusted local service providers in South Africa. Compare free quotes from verified professionals.",
    "url": "https://www.proconnectsa.co.za",
    "email": "support@proconnectsa.co.za",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "serviceType": [
      "Plumbing",
      "Electrical",
      "Cleaning",
      "Painting",
      "Handyman Services",
      "HVAC",
      "Landscaping",
      "Carpentry"
    ]
  }

  // Prioritize local services that match Snupit/Bark positioning
  const servicePriority = [
    { slug: "plumbing", name: "Plumbers" },
    { slug: "electrical", name: "Electricians" },
    { slug: "cleaning", name: "Cleaning Services" },
    { slug: "painting", name: "Painters" },
    { slug: "handyman", name: "Handyman Services" },
    { slug: "hvac", name: "HVAC Installers" },
    { slug: "landscaping", name: "Landscaping" },
    { slug: "carpentry", name: "Carpentry" },
  ]

  const popular = categories.length 
    ? servicePriority
        .map(priority => {
          const found = categories.find(c => c.slug === priority.slug)
          return found ? { ...found, name: priority.name } : { id: 0, slug: priority.slug, name: priority.name }
        })
        .slice(0, 8)
    : servicePriority.slice(0, 8)

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Find Trusted Local Service Providers in South Africa
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Compare quotes from verified professionals near you — fast & free. Whether you're in <Link href="/johannesburg/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, <Link href="/durban/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, or <Link href="/pretoria/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, find trusted <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumbers</Link>, <Link href="/services/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">electricians</Link>, <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">cleaning services</Link>, and more. No obligation to hire.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-8">
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">✓ Verified professionals</span>
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">✓ Local & trusted</span>
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">✓ No obligation</span>
                </div>

                <div className="border rounded-2xl bg-white p-6">
                  <BarkLeadForm />
                </div>
              </div>

              <div className="space-y-8">
                <div className="border rounded-2xl bg-white p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Popular Local Services</div>
                  <p className="text-sm text-gray-600 mb-4">
                    Find trusted professionals for all your home and business needs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/services/${c.slug}`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl bg-white p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Find Services by Province</div>
                  <p className="text-sm text-gray-600 mb-4">
                    Browse verified professionals in your province
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PROVINCES.slice(0, 3).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/${p.slug}/local-services`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Popular Cities</div>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/johannesburg/plumbing" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline">
                        Johannesburg
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link href="/cape-town/plumbing" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline">
                        Cape Town
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link href="/durban/plumbing" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline">
                        Durban
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link href="/pretoria/plumbing" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline">
                        Pretoria
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Are you a professional?{" "}
                    <Link href="/for-pros" className="font-semibold text-emerald-700 hover:text-emerald-800">
                      Join as a provider →
                    </Link>
                  </div>
                </div>

                <div className="border rounded-2xl bg-white p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Browse Local Providers</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Search verified professionals by service and location. Read reviews and compare profiles.
                  </p>
                  <Link href="/providers/browse" className="text-emerald-700 font-semibold hover:text-emerald-800">
                    Browse Providers →
                  </Link>
                </div>

                <div className="border rounded-2xl bg-emerald-50 border-emerald-200 p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Trust & Safety</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Verified professionals:</strong> All providers are background checked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>No obligation:</strong> Free to request quotes, no commitment to hire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Compare quotes:</strong> Get multiple quotes to find the best price</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Local & trusted:</strong> Connect with professionals in your area</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl bg-blue-50 border-blue-200 p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Explore by Province</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Find services in major provinces across South Africa
                  </p>
                  <div className="space-y-2">
                    <Link href="/gauteng/local-services" className="block text-blue-700 font-semibold hover:text-blue-800 text-sm">
                      Gauteng Services →
                    </Link>
                    <Link href="/services/plumbing/western-cape" className="block text-blue-700 font-semibold hover:text-blue-800 text-sm">
                      Western Cape Services →
                    </Link>
                    <Link href="/services/plumbing/kwazulu-natal" className="block text-blue-700 font-semibold hover:text-blue-800 text-sm">
                      KwaZulu-Natal Services →
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