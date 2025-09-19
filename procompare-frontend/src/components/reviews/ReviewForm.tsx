'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Camera,
  Upload,
  Send,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1-5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  wouldRecommend: z.boolean(),
  photos: z.array(z.string()).optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  jobId: string
  providerName: string
  jobTitle: string
  jobDescription: string
  completedDate: Date
  onSubmit: (reviewData: ReviewFormData) => void
  isLoading?: boolean
}

const reviewCategories = [
  { id: 'quality', label: 'Quality of Work', icon: '⭐' },
  { id: 'timeliness', label: 'Timeliness', icon: '⏰' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { id: 'pricing', label: 'Value for Money', icon: '💰' },
  { id: 'professionalism', label: 'Professionalism', icon: '👔' }
]

export function ReviewForm({
  jobId,
  providerName,
  jobTitle,
  jobDescription,
  completedDate,
  onSubmit,
  isLoading = false
}: ReviewFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [photos, setPhotos] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
      categories: [],
      wouldRecommend: false,
      photos: []
    }
  })

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
    setValue('rating', selectedRating)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newCategories)
    setValue('categories', newCategories)
  }

  const handleRecommendation = (recommend: boolean) => {
    setWouldRecommend(recommend)
    setValue('wouldRecommend', recommend)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // TODO: Upload photos to server
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos(prev => [...prev, ...newPhotos])
      setValue('photos', [...photos, ...newPhotos])
    }
  }

  const onFormSubmit = (data: ReviewFormData) => {
    onSubmit(data)
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select Rating'
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500'
      case 2: return 'text-orange-500'
      case 3: return 'text-yellow-500'
      case 4: return 'text-blue-500'
      case 5: return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Write a Review</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p><strong>Job:</strong> {jobTitle}</p>
          <p><strong>Provider:</strong> {providerName}</p>
          <p><strong>Completed:</strong> {completedDate.toLocaleDateString()}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Overall Rating</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className={`ml-2 text-lg font-semibold ${getRatingColor(rating)}`}>
                {getRatingText(rating)}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Textarea
              id="title"
              {...register('title')}
              placeholder="Summarize your experience in a few words..."
              rows={2}
              className="resize-none"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Detailed Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Detailed Review</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Tell us about your experience. What went well? What could be improved?"
              rows={4}
            />
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Rate Specific Aspects</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            selectedCategories.includes(category.id)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-red-600">{errors.categories.message}</p>
            )}
          </div>

          {/* Recommendation */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Would you recommend this provider?</Label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleRecommendation(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  wouldRecommend === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span>Yes, I would recommend</span>
              </button>
              <button
                type="button"
                onClick={() => handleRecommendation(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  wouldRecommend === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-400'
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                <span>No, I would not recommend</span>
              </button>
            </div>
            {errors.wouldRecommend && (
              <p className="text-sm text-red-600">{errors.wouldRecommend.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Add Photos (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600">Click to upload photos</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 10MB each</span>
              </label>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Review Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Focus on the work quality and service experience</li>
                  <li>• Avoid personal attacks or inappropriate language</li>
                  <li>• Your review will be visible to other clients</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading || rating === 0 || !isDirty}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}








