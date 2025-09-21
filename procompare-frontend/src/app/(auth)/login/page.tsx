"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const router = useRouter()

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp}: ${message}`
    console.log(`🔍 ${logMessage}`)
    setDebugLogs(prev => [...prev, logMessage])
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError("")
    setDebugLogs([])
    
    try {
      addDebugLog('🚀 FRONTEND LOGIN START')
      addDebugLog(`📝 Form data: email=${data.email}, password=${'*'.repeat(data.password.length)}`)

      // Step 1: Check if NextAuth is properly loaded
      addDebugLog('🔍 Step 1: Checking NextAuth availability...')
      if (typeof signIn !== 'function') {
        throw new Error('NextAuth signIn function is not available')
      }
      addDebugLog('✅ NextAuth signIn function is available')

      // Step 2: Check network connectivity
      addDebugLog('🔍 Step 2: Testing network connectivity...')
      try {
        const testResponse = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        const healthData = await testResponse.json()
        addDebugLog(`📡 Health check response: ${testResponse.status}`)
        addDebugLog(`🏥 Health data: ${JSON.stringify(healthData)}`)
      } catch (error: any) {
        addDebugLog(`⚠️ Health check failed: ${error.message}`)
      }

      // Step 3: Check NextAuth API endpoints
      addDebugLog('🔍 Step 3: Testing NextAuth API endpoints...')
      
      // Test providers endpoint
      try {
        const providersResponse = await fetch('/api/auth/providers', {
          signal: AbortSignal.timeout(10000)
        })
        addDebugLog(`📡 Providers endpoint status: ${providersResponse.status}`)
        if (providersResponse.ok) {
          const providers = await providersResponse.json()
          addDebugLog(`📡 Available providers: ${Object.keys(providers).join(', ')}`)
        } else {
          addDebugLog(`❌ Providers endpoint failed: ${providersResponse.statusText}`)
        }
      } catch (error: any) {
        addDebugLog(`❌ Providers endpoint error: ${error.message}`)
      }

      // Test session endpoint
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          signal: AbortSignal.timeout(10000)
        })
        addDebugLog(`📡 Session endpoint status: ${sessionResponse.status}`)
      } catch (error: any) {
        addDebugLog(`❌ Session endpoint error: ${error.message}`)
      }

      // Step 4: Test CSRF token
      addDebugLog('🔍 Step 4: Testing CSRF token...')
      try {
        const csrfResponse = await fetch('/api/auth/csrf', {
          signal: AbortSignal.timeout(10000)
        })
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json()
          addDebugLog(`🔐 CSRF token received: ${csrfData.csrfToken ? 'Yes' : 'No'}`)
        }
      } catch (error: any) {
        addDebugLog(`⚠️ CSRF token error: ${error.message}`)
      }

      // Step 5: Attempt NextAuth signIn with timeout
      addDebugLog('🔍 Step 5: Calling NextAuth signIn...')
      addDebugLog(`📤 Credentials: email=${data.email}, provider=credentials`)

      // Create a promise that rejects after 30 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignIn timeout after 30 seconds')), 30000)
      )

      // Race the signIn call against the timeout
      const signInPromise = signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Very important!
      })

      addDebugLog('⏳ Waiting for NextAuth signIn response...')
      
      const result = await Promise.race([signInPromise, timeoutPromise])
      
      addDebugLog('✅ NextAuth signIn completed!')
      addDebugLog(`📥 SignIn result: ${JSON.stringify(result, null, 2)}`)

      // Step 6: Analyze the result
      if (!result) {
        addDebugLog('❌ SignIn returned null/undefined')
        throw new Error('SignIn returned no result')
      }

      if (result.error) {
        addDebugLog(`❌ SignIn error: ${result.error}`)
        setError(`Authentication failed: ${result.error}`)
        return
      }

      if (result.ok) {
        addDebugLog('✅ Authentication successful!')
        
        // Step 7: Verify session was created
        addDebugLog('🔍 Step 7: Verifying session...')
        const session = await getSession()
        addDebugLog(`👤 Session data: ${JSON.stringify(session, null, 2)}`)
        
        if (session?.user) {
          addDebugLog('🎉 Login process completed successfully!')
          router.push('/dashboard')
        } else {
          addDebugLog('⚠️ Session not created despite successful signIn')
        }
      } else {
        addDebugLog(`❌ SignIn not successful: ok=${result.ok}, status=${result.status}`)
        setError('Login failed. Please try again.')
      }

    } catch (error: any) {
      addDebugLog(`💥 CRITICAL ERROR: ${error.message}`)
      addDebugLog(`📍 Error stack: ${error.stack}`)
      
      // Additional error context
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        addDebugLog('🔍 Network Error Diagnosis:')
        addDebugLog('- Check if Next.js dev server is running')
        addDebugLog('- Verify /api/auth/[...nextauth]/route.ts file exists')
        addDebugLog('- Check browser network tab for failed requests')
        addDebugLog('- Verify NEXTAUTH_URL environment variable')
      }
      
      setError('An unexpected error occurred. Please try again.')
      
    } finally {
      setIsLoading(false)
      addDebugLog('🏁 FRONTEND LOGIN END')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-2xl">
              <span className="text-emerald-600">ProConnect</span>
              <span className="text-gray-900">SA</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Debug Panel */}
        {debugLogs.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Debug Logs:</h3>
            <div className="text-xs space-y-1 max-h-96 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`font-mono ${
                    log.includes('❌') || log.includes('💥') ? 'text-red-600' : 
                    log.includes('✅') || log.includes('🎉') ? 'text-green-600' : 
                    log.includes('⚠️') ? 'text-yellow-600' : 
                    'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}














