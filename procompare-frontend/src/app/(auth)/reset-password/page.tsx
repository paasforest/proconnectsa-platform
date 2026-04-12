"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Manual URL parameter extraction to avoid prerendering issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setToken(params.get('token'))
    }
    setIsLoading(false)
  }, [])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setIsSuccess(true)
      toast.success("Password reset successfully!")
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/register')
      }, 3000)
      
    } catch (error) {
      toast.error("Failed to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-4">
        <Card className="w-full border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invalid reset link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please request a new password reset link from the sign-in page.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/register">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-4">
        <Card className="w-full border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Password reset successful
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been reset. You will be redirected to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/register">Continue to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-6">
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 mb-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <span className="font-bold text-2xl text-foreground">ProConnectSA</span>
        </Link>
      </div>
      <Card className="w-full border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button variant="link" asChild>
              <Link href="/register">Back to sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}