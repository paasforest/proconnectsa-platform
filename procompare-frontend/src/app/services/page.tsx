import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const categories = await fetchServiceCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Services</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a service to get free quotes from verified professionals. We’ll match you with providers in your area.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 px-8">
                <Link href="/services">Browse services</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl py-6 px-8">
                <Link href="/providers/browse">Browse pros</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Popular provinces</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {PROVINCES.slice(0, 3).map((p) => (
                  <Link
                    key={p.slug}
                    href={`/services/plumbing/${p.slug}`}
                    className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
              {PROVINCES.find((p) => p.slug === "gauteng") && (
                <div className="mb-10 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Looking for services in Gauteng?</strong> Explore our dedicated Gauteng pages:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/gauteng/local-services"
                      className="text-sm text-emerald-700 font-semibold hover:text-emerald-800 hover:underline"
                    >
                      Local Services
                    </Link>
                    <span className="text-gray-400">•</span>
                    <Link
                      href="/gauteng/get-quotes"
                      className="text-sm text-emerald-700 font-semibold hover:text-emerald-800 hover:underline"
                    >
                      Get Quotes
                    </Link>
                    <span className="text-gray-400">•</span>
                    <Link
                      href="/gauteng/find-service-providers"
                      className="text-sm text-emerald-700 font-semibold hover:text-emerald-800 hover:underline"
                    >
                      Find Providers
                    </Link>
                  </div>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Service categories</h2>
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
                    href={`/services/${c.slug}`}
                    className="rounded-2xl border bg-white p-5 hover:shadow-sm hover:border-emerald-200 transition"
                  >
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-600 mt-1">Get free quotes in your area</div>
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