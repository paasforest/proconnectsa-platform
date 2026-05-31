import Link from 'next/link'
import { CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import { Provider } from '@/lib/providers'

interface ProviderCardProps {
  provider: Provider
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      href={`/provider/${provider.slug}`}
      className="group block bg-white rounded-lg border border-mist p-6 hover:shadow-md hover:border-teal/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-light text-teal font-heading font-bold text-sm">
              {provider.logoText}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-lg text-gray-900 group-hover:text-teal transition-colors">
            {provider.name}
          </h3>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-teal bg-teal-light px-2 py-1 rounded-full">
          <CheckCircle className="h-3 w-3" /> Verified
        </span>
      </div>

      <p className="text-sm text-slate leading-snug mb-4">{provider.tagline}</p>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        {provider.responseTime && (
          <div className="flex items-center gap-2 text-xs text-slate">
            <Clock className="h-3.5 w-3.5 text-teal flex-shrink-0" />
            {provider.responseTime}
          </div>
        )}
        <div className="flex items-start gap-2 text-xs text-slate">
          <MapPin className="h-3.5 w-3.5 text-teal flex-shrink-0 mt-0.5" />
          <span>{provider.areasServed.slice(0, 3).join(', ')}{provider.areasServed.length > 3 ? ` +${provider.areasServed.length - 3} more` : ''}</span>
        </div>
      </div>

      <div className="flex items-center text-sm font-medium text-amber group-hover:text-amber-dark transition-colors">
        View profile <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
