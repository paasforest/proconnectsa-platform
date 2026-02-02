import Link from "next/link"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { PROVINCES } from "@/lib/seo-locations"
import { fetchServiceCategories } from "@/lib/service-categories"

export const dynamic = "force-dynamic"

export default async function Homepage() {
  const categories = await fetchServiceCategories()

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ProConnectSA",
    "description": "Get free quotes from verified service professionals across South Africa.",
    "url": "https://www.proconnectsa.co.za",
    "email": "support@proconnectsa.co.za",
  }

  const popular = (categories.length ? categories : [
    { id: 0, slug: "plumbing", name: "Plumbing" },
    { id: 0, slug: "electrical", name: "Electrical" },
    { id: 0, slug: "cleaning", name: "Cleaning" },
    { id: 0, slug: "painting", name: "Painting" },
    { id: 0, slug: "handyman", name: "Handyman" },
  ]).slice(0, 8)

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
                  Get free quotes from verified professionals
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Tell us what you need, your timeline, and where you are — we’ll match you with professionals who can help.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-8">
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">Verified pros</span>
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">Intent + timeline shown</span>
                  <span className="inline-flex items-center rounded-full bg-white border px-3 py-1">Secure & private</span>
                </div>

                <div className="border rounded-2xl bg-white p-6">
                  <BarkLeadForm />
                </div>
              </div>

              <div className="space-y-8">
                <div className="border rounded-2xl bg-white p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-3">Popular services</div>
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
                  <div className="text-lg font-semibold text-gray-900 mb-3">Top provinces</div>
                  <div className="flex flex-wrap gap-2">
                    {PROVINCES.slice(0, 3).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/services/plumbing/${p.slug}`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Want leads as a professional?{" "}
                    <Link href="/for-pros" className="font-semibold text-emerald-700 hover:text-emerald-800">
                      Learn how it works →
                    </Link>
                  </div>
                </div>

                <div className="border rounded-2xl bg-white p-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Browse the directory</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Prefer choosing a provider yourself? Browse verified professionals by service and city.
                  </p>
                  <Link href="/providers/browse" className="text-emerald-700 font-semibold hover:text-emerald-800">
                    Browse pros →
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