'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ReviewCard } from './ReviewCard'
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp,
  MessageSquare,
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react'

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

interface ReviewListProps {
  reviews: Review[]
  onReport?: (reviewId: string) => void
  onHelpful?: (reviewId: string) => void
  onReply?: (reviewId: string) => void
  isProvider?: boolean
  showJobDetails?: boolean
}

export function ReviewList({
  reviews,
  onReport,
  onHelpful,
  onReply,
  isProvider = false,
  showJobDetails = true
}: ReviewListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all')
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false)
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false)

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = 
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter
      const matchesPhotos = !showOnlyWithPhotos || (review.photos && review.photos.length > 0)
      const matchesRecommended = !showOnlyRecommended || review.wouldRecommend
      
      return matchesSearch && matchesRating && matchesPhotos && matchesRecommended
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'helpful':
          comparison = a.helpful - b.helpful
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getOverallStats = () => {
    const total = reviews.length
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const recommended = reviews.filter(r => r.wouldRecommend).length
    const withPhotos = reviews.filter(r => r.photos && r.photos.length > 0).length
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
      reviews.filter(r => r.rating === rating).length
    )
    
    return { total, average, recommended, withPhotos, ratingDistribution }
  }

  const stats = getOverallStats()

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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.average.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.recommended}</div>
            <div className="text-sm text-gray-600">Recommended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.withPhotos}</div>
            <div className="text-sm text-gray-600">With Photos</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating - 1]
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="helpful">Sort by Helpful</option>
              </select>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={showOnlyWithPhotos ? "default" : "outline"}
              onClick={() => setShowOnlyWithPhotos(!showOnlyWithPhotos)}
            >
              <Filter className="h-4 w-4 mr-1" />
              With Photos
            </Button>
            <Button
              size="sm"
              variant={showOnlyRecommended ? "default" : "outline"}
              onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Recommended Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No reviews found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReport={onReport}
              onHelpful={onHelpful}
              onReply={onReply}
              isProvider={isProvider}
              showJobDetails={showJobDetails}
            />
          ))
        )}
      </div>
    </div>
  )
}








