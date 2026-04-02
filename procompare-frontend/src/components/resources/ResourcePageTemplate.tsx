'use client'

import type { ResourceGuide } from '@/lib/resourceGuides'
import { resourceGuides } from '@/lib/resourceGuides'
import Link from 'next/link'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

type InlineLinkRule = { key: string; pattern: RegExp; href: string }

function phraseToPattern(phrase: string): RegExp {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b(${escaped})\\b`, 'i')
}

function linkifyFirstOccurrences(
  text: string,
  state: { used: Set<string> },
  rules: InlineLinkRule[] | undefined,
): ReactNode {
  if (!text) return null
  const safeRules = rules ?? []
  if (!safeRules.length) return text
  let best: { key: string; index: number; match: RegExpMatchArray; href: string } | null = null
  for (const { key, pattern, href } of safeRules) {
    if (state.used.has(key)) continue
    const m = text.match(pattern)
    if (m && m.index !== undefined) {
      if (!best || m.index < best.index) {
        best = { key, index: m.index, match: m, href }
      }
    }
  }
  if (!best) return text
  state.used.add(best.key)
  const before = text.slice(0, best.index)
  const matched = best.match[0]!
  const after = text.slice(best.index + matched.length)
  return (
    <>
      {before}
      <Link href={best.href} className="text-amber-700 hover:text-amber-800 hover:underline font-medium">
        {matched}
      </Link>
      {linkifyFirstOccurrences(after, state, safeRules)}
    </>
  )
}

function GuideInlineText({
  text,
  state,
  enabled,
  rules = [],
}: {
  text: string
  state: { used: Set<string> }
  enabled: boolean
  rules?: InlineLinkRule[]
}) {
  const safeRules = rules ?? []
  if (!enabled || !safeRules.length) return <>{text}</>
  return <>{linkifyFirstOccurrences(text, state, safeRules)}</>
}

function truncate(text: string | undefined, maxChars: number) {
  if (text == null || text.length === 0) return ''
  if (text.length <= maxChars) return text
  const trimmed = text.slice(0, maxChars)
  const lastSpace = trimmed.lastIndexOf(' ')
  return `${trimmed.slice(0, lastSpace > 40 ? lastSpace : maxChars).trim()}…`
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[
        'h-5 w-5 flex-none text-gray-600 transition-transform duration-200',
        open ? 'rotate-180' : 'rotate-0',
      ].join(' ')}
    >
      <path
        d="M6.7 9.2a1 1 0 0 1 1.4 0L12 13.1l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ResourcePageTemplate({ guide }: { guide: ResourceGuide }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const inlineLinkState = useMemo(() => ({ used: new Set<string>() }), [guide.slug])

  const inlineLinkRules = useMemo((): InlineLinkRule[] => {
    if (!guide.inlineLinkTargets?.length) return []
    return guide.inlineLinkTargets.map(({ phrase, href }) => ({
      key: phrase.toLowerCase(),
      pattern: phraseToPattern(phrase),
      href,
    }))
  }, [guide.inlineLinkTargets])

  const inlineLinksEnabled = Boolean(guide.enableGuideInlineLinks && inlineLinkRules.length > 0)

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
    [guide.faqs],
  )

  const articleSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.metaTitle,
      description: guide.metaDescription,
      dateModified: guide.lastUpdated,
      publisher: {
        '@type': 'Organization',
        name: 'ProConnectSA',
        url: 'https://www.proconnectsa.co.za',
      },
    }),
    [guide.lastUpdated, guide.metaDescription, guide.metaTitle],
  )

  const relatedGuides = useMemo(
    () =>
      (guide.relatedSlugs ?? [])
        .map((slug) => resourceGuides.find((g) => g.slug === slug))
        .filter((g): g is ResourceGuide => Boolean(g)),
    [guide.relatedSlugs],
  )

  const pageTitle =
    guide.displayTitle ?? `${guide.service} Cost in ${guide.city} — 2026 Pricing Guide`

  const heroCta =
    guide.heroCtaLabel ?? `Get Free ${guide.service} Quotes in ${guide.city}`
  const footerCta = guide.footerCtaLabel ?? 'Get Free Quotes Now'

  return (
    <main className="flex-1">
      {/* A) FAQ + Article JSON-LD Schema */}
      <Script
        id={`faq-schema-${guide.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id={`article-schema-${guide.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* B) Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/resources" className="hover:text-gray-900">
                    Resources
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-gray-900 font-medium">{`${guide.service} Cost ${guide.city}`}</li>
              </ol>
            </nav>

            {/* C) Hero block */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{pageTitle}</h1>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-sm text-gray-800">
                📍 {guide.city}, {guide.province}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-sm text-gray-800">
                🗓 Updated {guide.lastUpdated}
              </span>
            </div>

            <p className="text-gray-700 text-base md:text-lg mb-6 max-w-3xl">
              <GuideInlineText
                text={guide.intro}
                state={inlineLinkState}
                enabled={inlineLinksEnabled}
                rules={inlineLinkRules}
              />
            </p>

            {guide.introConversion ? (
              <p className="text-gray-700 text-base md:text-lg mb-6 max-w-3xl">
                {guide.introConversion.beforeLink}
                <a
                  href={guide.introConversion.linkHref}
                  className="text-amber-700 hover:text-amber-800 hover:underline font-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {guide.introConversion.linkText}
                </a>
                <GuideInlineText
                  text={guide.introConversion.afterLink}
                  state={inlineLinkState}
                  enabled={inlineLinksEnabled}
                  rules={inlineLinkRules}
                />
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link
                href={guide.ctaLink}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 shadow-sm transition-colors"
              >
                {heroCta} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* D) Quick price overview */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {guide.featuredCostSnippet?.heading ?? `How Much Does ${guide.service} Cost in ${guide.city}?`}
            </h2>

            {guide.featuredCostSnippet ? (
              <p className="text-gray-700 text-base md:text-lg mb-6 max-w-3xl">
                <GuideInlineText
                  text={guide.featuredCostSnippet.leadParagraph}
                  state={inlineLinkState}
                  enabled={inlineLinksEnabled}
                  rules={inlineLinkRules}
                />
              </p>
            ) : null}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-[640px] w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {guide.pricingTableHeaders?.labelColumn ?? 'Job Type'}
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {guide.pricingTableHeaders?.valueColumn ?? 'Estimated Cost'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guide.pricing.map((row, idx) => (
                    <tr key={`${row.label}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/40'}>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.label}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Prices reflect 2026 South African market rates. Actual quotes may vary by provider, location, and job complexity.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <Link href={guide.ctaLink} className="text-amber-700 hover:text-amber-800 hover:underline font-semibold">
                {guide.quickPriceCtaLabel ?? 'Compare real quotes'} →
              </Link>
            </p>

            {guide.monthlySavingsSection ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{guide.monthlySavingsSection.heading}</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{guide.monthlySavingsSection.body}</p>
              </div>
            ) : null}

            {guide.roiSection ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{guide.roiSection.heading}</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{guide.roiSection.body}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* E) What affects the price */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              What Affects the Cost of {guide.service} in {guide.city}?
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guide.priceFactors.map((factor, idx) => (
                <li
                  key={`${factor}-${idx}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold">
                    ✓
                  </span>
                  <span className="text-gray-800">
                    <GuideInlineText
                      text={factor}
                      state={inlineLinkState}
                      enabled={inlineLinksEnabled}
                      rules={inlineLinkRules}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* F) How to get the best price */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              How to Get the Best Price on {guide.service} in {guide.city}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {guide.tips.map((tip, idx) => (
                <div key={`${tip}-${idx}`} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-none">
                      <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-gray-800">
                      <GuideInlineText
                        text={tip}
                        state={inlineLinkState}
                        enabled={inlineLinksEnabled}
                        rules={inlineLinkRules}
                      />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* G) FAQ Accordion */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {guide.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div key={`${faq.question}-${idx}`} className="rounded-2xl border border-gray-200 bg-white">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex((current) => (current === idx ? null : idx))}
                    >
                      <span className="font-semibold text-gray-900">
                        <GuideInlineText
                          text={faq.question}
                          state={inlineLinkState}
                          enabled={inlineLinksEnabled}
                          rules={inlineLinkRules}
                        />
                      </span>
                      <Chevron open={isOpen} />
                    </button>
                    <div
                      className={[
                        'px-5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
                        isOpen ? 'max-h-[min(80vh,48rem)] opacity-100 pb-4' : 'max-h-0 opacity-0',
                      ].join(' ')}
                    >
                      <p className="text-gray-600">
                        <GuideInlineText
                          text={faq.answer}
                          state={inlineLinkState}
                          enabled={inlineLinksEnabled}
                          rules={inlineLinkRules}
                        />
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* H) Main CTA block */}
      <section className="py-12 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-3xl border border-amber-500/30 bg-gradient-to-br from-gray-950 to-gray-900 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {guide.footerCtaHeading ?? `Ready to Get Quotes from Verified ${guide.service} Providers in ${guide.city}?`}
            </h2>
            <p className="text-gray-200 mb-6">
              {guide.footerCtaSupportingText ??
                'Free, no obligation. Compare up to 3 verified quotes and choose the best fit for your budget.'}
            </p>
            <Link
              href={guide.ctaLink}
              className="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-7 py-4 shadow-sm transition-colors"
            >
              {footerCta} →
            </Link>
          </div>
        </div>
      </section>

      {/* I) Related guides */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Related Cost Guides</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedGuides.slice(0, 3).map((g) => (
                <div
                  key={g.slug}
                  className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="text-xs font-semibold text-amber-700 mb-1">{g.service}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">{g.city}</div>
                  <p className="text-sm text-gray-600 mb-4">{truncate(g.intro, 100)}</p>
                  <Link
                    href={`/resources/${g.slug}`}
                    className="text-amber-700 hover:text-amber-800 hover:underline font-semibold text-sm"
                  >
                    Read guide →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

