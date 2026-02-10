import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getProvinceBySlug } from "@/lib/seo-locations"
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
    robots: { index: false, follow: true },
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
  const topProviders = await fetchTopVerifiedProvidersForProvinceService({
    categorySlug: category,
    provinceTopCities: p.topCities || [],
    limit: 6,
  })

  const faq = [
    {
      q: `How many ${serviceName.toLowerCase()} quotes will I get?`,
      a: "We’ll match you with up to 3 verified professionals based on your location and request.",
    },
    {
      q: "Is it free to request quotes?",
      a: "Yes — requesting quotes is free and there’s no obligation to hire.",
    },
    {
      q: "How fast do professionals respond?",
      a: "Many professionals respond within 24 hours, depending on demand in your area.",
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
              <p className="text-gray-600 text-lg max-w-3xl">
                Compare quotes from verified professionals across {p.name}. Tell us what you need and get matched fast.
              </p>

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
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Verified professionals:</strong> All providers are background checked and verified</li>
                    <li>• <strong>Local expertise:</strong> Providers understand {p.name} properties and local regulations</li>
                    <li>• <strong>Compare quotes:</strong> Get multiple quotes to find the best price</li>
                    <li>• <strong>No obligation:</strong> Free to request quotes, no commitment to hire</li>
                    <li>• <strong>Fast matching:</strong> Connect with professionals who can help quickly</li>
                  </ul>
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

