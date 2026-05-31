import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import CategoryCard from '@/components/ui/CategoryCard'
import ProviderCard from '@/components/ui/ProviderCard'
import ProvinceCard from '@/components/ui/ProvinceCard'
import { categories, provinces, getLiveCategories } from '@/lib/categories'
import { providers } from '@/lib/providers'

export const metadata: Metadata = {
  title: 'ProConnectSA — Find Trusted Service Providers Across South Africa',
  description:
    'Verified locksmiths, couriers, home renovation specialists, and immigration consultants. One directory, multiple specialists across South Africa.',
  openGraph: {
    title: 'ProConnectSA — Find Trusted Service Providers Across South Africa',
    description:
      'Verified locksmiths, couriers, renovation experts, and immigration consultants. One directory, multiple specialists.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Aerial view of Cape Town, South Africa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProConnectSA — Verified South African Service Providers',
    description: 'Find verified locksmiths, couriers, home renovation specialists and immigration consultants.',
    images: ['https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&auto=format&fit=crop&q=80'],
  },
}

const liveCategories = getLiveCategories()

const featuredCards = [
  {
    category: liveCategories[0],
    thumb: 'https://images.unsplash.com/photo-1633113216237-2bfe92ce4dba?w=600&auto=format&fit=crop&q=80',
    alt: 'Locksmith working on a door lock',
  },
  {
    category: liveCategories[1],
    thumb: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    alt: 'Delivery driver handing over a parcel',
  },
  {
    category: liveCategories[2],
    thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80',
    alt: 'Modern renovated kitchen',
  },
  {
    category: liveCategories[3],
    thumb: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&auto=format&fit=crop&q=80',
    alt: 'Passport and travel documents',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[55vh] max-h-[600px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&auto=format&fit=crop&q=80"
          alt="Aerial view of Cape Town, South Africa"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/60" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-white leading-tight tracking-tight max-w-3xl mb-4">
            Find trusted service providers across South Africa
          </h1>
          <p className="text-white/85 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
            Verified locksmiths, couriers, renovation experts, and immigration consultants. One directory, multiple specialists.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold px-6 py-3 rounded-md transition-colors text-base"
            >
              Browse Services <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-md transition-colors text-base"
            >
              How It Works
            </Link>
          </div>
          <p className="text-white/60 text-sm">Serving Gauteng, Western Cape and beyond</p>
        </div>
      </section>

      {/* ── FEATURED SERVICES ─────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-teal mb-2">
              Services on ProConnectSA
            </h2>
            <p className="text-slate">Verified specialists for the things you actually need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCards.map(({ category, thumb, alt }) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="group bg-white rounded-lg border border-mist overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={thumb}
                    alt={alt}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-medium text-lg text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-slate leading-snug mb-3">{category.description}</p>
                  <span className="text-sm font-medium text-amber group-hover:text-amber-dark transition-colors">
                    View providers →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PROCONNECTSA ──────────────────────────── */}
      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-teal mb-10">
            Why ProConnectSA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="h-8 w-8 text-teal" />,
                title: 'Verified specialists',
                body: 'Every provider is an established business with a track record. No random handymen — only specialists who own their category.',
              },
              {
                icon: <BookOpen className="h-8 w-8 text-teal" />,
                title: 'One destination, multiple categories',
                body: 'Need a locksmith today and an immigration consultant next month? ProConnectSA is your one trusted starting point.',
              },
              {
                icon: <Shield className="h-8 w-8 text-teal" />,
                title: 'Honest referrals',
                body: 'No quote forms, no upsells, no spam. We connect you directly to the specialist\'s own website.',
              },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-teal-light rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL CATEGORIES ────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-teal mb-2">
              All service categories
            </h2>
            <p className="text-slate">Live now and coming soon.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map(cat => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE ──────────────────────────────────── */}
      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-teal mb-2">
              Coverage across South Africa
            </h2>
            <p className="text-slate">Verified providers across the country.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {provinces.map(p => (
              <ProvinceCard key={p.slug} name={p.name} slug={p.slug} liveCategories={p.liveCategories} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="bg-teal py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">
            Need to find a specialist?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Start with the right category. We will route you to a verified provider.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold px-8 py-4 rounded-md transition-colors text-base"
          >
            Browse all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
