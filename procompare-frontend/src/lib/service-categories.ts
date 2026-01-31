export type ServiceCategory = { id: number; name: string; slug: string }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za"

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leads/categories/`, {
      method: "GET",
      // SEO pages should be fresh enough, but don't block builds if backend is temporarily flaky.
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
    return items
      .filter((c: any) => c && c.id && c.slug && c.name)
      .map((c: any) => ({ id: Number(c.id), slug: String(c.slug), name: String(c.name) }))
  } catch {
    return []
  }
}

