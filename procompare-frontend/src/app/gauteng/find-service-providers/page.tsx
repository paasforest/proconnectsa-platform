import type { Metadata } from "next"
import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"
import BarkLeadForm from "@/components/leads/BarkLeadForm"

export const dynamic = "force-dynamic"

const province = PROVINCES.find((p) => p.slug === "gauteng")!
const provinceName = province.name
const topCities = province.topCities

export const metadata: Metadata = {
  title: "Find Service Providers in Gauteng | Verified Professionals | ProConnectSA",
  description: `Find verified service providers across Gauteng including Johannesburg, Pretoria, Sandton, and Midrand. Browse profiles, read reviews, and connect with trusted professionals.`,
  openGraph: {
    title: "Find Service Providers in Gauteng | ProConnectSA",
    description: `Browse verified service providers in Gauteng. Read reviews and connect with trusted professionals.`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function GautengFindServiceProvidersPage() {
  const categories = await fetchServiceCategories()

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ProConnectSA - Service Providers in Gauteng",
    description: "Find verified service providers across Gauteng",
    areaServed: {
      "@type": "State",
      name: "Gauteng",
      containsPlace: topCities.map((city) => ({
        "@type": "City",
        name: city,
      })),
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.proconnectsa.co.za" },
      { "@type": "ListItem", position: 2, name: provinceName, item: `https://www.proconnectsa.co.za/gauteng/find-service-providers` },
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
                <span className="text-gray-900 font-medium">Find Service Providers in {provinceName}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Find Service Providers in {provinceName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Browse verified service providers across {provinceName}. From Johannesburg to Pretoria, Sandton to Midrand, 
                find trusted professionals for all your service needs. Read reviews, compare profiles, and connect directly.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white border rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Quotes from Providers</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Submit your service request and we'll connect you with verified providers in your area.
                </p>
                <BarkLeadForm />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Providers by Service</h2>
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
                      <div className="text-sm text-gray-600 mt-1">Find {c.name.toLowerCase()} providers in {provinceName}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Verified Providers?</h2>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Verified credentials:</strong> All providers undergo verification checks</li>
                    <li>• <strong>Real reviews:</strong> Read authentic reviews from past customers</li>
                    <li>• <strong>Local expertise:</strong> Providers understand {provinceName} properties and regulations</li>
                    <li>• <strong>Transparent pricing:</strong> Compare quotes before you commit</li>
                    <li>• <strong>Reliable service:</strong> Track record of quality work in {provinceName}</li>
                  </ul>
                </div>

                <div className="bg-white border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Major Areas We Cover</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Our network of verified providers serves customers across all major areas in {provinceName}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topCities.map((city) => (
                      <Link
                        key={city}
                        href={`/providers/browse?city=${encodeURIComponent(city)}`}
                        className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Find the Right Provider</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1. Browse by Service Category</h3>
                    <p className="text-sm">
                      Start by selecting the service you need—whether it's plumbing in Johannesburg, electrical work in Pretoria, 
                      cleaning services in Sandton, or renovations in Midrand. Each category page shows providers who specialize in that service.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. Review Provider Profiles</h3>
                    <p className="text-sm">
                      Check provider profiles to see their experience, service areas, ratings, and reviews from past customers. 
                      Look for providers who serve your specific area in {provinceName} and have experience with similar projects.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3. Request Quotes</h3>
                    <p className="text-sm">
                      Submit a service request through our platform. We'll match you with up to 3 verified providers who can help. 
                      Compare their quotes, ask questions, and choose the provider that best fits your needs and budget.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Ready to Find Your Provider?</h2>
                <p className="text-gray-700 mb-4">
                  Browse our directory of verified service providers in {provinceName}, or submit a request to get matched with professionals in your area.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/providers/browse"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Browse All Providers
                  </Link>
                  <Link
                    href="/gauteng/get-quotes"
                    className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    Get Free Quotes
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
