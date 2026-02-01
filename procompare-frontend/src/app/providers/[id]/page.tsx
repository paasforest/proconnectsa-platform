import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, MapPin, Shield, Award, CheckCircle, ArrowRight } from "lucide-react";

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
  try {
    const url = `${API_BASE}/api/public/providers/${id}/`;
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`Failed to load provider: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as PublicProvider;
  } catch (error) {
    console.error('Error fetching provider:', error);
    return null;
  }
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

  const location = [provider.suburb, provider.city].filter(Boolean).join(", ") || "Location not specified";
  const rating = provider.average_rating?.toFixed(1) ?? "0.0";
  const reviews = provider.total_reviews || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{provider.business_name}</h1>
                  {provider.is_premium_listing && (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      ⭐ Premium
                    </Badge>
                  )}
                  {provider.verification_status === "verified" && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{rating}</span>
                    <span className="text-sm">({reviews} {reviews === 1 ? 'review' : 'reviews'})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(provider.service_categories || []).map((c) => (
                    <Badge key={c} variant="outline" className="bg-white">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="md:w-80">
                <div className="bg-white rounded-lg shadow-lg border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Get a Quote</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Submit a service request and we'll connect you with {provider.business_name} along with other verified providers.
                  </p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/services">
                      Request a Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Free service • Get multiple quotes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="md:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    About This Provider
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      {provider.verification_status === "verified" 
                        ? `${provider.business_name} is a verified professional on ProConnectSA. This provider has been background checked and meets our quality standards.`
                        : `${provider.business_name} is a professional on ProConnectSA. This profile is pending verification.`}
                    </p>
                    <p className="text-sm">
                      Contact details are shared securely when you submit a service request and the provider responds to your quote.
                    </p>
                    {provider.is_premium_listing && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <p className="text-yellow-800 text-sm font-medium">
                          ⭐ Premium Listing - This provider has enhanced visibility and priority matching for new leads.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services Section */}
                {(provider.service_categories && provider.service_categories.length > 0) && (
                  <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
                    <div className="flex flex-wrap gap-2">
                      {provider.service_categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-sm py-1 px-3">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* How It Works */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">How to Get a Quote</h3>
                  <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                    <li>Click "Request a Quote" above</li>
                    <li>Submit your service request with details</li>
                    <li>We'll match you with {provider.business_name} and other verified providers</li>
                    <li>Compare quotes and choose the best option</li>
                  </ol>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Ratings Card */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Ratings & Reviews
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(parseFloat(rating))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{reviews} {reviews === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Verification Status
                  </h3>
                  <div className="space-y-2">
                    {provider.verification_status === "verified" ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Verified Professional</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <span className="font-medium">Pending Verification</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Verified providers have been background checked and meet our quality standards.
                    </p>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
                  <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Submit a service request and get quotes from {provider.business_name} and other verified providers.
                  </p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/services">
                      Request a Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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

