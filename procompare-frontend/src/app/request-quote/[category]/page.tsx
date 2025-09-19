"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

const leadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.string().min(1, "Budget is required"),
  urgency: z.enum(["low", "medium", "high"]),
  preferred_date: z.string().min(1, "Preferred date is required"),
  location: z.string().min(1, "Location is required"),
  contact_phone: z.string().min(10, "Valid phone number is required"),
  contact_email: z.string().email("Valid email is required"),
  additional_notes: z.string().optional(),
})

type LeadForm = z.infer<typeof leadSchema>

const serviceCategories = {
  plumbing: {
    name: "Plumbing",
    icon: "🔧",
    description: "Repairs, installations, maintenance",
    popularServices: ["Leak repairs", "Pipe installation", "Drain cleaning", "Water heater service"]
  },
  electrical: {
    name: "Electrical",
    icon: "⚡",
    description: "Wiring, installations, repairs",
    popularServices: ["Outlet installation", "Light fixture repair", "Circuit breaker service", "Wiring upgrades"]
  },
  painting: {
    name: "Painting",
    icon: "🎨",
    description: "Interior, exterior, commercial",
    popularServices: ["Interior painting", "Exterior painting", "Cabinet refinishing", "Color consultation"]
  },
  cleaning: {
    name: "Cleaning",
    icon: "🧹",
    description: "House, office, deep cleaning",
    popularServices: ["House cleaning", "Office cleaning", "Deep cleaning", "Move-in/out cleaning"]
  },
  gardening: {
    name: "Gardening",
    icon: "🌱",
    description: "Landscaping, maintenance, design",
    popularServices: ["Garden design", "Lawn maintenance", "Tree trimming", "Irrigation installation"]
  },
  carpentry: {
    name: "Carpentry",
    icon: "🔨",
    description: "Custom work, repairs, installations",
    popularServices: ["Custom furniture", "Door installation", "Shelf building", "Deck construction"]
  },
  roofing: {
    name: "Roofing",
    icon: "🏠",
    description: "Repairs, installations, maintenance",
    popularServices: ["Roof repairs", "Gutter cleaning", "Shingle replacement", "Leak detection"]
  },
  "pool-maintenance": {
    name: "Pool Maintenance",
    icon: "🏊",
    description: "Cleaning, repairs, chemical balancing",
    popularServices: ["Pool cleaning", "Chemical balancing", "Equipment repair", "Pool opening/closing"]
  },
  "appliance-repair": {
    name: "Appliance Repair",
    icon: "🔧",
    description: "Washing machines, fridges, ovens",
    popularServices: ["Washing machine repair", "Refrigerator service", "Oven repair", "Dishwasher maintenance"]
  },
  "general-maintenance": {
    name: "General Maintenance",
    icon: "🛠️",
    description: "Handyman services, repairs",
    popularServices: ["General repairs", "Assembly services", "Installation help", "Maintenance tasks"]
  },
  security: {
    name: "Security",
    icon: "🔒",
    description: "Alarms, cameras, access control",
    popularServices: ["Security system installation", "Camera setup", "Access control", "Alarm maintenance"]
  },
  "cleaning-services": {
    name: "Cleaning Services",
    icon: "✨",
    description: "Professional cleaning services",
    popularServices: ["Residential cleaning", "Commercial cleaning", "Specialized cleaning", "Regular maintenance"]
  }
}

export default function RequestQuotePage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const serviceInfo = serviceCategories[category as keyof typeof serviceCategories]

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  })

  const onSubmit = async (data: LeadForm) => {
    setIsSubmitting(true)
    
    try {
      // Create lead with the selected category
      const leadData = {
        ...data,
        category: category,
        budget: parseFloat(data.budget),
        user_type: 'client'
      }

      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Quote request submitted successfully!")
      toast.info("You'll receive quotes from up to 3 verified providers within 24 hours")
      
      // Redirect to success page or dashboard
      router.push(`/request-quote/success?category=${category}`)
      
    } catch (error) {
      console.error('Error submitting lead:', error)
      toast.error("Failed to submit quote request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!serviceInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The service category you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/request-quote')}>
            Browse All Services
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{serviceInfo.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Request {serviceInfo.name} Quote
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {serviceInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Project Details</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Contact Info</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Review & Submit</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Project Details</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your {serviceInfo.name.toLowerCase()} project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder={`e.g., ${serviceInfo.popularServices[0]}`}
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail. Include any specific requirements, materials, or preferences..."
                    rows={4}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => setValue("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">Under R500</SelectItem>
                        <SelectItem value="1000">R500 - R1,000</SelectItem>
                        <SelectItem value="2500">R1,000 - R2,500</SelectItem>
                        <SelectItem value="5000">R2,500 - R5,000</SelectItem>
                        <SelectItem value="10000">R5,000 - R10,000</SelectItem>
                        <SelectItem value="25000">R10,000 - R25,000</SelectItem>
                        <SelectItem value="50000">R25,000+</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.budget && (
                      <p className="text-sm text-red-600">{errors.budget.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <RadioGroup onValueChange={(value) => setValue("urgency", value as "low" | "medium" | "high")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="flex items-center space-x-2">
                          <span>Low</span>
                          <span className="text-xs text-muted-foreground">(Within a month)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="flex items-center space-x-2">
                          <span>Medium</span>
                          <span className="text-xs text-muted-foreground">(Within 2 weeks)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="flex items-center space-x-2">
                          <span>High</span>
                          <span className="text-xs text-muted-foreground">(ASAP/Urgent)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.urgency && (
                      <p className="text-sm text-red-600">{errors.urgency.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred Start Date</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      {...register("preferred_date")}
                    />
                    {errors.preferred_date && (
                      <p className="text-sm text-red-600">{errors.preferred_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Sea Point, Cape Town"
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additional_notes"
                    placeholder="Any additional information, special requirements, or questions..."
                    rows={3}
                    {...register("additional_notes")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How should providers contact you?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="+27 82 123 4567"
                      {...register("contact_phone")}
                    />
                    {errors.contact_phone && (
                      <p className="text-sm text-red-600">{errors.contact_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email Address</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("contact_email")}
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-600">{errors.contact_email.message}</p>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Privacy Notice:</strong> Your contact information will only be shared with verified providers who submit quotes for your project. You can choose which providers to contact.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Request</CardTitle>
                <CardDescription>
                  Please review your information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{watch("title")}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{watch("description")}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Budget: R{watch("budget")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Urgency: {watch("urgency")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Start: {watch("preferred_date")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>{watch("location")}</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>What happens next?</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• We'll match you with up to 3 verified {serviceInfo.name.toLowerCase()} professionals</li>
                      <li>• You'll receive quotes within 24 hours</li>
                      <li>• Compare quotes and choose the best provider</li>
                      <li>• No obligation - you're not committed until you accept a quote</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Quote Request"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}










