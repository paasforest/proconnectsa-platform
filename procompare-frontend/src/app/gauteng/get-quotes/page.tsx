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
  title: "Get Free Quotes in Gauteng | Compare Service Providers | ProConnectSA",
  description: `Get free quotes from verified service providers across Gauteng. Compare pricing and availability for plumbing, electrical, cleaning, and more in Johannesburg, Pretoria, Sandton, and Midrand.`,
  openGraph: {
    title: "Get Free Quotes in Gauteng | ProConnectSA",
    description: `Compare free quotes from verified professionals in Gauteng. No obligation to hire.`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function GautengGetQuotesPage() {
  const categories = await fetchServiceCategories()

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Get Free Quotes in Gauteng",
    description: "Compare free quotes from verified service providers in Gauteng",
    areaServed: {
      "@type": "State",
      name: "Gauteng",
      containsPlace: topCities.map((city) => ({
        "@type": "City",
        name: city,
      })),
    },
    provider: {
      "@type": "Organization",
      name: "ProConnectSA",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.proconnectsa.co.za" },
      { "@type": "ListItem", position: 2, name: provinceName, item: `https://www.proconnectsa.co.za/gauteng/get-quotes` },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I get free quotes in Gauteng?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply submit your service request through our form, confirm via SMS, and we'll connect you with up to 3 verified professionals in your area. Compare their quotes, ask questions, and choose the best fit—all free with no obligation to hire.",
        },
      },
      {
        "@type": "Question",
        name: "Which areas in Gauteng do you cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `We connect customers with verified providers across all major areas in Gauteng, including Johannesburg, Pretoria, Sandton, Midrand, Randburg, Centurion, and surrounding suburbs.`,
        },
      },
      {
        "@type": "Question",
        name: "Is it really free to get quotes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, requesting quotes is completely free. There's no cost to you, and no obligation to hire any of the professionals who respond. You only pay if you decide to proceed with a service provider.",
        },
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>{" "}
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Get Quotes in {provinceName}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get Free Quotes in {provinceName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Compare quotes from verified service providers across {provinceName}. Whether you're in Johannesburg, Pretoria, 
                Sandton, or Midrand, submit one request and receive multiple quotes—all free with no obligation to hire.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
              <div className="bg-white border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
                  <span className="text-emerald-700 font-semibold">✓ Verified</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ No Obligation</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">✓ Compare Quotes</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Your Free Quote</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Tell us what service you need and where you're located in {provinceName}, and we'll connect you with verified professionals.
                </p>
                <BarkLeadForm />
              </div>

              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">How It Works</div>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Submit your service request with details about what you need</li>
                    <li>Confirm your request via SMS verification</li>
                    <li>Receive quotes from up to 3 verified professionals</li>
                    <li>Compare pricing, availability, and reviews</li>
                    <li>Choose the provider that best fits your needs</li>
                  </ol>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Popular Services in {provinceName}</div>
                  <div className="flex flex-wrap gap-2">
                    {(categories.length ? categories.slice(0, 6) : [
                      { slug: "plumbing", name: "Plumbing" },
                      { slug: "electrical", name: "Electrical" },
                      { slug: "cleaning", name: "Cleaning" },
                      { slug: "painting", name: "Painting" },
                      { slug: "handyman", name: "Handyman" },
                      { slug: "renovations", name: "Renovations" },
                    ]).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/services/${c.slug}/gauteng`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Why Get Quotes Through ProConnectSA?</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Free quotes:</strong> No cost to request quotes, no obligation to hire</li>
                    <li>• <strong>Verified providers:</strong> All professionals are verified and reviewed</li>
                    <li>• <strong>Local matching:</strong> Connect with providers who serve your area in {provinceName}</li>
                    <li>• <strong>Compare easily:</strong> Review multiple quotes side-by-side</li>
                    <li>• <strong>Protected contact:</strong> Your details stay private until you choose to share</li>
                  </ul>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Serving All Major Areas</div>
                  <p className="text-sm text-gray-600 mb-3">
                    We connect customers with verified providers across {provinceName}, including:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center rounded-full bg-gray-50 border px-3 py-1 text-xs text-gray-700"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Services by Category</h2>
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
                    className="rounded-xl border bg-gray-50 p-4 hover:shadow-sm hover:border-emerald-200 transition text-center"
                  >
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-600 mt-1">Get quotes in {provinceName}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
