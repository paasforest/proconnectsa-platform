import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Star, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How ProConnectSA Works
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Getting connected with verified service providers has never been easier. 
              Follow our simple 3-step process to find the perfect professional for your needs.
            </p>
          </div>
        </section>

        {/* Main Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Describe Your Job
                </h3>
                <p className="text-gray-600 mb-6">
                  Tell us what you need done, when you need it, your budget range, and any specific requirements. 
                  The more details you provide, the better we can match you with the right professionals.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Choose from 15+ service categories
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Set your budget range
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Specify urgency and timeline
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <Users className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Matched & Verified
                </h3>
                <p className="text-gray-600 mb-6">
                  Our system finds up to 3 verified professionals in your area who match your requirements. 
                  We verify your request via SMS to ensure quality and prevent spam.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SMS verification for quality
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Location-based matching
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Up to 3 qualified professionals
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Compare & Choose
                </h3>
                <p className="text-gray-600 mb-6">
                  Professionals will contact you directly with quotes and questions. 
                  Compare their profiles, reviews, and prices to choose the best fit for your project.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Direct contact from providers
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Compare quotes and reviews
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Choose the best professional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose ProConnectSA */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose ProConnectSA?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We make it easy, safe, and efficient to find the right service provider
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verified Professionals
                  </h3>
                  <p className="text-sm text-gray-600">
                    All providers are background checked and verified for your safety
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Fast Response
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get quotes within hours, not days. Most providers respond within 2 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Quality Reviews
                  </h3>
                  <p className="text-sm text-gray-600">
                    Read real reviews from previous customers to make informed decisions
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Local Experts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Connect with professionals in your area who know the local market
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of satisfied customers who have found their perfect service provider through ProConnectSA
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/request-quote">
                Request Your Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}












