import { resourceGuides } from '@/lib/resourceGuides'
import { ResourcePageTemplate } from '@/components/resources/ResourcePageTemplate'
import { notFound } from 'next/navigation'

const guide = resourceGuides.find((g) => g.slug === 'painting-cost-durban')

export const metadata = {
  title: guide?.metaTitle,
  description: guide?.metaDescription,
  alternates: {
    canonical: 'https://www.proconnectsa.co.za/resources/painting-cost-durban',
  },
  openGraph: {
    title: guide?.metaTitle,
    description: guide?.metaDescription,
    url: 'https://www.proconnectsa.co.za/resources/painting-cost-durban',
    siteName: 'ProConnectSA',
    type: 'article',
  },
}

export default function Page() {
  if (!guide) return notFound()
  return <ResourcePageTemplate guide={guide} />
}
