import { MetadataRoute } from 'next'
import { categories, provinces } from '@/lib/categories'
import { providers } from '@/lib/providers'

const BASE = 'https://www.proconnectsa.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/providers/browse`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE}/services/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const providerPages: MetadataRoute.Sitemap = providers.map(p => ({
    url: `${BASE}/provider/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  const provincePages: MetadataRoute.Sitemap = provinces.map(p => ({
    url: `${BASE}/${p.slug}/local-services`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const categoryProvincePages: MetadataRoute.Sitemap = categories.flatMap(cat =>
    provinces.map(prov => ({
      url: `${BASE}/services/${cat.slug}/${prov.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }))
  )

  return [
    ...staticPages,
    ...categoryPages,
    ...providerPages,
    ...provincePages,
    ...categoryProvincePages,
  ]
}
