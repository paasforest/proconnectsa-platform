import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const name = c?.name || category
  return {
    title: `${name} Quotes Near You | ProConnectSA`,
    description: `Compare free quotes from verified ${name.toLowerCase()} professionals near you. Fast matching and no obligation.`,
  }
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  if (!c && categories.length) return notFound()

  const displayName = c?.name || category

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/services" className="hover:text-gray-900">
                  Services
                </Link>{" "}
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{displayName}</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get free quotes for {displayName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Tell us what you need and we’ll connect you with verified professionals in your area. No obligation.
              </p>
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
                  <div className="text-lg font-semibold text-gray-900 mb-2">Choose your province</div>
                  <p className="text-gray-600 text-sm mb-4">
                    For SEO and faster matching, start with your province page.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROVINCES.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/services/${category}/${p.slug}`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Why ProConnectSA?</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Verified professionals</li>
                    <li>• Clear intent & timeline (Bark‑style)</li>
                    <li>• Secure and private</li>
                  </ul>
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

