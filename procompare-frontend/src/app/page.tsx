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
                    Browse verified professionals in your province. Get quotes from local service providers near you.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PROVINCES.map((p) => (
                      <Link
                        key={p.slug}
                        href={p.slug === "gauteng" ? `/${p.slug}/local-services` : `/services/plumbing/${p.slug}`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 font-medium"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Popular Cities</div>
                    <p className="text-xs text-gray-600 mb-3">
                      Find services in major cities: <Link href="/johannesburg/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href="/cape-town/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, <Link href="/durban/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, <Link href="/pretoria/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, <Link href="/sandton/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Sandton</Link>, and more.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Johannesburg", "Cape Town", "Durban", "Pretoria", "Sandton", "Centurion", "Midrand", "Stellenbosch"].map((city) => {
                        const citySlug = city.toLowerCase().replace(/\s+/g, "-")
                        return (
                          <Link key={city} href={`/${citySlug}/services`} className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-medium">
                            {city}
                          </Link>
                        )
                      })}
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
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <span className="text-emerald-600 font-bold">✓</span> <strong>Verified professionals:</strong> All providers are background checked. Whether you're in <Link href="/johannesburg/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link> or <Link href="/cape-town/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, every professional is verified.
                    </p>
                    <p>
                      <span className="text-emerald-600 font-bold">✓</span> <strong>No obligation:</strong> Free to request quotes, no commitment to hire. Compare <Link href="/services/plumbing" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumbing</Link>, <Link href="/services/electrical" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">electrical</Link>, and <Link href="/services/cleaning" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">cleaning</Link> quotes with zero pressure.
                    </p>
                    <p>
                      <span className="text-emerald-600 font-bold">✓</span> <strong>Compare quotes:</strong> Get multiple quotes to find the best price. Request quotes from providers in <Link href="/gauteng/local-services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Gauteng</Link>, <Link href="/services/plumbing/western-cape" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Western Cape</Link>, and all provinces.
                    </p>
                    <p>
                      <span className="text-emerald-600 font-bold">✓</span> <strong>Local & trusted:</strong> Connect with professionals in your area. Serving 50+ cities nationwide including <Link href="/durban/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, <Link href="/pretoria/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, and <Link href="/sandton/services" className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Sandton</Link>.
                    </p>
                  </div>
                </div>

                <div className="border rounded-2xl bg-blue-50 border-blue-200 p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Get Quotes by Province</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Find trusted service providers in major provinces across South Africa. Compare quotes from verified professionals near you.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Link href="/gauteng/local-services" className="block px-4 py-3 bg-white border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition">
                      <div className="font-semibold text-gray-900 text-sm">Gauteng</div>
                      <div className="text-xs text-gray-600 mt-1">Johannesburg, Pretoria, Sandton</div>
                    </Link>
                    <Link href="/services/plumbing/western-cape" className="block px-4 py-3 bg-white border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition">
                      <div className="font-semibold text-gray-900 text-sm">Western Cape</div>
                      <div className="text-xs text-gray-600 mt-1">Cape Town, Stellenbosch, Bellville</div>
                    </Link>
                    <Link href="/services/plumbing/kwazulu-natal" className="block px-4 py-3 bg-white border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition">
                      <div className="font-semibold text-gray-900 text-sm">KwaZulu-Natal</div>
                      <div className="text-xs text-gray-600 mt-1">Durban, Umhlanga, Pietermaritzburg</div>
                    </Link>
                    <Link href="/services/plumbing/eastern-cape" className="block px-4 py-3 bg-white border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition">
                      <div className="font-semibold text-gray-900 text-sm">Eastern Cape</div>
                      <div className="text-xs text-gray-600 mt-1">Gqeberha, East London</div>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-600">
                    Serving all 9 provinces: <Link href="/gauteng/local-services" className="text-emerald-700 hover:text-emerald-800 hover:underline">Gauteng</Link>, <Link href="/services/plumbing/western-cape" className="text-emerald-700 hover:text-emerald-800 hover:underline">Western Cape</Link>, <Link href="/services/plumbing/kwazulu-natal" className="text-emerald-700 hover:text-emerald-800 hover:underline">KwaZulu-Natal</Link>, and more.
                  </p>
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