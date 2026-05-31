import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, CheckCircle } from 'lucide-react'
import ProviderCard from '@/components/ui/ProviderCard'
import CategoryCard from '@/components/ui/CategoryCard'
import FaqAccordion, { FaqItem } from '@/components/ui/FaqAccordion'
import { categories, getCategoryBySlug } from '@/lib/categories'
import { getProvidersByCategory } from '@/lib/providers'

export async function generateStaticParams() {
  return categories.map(cat => ({ category: cat.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return {}
  return {
    title: `${cat.name} Services in South Africa`,
    description: `Find verified ${cat.name.toLowerCase()} providers across South Africa on ProConnectSA. ${cat.description}.`,
  }
}

const faqsByCategory: Record<string, FaqItem[]> = {
  locksmith: [
    { question: 'How quickly can a locksmith reach me?', answer: 'Vula24 averages 15 minutes in Gauteng and Western Cape. Response times vary by your exact location.' },
    { question: 'Are the locksmiths background-checked?', answer: 'Yes. Every locksmith on Vula24 is background-checked and rated by real customers before being listed.' },
    { question: 'What services does a locksmith cover?', answer: 'Car lockouts, house lockouts, office lockouts, lock repairs, key replacements, and security upgrades.' },
    { question: 'Are prices agreed upfront?', answer: 'Yes. Vula24 provides upfront pricing before any work begins — no surprise charges.' },
  ],
  'parcel-delivery': [
    { question: 'How does peer-to-peer delivery work?', answer: 'SwiftDrop connects you with verified drivers already travelling your route. You post a job, drivers apply, you choose the best fit.' },
    { question: 'What is the insurance cover?', answer: 'Every parcel on SwiftDrop is insured up to R2,000. For higher-value items, additional cover options are available.' },
    { question: 'How are drivers verified?', answer: 'Every driver is ID-verified before joining the platform. OTP and photo proof are required at both pickup and delivery.' },
    { question: 'What does delivery cost?', answer: 'Local deliveries start from R80. Intercity rates depend on distance and are agreed with the driver before booking.' },
  ],
  'home-renovation': [
    { question: 'Does Ndengo Construction operate outside the Western Cape?', answer: 'Currently they serve Cape Town and the broader Western Cape region only. Contact them directly if you are unsure.' },
    { question: 'Is the site visit really free?', answer: 'Yes. The initial site visit is completely free with no obligation. A detailed written quote follows within one week.' },
    { question: 'What types of renovation does Ndengo handle?', answer: 'Kitchen renovations, bathroom renovations, home extensions, full home renovations, outdoor builds, and associated plumbing and electrical.' },
    { question: 'How long does a typical renovation take?', answer: 'It depends on scope. A bathroom typically takes 2–3 weeks. A full home renovation can take 2–4 months. Your quote includes a timeline.' },
  ],
  immigration: [
    { question: 'Is job placement guaranteed?', answer: 'No. ISN provides recruitment and application support services. They do not guarantee job placement or visa approval.' },
    { question: 'What does the R300 registration fee cover?', answer: 'The R300 fee activates matching with verified international employers. Profile submission itself is free.' },
    { question: 'Which countries do they place candidates in?', answer: 'Poland, Romania, Hungary, Lithuania, Latvia, the United Kingdom, and Canada.' },
    { question: 'What types of roles are available?', answer: 'Warehouse work, agriculture, manufacturing, logistics, driving, and seasonal agricultural work, among others.' },
  ],
}

const defaultFaqs: FaqItem[] = [
  { question: 'When will providers be available in this category?', answer: 'We are actively onboarding verified providers. Follow us on WhatsApp to be the first to know.' },
  { question: 'How does ProConnectSA verify providers?', answer: 'We check that each provider is an established business with a working website, real contact details, and a track record.' },
  { question: 'Is ProConnectSA free to use?', answer: 'Yes. ProConnectSA is a free directory. We do not charge customers to browse or connect with providers.' },
]

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) notFound()

  const matchedProviders = getProvidersByCategory(slug)
  const isLive = cat.status === 'live'
  const faqs = faqsByCategory[slug] ?? defaultFaqs
  const related = categories.filter(c => c.slug !== slug).slice(0, 4)

  return (
    <>
      {/* Hero */}
      <div className="relative h-[300px] md:h-[400px] flex items-end overflow-hidden">
        <Image
          src={cat.bannerImage}
          alt={cat.name}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <nav className="text-white/70 text-sm mb-3">
            <a href="/" className="hover:text-white">Home</a> ›{' '}
            <a href="/services" className="hover:text-white">Services</a> ›{' '}
            <span className="text-white">{cat.name}</span>
          </nav>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-2">
            {cat.name} services in South Africa
          </h1>
          <p className="text-white/80 text-lg mb-4">{cat.description}</p>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-amber/20 text-amber border border-amber/40 px-3 py-1 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" /> Verified providers available
            </span>
          ) : (
            <span className="inline-block text-sm font-medium bg-white/10 text-white/70 border border-white/20 px-3 py-1 rounded-full">
              Coming soon
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {isLive && matchedProviders.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-teal mb-2">
                Verified {cat.name} providers
              </h2>
              <p className="text-slate">These are established specialists with a real track record.</p>
            </div>
            <div className={`mb-14 ${
                matchedProviders.length === 1
                  ? 'max-w-lg mx-auto w-full'
                  : matchedProviders.length === 2
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              }`}>
              {matchedProviders.map(p => (
                <ProviderCard key={p.slug} provider={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-cream rounded-xl border border-mist p-10 text-center max-w-xl mx-auto mb-14">
            <h2 className="font-heading font-bold text-2xl text-teal mb-3">
              Coming soon — {cat.name}
            </h2>
            <p className="text-slate mb-6">
              We are onboarding verified {cat.name.toLowerCase()} providers. Be the first to know when they go live.
            </p>
            <a
              href="https://wa.me/27774388845"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Notify me on WhatsApp
            </a>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-14 max-w-2xl">
          <h2 className="font-heading font-bold text-2xl text-teal mb-6">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} />
        </div>

        {/* Related categories */}
        <div>
          <h2 className="font-heading font-bold text-2xl text-teal mb-6">Related categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(cat => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
