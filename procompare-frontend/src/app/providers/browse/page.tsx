import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

type PublicProvider = {
  id: string;
  business_name: string;
  city: string | null;
  suburb: string | null;
  service_categories: string[] | null;
  service_category_names?: string[] | null;
  average_rating: number;
  total_reviews: number;
  verification_status: string;
  slug: string;
  bio?: string;
  years_experience?: number;
  profile_image?: string;
};

async function fetchProviders(searchParams: { category?: string; city?: string; page?: string; page_size?: string }) {
  try {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.city) params.set("city", searchParams.city);
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.page_size) params.set("page_size", searchParams.page_size || "20");
    const queryString = params.toString();
    const baseUrl = `${API_BASE}/api/public/providers/`;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error(`Failed to load providers: ${res.status} ${res.statusText}`);
      return { results: [], pagination: { page: 1, pages: 1, total: 0, page_size: 20 } };
    }
    
    const data = await res.json();
    return {
      results: data.results || [],
      pagination: data.pagination || { page: 1, pages: 1, total: 0, page_size: 20 }
    };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return { results: [], pagination: { page: 1, pages: 1, total: 0, page_size: 20 } };
  }
}

export const metadata: Metadata = {
  title: "Browse Verified Providers | ProConnectSA",
  description: "Browse public profiles of verified service providers by category and city. Find trusted professionals for your home and business needs.",
};

export default async function ProvidersBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; page?: string; page_size?: string }>;
}) {
  try {
    const params = await searchParams;
    const data = await fetchProviders(params);
    const providers = Array.isArray(data.results) ? data.results : [];
    const pagination = data.pagination || { page: 1, pages: 1, total: 0, page_size: 20 };

    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-12 bg-gradient-to-br from-emerald-50 to-blue-50 border-b">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Find Verified Providers
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Browse public profiles of verified professionals. Filter by category and city to find the perfect match for your needs.
                </p>
                
                {/* Search Form */}
                <form method="get" action="/providers/browse" className="max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="category"
                        type="text"
                        placeholder="Category (e.g. plumbing, electrical)"
                        defaultValue={params.category || ""}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="city"
                        type="text"
                        placeholder="City (e.g. Johannesburg, Cape Town)"
                        defaultValue={params.city || ""}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <input type="hidden" name="page" value="1" />
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg whitespace-nowrap"
                    >
                      Search
                    </Button>
                  </div>
                  {(params.category || params.city) && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Link
                        href="/providers/browse"
                        className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Clear filters
                      </Link>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Results Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {pagination.total > 0 ? (
                      <>
                        {pagination.total} {pagination.total === 1 ? 'Provider' : 'Providers'} Found
                      </>
                    ) : (
                      'No Providers Found'
                    )}
                  </h2>
                  {(params.category || params.city) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {params.category && `Category: ${params.category}`}
                      {params.category && params.city && ' • '}
                      {params.city && `City: ${params.city}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Providers Grid */}
              {providers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
                    <p className="text-gray-600 mb-6">
                      {params.category || params.city 
                        ? "Try adjusting your search filters or browse all providers."
                        : "No verified providers available at this time. Please check back later."}
                    </p>
                    {(params.category || params.city) && (
                      <Button asChild variant="outline">
                        <Link href="/providers/browse">View All Providers</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {providers.map((p) => (
                      <Card key={p.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {p.business_name}
                              </h3>
                              {p.suburb || p.city ? (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{[p.suburb, p.city].filter(Boolean).join(", ") || "South Africa"}</span>
                                </div>
                              ) : null}
                            </div>
                            {p.verification_status === "verified" && (
                              <Badge variant="default" className="bg-emerald-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>

                          {/* Service Categories */}
                          {p.service_category_names && p.service_category_names.length > 0 ? (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {p.service_category_names.slice(0, 3).map((cat, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium"
                                  >
                                    {cat}
                                  </span>
                                ))}
                                {p.service_category_names.length > 3 && (
                                  <span className="text-xs text-gray-500 px-2.5 py-1">
                                    +{p.service_category_names.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : p.service_categories && p.service_categories.length > 0 ? (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {p.service_categories.slice(0, 3).map((cat, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium"
                                  >
                                    {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                ))}
                                {p.service_categories.length > 3 && (
                                  <span className="text-xs text-gray-500 px-2.5 py-1">
                                    +{p.service_categories.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {/* Rating & Reviews */}
                          <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-semibold text-gray-900">
                                {p.average_rating?.toFixed(1) ?? "0.0"}
                              </span>
                              <span className="text-gray-500">/ 5.0</span>
                            </div>
                            <span className="text-gray-500">
                              {p.total_reviews || 0} {p.total_reviews === 1 ? 'review' : 'reviews'}
                            </span>
                          </div>

                          {/* Bio Preview */}
                          {p.bio && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {p.bio}
                            </p>
                          )}

                          {/* Experience */}
                          {p.years_experience && (
                            <p className="text-xs text-gray-500 mb-4">
                              {p.years_experience} {p.years_experience === 1 ? 'year' : 'years'} of experience
                            </p>
                          )}

                          {/* View Profile Button */}
                          <div className="pt-4 border-t">
                            <Button asChild variant="outline" className="w-full">
                              <Link href={`/providers/${p.id}`}>
                                View Profile →
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      {pagination.page > 1 && (
                        <Button asChild variant="outline">
                          <Link 
                            href={`/providers/browse?${new URLSearchParams({
                              ...params,
                              page: String(pagination.page - 1)
                            }).toString()}`}
                          >
                            Previous
                          </Link>
                        </Button>
                      )}
                      <span className="text-sm text-gray-600 px-4">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      {pagination.page < pagination.pages && (
                        <Button asChild variant="outline">
                          <Link 
                            href={`/providers/browse?${new URLSearchParams({
                              ...params,
                              page: String(pagination.page + 1)
                            }).toString()}`}
                          >
                            Next
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error rendering browse page:", error);
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1">
          <section className="py-12 bg-gradient-to-br from-emerald-50 to-blue-50 border-b">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Find Verified Providers
                </h1>
                <p className="text-lg text-gray-600">
                  Browse public profiles of verified professionals. Filter by category and city.
                </p>
              </div>
            </div>
          </section>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load providers</h3>
                  <p className="text-gray-600 mb-6">
                    There was an error loading the provider directory. Please try again later.
                  </p>
                  <Button asChild>
                    <Link href="/providers/browse">Try Again</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }
}
