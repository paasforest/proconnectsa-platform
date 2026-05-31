import Link from 'next/link'
import { MessageCircle, Mail, Phone } from 'lucide-react'
import { getLiveCategories } from '@/lib/categories'

const liveCategories = getLiveCategories()

const provinces = [
  { name: 'Gauteng', slug: 'gauteng' },
  { name: 'Western Cape', slug: 'western-cape' },
  { name: 'KwaZulu-Natal', slug: 'kwazulu-natal' },
  { name: 'Eastern Cape', slug: 'eastern-cape' },
  { name: 'Limpopo', slug: 'limpopo' },
  { name: 'Mpumalanga', slug: 'mpumalanga' },
  { name: 'North West', slug: 'north-west' },
  { name: 'Free State', slug: 'free-state' },
  { name: 'Northern Cape', slug: 'northern-cape' },
]

export default function Footer() {
  return (
    <footer className="bg-teal-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-3">ProConnectSA</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              South Africa's trusted directory for verified service providers. Find locksmiths, couriers, renovation specialists, and immigration consultants.
            </p>
            <div className="space-y-2">
              <a href="mailto:hello@proconnectsa.co.za" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Mail className="h-4 w-4" /> hello@proconnectsa.co.za
              </a>
              <a href="tel:+27774388845" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> 077 438 8845
              </a>
              <a href="https://wa.me/27774388845" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-white/50 mb-3">Services</h4>
            <ul className="space-y-2">
              {liveCategories.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/services/${cat.slug}`} className="text-sm text-white/70 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm text-white/50 hover:text-white transition-colors">
                  All categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Provinces */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-white/50 mb-3">Provinces</h4>
            <ul className="space-y-2">
              {provinces.map(p => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}/local-services`} className="text-sm text-white/70 hover:text-white transition-colors">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-white/50 mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Browse Providers', href: '/providers/browse' },
                { label: 'Contact', href: '/contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} ProConnectSA. All rights reserved.
          </p>
          <p className="text-white/50 text-xs">Proudly South African 🇿🇦</p>
        </div>
      </div>
    </footer>
  )
}
