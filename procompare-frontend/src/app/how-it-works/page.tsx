import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Search, UserCheck, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Three simple steps to find a verified service provider on ProConnectSA. No forms, no spam, no middlemen.',
}

const steps = [
  {
    number: '1',
    icon: <Search className="h-7 w-7 text-teal" />,
    title: 'Choose a category',
    body: 'Browse our service categories or search for what you need. Whether it is a locksmith at 2am or a renovation quote, start here.',
  },
  {
    number: '2',
    icon: <UserCheck className="h-7 w-7 text-teal" />,
    title: 'View verified providers',
    body: 'Read provider profiles to understand who they are, where they serve, and what they specialise in. No guessing.',
  },
  {
    number: '3',
    icon: <ExternalLink className="h-7 w-7 text-teal" />,
    title: 'Get in touch directly',
    body: 'Click through to the provider\'s own website to request a quote or book a service. You deal directly with them — no middlemen.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <div className="relative h-[260px] md:h-[340px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1600&auto=format&fit=crop&q=80"
          alt="Customer browsing services on a phone"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/65" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white">How it works</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Steps */}
        <div className="space-y-10 mb-16">
          {steps.map(step => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal flex items-center justify-center">
                <span className="font-heading font-bold text-2xl text-white">{step.number}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-teal-light rounded-lg p-2">{step.icon}</div>
                  <h2 className="font-heading font-bold text-xl text-gray-900">{step.title}</h2>
                </div>
                <p className="text-slate leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What we do NOT do */}
        <div className="bg-cream rounded-xl border border-mist p-8">
          <h2 className="font-heading font-bold text-2xl text-teal mb-5">What we do NOT do</h2>
          <ul className="space-y-3">
            {[
              'We do not sell your details to anyone.',
              'We do not flood you with quotes from random providers.',
              'We do not put 50 unverified handymen between you and the work.',
              'We do not take a cut of any transaction.',
              'We do not send you unsolicited marketing emails or calls.',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-gray-700">
                <span className="text-amber font-bold mt-0.5 flex-shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold px-8 py-4 rounded-md transition-colors text-base"
          >
            Browse services →
          </Link>
        </div>
      </div>
    </>
  )
}
