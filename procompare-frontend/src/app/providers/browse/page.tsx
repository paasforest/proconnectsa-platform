import type { Metadata } from 'next'
import Image from 'next/image'
import ProviderCard from '@/components/ui/ProviderCard'
import { providers } from '@/lib/providers'

export const metadata: Metadata = {
  title: 'Browse All Verified Providers',
  description: 'All verified service providers on ProConnectSA — locksmiths, couriers, home renovation specialists, and immigration consultants across South Africa.',
}

export default function BrowseProvidersPage() {
  return (
    <>
      <div className="relative h-[240px] md:h-[300px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&auto=format&fit=crop&q=80"
          alt="Verified service providers"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/65" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <nav className="text-white/70 text-sm mb-3">
            <a href="/" className="hover:text-white">Home</a> › <span className="text-white">Browse Providers</span>
          </nav>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white">All verified providers</h1>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-slate leading-relaxed mb-10 max-w-2xl">
          Every provider listed here is an established business with a real track record. Click through to read their full profile and visit their website directly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(p => (
            <ProviderCard key={p.slug} provider={p} />
          ))}
        </div>
      </section>
    </>
  )
}
