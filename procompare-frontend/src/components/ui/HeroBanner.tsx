import Image from 'next/image'
import { ReactNode } from 'react'

interface HeroBannerProps {
  image: string
  alt: string
  children: ReactNode
  overlay?: 'teal' | 'dark'
  size?: 'large' | 'medium' | 'small'
  priority?: boolean
}

export default function HeroBanner({
  image,
  alt,
  children,
  overlay = 'teal',
  size = 'medium',
  priority = false,
}: HeroBannerProps) {
  const heightClass =
    size === 'large'
      ? 'min-h-[70vh] md:min-h-[70vh]'
      : size === 'medium'
      ? 'h-[400px] md:h-[500px]'
      : 'h-[280px] md:h-[360px]'

  const overlayClass =
    overlay === 'teal'
      ? 'bg-teal/60'
      : 'bg-black/50'

  return (
    <div className={`relative w-full ${heightClass} flex items-center overflow-hidden`}>
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover object-center"
        priority={priority}
        sizes="100vw"
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
