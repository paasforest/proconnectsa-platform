'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MessageCircle } from 'lucide-react'

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Browse Providers', href: '/providers/browse' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-teal-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-xl text-teal tracking-tight">
            ProConnectSA
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-teal transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* WhatsApp + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/27774388845"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-teal hover:text-teal-dark transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-teal"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-mist bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-teal-light hover:text-teal transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
