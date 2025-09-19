"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { userStore } from "@/lib/user-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Eye, EyeOff, User, Building } from "lucide-react"

const registerSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+27[0-9]{9}$/, "Please enter a valid South African phone number (+27XXXXXXXXX)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  user_type: z.enum(["client", "provider"], {
    required_error: "Please select an account type",
  }),
  city: z.string().min(2, "City is required"),
  suburb: z.string().min(2, "Suburb is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: "client",
    },
  })

  const userType = watch("user_type")

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          user_type: data.user_type,
          city: data.city,
          suburb: data.suburb,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Registration failed")
        return
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Registration successful, but sign in failed. Please try signing in manually.")
      } else {
        // Redirect to dashboard after successful registration
        router.push("/dashboard")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join ProConnectSA</CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setValue("user_type", value as "client" | "provider")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>I need services</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="provider" id="provider" />
                    <Label htmlFor="provider" className="flex items-center space-x-2 cursor-pointer">
                      <Building className="h-4 w-4" />
                      <span>I provide services</span>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.user_type && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.user_type.message}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    {...register("first_name")}
                    disabled={isLoading}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    {...register("last_name")}
                    disabled={isLoading}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+27812345678"
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <select
                    id="city"
                    {...register("city")}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your city</option>
                    <optgroup label="Western Cape">
                      <option value="Cape Town">Cape Town</option>
                      <option value="Stellenbosch">Stellenbosch</option>
                      <option value="Paarl">Paarl</option>
                      <option value="George">George</option>
                      <option value="Mossel Bay">Mossel Bay</option>
                      <option value="Knysna">Knysna</option>
                      <option value="Oudtshoorn">Oudtshoorn</option>
                    </optgroup>
                    <optgroup label="Gauteng">
                      <option value="Johannesburg">Johannesburg</option>
                      <option value="Pretoria">Pretoria</option>
                      <option value="Sandton">Sandton</option>
                      <option value="Centurion">Centurion</option>
                      <option value="Midrand">Midrand</option>
                      <option value="Roodepoort">Roodepoort</option>
                      <option value="Germiston">Germiston</option>
                    </optgroup>
                    <optgroup label="KwaZulu-Natal">
                      <option value="Durban">Durban</option>
                      <option value="Pietermaritzburg">Pietermaritzburg</option>
                      <option value="Newcastle">Newcastle</option>
                      <option value="Richards Bay">Richards Bay</option>
                      <option value="Ballito">Ballito</option>
                    </optgroup>
                    <optgroup label="Eastern Cape">
                      <option value="Port Elizabeth">Port Elizabeth</option>
                      <option value="East London">East London</option>
                      <option value="Grahamstown">Grahamstown</option>
                      <option value="Uitenhage">Uitenhage</option>
                    </optgroup>
                    <optgroup label="Free State">
                      <option value="Bloemfontein">Bloemfontein</option>
                      <option value="Welkom">Welkom</option>
                      <option value="Bethlehem">Bethlehem</option>
                    </optgroup>
                    <optgroup label="Limpopo">
                      <option value="Polokwane">Polokwane</option>
                      <option value="Tzaneen">Tzaneen</option>
                      <option value="Lephalale">Lephalale</option>
                    </optgroup>
                    <optgroup label="Mpumalanga">
                      <option value="Nelspruit">Nelspruit</option>
                      <option value="Witbank">Witbank</option>
                      <option value="Secunda">Secunda</option>
                    </optgroup>
                    <optgroup label="North West">
                      <option value="Rustenburg">Rustenburg</option>
                      <option value="Potchefstroom">Potchefstroom</option>
                      <option value="Klerksdorp">Klerksdorp</option>
                    </optgroup>
                    <optgroup label="Northern Cape">
                      <option value="Kimberley">Kimberley</option>
                      <option value="Upington">Upington</option>
                      <option value="Kuruman">Kuruman</option>
                    </optgroup>
                  </select>
                  {errors.city && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb/Area</Label>
                  <Input
                    id="suburb"
                    placeholder="e.g. Sea Point, Sandton, Umhlanga"
                    {...register("suburb")}
                    disabled={isLoading}
                  />
                  {errors.suburb && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.suburb.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}














