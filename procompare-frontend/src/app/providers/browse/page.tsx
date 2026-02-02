import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

type PublicProvider = {
  id: string;
  business_name: string;
  city: string | null;
  suburb: string | null;
  service_categories: string[] | null;
  average_rating: number;
  total_reviews: number;
  verification_status: string;
  slug: string;
};

async function fetchProviders(searchParams: { category?: string; city?: string; page?: string; page_size?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.city) params.set("city", searchParams.city);
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.page_size) params.set("page_size", searchParams.page_size);
  const url = `${API_BASE}/api/public/providers/${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to load providers (${res.status})`);
  return res.json() as Promise<{ results: PublicProvider[]; pagination: { page: number; pages: number; total: number; page_size: number } }>;
}

export const metadata: Metadata = {
  title: "Find Verified Providers | ProConnectSA",
  description: "Browse public profiles of verified service providers by category and city.",
};

export default async function ProvidersBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; page?: string; page_size?: string }>;
}) {
  const params = await searchParams;
  const data = await fetchProviders(params);
  const providers = data.results || [];

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="py-10 bg-white border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Verified Providers</h1>
            <p className="text-gray-600">
              Browse public profiles of verified professionals. Filter by category and city.
            </p>
            <form className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                name="category"
                placeholder="Category slug (e.g. plumbing)"
                defaultValue={params.category || ""}
                className="border rounded px-3 py-2"
              />
              <input
                name="city"
                placeholder="City (e.g. Johannesburg)"
                defaultValue={params.city || ""}
                className="border rounded px-3 py-2"
              />
              <input type="hidden" name="page" value="1" />
              <button className="bg-blue-600 text-white rounded px-4 py-2">Search</button>
              <Link
                href="/providers/browse"
                className="text-sm text-gray-600 underline underline-offset-4 self-center"
              >
                Reset
              </Link>
            </form>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.length === 0 && (
              <div className="col-span-full text-gray-600">No providers found for your filters.</div>
            )}
            {providers.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{p.business_name}</h3>
                      <p className="text-sm text-gray-600">{[p.suburb, p.city].filter(Boolean).join(", ")}</p>
                    </div>
                    <Badge variant={p.verification_status === "verified" ? "default" : "secondary"}>
                      {p.verification_status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(p.service_categories || []).slice(0, 4).map((c) => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">{p.average_rating?.toFixed(1) ?? "0.0"}</span> / 5.0 ·{" "}
                    <span>{p.total_reviews} reviews</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/providers/${p.id}`}
                      className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium"
                    >
                      View profile →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

