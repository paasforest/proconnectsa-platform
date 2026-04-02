import type { MetadataRoute } from "next"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"
import { MAJOR_CITIES } from "@/lib/seo-cities"
import { resourceGuides } from "@/lib/resourceGuides"

const BASE_URL = "https://www.proconnectsa.co.za"

/** Legacy resource URLs that canonical to a newer primary guide — omit from sitemap to consolidate signals. */
const RESOURCE_SLUGS_EXCLUDED_FROM_SITEMAP = new Set(["cleaning-service-costs", "painting-costs"])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchServiceCategories()

  const cats =
    categories.length > 0
      ? categories
      : [
          { id: 0, slug: "plumbing", name: "Plumbing" },
          { id: 0, slug: "electrical", name: "Electrical" },
          { id: 0, slug: "cleaning", name: "Cleaning" },
          { id: 0, slug: "painting", name: "Painting" },
          { id: 0, slug: "handyman", name: "Handyman" },
          { id: 0, slug: "hvac", name: "HVAC" },
          { id: 0, slug: "landscaping", name: "Landscaping" },
          { id: 0, slug: "solar-installation", name: "Solar Installation" },
        ]

  const categorySlugs = cats.map((c) => c.slug)

  const core: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/providers/browse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/providers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/for-pros`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/press`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/immigration`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/gauteng/local-services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE_URL}/gauteng/get-quotes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE_URL}/gauteng/find-service-providers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.45 },
  ]

  const categoryUrls: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const provinceUrls: MetadataRoute.Sitemap = []
  for (const slug of categorySlugs) {
    for (const p of PROVINCES) {
      provinceUrls.push({
        url: `${BASE_URL}/services/${slug}/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.45,
      })
    }
  }

  const cityHubUrls: MetadataRoute.Sitemap = MAJOR_CITIES.map((city) => ({
    url: `${BASE_URL}/${city.slug}/services`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const cityServiceUrls: MetadataRoute.Sitemap = []
  for (const city of MAJOR_CITIES) {
    for (const service of categorySlugs) {
      cityServiceUrls.push({
        url: `${BASE_URL}/${city.slug}/${service}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  const resourceUrls: MetadataRoute.Sitemap = resourceGuides
    .filter((g) => !RESOURCE_SLUGS_EXCLUDED_FROM_SITEMAP.has(g.slug))
    .map((g) => ({
      url: `${BASE_URL}/resources/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }))

  return [...core, ...categoryUrls, ...provinceUrls, ...cityHubUrls, ...cityServiceUrls, ...resourceUrls]
}
