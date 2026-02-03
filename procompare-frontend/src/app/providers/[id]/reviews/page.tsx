"use client"

import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, Calendar, ThumbsUp, ThumbsDown, ArrowLeft, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import ProviderWriteReviewButton from "@/components/reviews/ProviderWriteReviewButton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

type Provider = {
  id: string;
  business_name: string;
  city: string | null;
  suburb: string | null;
  average_rating: number;
  total_reviews: number;
  verification_status: string;
};

type Review = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  quality_rating: number;
  communication_rating: number;
  timeliness_rating: number;
  value_rating: number;
  would_recommend: boolean;
  is_verified: boolean;
  created_at: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  lead_assignment?: {
    lead?: {
      service_category?: {
        name: string;
      };
    };
  };
};

type ReviewStats = {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
  recommendation_rate: number;
};

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProviderReviewsPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch provider details (public endpoint)
        const providerRes = await fetch(`${API_BASE}/api/public/providers/${params.id}/`);
        if (!providerRes.ok) {
          throw new Error("Provider not found");
        }
        const providerData = await providerRes.json();
        setProvider(providerData);

        // Try to fetch reviews for this provider
        // The provider reviews endpoint may require auth or be public
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Token ${token}`;
        }

        try {
          const reviewsRes = await fetch(
            `${API_BASE}/api/reviews/provider-by-profile/${params.id}/`,
            { headers }
          );
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData || []);
          }
        } catch (reviewErr) {
          console.error("Failed to fetch reviews:", reviewErr);
        }

        try {
          const statsRes = await fetch(
            `${API_BASE}/api/reviews/provider-by-profile/${params.id}/stats/`,
            { headers }
          );
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } catch (statsErr) {
          console.error("Failed to fetch stats:", statsErr);
        }
      } catch (err) {
        console.error("Error fetching provider:", err);
        setError("Failed to load provider information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading reviews...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Provider Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The provider you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/providers/browse">Browse Providers</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const location = [provider.suburb, provider.city].filter(Boolean).join(", ") || "Location not specified";

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button & Header */}
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href={`/providers/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Reviews for {provider.business_name}
            </h1>
            <p className="text-gray-600 mt-1">{location}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content - Reviews */}
            <div className="md:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {provider.business_name} hasn't received any reviews yet.
                      Be the first to share your experience!
                    </p>
                    <Button asChild>
                      <Link href={`/providers/${params.id}/review`}>
                        Write a Review
                        <Star className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StarRating rating={review.rating} />
                            <span className="font-semibold text-gray-900">
                              {review.rating}/5
                            </span>
                            {review.is_verified && (
                              <Badge
                                variant="default"
                                className="bg-green-600 text-xs"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {review.title}
                          </h3>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Quality</p>
                          <StarRating rating={review.quality_rating} size="sm" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Communication</p>
                          <StarRating rating={review.communication_rating} size="sm" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Timeliness</p>
                          <StarRating rating={review.timeliness_rating} size="sm" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Value</p>
                          <StarRating rating={review.value_rating} size="sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {review.client && (
                            <>
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {review.client.first_name} {review.client.last_name?.charAt(0)}.
                              </span>
                            </>
                          )}
                          {review.lead_assignment?.lead?.service_category && (
                            <Badge variant="outline" className="ml-2">
                              {review.lead_assignment.lead.service_category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {review.would_recommend ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <ThumbsUp className="h-4 w-4" />
                              Recommends
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <ThumbsDown className="h-4 w-4" />
                              Does not recommend
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Sidebar - Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Rating Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {stats?.average_rating?.toFixed(1) || provider.average_rating?.toFixed(1) || "0.0"}
                    </div>
                    <StarRating 
                      rating={Math.round(stats?.average_rating || provider.average_rating || 0)} 
                      size="lg" 
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {stats?.total_reviews || provider.total_reviews || 0} review
                      {(stats?.total_reviews || provider.total_reviews || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  {stats && stats.total_reviews > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.rating_distribution[rating] || 0;
                        const percentage = (count / stats.total_reviews) * 100;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-4">{rating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommendation Rate */}
                  {stats && stats.recommendation_rate !== undefined && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Recommendation Rate
                        </span>
                        <span className="font-semibold text-green-600">
                          {stats.recommendation_rate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Write Review CTA (eligibility gated) */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Worked with {provider.business_name}?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Only clients who completed a job with this provider can leave a review. This prevents fake reviews.
                  </p>
                  <ProviderWriteReviewButton
                    providerProfileId={params.id}
                    providerName={provider.business_name}
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  />
                </CardContent>
              </Card>

              {/* Provider Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {provider.business_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{location}</p>
                  {provider.verification_status === "verified" && (
                    <Badge variant="default" className="bg-green-600 mb-4">
                      Verified Provider
                    </Badge>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/providers/${params.id}`}>View Full Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
