"use client"

import { ClientHeader } from "@/components/layout/ClientHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.proconnectsa.co.za";

type Provider = {
  id: string;
  business_name: string;
  city: string | null;
  suburb: string | null;
};

export default function ProviderReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !params?.id) return;
    
    if (!user || !token) {
      toast.error("Please log in to write a review");
      router.push(`/register?redirect=/providers/${params.id}/review`);
      return;
    }

    // Fetch provider details
    const fetchProvider = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/providers/${params.id}/`);
        if (!res.ok) {
          throw new Error("Provider not found");
        }
        const data = await res.json();
        setProvider(data);
      } catch (error) {
        toast.error("Failed to load provider");
        router.push(`/providers/${params.id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [params.id, user, token, authLoading, router]);

  type EligibleAssignment = {
    lead_assignment_id: string;
    lead_id: string;
    lead_title: string;
  }
  const [eligibleAssignments, setEligibleAssignments] = useState<EligibleAssignment[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");

  useEffect(() => {
    if (!user || !token || !provider) return;

    const fetchEligible = async () => {
      try {
        setLoadingEligible(true);
        const res = await fetch(`/api/backend-proxy/reviews/provider-by-profile/${params.id}/eligible`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          }
        });

        if (!res.ok) {
          setEligibleAssignments([]);
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data?.eligible) ? data.eligible : [];
        setEligibleAssignments(items);
        setSelectedAssignmentId(items?.[0]?.lead_assignment_id || "");
      } catch (error) {
        console.error("Error fetching eligible assignments:", error);
        setEligibleAssignments([]);
      } finally {
        setLoadingEligible(false);
      }
    };

    fetchEligible();
  }, [user, token, provider, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (!selectedAssignmentId) {
      toast.error("You can only review after a completed job with this provider");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Please enter a review title (at least 5 characters)");
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error("Please enter a detailed review (at least 10 characters)");
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        lead_assignment_id: selectedAssignmentId,
        rating: rating,
        title: title.trim(),
        comment: comment.trim(),
        quality_rating: qualityRating || rating,
        communication_rating: communicationRating || rating,
        timeliness_rating: timelinessRating || rating,
        value_rating: valueRating || rating,
        would_recommend: wouldRecommend !== null ? wouldRecommend : true,
        job_completed: true
      };

      const res = await fetch(`/api/backend-proxy/reviews/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.detail || 'Failed to submit review');
      }

      toast.success("Review submitted successfully!");
      router.push(`/providers/${params.id}`);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || loadingEligible) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Provider not found</p>
            <Button asChild>
              <Link href="/providers/browse">Browse Providers</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasEligible = eligibleAssignments.length > 0;

  const location = [provider.suburb, provider.city].filter(Boolean).join(", ") || "Location not specified";

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href={`/providers/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
            <p className="text-gray-600 mt-2">
              Share your experience with <strong>{provider.business_name}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1">{location}</p>
          </div>

          {!hasEligible ? (
            <Card>
              <CardHeader>
                <CardTitle>Review Not Available</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Complete a Job First</p>
                      <p>You can only review {provider.business_name} after completing a job with them.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    To leave a review, you need to:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Submit a service request</li>
                    <li>Get matched with {provider.business_name}</li>
                    <li>Complete the job</li>
                    <li>Then come back here to leave your review</li>
                  </ol>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/providers/${params.id}`}>
                      Back to Profile
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Link href="/services">
                      Submit Service Request
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Review your completed job with {provider.business_name}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Job */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Which job are you reviewing?</Label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    {eligibleAssignments.map((a) => (
                      <option key={a.lead_assignment_id} value={a.lead_assignment_id}>
                        {a.lead_title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Only jobs you completed with this provider can be reviewed (prevents fake reviews).
                  </p>
                </div>

                {/* Overall Rating */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Overall Rating *</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-4 text-lg font-medium text-gray-700">
                      {rating === 0 ? "Select rating" : `${rating} out of 5`}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Review Title *</Label>
                  <Textarea
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience in a few words..."
                    rows={2}
                    className="resize-none"
                    required
                    minLength={5}
                  />
                  <p className="text-xs text-gray-500">At least 5 characters</p>
                </div>

                {/* Detailed Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Detailed Review *</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience. What went well? What could be improved?"
                    rows={6}
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500">At least 10 characters</p>
                </div>

                {/* Detailed Ratings */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-lg font-semibold">Rate Specific Aspects (Optional)</Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Quality of Work</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setQualityRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= qualityRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Communication</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommunicationRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= communicationRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Timeliness</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTimelinessRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= timelinessRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Value for Money</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setValueRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= valueRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-lg font-semibold">Would you recommend this provider?</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(true)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        wouldRecommend === true
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      Yes, I would recommend
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(false)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        wouldRecommend === false
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-300 hover:border-red-400"
                      }`}
                    >
                      No, I would not recommend
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Review Guidelines:</p>
                      <ul className="space-y-1 text-xs list-disc list-inside">
                        <li>Be honest and constructive in your feedback</li>
                        <li>Focus on the work quality and service experience</li>
                        <li>Your review will be visible to other clients</li>
                        <li>Reviews help other clients make informed decisions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/providers/${params.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || rating === 0 || !selectedAssignmentId}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
