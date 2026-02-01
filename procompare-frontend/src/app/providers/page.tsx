import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Award, 
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard
} from "lucide-react"

export default function ProvidersPage() {
  const featuredProviders = [
    {
      name: "Cape Town Plumbing Solutions",
      category: "Plumbing",
      rating: 4.9,
      reviews: 127,
      location: "Cape Town CBD",
      description: "Professional plumbing services with 15+ years experience. Specializing in residential and commercial plumbing solutions.",
      verified: true,
      responseTime: "2 hours",
      completionRate: 98,
      startingPrice: "R500"
    },
    {
      name: "Elite Electrical Services",
      category: "Electrical",
      rating: 4.8,
      reviews: 89,
      location: "Bellville",
      description: "Certified electricians providing safe and reliable electrical installations, repairs, and maintenance services.",
      verified: true,
      responseTime: "1 hour",
      completionRate: 96,
      startingPrice: "R400"
    },
    {
      name: "Perfect Paint Professionals",
      category: "Painting",
      rating: 4.7,
      reviews: 156,
      location: "Sea Point",
      description: "Interior and exterior painting specialists. Quality workmanship with attention to detail and customer satisfaction.",
      verified: true,
      responseTime: "3 hours",
      completionRate: 94,
      startingPrice: "R800"
    },
    {
      name: "Green Gardens Landscaping",
      category: "Gardening",
      rating: 4.9,
      reviews: 73,
      location: "Constantia",
      description: "Garden design, maintenance, and landscaping services. Creating beautiful outdoor spaces that last.",
      verified: true,
      responseTime: "4 hours",
      completionRate: 97,
      startingPrice: "R600"
    },
    {
      name: "SecureHome Solutions",
      category: "Security",
      rating: 4.8,
      reviews: 45,
      location: "Claremont",
      description: "Comprehensive security solutions including alarms, CCTV, and access control systems for homes and businesses.",
      verified: true,
      responseTime: "2 hours",
      completionRate: 99,
      startingPrice: "R1,200"
    },
    {
      name: "Crystal Clean Services",
      category: "Cleaning",
      rating: 4.6,
      reviews: 203,
      location: "Rondebosch",
      description: "Professional cleaning services for homes and offices. Reliable, thorough, and eco-friendly cleaning solutions.",
      verified: true,
      responseTime: "1 hour",
      completionRate: 92,
      startingPrice: "R300"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                How Our Matching Works
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We don't let you browse providers directly. Instead, we use smart matching to connect you with the best verified professionals for your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/services">Submit Service Request</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/how-it-works">Learn How It Works</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/providers/browse">Browse Verified Providers</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Provider Benefits */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose ProConnectSA Providers?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                Every provider on our platform meets strict quality and safety standards
              </p>
              <Link 
                href="/providers/browse" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View all verified pros <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verified & Licensed
                  </h3>
                  <p className="text-sm text-gray-600">
                    Background checked and properly licensed
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Highly Rated
                  </h3>
                  <p className="text-sm text-gray-600">
                    Rated by real customers
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
                    Quick response times guaranteed
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Quality Work
                  </h3>
                  <p className="text-sm text-gray-600">
                    High completion rates and satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Matching Process */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Smart Matching Process
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We use advanced algorithms to match you with the best providers for your specific needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                        </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Submit Your Request
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Tell us what you need, when you need it, and your budget. We'll verify your request and prepare it for matching.
                </p>
                    </div>
                    
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                      </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Smart Matching
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our system analyzes your request and matches it with verified providers who specialize in your type of project and serve your area.
                </p>
                      </div>
                      
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                        </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Receive Quotes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed quotes from multiple verified providers. Compare prices, reviews, and choose the best option for your needs.
                </p>
                    </div>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link href="/services">
                  Start Your Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Join as Provider */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Are You a Service Provider?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join our network of verified professionals and grow your business with quality leads from customers in your area.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-semibold mb-2">Quality Leads</h3>
                  <p className="opacity-90">Get matched with customers actively looking for your services</p>
                </div>
                
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-semibold mb-2">Verified Platform</h3>
                  <p className="opacity-90">Join a trusted platform that verifies both providers and customers</p>
                </div>
                
                <div className="text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-semibold mb-2">Flexible Pricing</h3>
                  <p className="opacity-90">Pay only for leads you want to pursue with our credit system</p>
                </div>
              </div>
              
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register?type=provider">
                  Join as Provider
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}












