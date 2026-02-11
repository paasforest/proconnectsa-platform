import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getCityBySlug, SERVICE_SLUG_TO_NAME } from "@/lib/seo-cities"
import { getProvinceBySlug } from "@/lib/seo-locations"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ city: string; service: string }> }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za"

type PublicProvider = {
  id: string
  business_name: string
  city: string | null
  suburb: string | null
  service_categories: string[] | null
  average_rating: number
  total_reviews: number
  verification_status: string
  is_premium_listing_active?: boolean
}

async function fetchProvidersForCityService(cityName: string, categorySlug: string, limit: number = 6): Promise<PublicProvider[]> {
  try {
    const url = `${API_BASE}/api/public/providers/?category=${encodeURIComponent(categorySlug)}&city=${encodeURIComponent(cityName)}&page=1&page_size=${limit}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    const providers: PublicProvider[] = Array.isArray(data?.results) ? data.results : []
    return providers.filter((p) => p?.id && (p.verification_status || "").toLowerCase() === "verified")
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, service } = await params
  const cityData = getCityBySlug(city)
  const serviceName = SERVICE_SLUG_TO_NAME[service] || service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, " ")
  
  if (!cityData) {
    return {
      title: `${serviceName} Services | ProConnectSA`,
      description: `Find ${serviceName.toLowerCase()} professionals near you.`,
    }
  }

  const cityName = cityData.name
  const provinceName = cityData.provinceName

  return {
    title: `${serviceName} in ${cityName} – Get Free Quotes | ProConnectSA`,
    description: `Find trusted ${serviceName.toLowerCase()} in ${cityName}, ${provinceName}. Compare free quotes from verified local professionals. No obligation to hire.`,
    openGraph: {
      title: `${serviceName} in ${cityName} | ProConnectSA`,
      description: `Find trusted ${serviceName.toLowerCase()} in ${cityName}. Compare free quotes from verified professionals.`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function CityServicePage({ params }: Props) {
  const { city, service } = await params
  const cityData = getCityBySlug(city)
  const categories = await fetchServiceCategories()
  
  // Normalize service slug - try to match with category slugs
  const categorySlug = categories.find(c => c.slug === service)?.slug || service
  const serviceName = SERVICE_SLUG_TO_NAME[service] || categories.find(c => c.slug === categorySlug)?.name || service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, " ")

  if (!cityData) return notFound()

  const cityName = cityData.name
  const provinceName = cityData.provinceName
  const province = getProvinceBySlug(cityData.provinceSlug)

  // Fetch providers for this city and service
  const providers = await fetchProvidersForCityService(cityName, categorySlug, 6)
  
  // Get related services (other services in same city)
  const relatedServices = categories
    .filter(c => c.slug !== categorySlug)
    .slice(0, 6)

  // Structured data for SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${serviceName} in ${cityName}`,
    "description": `Find trusted ${serviceName.toLowerCase()} professionals in ${cityName}, ${provinceName}`,
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedIn": {
        "@type": "State",
        "name": provinceName
      }
    },
    "serviceType": serviceName,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.proconnectsa.co.za" },
      { "@type": "ListItem", position: 2, name: provinceName, item: `https://www.proconnectsa.co.za/${cityData.provinceSlug}/local-services` },
      { "@type": "ListItem", position: 3, name: `${cityName} Services`, item: `https://www.proconnectsa.co.za/${city}/services` },
      { "@type": "ListItem", position: 4, name: `${serviceName} in ${cityName}`, item: `https://www.proconnectsa.co.za/${city}/${service}` },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I find ${serviceName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Submit your service request through our form and we'll connect you with up to 3 verified ${serviceName.toLowerCase()} professionals in ${cityName}. Compare their quotes and choose the best fit—all free with no obligation.`,
        },
      },
      {
        "@type": "Question",
        name: `Are ${serviceName.toLowerCase()} in ${cityName} verified?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, all professionals listed on ProConnectSA are verified. We check credentials, reviews, and business registration to ensure you're connecting with trusted local providers in ${cityName}.`,
        },
      },
      {
        "@type": "Question",
        name: `How much do ${serviceName.toLowerCase()} cost in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pricing varies based on the specific job, materials needed, and provider experience. Request free quotes from multiple ${serviceName.toLowerCase()} in ${cityName} to compare pricing and find the best value for your needs.`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4 flex items-center flex-wrap gap-1">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
                <span className="mx-1">/</span>
                <Link href={`/${cityData.provinceSlug}/local-services`} className="hover:text-gray-900">
                  {provinceName}
                </Link>
                <span className="mx-1">/</span>
                <Link href={`/${city}/services`} className="hover:text-gray-900">
                  {cityName} Services
                </Link>
                <span className="mx-1">/</span>
                <span className="text-gray-900 font-medium">{serviceName}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{serviceName}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                {serviceName} in {cityName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Find trusted {serviceName.toLowerCase()} near you in {cityName}, {provinceName}. Compare free quotes from verified local professionals. No obligation to hire.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
              <div className="bg-white border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
                  <span className="text-emerald-700 font-semibold">✓ Verified Professionals</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ No Obligation</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ Compare Quotes</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Free Quotes</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Tell us what you need and we'll connect you with verified {serviceName.toLowerCase()} in {cityName}.
                </p>
                <BarkLeadForm preselectedCategory={categorySlug} />
              </div>

              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Why Choose ProConnectSA in {cityName}?</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Local professionals:</strong> All providers serve {cityName} and surrounding areas</li>
                    <li>• <strong>Verified & reviewed:</strong> Check credentials and read customer reviews</li>
                    <li>• <strong>Compare quotes:</strong> Get multiple quotes to find the best price</li>
                    <li>• <strong>No obligation:</strong> Free to request quotes, no commitment to hire</li>
                    <li>• <strong>Fast matching:</strong> Connect with professionals who can help quickly</li>
                  </ul>
                </div>

                {providers.length > 0 && (
                  <div className="border rounded-2xl p-6 bg-white">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      Verified {serviceName} in {cityName}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      These are verified professionals currently serving {cityName}. Request quotes to compare pricing and availability.
                    </p>
                    <div className="space-y-3">
                      {providers.slice(0, 3).map((pro) => (
                        <div key={pro.id} className="rounded-xl border bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{pro.business_name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {[pro.suburb, pro.city].filter(Boolean).join(", ")}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">{typeof pro.average_rating === "number" ? pro.average_rating.toFixed(1) : "0.0"}</span>{" "}
                                / 5.0 · {pro.total_reviews || 0} {(pro.total_reviews || 0) === 1 ? "review" : "reviews"}
                              </div>
                            </div>
                            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-300">
                              Verified
                            </div>
                          </div>
                          <div className="mt-3">
                            <Link href={`/providers/${pro.id}`} className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                              View profile →
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <Link
                          href={`/providers/browse?category=${encodeURIComponent(categorySlug)}&city=${encodeURIComponent(cityName)}`}
                          className="text-emerald-700 font-semibold hover:text-emerald-800 text-sm"
                        >
                          Browse more {serviceName.toLowerCase()} in {cityName} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Services Section */}
                {relatedServices.length > 0 && (
                  <div className="border rounded-2xl p-6 bg-white">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Other Services in {cityName}</div>
                    <p className="text-gray-600 text-sm mb-4">
                      Looking for other services in {cityName}? Browse related services:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {relatedServices.map((relatedService) => (
                        <Link
                          key={relatedService.slug}
                          href={`/${city}/${relatedService.slug}`}
                          className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                        >
                          {relatedService.name} in {cityName}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href={`/${city}/services`}
                        className="text-sm text-emerald-700 font-semibold hover:text-emerald-800"
                      >
                        View All Services in {cityName} →
                      </Link>
                    </div>
                  </div>
                )}

                {province && (
                  <div className="border rounded-2xl p-6 bg-white">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Other cities in {provinceName}</div>
                    <p className="text-gray-600 text-sm mb-4">
                      Looking for {serviceName.toLowerCase()} in other areas? Explore nearby cities:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {province.topCities
                        .filter(c => c !== cityName)
                        .slice(0, 5)
                        .map((otherCity) => {
                          const otherCitySlug = otherCity.toLowerCase().replace(/\s+/g, "-")
                          return (
                            <Link
                              key={otherCity}
                              href={`/${otherCitySlug}/${service}`}
                              className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              {otherCity}
                            </Link>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
