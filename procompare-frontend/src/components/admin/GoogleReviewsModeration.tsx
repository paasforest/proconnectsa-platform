"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Star, CheckCircle, XCircle, Ban, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface GoogleReview {
  id: string;
  provider_profile: {
    id: string;
    business_name: string;
  };
  google_link: string;
  review_text: string;
  review_rating: number;
  review_screenshot?: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'banned';
  admin_notes?: string;
  submission_date: string;
  reviewed_at?: string;
  reviewed_by_name?: string;
}

export default function GoogleReviewsModeration() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      fetchReviews();
    }
  }, [token, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      apiClient.setToken(token);
      const response = await apiClient.getAdminGoogleReviews(statusFilter);
      setReviews(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error('Failed to fetch Google reviews:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, action: 'approve' | 'reject' | 'ban') => {
    try {
      setModeratingId(reviewId);
      const notes = adminNotes[reviewId] || '';
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      apiClient.setToken(token);
      await apiClient.moderateGoogleReview(reviewId, action, notes);

      // Refresh the list
      await fetchReviews();
      
      // Clear notes for this review
      setAdminNotes({ ...adminNotes, [reviewId]: '' });
    } catch (err: any) {
      console.error(`Failed to ${action} review:`, err);
      alert(err.response?.data?.error || err.message || `Failed to ${action} review`);
    } finally {
      setModeratingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      banned: { bg: 'bg-red-200', text: 'text-red-900', label: 'Banned' },
    };
    const style = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Google Reviews Moderation</h1>
        <p className="text-gray-600">
          Review and moderate Google Business reviews submitted by providers
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="banned">Banned</option>
          <option value="all">All</option>
        </select>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No reviews found</p>
          <p className="text-gray-400 text-sm mt-2">
            {statusFilter === 'pending' 
              ? 'No pending reviews to moderate'
              : `No ${statusFilter} reviews`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.provider_profile.business_name}
                    </h3>
                    {getStatusBadge(review.review_status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(review.submission_date).toLocaleString()}
                  </p>
                  {review.reviewed_by_name && (
                    <p className="text-sm text-gray-500">
                      Reviewed by: {review.reviewed_by_name} on{' '}
                      {review.reviewed_at ? new Date(review.reviewed_at).toLocaleString() : 'N/A'}
                    </p>
                  )}
                </div>
                {review.google_link && (
                  <a
                    href={review.google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    View on Google
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.review_rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">{review.review_rating} stars</span>
              </div>

              {/* Review Text */}
              {review.review_text && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                </div>
              )}

              {/* Screenshot */}
              {review.review_screenshot && (
                <div className="mb-4">
                  <img
                    src={review.review_screenshot}
                    alt="Review screenshot"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Admin Notes (if reviewed) */}
              {review.admin_notes && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-600">{review.admin_notes}</p>
                </div>
              )}

              {/* Action Buttons (only for pending) */}
              {review.review_status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (optional)
                    </label>
                    <textarea
                      value={adminNotes[review.id] || ''}
                      onChange={(e) =>
                        setAdminNotes({ ...adminNotes, [review.id]: e.target.value })
                      }
                      placeholder="Add notes for rejection/ban reason..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleModerate(review.id, 'approve')}
                      disabled={moderatingId === review.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, 'reject')}
                      disabled={moderatingId === review.id}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to ban this review? This will also suspend the provider account.')) {
                          handleModerate(review.id, 'ban');
                        }
                      }}
                      disabled={moderatingId === review.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Ban
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
