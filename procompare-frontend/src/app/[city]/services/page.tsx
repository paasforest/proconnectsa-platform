import type { Metadata } from 'next'
import Link from 'next/link'
import CategoryCard from '@/components/ui/CategoryCard'
import ProviderCard from '@/components/ui/ProviderCard'
import { categories, getLiveCategories } from '@/lib/categories'
import { providers } from '@/lib/providers'

const cityMap: Record<string, { name: string; province: string }> = {
  'cape-town': { name: 'Cape Town', province: 'Western Cape' },
  'johannesburg': { name: 'Johannesburg', province: 'Gauteng' },
  'pretoria': { name: 'Pretoria', province: 'Gauteng' },
  'durban': { name: 'Durban', province: 'KwaZulu-Natal' },
  'sandton': { name: 'Sandton', province: 'Gauteng' },
  'midrand': { name: 'Midrand', province: 'Gauteng' },
  'stellenbosch': { name: 'Stellenbosch', province: 'Western Cape' },
  'paarl': { name: 'Paarl', province: 'Western Cape' },
  'george': { name: 'George', province: 'Western Cape' },
  'soweto': { name: 'Soweto', province: 'Gauteng' },
  'centurion': { name: 'Centurion', province: 'Gauteng' },
  'randburg': { name: 'Randburg', province: 'Gauteng' },
  'polokwane': { name: 'Polokwane', province: 'Limpopo' },
  'bloemfontein': { name: 'Bloemfontein', province: 'Free State' },
  'port-elizabeth': { name: 'Port Elizabeth', province: 'Eastern Cape' },
  'east-london': { name: 'East London', province: 'Eastern Cape' },
  'gauteng': { name: 'Gauteng', province: 'Gauteng' },
  'western-cape': { name: 'Western Cape', province: 'Western Cape' },
  'kwazulu-natal': { name: 'KwaZulu-Natal', province: 'KwaZulu-Natal' },
  'eastern-cape': { name: 'Eastern Cape', province: 'Eastern Cape' },
  'limpopo': { name: 'Limpopo', province: 'Limpopo' },
  'mpumalanga': { name: 'Mpumalanga', province: 'Mpumalanga' },
  'north-west': { name: 'North West', province: 'North West' },
  'free-state': { name: 'Free State', province: 'Free State' },
  'northern-cape': { name: 'Northern Cape', province: 'Northern Cape' },
}

export async function generateStaticParams() {
  return Object.keys(cityMap).map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const info = cityMap[city]
  const cityName = info?.name ?? city.replace(/-/g, ' ')
  return {
    title: `Services in ${cityName}`,
    description: `Find verified service providers in ${cityName}, South Africa. Locksmiths, couriers, home renovation, and more on ProConnectSA.`,
  }
}

export default async function CityServicesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const info = cityMap[city]
  const cityName = info?.name ?? city.replace(/-/g, ' ')

  const cityProviders = providers.filter(p =>
    p.areasServed.some(a => a.toLowerCase().includes(cityName.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-slate text-sm mb-6">
        <Link href="/" className="hover:text-teal">Home</Link> ›{' '}
        <span className="text-gray-900">{cityName}</span>
      </nav>

      <h1 className="font-heading font-bold text-4xl md:text-5xl text-teal mb-3">
        Services in {cityName}
      </h1>
      <p className="text-slate text-lg mb-10 leading-relaxed">
        Find verified service providers serving {cityName}{info?.province ? `, ${info.province}` : ''}.
      </p>

      {cityProviders.length > 0 && (
        <div className="mb-14">
          <h2 className="font-heading font-bold text-2xl text-teal mb-6">
            Providers serving {cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityProviders.map(p => <ProviderCard key={p.slug} provider={p} />)}
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
