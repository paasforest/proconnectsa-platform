"use client"

import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, Calendar, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

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
    id: string;
    first_name: string;
    last_name: string;
  };
  lead_assignment?: {
    id: string;
    lead?: {
      title: string;
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

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
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

export default function ReviewsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      router.push("/login?redirect=/reviews");
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch reviews
        const reviewsRes = await fetch(`${API_BASE}/api/reviews/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!reviewsRes.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.results || reviewsData || []);

        // If provider, fetch stats
        if (user?.userType === "provider" && user?.id) {
          try {
            const statsRes = await fetch(
              `${API_BASE}/api/reviews/provider/${user.id}/stats/`,
              {
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              setStats(statsData);
            }
          } catch (statsErr) {
            console.error("Failed to fetch stats:", statsErr);
          }
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
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

  const isProvider = user?.userType === "provider";

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isProvider ? "My Reviews" : "Reviews I've Given"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isProvider
                ? "See what clients are saying about your work"
                : "View all the reviews you've submitted"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {isProvider
                        ? "You haven't received any reviews yet. Complete jobs to get feedback from clients."
                        : "You haven't submitted any reviews yet."}
                    </p>
                    {!isProvider && (
                      <Button asChild>
                        <Link href="/client/requests">View My Requests</Link>
                      </Button>
                    )}
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
                          {isProvider && review.client && (
                            <>
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {review.client.first_name} {review.client.last_name}
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
                              Would recommend
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <ThumbsDown className="h-4 w-4" />
                              Would not recommend
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Sidebar - Stats (for providers) */}
            <div className="space-y-6">
              {isProvider && stats && (
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
                        {stats.average_rating.toFixed(1)}
                      </div>
                      <StarRating rating={Math.round(stats.average_rating)} />
                      <p className="text-sm text-gray-600 mt-1">
                        {stats.total_reviews} review
                        {stats.total_reviews !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2 pt-4 border-t">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.rating_distribution[rating] || 0;
                        const percentage =
                          stats.total_reviews > 0
                            ? (count / stats.total_reviews) * 100
                            : 0;
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

                    {/* Recommendation Rate */}
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
                  </CardContent>
                </Card>
              )}

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isProvider ? "Getting Better Reviews" : "Review Tips"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {isProvider ? (
                      <>
                        <li>• Communicate clearly with clients</li>
                        <li>• Complete work on time</li>
                        <li>• Provide quality workmanship</li>
                        <li>• Follow up after job completion</li>
                        <li>• Address concerns promptly</li>
                      </>
                    ) : (
                      <>
                        <li>• Be specific about what went well</li>
                        <li>• Mention areas for improvement</li>
                        <li>• Rate each aspect fairly</li>
                        <li>• Help others make informed decisions</li>
                      </>
                    )}
                  </ul>
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
