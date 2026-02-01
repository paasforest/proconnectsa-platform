import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
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
  is_premium_listing?: boolean;
  slug: string;
};

async function fetchProvider(id: string) {
  const url = `${API_BASE}/api/public/providers/${id}/`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load provider (${res.status})`);
  return (await res.json()) as PublicProvider;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const provider = await fetchProvider(params.id);
    if (!provider) return { title: "Provider not found | ProConnectSA" };
    return {
      title: `${provider.business_name} | Provider Profile`,
      description: `Verified provider in ${[provider.suburb, provider.city].filter(Boolean).join(", ") || "South Africa"}.`,
    };
  } catch {
    return { title: "Provider | ProConnectSA" };
  }
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const provider = await fetchProvider(params.id);
  if (!provider) return notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{provider.business_name}</h1>
                <p className="text-gray-600 mt-1">
                  {[provider.suburb, provider.city].filter(Boolean).join(", ") || "Location not specified"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(provider.service_categories || []).map((c) => (
                    <span key={c} className="text-xs bg-white border px-2 py-1 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {provider.is_premium_listing && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    Premium
                  </Badge>
                )}
                <Badge variant={provider.verification_status === "verified" ? "default" : "secondary"}>
                  {provider.verification_status === "verified" ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white border rounded p-5">
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 text-sm">
                  {provider.verification_status === "verified" 
                    ? "This provider has a verified profile on ProConnectSA. Contact details are shared securely when a lead is matched and purchased."
                    : "This provider profile is pending verification. Contact details are shared securely when a lead is matched and purchased."}
                </p>
                {provider.is_premium_listing && (
                  <p className="text-yellow-700 text-sm mt-2 font-medium">
                    ⭐ Premium Listing - Featured Provider
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="bg-white border rounded p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Ratings</h3>
                <div className="text-sm text-gray-700">
                  <div>
                    <span className="font-medium">{provider.average_rating?.toFixed(1) ?? "0.0"}</span> / 5.0
                  </div>
                  <div>{provider.total_reviews} reviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

