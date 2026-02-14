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

  // Optimized emotional titles for better CTR with keyword variations
  const getOptimizedTitle = (service: string, city: string, serviceSlug: string) => {
    const serviceLower = service.toLowerCase()
    const slugLower = serviceSlug.toLowerCase()
    
    // Electrical variations - target "electricians", "electrical contractors", "electrical installation"
    if (serviceLower.includes("electrician") || slugLower === "electrical") {
      // Rotate between variations for better coverage
      const variations = [
        `Electricians & Electrical Contractors in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`,
        `Electrician Near Me in ${city} - Compare 3 Verified Pros | ProConnectSA`,
        `Electrical Installation Services in ${city} (Free Quotes) | ProConnectSA`,
        `Compare 3 Verified Electricians in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`
      ]
      // Use city hash for consistent variation per city
      const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return variations[hash % variations.length]
    }
    
    // Plumbing variations
    if (serviceLower.includes("plumber") || slugLower === "plumbing") {
      const variations = [
        `Plumbers & Plumbing Contractors in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`,
        `Plumber Near Me in ${city} - Compare 3 Verified Pros | ProConnectSA`,
        `Compare 3 Verified Plumbers in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`
      ]
      const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return variations[hash % variations.length]
    }
    
    // Security/Alarm variations
    if (serviceLower.includes("security") || slugLower.includes("alarm") || slugLower.includes("security")) {
      const variations = [
        `Alarm Systems & Security Installation in ${city} (Free Quotes) | ProConnectSA`,
        `Security Systems Near Me in ${city} - Compare 3 Verified Pros | ProConnectSA`,
        `Alarm Systems in ${city} - Get Free Quotes from Verified Installers | ProConnectSA`
      ]
      const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return variations[hash % variations.length]
    }
    
    // Carpentry variations
    if (serviceLower.includes("carpenter") || slugLower === "carpentry") {
      const variations = [
        `Carpenters & Carpentry Services in ${city} (Free Quotes) | ProConnectSA`,
        `Carpenter Near Me in ${city} - Compare 3 Verified Pros | ProConnectSA`,
        `Carpentry Services in ${city} - Get Free Quotes | ProConnectSA`
      ]
      const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return variations[hash % variations.length]
    }
    
    // Solar variations
    if (serviceLower.includes("solar")) {
      return `Solar Installation Services in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`
    }
    
    // Cleaning variations
    if (serviceLower.includes("clean")) {
      return `Cleaning Services Near Me in ${city} (Free Quotes) | ProConnectSA`
    }
    
    // Painting variations
    if (serviceLower.includes("paint")) {
      return `Painters & Painting Services in ${city} (Free Quotes) | ProConnectSA`
    }
    
    // Default optimized title with "near me" variation
    const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    if (hash % 2 === 0) {
      return `${service} Near Me in ${city} - Compare 3 Verified Pros | ProConnectSA`
    }
    return `Compare 3 Verified ${service} in ${city} (Free Quotes in 60 Seconds) | ProConnectSA`
  }

  // Enhanced meta descriptions with urgency and social proof
  const getOptimizedDescription = (service: string, city: string, province: string, serviceSlug: string) => {
    const serviceLower = service.toLowerCase()
    const slugLower = serviceSlug.toLowerCase()
    
    // Electrical descriptions
    if (serviceLower.includes("electrician") || slugLower === "electrical") {
      return `Find trusted electricians and electrical contractors in ${city}, ${province}. Compare free quotes from 3 verified professionals. Get quotes today - no obligation. Trusted by 1000+ customers. Fast matching in 60 seconds.`
    }
    
    // Plumbing descriptions
    if (serviceLower.includes("plumber") || slugLower === "plumbing") {
      return `Find trusted plumbers and plumbing contractors in ${city}, ${province}. Compare free quotes from 3 verified professionals. Get quotes today - no obligation. Trusted by 1000+ customers.`
    }
    
    // Security/Alarm descriptions
    if (serviceLower.includes("security") || slugLower.includes("alarm") || slugLower.includes("security")) {
      return `Find trusted alarm systems and security installation professionals in ${city}, ${province}. Compare free quotes from 3 verified installers. Get quotes today - no obligation. Trusted by 1000+ customers.`
    }
    
    // Carpentry descriptions
    if (serviceLower.includes("carpenter") || slugLower === "carpentry") {
      return `Find trusted carpenters and carpentry services in ${city}, ${province}. Compare free quotes from 3 verified professionals. Get quotes today - no obligation. Trusted by 1000+ customers.`
    }
    
    // Default enhanced description
    return `Find trusted ${service.toLowerCase()} professionals in ${city}, ${province}. Compare free quotes from 3 verified experts. Get quotes today - no obligation. Trusted by 1000+ customers. Fast matching in 60 seconds.`
  }

  return {
    title: getOptimizedTitle(serviceName, cityName, service),
    description: getOptimizedDescription(serviceName, cityName, provinceName, service),
    openGraph: {
      title: getOptimizedTitle(serviceName, cityName, service),
      description: getOptimizedDescription(serviceName, cityName, provinceName, service),
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
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Compare 3 Verified {serviceName} in {cityName}
              </h1>
              <p className="text-gray-700 text-lg md:text-xl max-w-3xl mb-6 font-medium">
                Find trusted {serviceName.toLowerCase()} {categorySlug === "electrical" ? "and electrical contractors" : categorySlug === "plumbing" ? "and plumbing contractors" : categorySlug === "carpentry" ? "and carpentry services" : ""} near you in {cityName}, {provinceName}. Get free quotes in 60 seconds. Compare pricing, reviews, and availability from verified local professionals. No obligation to hire.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Quote Section Above The Fold */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Get 3 Free Quotes from Verified {serviceName} in {cityName}
                  </h2>
                  <p className="text-gray-700 text-sm md:text-base">
                    Tell us what you need and we'll match you with up to 3 verified professionals. Compare quotes and choose the best fit—all free with no obligation.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 mb-6 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="text-lg">✓</span> Verified Professionals
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="text-lg">✓</span> Free Quotes
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="text-lg">✓</span> No Obligation
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="text-lg">✓</span> 60 Second Matching
                  </span>
                </div>
                <div className="max-w-2xl mx-auto">
                  <BarkLeadForm preselectedCategory={categorySlug} />
                </div>
              </div>
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
                  <div className="text-sm text-gray-700 space-y-3">
                    <p>
                      <strong>Local professionals near you:</strong> All providers serve {cityName} and surrounding areas. Whether you need {categorySlug === "electrical" ? "electrical contractors and installation services" : categorySlug === "plumbing" ? "plumbing contractors and installation services" : categorySlug === "carpentry" ? "carpentry services and custom woodwork" : categorySlug === "security" || categorySlug === "alarm-systems" ? "alarm systems and security installation" : `${serviceName.toLowerCase()}`} in {cityName}, we connect you with verified professionals near you. Looking for other services? Browse <Link href={`/${city}/plumbing`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumbing</Link>, <Link href={`/${city}/electrical`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">electrical contractors</Link>, or <Link href={`/${city}/cleaning`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">cleaning services</Link>.
                    </p>
                    <p>
                      <strong>Verified & reviewed:</strong> Check credentials and read customer reviews. Our {serviceName.toLowerCase()} {categorySlug === "electrical" ? "and electrical contractors" : categorySlug === "plumbing" ? "and plumbing contractors" : ""} in {cityName} are verified and have proven track records. Trusted by 1000+ customers across South Africa. Looking for other services? Browse <Link href={`/${city}/services`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">all services in {cityName}</Link>.
                    </p>
                    <p>
                      <strong>Compare quotes:</strong> Get multiple quotes to find the best price. Request quotes from different {serviceName.toLowerCase()} {categorySlug === "electrical" ? "contractors" : categorySlug === "plumbing" ? "contractors" : "providers"} in {cityName} and compare pricing, availability, and reviews before making a decision. Get quotes today - no obligation to hire.
                    </p>
                    <p>
                      <strong>No obligation:</strong> Free to request quotes, no commitment to hire. Explore <Link href={`/services/${categorySlug}/${cityData.provinceSlug}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">{serviceName.toLowerCase()} across {provinceName}</Link> or find providers in nearby cities like <Link href={`/${province?.topCities.find(c => c !== cityName)?.toLowerCase().replace(/\s+/g, "-")}/${service}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">{province?.topCities.find(c => c !== cityName)}</Link>.
                    </p>
                  </div>
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

        {/* FAQ Section */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Frequently Asked Questions About {serviceName} in {cityName}
              </h2>
              <div className="space-y-4">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How do I find {serviceName.toLowerCase()} in {cityName}?
                  </h3>
                  <p className="text-gray-700">
                    Submit your service request through our form above and we'll connect you with up to 3 verified {serviceName.toLowerCase()} professionals in {cityName}. Compare their quotes, read reviews, and choose the best fit—all free with no obligation to hire. Our platform matches you with local providers who serve {cityName} and surrounding areas in {provinceName}.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Are {serviceName.toLowerCase()} in {cityName} verified?
                  </h3>
                  <p className="text-gray-700">
                    Yes, all professionals listed on ProConnectSA are verified. We check credentials, business registration, reviews, and insurance to ensure you're connecting with trusted local providers in {cityName}. Every {serviceName.toLowerCase()} you'll be matched with has been background checked and verified before being listed on our platform.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How much do {serviceName.toLowerCase()} cost in {cityName}?
                  </h3>
                  <p className="text-gray-700">
                    Pricing varies based on the specific job, materials needed, provider experience, and location within {cityName}. Request free quotes from multiple {serviceName.toLowerCase()} professionals to compare pricing and find the best value for your needs. Most providers in {cityName} offer competitive rates, and getting multiple quotes helps ensure you're getting fair pricing for your project.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How quickly can I get quotes in {cityName}?
                  </h3>
                  <p className="text-gray-700">
                    Most {serviceName.toLowerCase()} professionals in {cityName} respond within 24-48 hours of your request. During peak seasons or for urgent jobs, response times may vary. Our platform prioritizes active providers who respond quickly to customer requests, ensuring you get timely quotes for your project in {cityName}.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What areas in {cityName} do you cover?
                  </h3>
                  <p className="text-gray-700">
                    Our network of verified {serviceName.toLowerCase()} covers all areas of {cityName}, including {cityName === "Johannesburg" ? "Sandton, Rosebank, Melville, Randburg, Fourways, Midrand, Rivonia" : cityName === "Cape Town" ? "City Bowl, Sea Point, Camps Bay, Constantia, Newlands, Rondebosch" : cityName === "Durban" ? "Umhlanga, Berea, Morningside, Glenwood, Westville" : "all major suburbs and surrounding areas"}. Whether you're in the city center or surrounding suburbs, we'll match you with providers who serve your specific area.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is it really free to get quotes?
                  </h3>
                  <p className="text-gray-700">
                    Yes, requesting quotes is completely free. There's no cost to you, and no obligation to hire any of the professionals who respond. You only pay if you decide to proceed with a {serviceName.toLowerCase()} provider. This allows you to compare pricing, availability, and reviews from multiple professionals in {cityName} before making a decision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Why Trust ProConnectSA for {serviceName} in {cityName}?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Verified Providers</div>
                  <p className="text-xs text-gray-600">All {serviceName.toLowerCase()} are background checked and verified</p>
                </div>
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">Free</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Quote Requests</div>
                  <p className="text-xs text-gray-600">No cost, no obligation to hire</p>
                </div>
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">24hr</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Average Response</div>
                  <p className="text-xs text-gray-600">Fast matching with local professionals</p>
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
