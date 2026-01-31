"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

/**
 * Redirect old /request-quote/[category] URLs to new SEO-friendly /services/[category] route
 */
export default function RequestQuoteCategoryRedirect() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string

  useEffect(() => {
    if (category) {
      // Redirect to new SEO route
      router.replace(`/services/${category}`)
    } else {
      // Fallback to services hub
      router.replace('/services')
    }
  }, [category, router])

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
