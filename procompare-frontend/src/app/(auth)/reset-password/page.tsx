'use client'

import React, { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setToken(params.get('token'))
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        {token ? (
          <p className="text-green-600">Token found: {token.substring(0, 10)}...</p>
        ) : (
          <p className="text-red-600">No token found</p>
        )}
        <p className="text-center">Password reset functionality coming soon...</p>
      </div>
    </div>
  )
}