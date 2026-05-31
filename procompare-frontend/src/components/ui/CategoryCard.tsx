import Image from 'next/image'
import Link from 'next/link'
import { KeyRound, Package, Hammer, Plane, Droplet, Zap, Sparkles, Paintbrush, Wrench, Wind, Trees } from 'lucide-react'
import { Category } from '@/lib/categories'

const iconMap: Record<string, React.ReactNode> = {
  KeyRound: <KeyRound className="h-5 w-5 text-teal" />,
  Package: <Package className="h-5 w-5 text-teal" />,
  Hammer: <Hammer className="h-5 w-5 text-teal" />,
  Plane: <Plane className="h-5 w-5 text-teal" />,
  Droplet: <Droplet className="h-5 w-5 text-teal" />,
  Zap: <Zap className="h-5 w-5 text-teal" />,
  Sparkles: <Sparkles className="h-5 w-5 text-teal" />,
  Paintbrush: <Paintbrush className="h-5 w-5 text-teal" />,
  Wrench: <Wrench className="h-5 w-5 text-teal" />,
  Wind: <Wind className="h-5 w-5 text-teal" />,
  Trees: <Trees className="h-5 w-5 text-teal" />,
}

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const icon = iconMap[category.icon] ?? iconMap['Wrench']
  const isLive = category.status === 'live'

  return (
    <div className="group bg-white rounded-lg border border-mist overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={category.bannerImage}
          alt={category.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Icon overlay */}
        <div className="absolute bottom-3 left-3 bg-white rounded-full p-2 shadow-sm">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-medium text-lg text-gray-900 mb-1">{category.name}</h3>
        <p className="text-sm text-slate leading-snug mb-3">{category.description}</p>

        {isLive ? (
          <Link
            href={`/services/${category.slug}`}
            className="text-sm font-medium text-amber hover:text-amber-dark transition-colors"
          >
            View providers →
          </Link>
        ) : (
          <span className="inline-block text-xs font-medium text-amber/60 bg-amber/10 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        )}
      </div>
    </div>
  )
}
