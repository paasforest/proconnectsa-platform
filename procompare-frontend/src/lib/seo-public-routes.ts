/**
 * Single source of truth for “is this public SEO URL valid?” so `generateMetadata`
 * and the page component cannot disagree (which caused soft-404 / wrong index signals).
 */
import { notFound } from "next/navigation"
import { getCityBySlug, type City } from "@/lib/seo-cities"
import { getProvinceBySlug } from "@/lib/seo-locations"
import {
  getServiceCategoriesCached,
  type ServiceCategory,
} from "@/lib/service-categories"

export function requireCitySlug(slug: string): City {
  const city = getCityBySlug(slug)
  if (!city) notFound()
  return city
}

export type ResolvedServiceCategory = {
  categories: ServiceCategory[]
  category: ServiceCategory | null
}

export async function requireServiceCategorySlug(
  slug: string
): Promise<ResolvedServiceCategory> {
  const categories = await getServiceCategoriesCached()
  const category = categories.find((c) => c.slug === slug) ?? null
  if (!category && categories.length > 0) notFound()
  return { categories, category }
}

export async function requireServiceProvinceSlugs(
  categorySlug: string,
  provinceSlug: string
) {
  const resolved = await requireServiceCategorySlug(categorySlug)
  const province = getProvinceBySlug(provinceSlug)
  if (!province) notFound()
  return { ...resolved, province }
}
