"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { PROVINCES } from "@/lib/seo-locations"
import { MAJOR_CITIES } from "@/lib/seo-cities"

const TOP_SERVICES = [
  { slug: "plumbing", name: "Plumbing" },
  { slug: "electrical", name: "Electrical" },
  { slug: "cleaning", name: "Cleaning" },
  { slug: "painting", name: "Painting" },
  { slug: "handyman", name: "Handyman" },
  { slug: "hvac", name: "HVAC" },
  { slug: "landscaping", name: "Landscaping" },
  { slug: "solar-installation", name: "Solar Installation" },
]

const TOP_CITIES = MAJOR_CITIES.slice(0, 20)

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl">ProConnectSA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with verified service providers across South Africa. Get quotes, read reviews, and hire the best professionals for your home and business needs.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              {TOP_SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link 
                    href={`/services/${service.slug}`} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  All services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/providers/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Providers
                </Link>
              </li>
              <li>
                <Link href="/for-pros" className="text-muted-foreground hover:text-foreground transition-colors">
                  For Providers
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-foreground transition-colors">
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h3 className="font-semibold">Find Services By Province</h3>
            <ul className="space-y-2 text-sm">
              {PROVINCES.map((province) => (
                <li key={province.slug}>
                  <Link 
                    href={province.slug === "gauteng" 
                      ? `/gauteng/local-services` 
                      : `/services/plumbing/${province.slug}`
                    } 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {province.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Popular Services by Province:</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                <Link href="/services/electrical/gauteng" className="text-muted-foreground hover:text-foreground transition-colors">Electrical (Gauteng)</Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/services/electrical/kwazulu-natal" className="text-muted-foreground hover:text-foreground transition-colors">Electrical (KZN)</Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/services/handyman/western-cape" className="text-muted-foreground hover:text-foreground transition-colors">Handyman (WC)</Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/services/painting/northern-cape" className="text-muted-foreground hover:text-foreground transition-colors">Painting (NC)</Link>
              </div>
            </div>
            <div className="pt-3 border-t">
              <h4 className="font-semibold text-xs mb-2">Popular Cities</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {TOP_CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}/plumbing`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  South Africa
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  +27 67 951 8124
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  support@proconnectsa.co.za
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 ProConnectSA. All rights reserved. | Proudly South African 🇿🇦
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/providers" className="text-muted-foreground hover:text-foreground transition-colors">For Providers</Link>
              <span className="text-muted-foreground">|</span>
              <span className="inline-flex items-center rounded-full bg-green-50 text-green-800 px-3 py-1 border border-green-200">
                SARS Registered
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-800 px-3 py-1 border border-blue-200">
                CIPC Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}














