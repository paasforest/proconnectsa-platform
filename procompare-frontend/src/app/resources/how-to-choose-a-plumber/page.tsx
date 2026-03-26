import { resourceGuides } from '@/lib/resourceGuides'
import { ResourcePageTemplate } from '@/components/resources/ResourcePageTemplate'
import { notFound } from 'next/navigation'

const guide = resourceGuides.find((g) => g.slug === 'how-to-choose-a-plumber')

export const metadata = {
  title: guide?.metaTitle,
  description: guide?.metaDescription,
  alternates: {
    canonical: 'https://www.proconnectsa.co.za/resources/how-to-choose-a-plumber',
  },
  openGraph: {
    title: guide?.metaTitle,
    description: guide?.metaDescription,
    url: 'https://www.proconnectsa.co.za/resources/how-to-choose-a-plumber',
    siteName: 'ProConnectSA',
    type: 'article',
  },
}

export default function Page() {
  if (!guide) return notFound()
  return <ResourcePageTemplate guide={guide} />
}
