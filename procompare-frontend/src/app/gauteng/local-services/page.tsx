import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"
import { getCitiesByProvince } from "@/lib/seo-cities"
import BarkLeadForm from "@/components/leads/BarkLeadForm"

export const dynamic = "force-dynamic"

const province = PROVINCES.find((p) => p.slug === "gauteng")!
const provinceName = province.name
const topCities = province.topCities
const allCities = getCitiesByProvince("gauteng")

export const metadata: Metadata = {
  title: "Find Local Service Providers in Gauteng | ProConnectSA",
  description: `Connect with verified local service providers across Gauteng including Johannesburg, Pretoria, Sandton, and Midrand. Get free quotes for plumbing, electrical, cleaning, and more.`,
  openGraph: {
    title: "Find Local Service Providers in Gauteng | ProConnectSA",
    description: `Connect with verified local service providers across Gauteng. Get free quotes for all your service needs.`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function GautengLocalServicesPage() {
  const categories = await fetchServiceCategories()

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ProConnectSA - Local Services in Gauteng",
    description: "Find verified local service providers in Gauteng",
    areaServed: {
      "@type": "State",
      name: "Gauteng",
      containsPlace: topCities.map((city) => ({
        "@type": "City",
        name: city,
      })),
    },
    serviceType: categories.map((cat) => cat.name),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.proconnectsa.co.za" },
      { "@type": "ListItem", position: 2, name: provinceName, item: `https://www.proconnectsa.co.za/gauteng/local-services` },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>{" "}
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{provinceName} Local Services</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Local Service Providers in {provinceName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Connect with verified local professionals across {provinceName}, from Johannesburg to Pretoria, Sandton to Midrand. 
                Get free quotes for plumbing, electrical, cleaning, painting, and more. Fast matching with no obligation to hire.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {topCities.slice(0, 6).map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white border rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <span className="font-bold">✓</span>
                    <span className="font-semibold">Verified Professionals</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <span className="font-bold">✓</span>
                    <span className="font-semibold">No Obligation</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <span className="font-bold">✓</span>
                    <span className="font-semibold">Compare Quotes</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request Free Quotes</h2>
                <p className="text-gray-600 mb-6">
                  Tell us what service you need and your location in {provinceName}, and we'll connect you with verified local professionals.
                </p>
                <BarkLeadForm />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Popular Services in {provinceName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categories.length ? categories : [
                    { id: 0, slug: "plumbing", name: "Plumbing" },
                    { id: 0, slug: "electrical", name: "Electrical" },
                    { id: 0, slug: "cleaning", name: "Cleaning" },
                    { id: 0, slug: "painting", name: "Painting" },
                    { id: 0, slug: "handyman", name: "Handyman" },
                    { id: 0, slug: "renovations", name: "Renovations" },
                  ]).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/services/${c.slug}/gauteng`}
                      className="rounded-2xl border bg-white p-5 hover:shadow-sm hover:border-emerald-200 transition"
                    >
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-600 mt-1">Get free quotes in {provinceName}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Local Providers in {provinceName}?</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Whether you're in bustling Johannesburg, the administrative hub of Pretoria, the business district of Sandton, 
                    or the growing suburbs of Midrand, finding reliable local service providers matters. Local professionals understand 
                    the unique needs of {provinceName} properties—from high-rise apartments to suburban homes, from commercial spaces 
                    to residential complexes.
                  </p>
                  <p>
                    Our platform connects you with verified service providers who serve your specific area in {provinceName}. 
                    This means faster response times, better understanding of local regulations, and professionals who know the 
                    common issues faced by properties in Johannesburg, Pretoria, Sandton, Midrand, and surrounding areas.
                  </p>
                  <p>
                    Request free quotes from multiple providers, compare pricing and availability, and choose the professional 
                    that best fits your needs—all without sharing your contact details publicly and with no obligation to hire.
                  </p>
                </div>
              </div>

              {/* All Cities in Province Section */}
              <div className="bg-white border rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">All Cities in {provinceName}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Find service providers in all major cities across {provinceName}. Click any city to browse services.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}/plumbing`}
                      className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Popular services in {provinceName} cities:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/services/${c.slug}/${province.slug}`}
                        className="text-xs text-gray-600 hover:text-emerald-700 hover:underline"
                      >
                        {c.name} in {provinceName}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Areas Section */}
              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Areas We Serve</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Click any city to browse all services available in that area:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}/services`}
                      className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                    >
                      All Services in {city.name}
                    </Link>
                  ))}
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
