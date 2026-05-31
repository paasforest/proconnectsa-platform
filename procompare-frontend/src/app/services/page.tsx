import type { Metadata } from 'next'
import Image from 'next/image'
import CategoryCard from '@/components/ui/CategoryCard'
import { categories } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'All Service Categories',
  description:
    'Browse all service categories on ProConnectSA — verified locksmiths, couriers, home renovation, immigration services, and more across South Africa.',
}

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[240px] md:h-[300px] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&auto=format&fit=crop&q=80"
          alt="South African service providers"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="text-white/70 text-sm mb-3">
            <a href="/" className="hover:text-white">Home</a> › <span className="text-white">Services</span>
          </nav>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white">All service categories</h1>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-slate leading-relaxed mb-10 max-w-2xl">
          ProConnectSA is a directory of verified service providers across South Africa. Below are all categories we cover — some live with verified providers, others coming soon as we onboard new specialists.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map(cat => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>
    </>
  )
}
