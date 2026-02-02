import type { MetadataRoute } from "next"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.proconnectsa.co.za"
  const categories = await fetchServiceCategories()

  const core: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date() },
    { url: `${baseUrl}/providers/browse`, lastModified: new Date() },
    { url: `${baseUrl}/for-pros`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
  ]

  const cats = (categories.length ? categories : [
    { id: 0, slug: "plumbing", name: "Plumbing" },
    { id: 0, slug: "electrical", name: "Electrical" },
    { id: 0, slug: "cleaning", name: "Cleaning" },
    { id: 0, slug: "painting", name: "Painting" },
    { id: 0, slug: "handyman", name: "Handyman" },
  ])

  const categoryUrls: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${baseUrl}/services/${c.slug}`,
    lastModified: new Date(),
  }))

  const provinceUrls: MetadataRoute.Sitemap = []
  for (const c of cats) {
    for (const p of PROVINCES) {
      provinceUrls.push({
        url: `${baseUrl}/services/${c.slug}/${p.slug}`,
        lastModified: new Date(),
      })
    }
  }

  return [...core, ...categoryUrls, ...provinceUrls]
}
