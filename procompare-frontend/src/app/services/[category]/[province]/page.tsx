import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BarkLeadForm from "@/components/leads/BarkLeadForm"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { fetchServiceCategories } from "@/lib/service-categories"
import { getProvinceBySlug } from "@/lib/seo-locations"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ category: string; province: string }> }

const SEO_PAGE_COPY: Record<
  string,
  {
    seoTitle: string
    metaDescription: string
    h1: string
    intro: string
    sections: Array<{ h2: string; body: string }>
    internalLinks: Array<{ href: string; text: string }>
  }
> = {
  "plumbing/gauteng": {
    seoTitle: "Plumbing in Gauteng: Free Quotes from Verified Pros",
    metaDescription:
      "Get plumbing in Gauteng sorted fast—request free quotes from verified professionals on ProConnectSA. Compare options with no obligation to hire.",
    h1: "Plumbing in Gauteng – Get Free Quotes from Verified Professionals",
    intro:
      "Finding a reliable plumber in Gauteng can feel urgent—burst pipes, a leaking geyser, blocked drains, or a sudden loss of water pressure rarely wait for “next week.” From high-density complexes in Johannesburg to family homes in Pretoria and new builds across fast-growing suburbs, plumbing problems can disrupt your day and damage your property quickly. ProConnectSA helps you request free quotes from verified professionals in Gauteng so you can compare options, response times, and experience before you choose. Submit your job once, confirm by SMS, and we’ll connect you with trusted providers who match your needs—without sharing your contact details publicly and with no obligation to hire.",
    sections: [
      {
        h2: "Common Plumbing Jobs in Gauteng",
        body:
          "Gauteng properties range from older brick homes with ageing pipework to modern townhouses with shared water lines and strict body corporate rules. That mix creates a few common plumbing requests in Gauteng. Geyser repairs and replacements are frequent, including pressure control valve issues, dripping overflow pipes, and burst geysers after power interruptions or temperature swings. Blocked drains and sewer lines are also common in Gauteng homes, restaurants, and office parks—often caused by grease build-up, tree roots, or older piping. Many customers need leak detection for concealed pipes behind walls or under paving, where small leaks can become expensive water loss and structural damage. In Gauteng multi-storey buildings, garden flats, and complexes, low water pressure and inconsistent hot water are regular call-outs. Summer downpours in Gauteng also trigger stormwater and drainage fixes—overflowing gutters, pooling water, and blocked channels. Renovations add their own needs, like moving water points, installing new basins and mixers, and checking compliance for insurance or resale.",
      },
      {
        h2: "How ProConnectSA Connects You with Trusted Plumbing Providers",
        body:
          "Start by describing your plumbing job—blocked drain, geyser replacement, leak detection, installation, or maintenance—along with your area in Gauteng and your preferred timing. We confirm your request with SMS verification to reduce spam and fake enquiries. Our matching logic then connects you with verified plumbing providers who serve your location and can handle the type of work you need. Your personal contact details aren’t posted publicly; providers only receive access once they’re matched and choose to purchase the lead, which helps prevent your phone from being flooded. You can compare quotes, ask questions, and choose who to hire. There’s no obligation to proceed if pricing, availability, or approach isn’t right for you.",
      },
      {
        h2: "Why Use ProConnectSA for Plumbing in Gauteng",
        body:
          "When you need plumbing in Gauteng, speed matters—but so does trust. ProConnectSA focuses on quality control by listing verified professionals and keeping requests tied to real customers through SMS verification. You’ll save time by submitting one request instead of calling around, and you’ll have clearer options to compare. Because providers are matched based on location and service fit in Gauteng, you’re more likely to get responses that make sense for your suburb, access rules, and property type. The process is transparent: you request free quotes, review the responses, and decide whether to hire. If you’re dealing with an urgent plumbing issue in Gauteng, fast responses and a structured process can reduce downtime and prevent further damage.",
      },
      {
        h2: "Pricing Expectations for Plumbing in Gauteng",
        body:
          "Plumbing pricing in Gauteng varies widely depending on the job type, access, parts, and urgency. For smaller repairs (like a leaking tap, toilet mechanism, or minor pipe fix), costs often depend on call-out fees, labour time, and whether parts are required. For larger work—geyser replacement, drain jetting, leak detection, or renovations—pricing is influenced by equipment needs, compliance requirements, and whether walls, paving, or ceilings must be opened and repaired afterwards. Your Gauteng location can also affect pricing if after-hours work, security access, parking, or travel time is involved. The best approach is to request a few quotes, confirm what’s included (labour, parts, VAT, guarantees), and choose the plumber who offers the right balance of experience, timeline, and value.",
      },
      {
        h2: "Get Free Quotes from Plumbing Providers in Gauteng",
        body:
          "If you need plumbing in Gauteng, request free quotes on ProConnectSA in minutes. Describe the issue, confirm by SMS, and we’ll connect you with verified professionals who can help. You’ll be able to compare options quickly, ask for clarity on pricing, and choose the provider that fits your timeline. It’s free to request quotes, there’s no obligation to hire, and your contact details stay protected throughout the process.",
      },
    ],
    internalLinks: [
      { href: "/services/plumbing", text: "You can also browse our main plumbing page at /services/plumbing." },
      {
        href: "/services/plumbing/western-cape",
        text: "If you’re outside Gauteng, we also help customers find plumbing providers in the Western Cape.",
      },
      {
        href: "/services/plumbing/kwazulu-natal",
        text: "For coastal areas, see plumbing in KwaZulu-Natal for region-specific needs and availability.",
      },
      {
        href: "/services/plumbing/eastern-cape",
        text: "We also support plumbing requests in the Eastern Cape if your property is based there.",
      },
    ],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, province } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const p = getProvinceBySlug(province)
  const name = c?.name || category
  const provinceName = p?.name || province

  const key = `${category}/${province}`
  const custom = SEO_PAGE_COPY[key]
  if (custom) {
    return {
      title: custom.seoTitle,
      description: custom.metaDescription,
    }
  }

  return {
    title: `${name} in ${provinceName} | Get Free Quotes | ProConnectSA`,
    description: `Compare free quotes from verified ${name.toLowerCase()} professionals in ${provinceName}. Fast matching and no obligation.`,
  }
}

export default async function ServiceProvincePage({ params }: Props) {
  const { category, province } = await params
  const categories = await fetchServiceCategories()
  const c = categories.find((x) => x.slug === category)
  const p = getProvinceBySlug(province)

  if (!p) return notFound()
  if (!c && categories.length) return notFound()

  const serviceName = c?.name || category
  const key = `${category}/${province}`
  const custom = SEO_PAGE_COPY[key]

  const faq = [
    {
      q: `How many ${serviceName.toLowerCase()} quotes will I get?`,
      a: "We’ll match you with up to 3 verified professionals based on your location and request.",
    },
    {
      q: "Is it free to request quotes?",
      a: "Yes — requesting quotes is free and there’s no obligation to hire.",
    },
    {
      q: "How fast do professionals respond?",
      a: "Many professionals respond within 24 hours, depending on demand in your area.",
    },
  ]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Services", item: "https://www.proconnectsa.co.za/services" },
      { "@type": "ListItem", position: 2, name: serviceName, item: `https://www.proconnectsa.co.za/services/${category}` },
      { "@type": "ListItem", position: 3, name: p.name, item: `https://www.proconnectsa.co.za/services/${category}/${province}` },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/services" className="hover:text-gray-900">
                  Services
                </Link>{" "}
                <span className="mx-2">/</span>
                <Link href={`/services/${category}`} className="hover:text-gray-900">
                  {serviceName}
                </Link>{" "}
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{p.name}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Get free quotes for {serviceName} in {p.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Compare quotes from verified professionals across {p.name}. Tell us what you need and get matched fast.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.topCities.map((city) => (
                  <span key={city} className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
              <div className="bg-white border rounded-2xl p-6">
                <BarkLeadForm preselectedCategory={category} />
              </div>
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Popular cities in {p.name}</div>
                  <p className="text-gray-600 text-sm mb-4">
                    We’ll match based on your suburb/city — these are common areas in {p.name}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.topCities.map((city) => (
                      <span key={city} className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-gray-700 bg-gray-50">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-3">FAQs</div>
                  <div className="space-y-3 text-sm">
                    {faq.map((x) => (
                      <div key={x.q}>
                        <div className="font-medium text-gray-900">{x.q}</div>
                        <div className="text-gray-600 mt-1">{x.a}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Are you a professional?</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Get customers in {p.name}. Only see leads in your services and areas.
                  </p>
                  <Link href="/for-pros" className="text-emerald-700 font-semibold hover:text-emerald-800">
                    Learn how it works →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {custom && (
          <section className="pb-14">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white border rounded-2xl p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{custom.h1}</h1>
                  <p className="mt-4 text-gray-700 leading-relaxed">{custom.intro}</p>

                  <div className="mt-8 space-y-8">
                    {custom.sections.map((s) => (
                      <div key={s.h2}>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{s.h2}</h2>
                        <p className="mt-3 text-gray-700 leading-relaxed">{s.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 border-t pt-6 space-y-3 text-sm text-gray-700">
                    {custom.internalLinks.map((l) => (
                      <p key={l.href}>
                        {l.text}{" "}
                        <Link className="text-emerald-700 font-semibold hover:text-emerald-800" href={l.href}>
                          {l.href}
                        </Link>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

