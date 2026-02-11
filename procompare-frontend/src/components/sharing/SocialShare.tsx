'use client'

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  className?: string
}

export function SocialShare({ url, title, description, className = "" }: SocialShareProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareTitle = title || 'ProConnectSA - Find Trusted Local Service Providers'
  const shareDescription = description || 'Compare quotes from verified professionals across South Africa'

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer')}
        className="h-8 w-8 p-0"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer')}
        className="h-8 w-8 p-0"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer')}
        className="h-8 w-8 p-0"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="h-8 w-8 p-0"
        title="Share via native share or copy link"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
