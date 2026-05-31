import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Clock, MapPin, Tag } from 'lucide-react'
import ExternalCtaButton from '@/components/ui/ExternalCtaButton'
import { providers, getProviderBySlug } from '@/lib/providers'

export async function generateStaticParams() {
  return providers.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) return {}
  return {
    title: `${provider.name} — ${provider.tagline}`,
    description: provider.description.split('\n')[0],
    openGraph: {
      title: `${provider.name} | ProConnectSA`,
      description: provider.tagline,
      images: [{ url: provider.heroImage, width: 1600, height: 800, alt: provider.name }],
    },
  }
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) notFound()

  const descParagraphs = provider.description.trim().split('\n\n').filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    description: provider.description.split('\n')[0],
    url: provider.website,
    areaServed: provider.areasServed,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="relative h-[340px] md:h-[460px] flex items-end overflow-hidden">
        <Image
          src={provider.heroImage}
          alt={provider.name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/55" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <nav className="text-white/70 text-sm mb-3">
            <a href="/" className="hover:text-white">Home</a> ›{' '}
            <a href="/providers/browse" className="hover:text-white">Providers</a> ›{' '}
            <span className="text-white">{provider.name}</span>
          </nav>
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-white mb-2">{provider.name}</h1>
          <p className="text-white/85 text-xl mb-4">{provider.tagline}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-amber text-white px-3 py-1 rounded-full">
            <CheckCircle className="h-3.5 w-3.5" /> Verified Provider
          </span>
        </div>
      </div>

      {/* Stats strip */}
      {provider.stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-mist shadow-sm -mt-8 relative z-20 p-6 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center divide-x divide-mist">
              {provider.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center px-8 py-2">
                  <span className="font-heading font-bold text-3xl text-amber">{stat.value}</span>
                  <span className="text-xs text-slate mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — description */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-heading font-bold text-2xl text-teal mb-4">About {provider.name}</h2>
              <div className="space-y-4">
                {descParagraphs.map((para, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl text-teal mb-4">
                What {provider.name} offers
              </h2>
              <ul className="space-y-2">
                {provider.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {provider.pricing && (
              <div className="border-l-4 border-teal bg-cream rounded-r-lg p-5">
                <h3 className="font-heading font-semibold text-teal mb-2">Pricing</h3>
                <p className="text-gray-700 text-sm">{provider.pricing}</p>
              </div>
            )}

            {provider.disclaimer && (
              <div className="bg-mist/50 rounded-lg p-4">
                <p className="text-slate text-sm">{provider.disclaimer}</p>
              </div>
            )}

            {/* Areas — full list */}
            <div>
              <h2 className="font-heading font-bold text-2xl text-teal mb-4">All areas covered</h2>
              <div className="flex flex-wrap gap-2">
                {provider.areasServed.map(area => (
                  <span key={area} className="text-sm text-teal bg-cream border border-teal/20 px-3 py-1 rounded-md">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — sticky CTA card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-xl border border-mist p-6 space-y-5">
              <ExternalCtaButton href={provider.website} label={provider.cta} size="large" />

              <div className="border-t border-mist pt-5 space-y-4">
                {provider.responseTime && (
                  <div>
                    <div className="flex items-center gap-2 text-teal text-xs font-semibold uppercase tracking-wider mb-1">
                      <Clock className="h-3.5 w-3.5" /> Response time
                    </div>
                    <p className="text-gray-900 text-sm">{provider.responseTime}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-teal text-xs font-semibold uppercase tracking-wider mb-1">
                    <MapPin className="h-3.5 w-3.5" /> Areas served
                  </div>
                  <p className="text-gray-700 text-sm">
                    {provider.areasServed.slice(0, 4).join(', ')}
                    {provider.areasServed.length > 4 && ` and ${provider.areasServed.length - 4} more`}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-teal text-xs font-semibold uppercase tracking-wider mb-2">
                    <Tag className="h-3.5 w-3.5" /> Services
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.categories.slice(0, 5).map(c => (
                      <span key={c} className="text-xs bg-teal-light text-teal-dark px-2 py-0.5 rounded-md capitalize">
                        {c.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="bg-teal py-14 mt-4">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-3">
            Ready to get help from {provider.name}?
          </h2>
          <p className="text-white/80 mb-8">
            Visit their website to request a quote, book a service, or get in touch directly.
          </p>
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-bold px-8 py-4 rounded-md transition-colors text-lg"
          >
            {provider.cta}
          </a>
          <p className="text-white/50 text-xs mt-2">Opens in a new tab</p>
        </div>
      </section>
    </>
  )
}
