"use client";

import React, { useState } from 'react';
import { Star, Upload, Link as LinkIcon, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';

interface GoogleReviewFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GoogleReviewForm({ onSuccess, onCancel }: GoogleReviewFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    google_link: '',
    review_text: '',
    review_rating: 5,
    review_screenshot: null as File | null,
  });
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, or GIF)');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, review_screenshot: file });
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreementAccepted) {
      setError('You must confirm that all reviews submitted are genuine');
      return;
    }

    if (!formData.google_link) {
      setError('Please provide a Google Maps link to the review');
      return;
    }

    if (!formData.google_link.includes('google.com/maps') && !formData.google_link.includes('goo.gl/maps')) {
      setError('Please provide a valid Google Maps link');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (token) {
        apiClient.setToken(token);
      }

      await apiClient.submitGoogleReview({
        google_link: formData.google_link,
        review_text: formData.review_text || undefined,
        review_rating: formData.review_rating,
        review_screenshot: formData.review_screenshot || undefined,
        agreement_accepted: true,
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        google_link: '',
        review_text: '',
        review_rating: 5,
        review_screenshot: null,
      });
      setAgreementAccepted(false);
      setPreviewImage(null);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Failed to submit Google review:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to submit review. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">Review Submitted Successfully!</h3>
        <p className="text-green-700 mb-4">
          Your Google review has been submitted for admin verification. 
          It will appear on your profile once approved.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            if (onCancel) onCancel();
          }}
          className="text-green-700 hover:text-green-900 underline"
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Google Maps Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Maps Link <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-gray-400" />
          <input
            type="url"
            value={formData.google_link}
            onChange={(e) => setFormData({ ...formData, google_link: e.target.value })}
            placeholder="https://www.google.com/maps/place/..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Paste the direct link to your Google Business review
        </p>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Text (Optional)
        </label>
        <textarea
          value={formData.review_text}
          onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
          placeholder="Paste the review text here (optional - can be extracted from screenshot)"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Star Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, review_rating: rating })}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= formData.review_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-600">
            {formData.review_rating} {formData.review_rating === 1 ? 'star' : 'stars'}
          </span>
        </div>
      </div>

      {/* Screenshot Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Screenshot (Optional but Recommended)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="screenshot-upload"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="screenshot-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {formData.review_screenshot
                ? formData.review_screenshot.name
                : 'Click to upload screenshot (JPEG, PNG, GIF - max 10MB)'}
            </span>
          </label>
        </div>
        {previewImage && (
          <div className="mt-4">
            <img
              src={previewImage}
              alt="Screenshot preview"
              className="max-w-full h-auto rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, review_screenshot: null });
                setPreviewImage(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      {/* Agreement Checkbox */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreementAccepted}
            onChange={(e) => setAgreementAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-700">
            I confirm all reviews submitted are genuine and from my actual Google Business profile. 
            False reviews will result in a permanent ban. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !agreementAccepted}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Review for Verification'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
