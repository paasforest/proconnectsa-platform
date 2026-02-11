import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getProvinceBySlug } from "@/lib/seo-locations"
import { getCitiesByProvince } from "@/lib/seo-cities"
import { SEO_SERVICE_PROVINCE_PAGES } from "@/lib/seo-service-pages"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ category: string; province: string }> }

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

async function fetchTopVerifiedProvidersForProvinceService(args: {
  categorySlug: string
  provinceTopCities: string[]
  limit: number
}): Promise<PublicProvider[]> {
  const { categorySlug, provinceTopCities, limit } = args

  const results: PublicProvider[] = []
  const seen = new Set<string>()

  // Query by city because our public providers endpoint supports city filtering.
  // We iterate top cities for the province to approximate province-wide coverage.
  for (const city of provinceTopCities) {
    if (results.length >= limit) break
    try {
      const url = `${API_BASE}/api/public/providers/?category=${encodeURIComponent(categorySlug)}&city=${encodeURIComponent(
        city
      )}&page=1&page_size=${Math.max(6, limit)}`
      const res = await fetch(url, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const data = await res.json()
      const providers: PublicProvider[] = Array.isArray(data?.results) ? data.results : []

      for (const p of providers) {
        if (results.length >= limit) break
        if (!p?.id || seen.has(p.id)) continue
        if ((p.verification_status || "").toLowerCase() !== "verified") continue
        seen.add(p.id)
        results.push(p)
      }
    } catch {
      // ignore and keep trying other cities
    }
  }

  return results
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, province } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const p = getProvinceBySlug(province)
  const name = c?.name || category
  const provinceName = p?.name || province

  const key = `${category}/${province}`
  const custom = SEO_SERVICE_PROVINCE_PAGES[key]
  if (custom) {
    return {
      title: custom.seoTitle,
      description: custom.metaDescription,
    }
  }

  return {
    title: `${name} in ${provinceName} | Get Free Quotes | ProConnectSA`,
    description: `Compare free quotes from verified ${name.toLowerCase()} professionals in ${provinceName}. Fast matching and no obligation.`,
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ServiceProvincePage({ params }: Props) {
  const { category, province } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const p = getProvinceBySlug(province)

  if (!p) return notFound()
  if (!c && categories.length) return notFound()

  const serviceName = c?.name || category
  const key = `${category}/${province}`
  const custom = SEO_SERVICE_PROVINCE_PAGES[key]
  const citiesInProvince = getCitiesByProvince(province)
  const topProviders = await fetchTopVerifiedProvidersForProvinceService({
    categorySlug: category,
    provinceTopCities: p.topCities || [],
    limit: 6,
  })
  
  // Get related services (other services in same province)
  const relatedServices = categories
    .filter(cat => cat.slug !== category)
    .slice(0, 6)

  const faq = [
    {
      q: `How many ${serviceName.toLowerCase()} quotes will I get in ${p.name}?`,
      a: `We'll match you with up to 3 verified ${serviceName.toLowerCase()} professionals based on your location in ${p.name} and your specific request. This allows you to compare pricing, availability, and reviews from multiple providers before making a decision.`,
    },
    {
      q: `Is it free to request ${serviceName.toLowerCase()} quotes in ${p.name}?`,
      a: `Yes — requesting quotes is completely free and there's no obligation to hire. You only pay if you decide to proceed with a ${serviceName.toLowerCase()} provider. This service is available across all major cities in ${p.name}, including ${p.topCities.slice(0, 3).join(", ")}.`,
    },
    {
      q: `How fast do ${serviceName.toLowerCase()} professionals respond in ${p.name}?`,
      a: `Most ${serviceName.toLowerCase()} professionals in ${p.name} respond within 24-48 hours of your request. Response times may vary based on demand in your specific area, but our platform prioritizes active providers who respond quickly to customer requests.`,
    },
    {
      q: `Are ${serviceName.toLowerCase()} in ${p.name} verified?`,
      a: `Yes, all professionals listed on ProConnectSA are verified. We check credentials, business registration, reviews, and insurance to ensure you're connecting with trusted providers across ${p.name}. Every ${serviceName.toLowerCase()} you'll be matched with has been background checked before being listed.`,
    },
    {
      q: `What areas in ${p.name} do you cover?`,
      a: `Our network covers all major cities and towns across ${p.name}, including ${p.topCities.slice(0, 5).join(", ")}, and surrounding areas. Whether you're in a major city or smaller town, we'll match you with ${serviceName.toLowerCase()} professionals who serve your specific area.`,
    },
    {
      q: `How much do ${serviceName.toLowerCase()} cost in ${p.name}?`,
      a: `Pricing varies based on the specific job, materials needed, provider experience, and location within ${p.name}. Request free quotes from multiple professionals to compare pricing. Rates may differ between major cities like ${p.topCities[0]} and smaller towns, so getting multiple quotes helps ensure fair pricing.`,
    },
  ]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Services", item: "https://www.proconnectsa.co.za/services" },
      { "@type": "ListItem", position: 2, name: serviceName, item: `https://www.proconnectsa.co.za/services/${category}` },
      { "@type": "ListItem", position: 3, name: p.name, item: `https://www.proconnectsa.co.za/services/${category}/${province}` },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4 flex items-center flex-wrap gap-1">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
                <span className="mx-1">/</span>
                <Link href="/services" className="hover:text-gray-900">
                  Services
                </Link>{" "}
                <span className="mx-1">/</span>
                <Link href={`/services/${category}`} className="hover:text-gray-900">
                  {serviceName}
                </Link>{" "}
                <span className="mx-1">/</span>
                <span className="text-gray-900 font-medium">{p.name}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get free quotes for {serviceName} in {p.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl mb-4">
                Compare quotes from verified professionals across {p.name}. Whether you're looking for {serviceName.toLowerCase()} in <Link href={`/johannesburg/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href={`/pretoria/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, <Link href={`/cape-town/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, or <Link href={`/durban/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, we'll match you with local professionals. Tell us what you need and get matched fast.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl">
                <p className="text-sm text-gray-700">
                  <strong>Looking for {serviceName.toLowerCase()} in {p.name}?</strong> Our platform connects you with verified professionals across all major cities in {p.name}, including {p.topCities.slice(0, 3).join(", ")}, and surrounding areas. Every provider is background checked, insured, and has proven track records. Request free quotes with no obligation to hire.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.topCities.map((city) => {
                  const citySlug = city.toLowerCase().replace(/\s+/g, "-")
                  return (
                    <Link
                      key={city}
                      href={`/${citySlug}/${category}`}
                      className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      title={`Find ${serviceName.toLowerCase()} in ${city}`}
                    >
                      {city}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
              <div className="bg-white border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-emerald-700 font-semibold">✓ Verified</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ No Obligation</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ Compare Quotes</span>
                </div>
                <BarkLeadForm preselectedCategory={category} />
              </div>
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Find {serviceName} in Cities Near You</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse verified {serviceName.toLowerCase()} professionals in major cities across {p.name}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.topCities.map((city) => {
                      const citySlug = city.toLowerCase().replace(/\s+/g, "-")
                      return (
                        <Link
                          key={city}
                          href={`/${citySlug}/${category}`}
                          className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50"
                          title={`Find ${serviceName.toLowerCase()} in ${city}`}
                        >
                          {city}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-emerald-50 border-emerald-200">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Why Choose ProConnectSA in {p.name}?</div>
                  <div className="text-sm text-gray-700 space-y-3">
                    <p>
                      <strong>Verified professionals:</strong> All providers are background checked and verified. Whether you need {serviceName.toLowerCase()} in <Link href={`/johannesburg/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link> or <Link href={`/cape-town/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, we ensure quality.
                    </p>
                    <p>
                      <strong>Local expertise:</strong> Providers understand {p.name} properties and local regulations. From <Link href={`/services/plumbing/${p.slug}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">plumbing</Link> to <Link href={`/services/electrical/${p.slug}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">electrical work</Link>, our professionals know the local market.
                    </p>
                    <p>
                      <strong>Compare quotes:</strong> Get multiple quotes to find the best price. No obligation to hire—request quotes from <Link href={`/${p.topCities[0]?.toLowerCase().replace(/\s+/g, "-")}/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">{p.topCities[0]}</Link> to <Link href={`/${p.topCities[1]?.toLowerCase().replace(/\s+/g, "-")}/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">{p.topCities[1]}</Link> and compare.
                    </p>
                    <p>
                      <strong>Fast matching:</strong> Connect with professionals who can help quickly. Our platform matches you with verified {serviceName.toLowerCase()} providers across all major cities in {p.name}.
                    </p>
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Top verified {serviceName.toLowerCase()} pros in {p.name}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    These are verified professionals currently visible in our public directory for {p.name}. Requesting quotes is still free and
                    there’s no obligation to hire.
                  </p>

                  {topProviders.length === 0 ? (
                    <div className="text-sm text-gray-700">
                      We’re growing our network of verified providers in {p.name}. Submit your request and we’ll route it to matching pros as they
                      become available.
                      <div className="mt-3">
                        <Link href={`/services/${category}`} className="text-emerald-700 font-semibold hover:text-emerald-800">
                          Back to {serviceName} →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProviders.map((pro) => (
                        <div key={pro.id} className="rounded-xl border bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
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
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <Link href={`/providers/${pro.id}`} className="text-emerald-700 font-semibold hover:text-emerald-800">
                              View profile →
                            </Link>
                            <Link href={`/providers/${pro.id}/reviews`} className="text-gray-700 font-semibold hover:text-gray-900">
                              Reviews →
                            </Link>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2">
                        <Link
                          href={`/providers/browse?category=${encodeURIComponent(category)}`}
                          className="text-emerald-700 font-semibold hover:text-emerald-800"
                        >
                          Browse more {serviceName.toLowerCase()} pros →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* All Cities in Province Section */}
                {citiesInProvince.length > 0 && (
                  <div className="border rounded-2xl p-6 bg-white">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Find {serviceName} in Cities Across {p.name}</div>
                    <p className="text-gray-600 text-sm mb-4">
                      Browse {serviceName.toLowerCase()} professionals in all major cities across {p.name}. Click any city to see providers and get quotes.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {citiesInProvince.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/${city.slug}/${category}`}
                          className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                        >
                          {serviceName} in {city.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-3">FAQs</div>
                  <div className="space-y-3 text-sm">
                    {faq.map((x) => (
                      <div key={x.q}>
                        <div className="font-medium text-gray-900">{x.q}</div>
                        <div className="text-gray-600 mt-1">{x.a}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Are you a professional?</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Get customers in {p.name}. Only see leads in your services and areas.
                  </p>
                  <Link href="/for-pros" className="text-emerald-700 font-semibold hover:text-emerald-800">
                    Learn how it works →
                  </Link>
                </div>

                {province === "gauteng" && (
                  <div className="border rounded-2xl p-6 bg-emerald-50 border-emerald-200">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Explore {p.name} Services</div>
                    <p className="text-gray-600 text-sm mb-4">
                      Discover more ways to find and connect with service providers in {p.name}.
                    </p>
                    <div className="space-y-2">
                      <Link href="/gauteng/local-services" className="block text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Local Services in {p.name} →
                      </Link>
                      <Link href="/gauteng/get-quotes" className="block text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Get Free Quotes in {p.name} →
                      </Link>
                      <Link href="/gauteng/find-service-providers" className="block text-emerald-700 font-semibold hover:text-emerald-800 text-sm">
                        Find Service Providers in {p.name} →
                      </Link>
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
                Frequently Asked Questions About {serviceName} in {p.name}
              </h2>
              <div className="space-y-4">
                {faq.map((item, index) => (
                  <div key={index} className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                    <p className="text-gray-700">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Why Choose ProConnectSA for {serviceName} in {p.name}?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Verified Providers</div>
                  <p className="text-xs text-gray-600">All {serviceName.toLowerCase()} are background checked and verified across {p.name}</p>
                </div>
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">Free</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Quote Requests</div>
                  <p className="text-xs text-gray-600">No cost, no obligation to hire in {p.name}</p>
                </div>
                <div className="bg-white border rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">24hr</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Average Response</div>
                  <p className="text-xs text-gray-600">Fast matching with local professionals in {p.name}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {custom && (
          <section className="pb-14">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white border rounded-2xl p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{custom.h1}</h1>
                  <p className="mt-4 text-gray-700 leading-relaxed">{custom.intro}</p>

                  <div className="mt-8 space-y-8">
                    {custom.sections.map((s) => (
                      <div key={s.h2}>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{s.h2}</h2>
                        <p className="mt-3 text-gray-700 leading-relaxed">{s.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 border-t pt-6 space-y-3 text-sm text-gray-700">
                    {custom.internalLinks.map((l) => (
                      <p key={l.href}>
                        {l.text}{" "}
                        <Link className="text-emerald-700 font-semibold hover:text-emerald-800" href={l.href}>
                          {l.href}
                        </Link>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

