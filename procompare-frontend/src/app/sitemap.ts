import type { MetadataRoute } from "next"
import { fetchServiceCategories } from "@/lib/service-categories"
import { PROVINCES } from "@/lib/seo-locations"
import { MAJOR_CITIES } from "@/lib/seo-cities"

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
    { url: `${baseUrl}/resources`, lastModified: new Date() },
    { url: `${baseUrl}/press`, lastModified: new Date() },
    // Gauteng province pages
    { url: `${baseUrl}/gauteng/local-services`, lastModified: new Date() },
    { url: `${baseUrl}/gauteng/get-quotes`, lastModified: new Date() },
    { url: `${baseUrl}/gauteng/find-service-providers`, lastModified: new Date() },
  ]

  const cats = (categories.length ? categories : [
    { id: 0, slug: "plumbing", name: "Plumbing" },
    { id: 0, slug: "electrical", name: "Electrical" },
    { id: 0, slug: "cleaning", name: "Cleaning" },
    { id: 0, slug: "painting", name: "Painting" },
    { id: 0, slug: "handyman", name: "Handyman" },
    { id: 0, slug: "hvac", name: "HVAC" },
    { id: 0, slug: "landscaping", name: "Landscaping" },
    { id: 0, slug: "solar-installation", name: "Solar Installation" },
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

  // City hub pages - all services in each city
  const cityHubUrls: MetadataRoute.Sitemap = MAJOR_CITIES.map((city) => ({
    url: `${baseUrl}/${city.slug}/services`,
    lastModified: new Date(),
  }))

  // City + Service pages - prioritize top services and major cities
  const topServices = ["plumbing", "electrical", "cleaning", "painting", "handyman", "hvac", "landscaping", "solar-installation", "security", "alarm-systems", "carpentry"]
  const cityServiceUrls: MetadataRoute.Sitemap = []
  for (const city of MAJOR_CITIES) {
    for (const service of topServices) {
      cityServiceUrls.push({
        url: `${baseUrl}/${city.slug}/${service}`,
        lastModified: new Date(),
      })
    }
  }

  // Resource guides and cost guides (30 total)
  const resourceUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/resources/how-to-choose-a-plumber`, lastModified: new Date() },
    { url: `${baseUrl}/resources/plumber-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/plumber-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/electrician-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/electrician-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/solar-installation-cost-south-africa`, lastModified: new Date() },
    { url: `${baseUrl}/resources/cleaning-service-costs`, lastModified: new Date() },
    { url: `${baseUrl}/resources/painting-costs`, lastModified: new Date() },
    { url: `${baseUrl}/resources/handyman-costs`, lastModified: new Date() },
    { url: `${baseUrl}/resources/painting-cost-durban`, lastModified: new Date() },
    { url: `${baseUrl}/resources/painting-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/painting-cost-pretoria`, lastModified: new Date() },
    { url: `${baseUrl}/resources/renovation-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/renovation-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/renovation-cost-durban`, lastModified: new Date() },
    { url: `${baseUrl}/resources/cleaning-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/cleaning-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/handyman-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/handyman-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/hvac-cost-south-africa`, lastModified: new Date() },
    { url: `${baseUrl}/resources/hvac-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/hvac-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/landscaping-cost-south-africa`, lastModified: new Date() },
    { url: `${baseUrl}/resources/landscaping-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/landscaping-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/roofing-cost-south-africa`, lastModified: new Date() },
    { url: `${baseUrl}/resources/roofing-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/roofing-cost-johannesburg`, lastModified: new Date() },
    { url: `${baseUrl}/resources/flooring-cost-south-africa`, lastModified: new Date() },
    { url: `${baseUrl}/resources/flooring-cost-cape-town`, lastModified: new Date() },
    { url: `${baseUrl}/resources/flooring-cost-johannesburg`, lastModified: new Date() },
  ]

  return [...core, ...categoryUrls, ...provinceUrls, ...cityHubUrls, ...cityServiceUrls, ...resourceUrls]
}
