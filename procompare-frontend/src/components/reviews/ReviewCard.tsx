'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag,
  MoreVertical,
  Calendar,
  Camera,
  CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  clientName: string
  clientAvatar?: string
  rating: number
  title: string
  comment: string
  categories: Array<{
    id: string
    label: string
    rating: number
  }>
  wouldRecommend: boolean
  photos?: string[]
  createdAt: Date
  jobTitle: string
  jobDescription: string
  providerResponse?: {
    comment: string
    createdAt: Date
  }
  helpful: number
  isVerified: boolean
}

interface ReviewCardProps {
  review: Review
  onReport?: (reviewId: string) => void
  onHelpful?: (reviewId: string) => void
  onReply?: (reviewId: string) => void
  isProvider?: boolean
  showJobDetails?: boolean
}

export function ReviewCard({
  review,
  onReport,
  onHelpful,
  onReply,
  isProvider = false,
  showJobDetails = true
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)

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

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Not Rated'
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const commentPreview = review.comment.length > 200
    ? review.comment.substring(0, 200) + '...'
    : review.comment

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.clientAvatar} />
              <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{review.clientName}</h4>
                {review.isVerified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(review.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isProvider && onReport && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReport(review.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(review.rating, 'lg')}
            <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
              {review.rating}
            </span>
          </div>
          <Badge variant="outline" className={getRatingColor(review.rating)}>
            {getRatingText(review.rating)}
          </Badge>
          {review.wouldRecommend && (
            <Badge className="bg-green-500 text-white">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>

        {/* Review Title */}
        <h3 className="text-lg font-semibold">{review.title}</h3>

        {/* Job Details */}
        {showJobDetails && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700">{review.jobTitle}</p>
            <p className="text-sm text-gray-600">{review.jobDescription}</p>
          </div>
        )}

        {/* Category Ratings */}
        {review.categories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Detailed Ratings:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {review.categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.label}</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(category.rating, 'sm')}
                    <span className="text-sm font-medium">{category.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Comment */}
        <div className="space-y-2">
          <p className="text-gray-700">
            {showFullComment ? review.comment : commentPreview}
          </p>
          {review.comment.length > 200 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showFullComment ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {review.photos.length} Photo{review.photos.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {review.photos.slice(0, 4).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  onClick={() => setShowPhotos(true)}
                />
              ))}
              {review.photos.length > 4 && (
                <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200">
                  <span className="text-sm text-gray-600">
                    +{review.photos.length - 4} more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Provider Response */}
        {review.providerResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-semibold text-blue-800">Provider Response:</span>
              <span className="text-xs text-blue-600">
                {formatDistanceToNow(review.providerResponse.createdAt, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-blue-700">{review.providerResponse.comment}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onHelpful?.(review.id)}
              className="text-gray-600 hover:text-green-600"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Helpful ({review.helpful})
            </Button>
            {isProvider && onReply && !review.providerResponse && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReply(review.id)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}








