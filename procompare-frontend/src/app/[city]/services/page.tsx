import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getCityBySlug, getCitiesByProvince } from "@/lib/seo-cities"
import { getProvinceBySlug, PROVINCES } from "@/lib/seo-locations"
import BarkLeadForm from "@/components/leads/BarkLeadForm"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ city: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const cityData = getCityBySlug(city)
  
  if (!cityData) {
    return {
      title: "Services | ProConnectSA",
      description: "Find service providers near you.",
    }
  }

  return {
    title: `All Services in ${cityData.name} | Get Free Quotes | ProConnectSA`,
    description: `Find trusted service providers in ${cityData.name}, ${cityData.provinceName}. Compare free quotes from verified professionals for plumbing, electrical, cleaning, painting, and more. No obligation to hire.`,
    openGraph: {
      title: `All Services in ${cityData.name} | ProConnectSA`,
      description: `Find verified service providers in ${cityData.name}. Compare free quotes from local professionals.`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function CityServicesPage({ params }: Props) {
  const { city } = await params
  const cityData = getCityBySlug(city)
  
  if (!cityData) return notFound()

  const categories = await fetchServiceCategories()
  const province = getProvinceBySlug(cityData.provinceSlug)
  const otherCitiesInProvince = getCitiesByProvince(cityData.provinceSlug).filter(
    c => c.slug !== city
  )

  // Structured data for SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `ProConnectSA - Services in ${cityData.name}`,
    description: `Find verified service providers in ${cityData.name}, ${cityData.provinceName}`,
    areaServed: {
      "@type": "City",
      name: cityData.name,
      containedIn: {
        "@type": "State",
        name: cityData.provinceName
      }
    },
    serviceType: categories.map((cat) => cat.name),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.proconnectsa.co.za" },
      { "@type": "ListItem", position: 2, name: cityData.provinceName, item: `https://www.proconnectsa.co.za/${cityData.provinceSlug}/local-services` },
      { "@type": "ListItem", position: 3, name: `${cityData.name} Services`, item: `https://www.proconnectsa.co.za/${city}/services` },
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
                {province && (
                  <>
                    <Link href={`/${cityData.provinceSlug}/local-services`} className="hover:text-gray-900">
                      {cityData.provinceName}
                    </Link>{" "}
                    <span className="mx-2">/</span>
                  </>
                )}
                <span className="text-gray-900 font-medium">{cityData.name} Services</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                All Services in {cityData.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Find trusted service providers in {cityData.name}, {cityData.provinceName}. 
                Compare free quotes from verified professionals for all your home and business needs. 
                Fast matching with no obligation to hire.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Lead Form */}
              <div className="bg-white border rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
                  <span className="text-emerald-700 font-semibold">✓ Verified</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ No Obligation</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ Compare Quotes</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Free Quotes in {cityData.name}</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Tell us what service you need in {cityData.name}, and we'll connect you with verified local professionals.
                </p>
                <BarkLeadForm />
              </div>

              {/* All Services Grid */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Services Available in {cityData.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categories.length ? categories : [
                    { id: 0, slug: "plumbing", name: "Plumbing" },
                    { id: 0, slug: "electrical", name: "Electrical" },
                    { id: 0, slug: "cleaning", name: "Cleaning" },
                    { id: 0, slug: "painting", name: "Painting" },
                    { id: 0, slug: "handyman", name: "Handyman" },
                    { id: 0, slug: "hvac", name: "HVAC" },
                    { id: 0, slug: "landscaping", name: "Landscaping" },
                    { id: 0, slug: "solar-installation", name: "Solar Installation" },
                    { id: 0, slug: "carpentry", name: "Carpentry" },
                    { id: 0, slug: "roofing", name: "Roofing" },
                    { id: 0, slug: "flooring", name: "Flooring" },
                    { id: 0, slug: "renovations", name: "Renovations" },
                  ]).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${city}/${c.slug}`}
                      className="rounded-2xl border bg-white p-5 hover:shadow-sm hover:border-emerald-200 transition group"
                    >
                      <div className="font-semibold text-gray-900 group-hover:text-emerald-700">
                        {c.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Find {c.name.toLowerCase()} in {cityData.name}
                      </div>
                      <div className="text-xs text-emerald-700 mt-2 font-medium">
                        Get quotes →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Cities in Province */}
              {otherCitiesInProvince.length > 0 && (
                <div className="bg-white border rounded-2xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Other Cities in {cityData.provinceName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Looking for services in nearby cities? Explore other areas in {cityData.provinceName}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {otherCitiesInProvince.slice(0, 8).map((otherCity) => (
                      <Link
                        key={otherCity.slug}
                        href={`/${otherCity.slug}/services`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 font-medium"
                      >
                        {otherCity.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Choose Section */}
              <div className="bg-white border rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Why Choose ProConnectSA in {cityData.name}?
                </h2>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>Local professionals:</strong> All providers serve {cityData.name} and surrounding areas</li>
                  <li>• <strong>Verified & reviewed:</strong> Check credentials and read customer reviews</li>
                  <li>• <strong>Compare quotes:</strong> Get multiple quotes to find the best price</li>
                  <li>• <strong>No obligation:</strong> Free to request quotes, no commitment to hire</li>
                  <li>• <strong>Fast matching:</strong> Connect with professionals who can help quickly</li>
                </ul>
              </div>

              {/* Back to Province */}
              {province && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Explore All {province.name} Services
                  </h2>
                  <p className="text-gray-700 text-sm mb-4">
                    Find service providers across all cities in {province.name}. Browse by province or city.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/${cityData.provinceSlug}/local-services`}
                      className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      All {province.name} Services
                    </Link>
                    <Link
                      href={`/services/plumbing/${cityData.provinceSlug}`}
                      className="inline-flex items-center px-6 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium"
                    >
                      Browse by Service
                    </Link>
                  </div>
                </div>
              )}

              {/* Other Provinces Section */}
              <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Provinces</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Find service providers in other provinces across South Africa:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROVINCES.filter(p => p.slug !== cityData.provinceSlug).map((otherProvince) => (
                    <Link
                      key={otherProvince.slug}
                      href={otherProvince.slug === "gauteng" 
                        ? `/gauteng/local-services` 
                        : `/services/plumbing/${otherProvince.slug}`
                      }
                      className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 font-medium"
                    >
                      {otherProvince.name}
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
