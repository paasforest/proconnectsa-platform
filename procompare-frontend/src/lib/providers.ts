export type Provider = {
  slug: string
  name: string
  tagline: string
  description: string
  website: string
  logoText: string
  heroImage: string
  primaryCategory: string
  categories: string[]
  areasServed: string[]
  responseTime?: string
  yearsOperating?: number
  highlights: string[]
  stats?: { value: string; label: string }[]
  pricing?: string
  disclaimer?: string
  cta: string
}

export const providers: Provider[] = [
  {
    slug: 'vula24',
    name: 'Vula24',
    tagline: '24/7 emergency locksmith services across South Africa',
    description: `Vula24 connects you with verified locksmiths in Gauteng and Western Cape, 24 hours a day. Every locksmith on the network is background-checked and rated by real customers before they join.

Whether you are locked out of your car, your house, or your office, Vula24 matches you with the nearest available professional and gets you back inside fast. Average response time is 15 minutes. No hidden fees, no surprises — just verified help when you need it most.

Built specifically for South African emergencies, with operators available even at 2am on a Sunday.`,
    website: 'https://www.vula24.co.za',
    logoText: 'V24',
    heroImage: 'https://images.unsplash.com/photo-1568633329995-e54aef85044d?w=1600&auto=format&fit=crop&q=80',
    primaryCategory: 'locksmith',
    categories: ['locksmith', 'emergency-locksmith', 'car-lockout', 'house-lockout', 'lock-repair', 'key-replacement'],
    areasServed: [
      'Johannesburg', 'Pretoria', 'Sandton', 'Midrand', 'Soweto',
      'Centurion', 'Randburg', 'Roodepoort',
      'Cape Town', 'Stellenbosch', 'Paarl', 'Bellville',
      'Somerset West', 'Franschhoek', 'Worcester', 'George',
    ],
    responseTime: '15 minutes average',
    highlights: [
      'Verified, background-checked locksmiths',
      'Average 15-minute response time',
      'Available 24 hours, 7 days a week',
      'No hidden fees — price agreed upfront',
      'Live in Gauteng and Western Cape',
    ],
    stats: [
      { value: '200+', label: 'Jobs completed' },
      { value: '15 min', label: 'Avg response' },
      { value: '4.9★', label: 'Avg rating' },
    ],
    cta: 'Visit Vula24 →',
  },
  {
    slug: 'swiftdrop',
    name: 'SwiftDrop',
    tagline: 'Send parcels with people going your way — same day delivery across SA',
    description: `SwiftDrop is a peer-to-peer parcel delivery platform connecting senders with verified drivers already travelling their route. Local and intercity delivery from R80, with parcels insured up to R2,000.

Two ways to send: post a delivery job and let drivers apply, or find a driver already travelling intercity and book a slot on their trip. Every driver is ID-verified, every handoff requires OTP and photo proof, and every parcel is tracked live.

Built for the way South Africans already move parcels — through taxi ranks and travellers — but modernised with verified drivers, secure payments, and real-time tracking.`,
    website: 'https://swiftdrop24.co.za',
    logoText: 'SD',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
    primaryCategory: 'parcel-delivery',
    categories: ['parcel-delivery', 'courier', 'same-day-delivery', 'intercity-delivery', 'document-delivery'],
    areasServed: [
      'Johannesburg', 'Pretoria', 'Polokwane', 'Durban', 'Bloemfontein',
      'Cape Town', 'Port Elizabeth', 'East London', 'George',
    ],
    responseTime: 'Same-day delivery on most routes',
    highlights: [
      'Same-day delivery across SA',
      'Verified, ID-checked drivers',
      'Parcels insured up to R2,000',
      'OTP verification at every handoff',
      'Save up to 40% vs traditional couriers',
    ],
    stats: [
      { value: 'R80+', label: 'Starting price' },
      { value: 'R2,000', label: 'Insurance cover' },
      { value: '9', label: 'Provinces covered' },
    ],
    pricing: 'Local deliveries from R80. Intercity rates vary by distance.',
    cta: 'Visit SwiftDrop →',
  },
  {
    slug: 'ndengo-construction',
    name: 'Ndengo Construction',
    tagline: 'Premium home renovations and extensions across the Western Cape',
    description: `Ndengo Construction is a premium home renovation specialist serving Western Cape homeowners for over 5 years. We handle kitchen renovations, bathroom renovations, home extensions, full home renovations, plumbing and electrical work, and outdoor builds — all in-house, with one team and one quote.

Every project starts with a free site visit. We listen to what you want, look at the space, and send you a detailed written quote within a week. No hidden costs, no surprises, no contractors disappearing mid-project.

Based in the Western Cape, serving Cape Town and the broader region. Fully insured. NHBRC registration in progress.`,
    website: 'https://ndengoconstruction.co.za',
    logoText: 'NC',
    heroImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=80',
    primaryCategory: 'home-renovation',
    categories: ['home-renovation', 'kitchen-renovation', 'bathroom-renovation', 'home-extension', 'full-renovation', 'outdoor-build', 'construction'],
    areasServed: [
      'Cape Town', 'Bellville', 'Stellenbosch', 'Paarl', 'Somerset West',
      'Newlands', 'Constantia', 'Claremont', 'Rondebosch', 'Tokai',
      'Hout Bay', 'Camps Bay', 'Sea Point', 'Green Point',
    ],
    responseTime: 'Free site visit within 1 business day',
    yearsOperating: 5,
    highlights: [
      'Premium home renovations done properly',
      'Everything in-house — one team, one quote',
      '5+ years renovating Western Cape homes',
      'Fully insured, NHBRC registration in progress',
      'Free site visits across the Western Cape',
    ],
    stats: [
      { value: '5+', label: 'Years operating' },
      { value: 'Free', label: 'Site visits' },
      { value: 'WC', label: 'Service area' },
    ],
    cta: 'Visit Ndengo Construction →',
  },
  {
    slug: 'immigrant-support-network',
    name: 'Immigrant Support Network',
    tagline: 'Connecting African talent with international employers in Europe and Canada',
    description: `Immigrant Support Network (ISN) helps African candidates pursue legal work opportunities abroad. We maintain a database of pre-screened, document-ready candidates and match them with verified international employers in Europe and Canada.

Our services cover work abroad placements, visa application assistance, and CV preparation. We work with employers across Poland, Romania, Hungary, Lithuania, Latvia, the United Kingdom, and Canada — placing candidates in roles spanning warehouse work, agriculture, manufacturing, logistics, drivers, and seasonal agricultural work.

Profile submission is free. A flat R300 registration activates matching with employers — significantly less than the thousands charged by traditional recruitment agencies. We do not guarantee job placement or visa approval; we provide recruitment and application support services.`,
    website: 'https://www.immigrantsupportnetwork.co.za',
    logoText: 'ISN',
    heroImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1600&auto=format&fit=crop&q=80',
    primaryCategory: 'immigration',
    categories: ['immigration', 'visa-services', 'work-abroad', 'overseas-jobs', 'cv-services'],
    areasServed: [
      'Nationwide South Africa',
      'Across all African countries',
      'Destinations: Poland, Romania, Hungary, Lithuania, Latvia, UK, Canada',
    ],
    responseTime: '24-hour response on applications',
    highlights: [
      'Pre-screened candidate database for international employers',
      'Visa application assistance and document preparation',
      'Work opportunities in Europe and Canada',
      'CV services tailored for international applications',
      'Flat R300 registration — no inflated agency fees',
    ],
    stats: [
      { value: '500+', label: 'Applications processed' },
      { value: '12+', label: 'African countries served' },
      { value: '7', label: 'Destination countries' },
    ],
    pricing: 'Free to submit profile. R300 flat fee to activate employer matching.',
    disclaimer: 'ISN does not guarantee job placement or visa approval. They provide recruitment and application support services.',
    cta: 'Visit Immigrant Support Network →',
  },
]

export function getProvidersByCategory(category: string): Provider[] {
  return providers.filter(p =>
    p.categories.includes(category.toLowerCase().trim())
  )
}

export function getProviderBySlug(slug: string): Provider | undefined {
  return providers.find(p => p.slug === slug)
}
