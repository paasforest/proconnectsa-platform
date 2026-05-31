import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface ProvinceCardProps {
  name: string
  slug: string
  liveCategories: number
}

export default function ProvinceCard({ name, slug, liveCategories }: ProvinceCardProps) {
  return (
    <Link
      href={`/${slug}/local-services`}
      className="group flex items-center gap-3 bg-white rounded-lg border border-mist p-4 hover:border-teal hover:shadow-sm transition-all duration-200"
    >
      <div className="flex-shrink-0 w-9 h-9 bg-teal-light rounded-lg flex items-center justify-center group-hover:bg-teal transition-colors">
        <MapPin className="h-4 w-4 text-teal group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="font-heading font-medium text-gray-900 text-sm group-hover:text-teal transition-colors">
          {name}
        </h3>
        <p className="text-xs text-slate mt-0.5">
          {liveCategories} live {liveCategories === 1 ? 'category' : 'categories'}
        </p>
      </div>
    </Link>
  )
}
