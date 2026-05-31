import { ExternalLink } from 'lucide-react'

interface ExternalCtaButtonProps {
  href: string
  label: string
  size?: 'default' | 'large'
  className?: string
}

export default function ExternalCtaButton({ href, label, size = 'default', className = '' }: ExternalCtaButtonProps) {
  const sizeClasses = size === 'large'
    ? 'px-8 py-4 text-base'
    : 'px-6 py-3 text-sm'

  return (
    <div className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold rounded-md transition-colors duration-200 ${sizeClasses} w-full justify-center`}
      >
        {label}
        <ExternalLink className="h-4 w-4" />
      </a>
      <p className="text-center text-xs text-slate mt-1.5">Opens in a new tab</p>
    </div>
  )
}
