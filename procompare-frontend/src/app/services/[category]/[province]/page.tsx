import type { Metadata } from 'next'
import Link from 'next/link'
import ProviderCard from '@/components/ui/ProviderCard'
import { categories, getCategoryBySlug, provinces } from '@/lib/categories'
import { providers } from '@/lib/providers'

export async function generateStaticParams() {
  const params: { category: string; province: string }[] = []
  for (const cat of categories) {
    for (const prov of provinces) {
      params.push({ category: cat.slug, province: prov.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; province: string }> }): Promise<Metadata> {
  const { category, province } = await params
  const cat = getCategoryBySlug(category)
  const prov = provinces.find(p => p.slug === province)
  const catName = cat?.name ?? category.replace(/-/g, ' ')
  const provName = prov?.name ?? province.replace(/-/g, ' ')
  return {
    title: `${catName} in ${provName}`,
    description: `Find verified ${catName.toLowerCase()} providers in ${provName}, South Africa on ProConnectSA.`,
  }
}

export default async function CategoryProvincePage({ params }: { params: Promise<{ category: string; province: string }> }) {
  const { category, province } = await params
  const cat = getCategoryBySlug(category)
  const prov = provinces.find(p => p.slug === province)
  const catName = cat?.name ?? category.replace(/-/g, ' ')
  const provName = prov?.name ?? province.replace(/-/g, ' ')

  const matched = providers.filter(p =>
    p.categories.includes(category) &&
    p.areasServed.some(a => a.toLowerCase().includes(provName.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-slate text-sm mb-6">
        <Link href="/" className="hover:text-teal">Home</Link> ›{' '}
        <Link href="/services" className="hover:text-teal">Services</Link> ›{' '}
        <Link href={`/services/${category}`} className="hover:text-teal">{catName}</Link> ›{' '}
        <span className="text-gray-900">{provName}</span>
      </nav>

      <h1 className="font-heading font-bold text-4xl md:text-5xl text-teal mb-3">
        {catName} in {provName}
      </h1>
      <p className="text-slate text-lg mb-10">
        Verified {catName.toLowerCase()} providers serving {provName}.
      </p>

      {matched.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matched.map(p => <ProviderCard key={p.slug} provider={p} />)}
        </div>
      ) : (
        <div className="bg-cream rounded-xl border border-mist p-10 text-center max-w-xl mx-auto">
          <h2 className="font-heading font-bold text-xl text-teal mb-3">
            No providers listed yet for {catName} in {provName}
          </h2>
          <p className="text-slate mb-6">Check back soon, or view all providers in this category.</p>
          <Link
            href={`/services/${category}`}
            className="text-sm font-medium text-amber hover:text-amber-dark transition-colors"
          >
            View all {catName} providers →
          </Link>
        </div>
      )}
    </div>
  )
}
