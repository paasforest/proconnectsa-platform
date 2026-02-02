export type ProvinceSlug =
  | "gauteng"
  | "western-cape"
  | "kwazulu-natal"
  | "eastern-cape"
  | "free-state"
  | "mpumalanga"
  | "limpopo"
  | "north-west"
  | "northern-cape"

export const PROVINCES: { slug: ProvinceSlug; name: string; topCities: string[] }[] = [
  { slug: "gauteng", name: "Gauteng", topCities: ["Johannesburg", "Pretoria", "Sandton", "Centurion", "Midrand", "Randburg"] },
  { slug: "western-cape", name: "Western Cape", topCities: ["Cape Town", "Stellenbosch", "Bellville", "Paarl", "Somerset West", "George"] },
  { slug: "kwazulu-natal", name: "KwaZulu-Natal", topCities: ["Durban", "Umhlanga", "Pinetown", "Pietermaritzburg"] },
  { slug: "eastern-cape", name: "Eastern Cape", topCities: ["Gqeberha", "East London"] },
  { slug: "free-state", name: "Free State", topCities: ["Bloemfontein"] },
  { slug: "mpumalanga", name: "Mpumalanga", topCities: ["Nelspruit"] },
  { slug: "limpopo", name: "Limpopo", topCities: ["Polokwane"] },
  { slug: "north-west", name: "North West", topCities: ["Rustenburg"] },
  { slug: "northern-cape", name: "Northern Cape", topCities: ["Kimberley"] },
]

export function getProvinceBySlug(slug: string) {
  return PROVINCES.find((p) => p.slug === slug) || null
}

