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
              <nav className="text-sm text-gray-600 mb-4 flex items-center flex-wrap gap-1">
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
                <span className="mx-1">/</span>
                <Link href="/services" className="hover:text-gray-900">
                  Services
                </Link>{" "}
                <span className="mx-1">/</span>
                <span className="text-gray-900 font-medium">{displayName}</span>
              </nav>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get free quotes for {displayName}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Tell us what you need and we'll connect you with verified professionals in your area. Find {displayName.toLowerCase()} in <Link href={`/johannesburg/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Johannesburg</Link>, <Link href={`/cape-town/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Cape Town</Link>, <Link href={`/durban/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Durban</Link>, <Link href={`/pretoria/${category}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Pretoria</Link>, or browse by province: <Link href={`/services/${category}/gauteng`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Gauteng</Link>, <Link href={`/services/${category}/western-cape`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">Western Cape</Link>, <Link href={`/services/${category}/kwazulu-natal`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium">KwaZulu-Natal</Link>. No obligation.
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
                <BarkLeadForm preselectedCategory={category} />
              </div>
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Find {displayName} in Your Province</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse verified {displayName.toLowerCase()} professionals by province. Find local providers near you.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PROVINCES.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/services/${category}/${p.slug}`}
                        className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 font-medium"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Popular Cities for {displayName}</p>
                    <p className="text-gray-600 text-xs mb-3">
                      Find {displayName.toLowerCase()} in major cities across South Africa:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Johannesburg", "Cape Town", "Durban", "Pretoria", "Sandton", "Centurion", "Midrand", "Stellenbosch", "Umhlanga", "Bellville"].map((city) => {
                        const citySlug = city.toLowerCase().replace(/\s+/g, "-")
                        return (
                          <Link
                            key={city}
                            href={`/${citySlug}/${category}`}
                            className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            {city}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Why Choose ProConnectSA?</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Verified professionals:</strong> All providers are background checked</li>
                    <li>• <strong>Compare quotes:</strong> Get multiple quotes to find the best price</li>
                    <li>• <strong>Local & trusted:</strong> Connect with professionals in your area</li>
                    <li>• <strong>No obligation:</strong> Free to request quotes, no commitment to hire</li>
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

