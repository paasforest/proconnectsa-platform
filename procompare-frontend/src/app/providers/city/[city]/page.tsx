import Link from "next/link";
import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
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

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityName = decodeURIComponent(params.city);
  return {
    title: `Providers in ${cityName} | ProConnectSA`,
    description: `Browse verified professionals available in ${cityName}.`,
  };
}

async function fetchProvidersByCity(city: string) {
  const url = `${API_BASE}/api/public/providers/?city=${encodeURIComponent(city)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to load providers (${res.status})`);
  return res.json() as Promise<{ results: PublicProvider[]; pagination: any }>;
}

export default async function ProvidersByCityPage({ params }: { params: { city: string } }) {
  const cityName = decodeURIComponent(params.city);
  const data = await fetchProvidersByCity(cityName);
  const providers = data.results || [];

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="py-10 bg-white border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Providers in {cityName}</h1>
            <p className="text-gray-600">Verified professionals serving {cityName}.</p>
            <div className="mt-4">
              <Link href="/providers/browse" className="text-blue-700 hover:text-blue-900 font-medium">
                ← All Providers
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.length === 0 && (
              <div className="col-span-full text-gray-600">No providers found for this city.</div>
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

