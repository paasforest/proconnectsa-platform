import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Shield, 
  DollarSign, 
  CheckCircle,
  Briefcase,
  Image as ImageIcon
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

type PublicProvider = {
  id: string;
  business_name: string;
  city: string | null;
  suburb: string | null;
  service_categories: string[] | null;
  service_category_names: string[];
  average_rating: number;
  total_reviews: number;
  verification_status: string;
  slug: string;
  bio: string;
  years_experience: number | null;
  service_areas: string[];
  max_travel_distance: number;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  minimum_job_value: number | null;
  response_time_hours: number | null;
  job_completion_rate: number | null;
  profile_image: string;
  portfolio_images: string[];
  insurance_valid_until: string | null;
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
      description: provider.bio || `Verified ${provider.service_category_names.join(', ')} provider in ${[provider.suburb, provider.city].filter(Boolean).join(", ") || "South Africa"}.`,
    };
  } catch {
    return { title: "Provider | ProConnectSA" };
  }
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const provider = await fetchProvider(params.id);
  if (!provider) return notFound();

  const location = [provider.suburb, provider.city].filter(Boolean).join(", ") || "Location not specified";
  const hasPricing = provider.hourly_rate_min || provider.hourly_rate_max || provider.minimum_job_value;
  const hasInsurance = provider.insurance_valid_until && new Date(provider.insurance_valid_until) > new Date();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ClientHeader />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{provider.business_name}</h1>
                  {provider.verification_status === "verified" && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                  {provider.years_experience && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{provider.years_experience} years experience</span>
                    </div>
                  )}
                </div>

                {/* Service Categories */}
                {provider.service_category_names && provider.service_category_names.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {provider.service_category_names.map((category, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Rating */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold text-lg">{provider.average_rating?.toFixed(1) ?? "0.0"}</span>
                  </div>
                  <span className="text-gray-600">
                    ({provider.total_reviews} {provider.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col gap-3">
                <Link href={`/request-quote?provider=${provider.id}`}>
                  <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                    Get a Quote
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 text-center md:text-left">
                  Free service • Get multiple quotes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {provider.business_name}</h2>
                  {provider.bio ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{provider.bio}</p>
                  ) : (
                    <p className="text-gray-600 italic">
                      This provider has a verified profile on ProConnectSA. Contact details are shared securely when a
                      lead is matched and purchased.
                    </p>
                  )}
                </div>

                {/* Services & Coverage */}
                {(provider.service_areas.length > 0 || provider.max_travel_distance) && (
                  <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Service Areas
                    </h2>
                    {provider.service_areas.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {provider.service_areas.map((area, idx) => (
                          <Badge key={idx} variant="outline">{area}</Badge>
                        ))}
                      </div>
                    ) : null}
                    {provider.max_travel_distance && (
                      <p className="text-sm text-gray-600">
                        Maximum travel distance: {provider.max_travel_distance} km
                      </p>
                    )}
                  </div>
                )}

                {/* Portfolio Images */}
                {provider.portfolio_images && provider.portfolio_images.length > 0 && (
                  <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Portfolio
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {provider.portfolio_images.slice(0, 6).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={img} 
                            alt={`${provider.business_name} portfolio ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Ratings Card */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Ratings & Reviews
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900">{provider.average_rating?.toFixed(1) ?? "0.0"}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(provider.average_rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {provider.total_reviews} {provider.total_reviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <Link href={`/providers/${provider.id}/reviews`}>
                    <Button variant="outline" className="w-full">
                      View All Reviews
                    </Button>
                  </Link>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Performance
                  </h3>
                  <div className="space-y-4">
                    {provider.response_time_hours && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Response Time</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {provider.response_time_hours < 1 
                            ? `${Math.round(provider.response_time_hours * 60)} min`
                            : `${provider.response_time_hours.toFixed(1)} hrs`}
                        </span>
                      </div>
                    )}
                    {provider.job_completion_rate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completion Rate</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {provider.job_completion_rate.toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {hasInsurance && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="w-4 h-4" />
                          <span>Insurance</span>
                        </div>
                        <span className="font-medium text-green-600">Valid</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Information */}
                {hasPricing && (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing
                    </h3>
                    <div className="space-y-3 text-sm">
                      {provider.hourly_rate_min && provider.hourly_rate_max && (
                        <div>
                          <span className="text-gray-600">Hourly Rate:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            R{provider.hourly_rate_min.toFixed(0)} - R{provider.hourly_rate_max.toFixed(0)}
                          </span>
                        </div>
                      )}
                      {provider.minimum_job_value && (
                        <div>
                          <span className="text-gray-600">Minimum Job Value:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            R{provider.minimum_job_value.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Get Quote CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Need a Quote?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Submit a service request and we'll connect you with {provider.business_name} along with other verified providers.
                  </p>
                  <Link href={`/request-quote?provider=${provider.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Request a Quote
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 mt-2">Free service • Get multiple quotes</p>
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

