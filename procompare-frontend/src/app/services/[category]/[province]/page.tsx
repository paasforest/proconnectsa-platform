import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getProvinceBySlug } from "@/lib/seo-locations"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ category: string; province: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, province } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const p = getProvinceBySlug(province)
  const name = c?.name || category
  const provinceName = p?.name || province
  return {
    title: `${name} in ${provinceName} | Get Free Quotes | ProConnectSA`,
    description: `Compare free quotes from verified ${name.toLowerCase()} professionals in ${provinceName}. Fast matching and no obligation.`,
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
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/services" className="hover:text-gray-900">
                  Services
                </Link>{" "}
                <span className="mx-2">/</span>
                <Link href={`/services/${category}`} className="hover:text-gray-900">
                  {serviceName}
                </Link>{" "}
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{p.name}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get free quotes for {serviceName} in {p.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Compare quotes from verified professionals across {p.name}. Tell us what you need and get matched fast.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.topCities.map((city) => (
                  <span key={city} className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
              <div className="bg-white border rounded-2xl p-6">
                <BarkLeadForm preselectedCategory={category} />
              </div>
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Popular cities in {p.name}</div>
                  <p className="text-gray-600 text-sm mb-4">
                    We’ll match based on your suburb/city — these are common areas in {p.name}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.topCities.map((city) => (
                      <span key={city} className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 bg-gray-50">
                        {city}
                      </span>
                    ))}
                  </div>
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
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

