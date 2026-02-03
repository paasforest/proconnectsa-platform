'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Star } from 'lucide-react'

import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'

type EligibleAssignment = {
  lead_assignment_id: string
  lead_id: string
  lead_title: string
}

type Props = {
  providerProfileId: string
  providerName: string
  variant?: 'default' | 'outline'
  className?: string
}

export default function ProviderWriteReviewButton({
  providerProfileId,
  providerName,
  variant = 'outline',
  className
}: Props) {
  const { user, token, isLoading } = useAuth()
  const pathname = usePathname()
  const [eligible, setEligible] = useState<EligibleAssignment[] | null>(null)
  const [loading, setLoading] = useState(false)

  const isClient = user?.user_type === 'client'
  const redirect = useMemo(() => encodeURIComponent(pathname || `/providers/${providerProfileId}`), [pathname, providerProfileId])

  useEffect(() => {
    if (isLoading) return
    if (!token || !isClient) {
      setEligible(null)
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/backend-proxy/reviews/provider-by-profile/${providerProfileId}/eligible`, {
          method: 'GET',
          headers: { Authorization: `Token ${token}` }
        })
        if (!res.ok) {
          if (!cancelled) setEligible([])
          return
        }
        const data = await res.json()
        if (!cancelled) setEligible(Array.isArray(data?.eligible) ? data.eligible : [])
      } catch {
        if (!cancelled) setEligible([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [isLoading, token, isClient, providerProfileId])

  // Not logged in
  if (!isLoading && !token) {
    return (
      <div className="space-y-2">
        <Button asChild variant={variant} className={className}>
          <Link href={`/register?redirect=${redirect}`}>
            <Star className="h-4 w-4 mr-2" />
            Write a Review
          </Link>
        </Button>
        <p className="text-xs text-gray-500">
          Sign in as a client to review {providerName}.
        </p>
      </div>
    )
  }

  // Logged in, but not a client
  if (!isLoading && token && !isClient) {
    return (
      <div className="space-y-2">
        <Button asChild variant={variant} className={className}>
          <Link href={`/providers/${providerProfileId}/review`}>
            <Star className="h-4 w-4 mr-2" />
            Write a Review
          </Link>
        </Button>
        <p className="text-xs text-gray-500">
          Only clients can submit reviews. If you completed a job, sign in using the client account you used to request the service.
        </p>
      </div>
    )
  }

  // Logged in client
  const canReview = (eligible?.length || 0) > 0
  return (
    <div className="space-y-2">
      <Button asChild variant={variant} className={className}>
        <Link href={`/providers/${providerProfileId}/review`}>
          <Star className="h-4 w-4 mr-2" />
          {loading ? 'Checking…' : 'Write a Review'}
        </Link>
      </Button>
      <p className="text-xs text-gray-500">
        {loading
          ? 'Checking eligibility…'
          : canReview
            ? 'You can review this provider because you completed a job with them.'
            : `You can only review ${providerName} after a completed job.`}
      </p>
    </div>
  )
}

