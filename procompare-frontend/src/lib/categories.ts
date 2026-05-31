export type Category = {
  slug: string
  name: string
  description: string
  icon: string
  bannerImage: string
  status: 'live' | 'coming-soon'
}

export const categories: Category[] = [
  { slug: 'locksmith', name: 'Locksmith', description: '24/7 emergency lockout and key services', icon: 'KeyRound', bannerImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop&q=80', status: 'live' },
  { slug: 'parcel-delivery', name: 'Parcel Delivery', description: 'Same-day local and intercity parcel delivery', icon: 'Package', bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80', status: 'live' },
  { slug: 'home-renovation', name: 'Home Renovation', description: 'Kitchens, bathrooms, extensions and full renovations', icon: 'Hammer', bannerImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80', status: 'live' },
  { slug: 'immigration', name: 'Immigration & Visa', description: 'Work abroad placements and visa assistance', icon: 'Plane', bannerImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop&q=80', status: 'live' },
  { slug: 'plumbing', name: 'Plumbing', description: 'Burst pipes, geysers, repairs and installations', icon: 'Droplet', bannerImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'electrical', name: 'Electrical', description: 'Wiring, DB boards, compliance certificates', icon: 'Zap', bannerImage: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'cleaning', name: 'Cleaning Services', description: 'Home and office cleaning', icon: 'Sparkles', bannerImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'painting', name: 'Painting', description: 'Interior and exterior painting', icon: 'Paintbrush', bannerImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'handyman', name: 'Handyman', description: 'General repairs and odd jobs', icon: 'Wrench', bannerImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'hvac', name: 'HVAC', description: 'Air conditioning and ventilation', icon: 'Wind', bannerImage: 'https://images.unsplash.com/photo-1631545806842-2e95a9aa1f50?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'landscaping', name: 'Landscaping', description: 'Gardens, lawn care, irrigation', icon: 'Trees', bannerImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
  { slug: 'carpentry', name: 'Carpentry', description: 'Built-ins, doors, custom woodwork', icon: 'Hammer', bannerImage: 'https://images.unsplash.com/photo-1572297870735-3aaa3e6b8e84?w=1600&auto=format&fit=crop&q=80', status: 'coming-soon' },
]

export const provinces = [
  { name: 'Gauteng', slug: 'gauteng', liveCategories: 4 },
  { name: 'Western Cape', slug: 'western-cape', liveCategories: 4 },
  { name: 'KwaZulu-Natal', slug: 'kwazulu-natal', liveCategories: 2 },
  { name: 'Eastern Cape', slug: 'eastern-cape', liveCategories: 2 },
  { name: 'Limpopo', slug: 'limpopo', liveCategories: 1 },
  { name: 'Mpumalanga', slug: 'mpumalanga', liveCategories: 1 },
  { name: 'North West', slug: 'north-west', liveCategories: 1 },
  { name: 'Free State', slug: 'free-state', liveCategories: 1 },
  { name: 'Northern Cape', slug: 'northern-cape', liveCategories: 1 },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug)
}

export function getLiveCategories() {
  return categories.filter(c => c.status === 'live')
}
