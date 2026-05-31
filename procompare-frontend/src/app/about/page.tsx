import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About ProConnectSA',
  description: 'What ProConnectSA is, how we verify providers, and why we built an honest referral directory for South Africa.',
}

export default function AboutPage() {
  return (
    <>
      <div className="relative h-[260px] md:h-[340px] flex items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop&q=80"
          alt="South African professionals meeting"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal/65" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white">About ProConnectSA</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <section>
          <h2 className="font-heading font-bold text-2xl text-teal mb-4">What we are</h2>
          <p className="text-gray-700 leading-relaxed">
            ProConnectSA is a directory of verified service providers across South Africa. We do not provide services ourselves — we connect customers with established specialists in each category. When you find a provider on ProConnectSA, you are taken directly to that provider's own website to enquire, book, or get a quote.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-2xl text-teal mb-4">How we are different</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Most lead generation platforms collect your details and sell them to multiple providers at once. You fill in a form, your number goes to five different businesses, and you spend the next two days fielding calls.
          </p>
          <p className="text-gray-700 leading-relaxed">
            ProConnectSA does not work that way. We do not collect your details. We do not take commissions. We do not flood you with quotes from random people. We show you who the specialist is, explain what they do, and send you directly to them.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-2xl text-teal mb-4">Our standard for "verified"</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            When we say "verified", we mean:
          </p>
          <ul className="space-y-2 text-gray-700">
            {[
              'The provider is a real, registered business — not a freelancer or informal trader',
              'They have a working website and real contact details',
              'They have a demonstrable track record in their category',
              'We have reviewed their service offering and it is what they claim',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-teal font-bold mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-2xl text-teal mb-4">Get in touch</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Questions about ProConnectSA, or interested in having your business listed? Reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:hello@proconnectsa.co.za"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <Mail className="h-4 w-4" /> Email us
            </a>
            <a
              href="https://wa.me/27774388845"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-teal text-teal hover:bg-teal-light font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
