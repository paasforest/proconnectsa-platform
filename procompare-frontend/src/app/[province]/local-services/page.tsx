import type { Metadata } from 'next'
import Link from 'next/link'
import ProviderCard from '@/components/ui/ProviderCard'
import CategoryCard from '@/components/ui/CategoryCard'
import { provinces, categories } from '@/lib/categories'
import { providers } from '@/lib/providers'

export async function generateStaticParams() {
  return provinces.map(p => ({ province: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
  const { province } = await params
  const info = provinces.find(p => p.slug === province)
  const name = info?.name ?? province.replace(/-/g, ' ')
  return {
    title: `Local Services in ${name}`,
    description: `Find verified service providers in ${name}, South Africa. ProConnectSA connects you with established specialists.`,
  }
}

export default async function ProvinceServicesPage({ params }: { params: Promise<{ province: string }> }) {
  const { province } = await params
  const info = provinces.find(p => p.slug === province)
  const provinceName = info?.name ?? province.replace(/-/g, ' ')

  const provinceProviders = providers.filter(p =>
    p.areasServed.some(a => a.toLowerCase().includes(provinceName.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-slate text-sm mb-6">
        <Link href="/" className="hover:text-teal">Home</Link> ›{' '}
        <Link href="/services" className="hover:text-teal">Services</Link> ›{' '}
        <span className="text-gray-900">{provinceName}</span>
      </nav>

      <h1 className="font-heading font-bold text-4xl md:text-5xl text-teal mb-3">
        Local services in {provinceName}
      </h1>
      <p className="text-slate text-lg mb-10 leading-relaxed">
        Verified service providers operating in {provinceName}, South Africa.
      </p>

      {provinceProviders.length > 0 && (
        <div className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-teal mb-6">
            Providers in {provinceName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {provinceProviders.map(p => <ProviderCard key={p.slug} provider={p} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading font-bold text-2xl text-teal mb-6">All service categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map(cat => <CategoryCard key={cat.slug} category={cat} />)}
        </div>
      </div>
    </div>
  )
}
