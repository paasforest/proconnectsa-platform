import type { Metadata } from 'next'
import { Mail, MessageCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact ProConnectSA',
  description: 'Get in touch with ProConnectSA. Questions, provider enquiries, or anything else — reach out directly.',
}

const contacts = [
  {
    icon: <Mail className="h-6 w-6 text-teal" />,
    label: 'Email',
    value: 'hello@proconnectsa.co.za',
    href: 'mailto:hello@proconnectsa.co.za',
    desc: 'We respond within one business day.',
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-teal" />,
    label: 'WhatsApp',
    value: '077 438 8845',
    href: 'https://wa.me/27774388845',
    desc: 'The fastest way to reach us.',
    external: true,
  },
  {
    icon: <Phone className="h-6 w-6 text-teal" />,
    label: 'Phone',
    value: '077 438 8845',
    href: 'tel:+27774388845',
    desc: 'Available Monday – Friday, 8am – 5pm.',
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading font-bold text-4xl md:text-5xl text-teal mb-3">Get in touch</h1>
      <p className="text-slate text-lg mb-12 leading-relaxed">
        Questions about ProConnectSA or interested in joining as a provider? Reach out directly — no bots, no tickets, just a real person.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contacts.map(c => (
          <a
            key={c.label}
            href={c.href}
            {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group block bg-white rounded-xl border border-mist p-6 hover:border-teal hover:shadow-sm transition-all duration-200"
          >
            <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal transition-colors">
              <span className="group-hover:[&>*]:text-white transition-colors">{c.icon}</span>
            </div>
            <h3 className="font-heading font-semibold text-gray-900 mb-1 group-hover:text-teal transition-colors">
              {c.label}
            </h3>
            <p className="text-teal font-medium text-sm mb-2">{c.value}</p>
            <p className="text-slate text-xs">{c.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
