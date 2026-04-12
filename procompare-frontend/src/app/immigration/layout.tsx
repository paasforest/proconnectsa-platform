import type { Metadata } from "next"
import { siteUrl } from "@/lib/seo-site"

const canonical = siteUrl("/immigration")

export const metadata: Metadata = {
  title: "Immigration Services South Africa | Visa Help & Applications | ProConnectSA",
  description:
    "Plan your move from South Africa: visa pathways, document prep, typical costs, and FAQs. Use our hub to explore options and connect to structured immigration tools.",
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Immigration Services South Africa | Visa Help & Applications | ProConnectSA",
    description:
      "Visa pathways, process overview, pricing context, and FAQs for South Africans planning to work or study abroad.",
    url: canonical,
    siteName: "ProConnectSA",
    type: "website",
    locale: "en_ZA",
  },
}

export default function ImmigrationLayout({ children }: { children: React.ReactNode }) {
  return children
}
