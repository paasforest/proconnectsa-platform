export type CitySlug = 
  | "johannesburg"
  | "pretoria"
  | "cape-town"
  | "durban"
  | "sandton"
  | "centurion"
  | "midrand"
  | "randburg"
  | "stellenbosch"
  | "bellville"
  | "paarl"
  | "somerset-west"
  | "george"
  | "umhlanga"
  | "pinetown"
  | "pietermaritzburg"
  | "gqeberha"
  | "east-london"
  | "bloemfontein"
  | "nelspruit"
  | "polokwane"
  | "rustenburg"
  | "kimberley"

export interface City {
  slug: CitySlug
  name: string
  provinceSlug: string
  provinceName: string
  description?: string
}

export const MAJOR_CITIES: City[] = [
  // Gauteng
  { slug: "johannesburg", name: "Johannesburg", provinceSlug: "gauteng", provinceName: "Gauteng", description: "South Africa's largest city and economic hub" },
  { slug: "pretoria", name: "Pretoria", provinceSlug: "gauteng", provinceName: "Gauteng", description: "Administrative capital of South Africa" },
  { slug: "sandton", name: "Sandton", provinceSlug: "gauteng", provinceName: "Gauteng", description: "Business district and financial center" },
  { slug: "centurion", name: "Centurion", provinceSlug: "gauteng", provinceName: "Gauteng", description: "Fast-growing city between Pretoria and Johannesburg" },
  { slug: "midrand", name: "Midrand", provinceSlug: "gauteng", provinceName: "Gauteng", description: "Central location between Johannesburg and Pretoria" },
  { slug: "randburg", name: "Randburg", provinceSlug: "gauteng", provinceName: "Gauteng", description: "Northern suburb of Johannesburg" },
  
  // Western Cape
  { slug: "cape-town", name: "Cape Town", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Legislative capital and major port city" },
  { slug: "stellenbosch", name: "Stellenbosch", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Historic university town in wine country" },
  { slug: "bellville", name: "Bellville", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Northern suburb of Cape Town" },
  { slug: "paarl", name: "Paarl", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Wine region town in the Cape Winelands" },
  { slug: "somerset-west", name: "Somerset West", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Coastal town near Cape Town" },
  { slug: "george", name: "George", provinceSlug: "western-cape", provinceName: "Western Cape", description: "Garden Route city" },
  
  // KwaZulu-Natal
  { slug: "durban", name: "Durban", provinceSlug: "kwazulu-natal", provinceName: "KwaZulu-Natal", description: "Major port city and tourist destination" },
  { slug: "umhlanga", name: "Umhlanga", provinceSlug: "kwazulu-natal", provinceName: "KwaZulu-Natal", description: "Coastal resort town near Durban" },
  { slug: "pinetown", name: "Pinetown", provinceSlug: "kwazulu-natal", provinceName: "KwaZulu-Natal", description: "Industrial area west of Durban" },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", provinceSlug: "kwazulu-natal", provinceName: "KwaZulu-Natal", description: "Provincial capital of KwaZulu-Natal" },
  
  // Eastern Cape
  { slug: "gqeberha", name: "Gqeberha", provinceSlug: "eastern-cape", provinceName: "Eastern Cape", description: "Major port city (formerly Port Elizabeth)" },
  { slug: "east-london", name: "East London", provinceSlug: "eastern-cape", provinceName: "Eastern Cape", description: "Coastal city and port" },
  
  // Free State
  { slug: "bloemfontein", name: "Bloemfontein", provinceSlug: "free-state", provinceName: "Free State", description: "Judicial capital of South Africa" },
  
  // Mpumalanga
  { slug: "nelspruit", name: "Nelspruit", provinceSlug: "mpumalanga", provinceName: "Mpumalanga", description: "Gateway to Kruger National Park" },
  
  // Limpopo
  { slug: "polokwane", name: "Polokwane", provinceSlug: "limpopo", provinceName: "Limpopo", description: "Provincial capital" },
  
  // North West
  { slug: "rustenburg", name: "Rustenburg", provinceSlug: "north-west", provinceName: "North West", description: "Platinum mining city" },
  
  // Northern Cape
  { slug: "kimberley", name: "Kimberley", provinceSlug: "northern-cape", provinceName: "Northern Cape", description: "Diamond mining city" },
]

export function getCityBySlug(slug: string): City | null {
  return MAJOR_CITIES.find((c) => c.slug === slug) || null
}

export function getCitiesByProvince(provinceSlug: string): City[] {
  return MAJOR_CITIES.filter((c) => c.provinceSlug === provinceSlug)
}

// Service name mappings for URL-friendly slugs
export const SERVICE_SLUG_TO_NAME: Record<string, string> = {
  "plumbing": "Plumbers",
  "plumbers": "Plumbers",
  "electrical": "Electricians",
  "electricians": "Electricians",
  "cleaning": "Cleaning Services",
  "cleaning-services": "Cleaning Services",
  "painting": "Painters",
  "painters": "Painters",
  "handyman": "Handyman Services",
  "handyman-services": "Handyman Services",
  "hvac": "HVAC Installers",
  "hvac-installers": "HVAC Installation",
  "landscaping": "Landscaping",
  "landscaping-services": "Landscaping Services",
  "carpentry": "Carpenters",
  "carpenters": "Carpenters",
  "solar": "Solar Installation",
  "solar-installation": "Solar Installation",
  "roofing": "Roofing",
  "flooring": "Flooring",
  "renovations": "Renovations",
  "security": "Security Systems",
  "security-systems": "Security Systems",
  "alarm-systems": "Alarm Systems",
  "alarms": "Alarm Systems",
  "cctv": "CCTV Installation",
  "cctv-installation": "CCTV Installation",
}
