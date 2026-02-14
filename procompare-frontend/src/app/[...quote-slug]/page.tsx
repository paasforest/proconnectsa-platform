import { redirect } from "next/navigation"
import { MAJOR_CITIES } from "@/lib/seo-cities"
import { fetchServiceCategories } from "@/lib/service-categories"

export const dynamic = "force-dynamic"

// Service name variations to slug mappings
const SERVICE_NAME_TO_SLUG: Record<string, string> = {
  "plumber": "plumbing",
  "plumbers": "plumbing",
  "electrician": "electrical",
  "electricians": "electrical",
  "cleaner": "cleaning",
  "cleaning": "cleaning",
  "painter": "painting",
  "painters": "painting",
  "handyman": "handyman",
  "hvac": "hvac",
  "landscaper": "landscaping",
  "landscaping": "landscaping",
  "solar": "solar-installation",
  "solar-installer": "solar-installation",
  "solar-installation": "solar-installation",
  "roofer": "roofing",
  "roofing": "roofing",
  "carpenter": "carpentry",
  "carpentry": "carpentry",
  "alarm": "alarm-systems",
  "alarms": "alarm-systems",
  "alarm-systems": "alarm-systems",
  "security": "security",
  "security-systems": "security",
}

// City name variations to slug mappings
const CITY_NAME_TO_SLUG: Record<string, string> = {
  "cape-town": "cape-town",
  "capetown": "cape-town",
  "johannesburg": "johannesburg",
  "jhb": "johannesburg",
  "pretoria": "pretoria",
  "durban": "durban",
  "sandton": "sandton",
  "centurion": "centurion",
  "midrand": "midrand",
  "randburg": "randburg",
  "stellenbosch": "stellenbosch",
  "bellville": "bellville",
  "paarl": "paarl",
  "somerset-west": "somerset-west",
  "somersetwest": "somerset-west",
  "george": "george",
  "umhlanga": "umhlanga",
  "pinetown": "pinetown",
  "pietermaritzburg": "pietermaritzburg",
  "gqeberha": "gqeberha",
  "port-elizabeth": "gqeberha",
  "portelizabeth": "gqeberha",
  "east-london": "east-london",
  "eastlondon": "east-london",
  "bloemfontein": "bloemfontein",
  "nelspruit": "nelspruit",
  "polokwane": "polokwane",
  "rustenburg": "rustenburg",
  "kimberley": "kimberley",
}

type Props = {
  params: Promise<{ quoteSlug: string[] }>
}

export default async function QuoteSlugRedirect({ params }: Props) {
  const { quoteSlug } = await params
  
  if (!quoteSlug || quoteSlug.length === 0) {
    redirect("/")
  }

  // Join all segments
  const fullSlug = quoteSlug.join("-")
  
  // Only process URLs ending with "-quotes"
  if (!fullSlug.endsWith("-quotes")) {
    redirect("/")
  }

  // Remove "-quotes" suffix
  const slugWithoutQuotes = fullSlug.replace(/-quotes$/, "")

  // Try to parse: service-city patterns
  // Most common: plumber-cape-town, electrician-johannesburg, solar-installer-pretoria
  const parts = slugWithoutQuotes.split("-")
  
  if (parts.length < 2) {
    redirect("/")
  }

  // Try to find city and service
  let citySlug: string | null = null
  let serviceSlug: string | null = null

  // Strategy 1: Check if any part matches a known city
  for (const part of parts) {
    if (CITY_NAME_TO_SLUG[part]) {
      citySlug = CITY_NAME_TO_SLUG[part]
      break
    }
  }

  // Strategy 2: Check multi-word cities (cape-town, somerset-west, etc.)
  for (let i = 0; i < parts.length - 1; i++) {
    const twoWord = `${parts[i]}-${parts[i + 1]}`
    if (CITY_NAME_TO_SLUG[twoWord]) {
      citySlug = CITY_NAME_TO_SLUG[twoWord]
      break
    }
  }

  // Strategy 3: Check if city exists in MAJOR_CITIES
  if (!citySlug) {
    for (const city of MAJOR_CITIES) {
      const citySlugParts = city.slug.split("-")
      // Check if city slug parts match consecutive parts in the URL
      for (let i = 0; i <= parts.length - citySlugParts.length; i++) {
        const match = citySlugParts.every((part, idx) => parts[i + idx] === part)
        if (match) {
          citySlug = city.slug
          break
        }
      }
      if (citySlug) break
    }
  }

  // Find service - check all parts that aren't the city
  if (citySlug) {
    const cityParts = citySlug.split("-")
    const remainingParts = parts.filter((part, idx) => {
      // Remove city parts
      return !cityParts.includes(part)
    })

    // Try to match service from remaining parts
    const serviceCandidate = remainingParts.join("-")
    if (SERVICE_NAME_TO_SLUG[serviceCandidate]) {
      serviceSlug = SERVICE_NAME_TO_SLUG[serviceCandidate]
    } else {
      // Try individual parts
      for (const part of remainingParts) {
        if (SERVICE_NAME_TO_SLUG[part]) {
          serviceSlug = SERVICE_NAME_TO_SLUG[part]
          break
        }
      }
    }
  } else {
    // No city found, try to find service from first part
    const firstPart = parts[0]
    if (SERVICE_NAME_TO_SLUG[firstPart]) {
      serviceSlug = SERVICE_NAME_TO_SLUG[firstPart]
    }
  }

  // If we have both, redirect to canonical URL
  if (citySlug && serviceSlug) {
    redirect(`/${citySlug}/${serviceSlug}`)
  }

  // If we only have service, redirect to services page
  if (serviceSlug) {
    redirect(`/services/${serviceSlug}`)
  }

  // Fallback to homepage
  redirect("/")
}
