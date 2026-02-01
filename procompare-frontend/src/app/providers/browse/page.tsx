"use client"

import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

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
  is_premium_listing?: boolean;
  slug: string;
};

async function fetchProviders(searchParams: { category?: string; city?: string; page?: string; page_size?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.city) params.set("city", searchParams.city);
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.page_size) params.set("page_size", searchParams.page_size);
  const queryString = params.toString();
  const url = `${API_BASE}/api/public/providers/${queryString ? `?${queryString}` : ""}`;
  try {
    const res = await fetch(url, { 
      cache: 'no-store' // Client-side fetch
    });
    if (!res.ok) {
      console.error(`Failed to load providers: ${res.status} ${res.statusText}`);
      return { results: [], pagination: { page: 1, pages: 0, total: 0, page_size: 20 } };
    }
    return await res.json() as { results: PublicProvider[]; pagination: { page: number; pages: number; total: number; page_size: number } };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return { results: [], pagination: { page: 1, pages: 0, total: 0, page_size: 20 } };
  }
}

function ProvidersBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  useEffect(() => {
    const loadProviders = async () => {
      setLoading(true);
      try {
        const params: { category?: string; city?: string; page?: string; page_size?: string } = {};
        if (searchParams.get("category")) params.category = searchParams.get("category") || undefined;
        if (searchParams.get("city")) params.city = searchParams.get("city") || undefined;
        if (searchParams.get("page")) params.page = searchParams.get("page") || undefined;
        params.page_size = "20";
        
        const data = await fetchProviders(params);
        setProviders(data.results || []);
      } catch (error) {
        console.error("Failed to load providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category.trim()) params.set("category", category.trim());
    if (city.trim()) params.set("city", city.trim());
    params.set("page", "1");
    router.replace(`/providers/browse?${params.toString()}`);
  };

  const handleReset = () => {
    setCategory("");
    setCity("");
    router.replace("/providers/browse");
  };

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
            <form onSubmit={handleSearch} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category slug (e.g. plumbing)"
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Johannesburg)"
                className="border rounded px-3 py-2"
              />
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-600 underline underline-offset-4 self-center hover:text-gray-900"
              >
                Reset
              </button>
            </form>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading providers...</div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="mb-2">No providers found for your filters.</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria or browse all providers.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((p) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{p.business_name}</h3>
                          <p className="text-sm text-gray-600">{[p.suburb, p.city].filter(Boolean).join(", ") || "Location not specified"}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {p.is_premium_listing && (
                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                          <Badge variant={p.verification_status === "verified" ? "default" : "secondary"}>
                            {p.verification_status}
                          </Badge>
                        </div>
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function ProvidersBrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    }>
      <ProvidersBrowseContent />
    </Suspense>
  );
}

