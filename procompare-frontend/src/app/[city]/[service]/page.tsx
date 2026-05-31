import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProviderCard from '@/components/ui/ProviderCard'
import { categories, getCategoryBySlug } from '@/lib/categories'
import { providers } from '@/lib/providers'

const cities = [
  'cape-town', 'johannesburg', 'pretoria', 'durban', 'sandton', 'midrand',
  'stellenbosch', 'paarl', 'george', 'soweto', 'centurion', 'randburg',
  'polokwane', 'bloemfontein', 'port-elizabeth', 'east-london',
]

export async function generateStaticParams() {
  const params: { city: string; service: string }[] = []
  for (const city of cities) {
    for (const cat of categories) {
      params.push({ city, service: cat.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; service: string }> }): Promise<Metadata> {
  const { city, service } = await params
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const cat = getCategoryBySlug(service)
  const catName = cat?.name ?? service.replace(/-/g, ' ')
  return {
    title: `${catName} in ${cityName}`,
    description: `Find verified ${catName.toLowerCase()} providers in ${cityName}, South Africa on ProConnectSA.`,
  }
}

export default async function CityServicePage({ params }: { params: Promise<{ city: string; service: string }> }) {
  const { city, service } = await params
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const cat = getCategoryBySlug(service)
  const catName = cat?.name ?? service.replace(/-/g, ' ')

  const matchedProviders = providers.filter(p =>
    p.categories.includes(service) &&
    p.areasServed.some(a => a.toLowerCase().includes(cityName.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-slate text-sm mb-6">
        <Link href="/" className="hover:text-teal">Home</Link> ›{' '}
        <Link href={`/${city}/services`} className="hover:text-teal">{cityName}</Link> ›{' '}
        <span className="text-gray-900">{catName}</span>
      </nav>

      <h1 className="font-heading font-bold text-4xl md:text-5xl text-teal mb-3">
        {catName} in {cityName}
      </h1>
      <p className="text-slate text-lg mb-10 leading-relaxed">
        Verified {catName.toLowerCase()} providers serving {cityName}, South Africa.
      </p>

      {matchedProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {matchedProviders.map(p => <ProviderCard key={p.slug} provider={p} />)}
        </div>
      ) : (
        <div className="bg-cream rounded-xl border border-mist p-10 text-center max-w-xl mx-auto mb-10">
          <h2 className="font-heading font-bold text-xl text-teal mb-3">
            No providers listed yet for {catName} in {cityName}
          </h2>
          <p className="text-slate mb-6">
            We may have providers serving this area under a broader region.
          </p>
          <Link
            href={`/services/${service}`}
            className="inline-block text-sm font-medium text-amber hover:text-amber-dark transition-colors"
          >
            View all {catName} providers →
          </Link>
        </div>
      )}
    </div>
  )
}
