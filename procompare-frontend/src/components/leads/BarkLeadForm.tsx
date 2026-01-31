'use client'

import React, { useEffect, useMemo, useState } from 'react'

type ServiceCategory = { id: number; name: string; slug: string }

type BarkLeadFormProps = {
  onComplete?: (data: any) => void
  onCancel?: () => void
  preselectedCategory?: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'

const BUDGET_RANGES = [
  { label: 'Under R1,000', value: 'under_1000' },
  { label: 'R1,000 - R5,000', value: '1000_5000' },
  { label: 'R5,000 - R15,000', value: '5000_15000' },
  { label: 'R15,000 - R50,000', value: '15000_50000' },
  { label: 'Over R50,000', value: 'over_50000' },
] as const

// Must match backend `Lead.URGENCY_CHOICES`
const URGENCY_OPTIONS = [
  { label: 'Urgent (ASAP)', value: 'urgent' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Flexible', value: 'flexible' },
] as const

// Must match backend `Lead.HIRING_INTENT_CHOICES`
const HIRING_INTENT_OPTIONS = [
  { label: "Ready to hire", value: "ready_to_hire" },
  { label: "Planning to hire soon", value: "planning_to_hire" },
  { label: "Comparing quotes", value: "comparing_quotes" },
  { label: "Just researching", value: "researching" },
] as const

// Must match backend `Lead.HIRING_TIMELINE_CHOICES`
const HIRING_TIMELINE_OPTIONS = [
  { label: "ASAP", value: "asap" },
  { label: "This month", value: "this_month" },
  { label: "Next month", value: "next_month" },
  { label: "Flexible", value: "flexible" },
] as const

export default function BarkLeadForm({ onComplete, onCancel, preselectedCategory }: BarkLeadFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [serviceSlug, setServiceSlug] = useState<string>(preselectedCategory || '')
  const [locationAddress, setLocationAddress] = useState('')
  const [locationSuburb, setLocationSuburb] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetRange, setBudgetRange] = useState<(typeof BUDGET_RANGES)[number]['value']>('1000_5000')
  const [urgency, setUrgency] = useState<(typeof URGENCY_OPTIONS)[number]['value']>('this_week')
  const [hiringIntent, setHiringIntent] = useState<(typeof HIRING_INTENT_OPTIONS)[number]['value']>('comparing_quotes')
  const [hiringTimeline, setHiringTimeline] = useState<(typeof HIRING_TIMELINE_OPTIONS)[number]['value']>('this_month')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingCategories(true)
        const res = await fetch(`${API_BASE_URL}/api/leads/categories/`, { method: 'GET' })
        if (!res.ok) throw new Error(`Failed to load categories (${res.status})`)
        const data = await res.json()
        const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
        const normalized: ServiceCategory[] = items
          .filter((c: any) => c && c.id && c.slug && c.name)
          .map((c: any) => ({ id: Number(c.id), slug: String(c.slug), name: String(c.name) }))
        if (!cancelled) setCategories(normalized)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load categories')
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // If we got a preselected category slug, keep it only if it exists in backend categories
  useEffect(() => {
    if (!preselectedCategory) return
    setServiceSlug(preselectedCategory)
  }, [preselectedCategory])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === serviceSlug) || null,
    [categories, serviceSlug]
  )

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(selectedCategory)
    if (step === 2)
      return (
        locationAddress.trim().length >= 3 &&
        locationSuburb.trim().length >= 2 &&
        locationCity.trim().length >= 2 &&
        description.trim().length >= 10
      )
    if (step === 3)
      return contactName.trim().length >= 2 && contactPhone.trim().length >= 7 && contactEmail.trim().includes('@')
    return false
  }, [step, selectedCategory, locationAddress, locationSuburb, locationCity, description, contactName, contactPhone, contactEmail])

  const submit = async () => {
    if (!selectedCategory) {
      setError('Please select a service')
      setStep(1)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        service_category_id: selectedCategory.id,
        title: title.trim() || `${selectedCategory.name} request`,
        description: description.trim(),
        location_address: locationAddress.trim(),
        location_suburb: locationSuburb.trim(),
        location_city: locationCity.trim(),
        budget_range: budgetRange,
        urgency,
        preferred_contact_time: 'morning',
        hiring_intent: hiringIntent,
        hiring_timeline: hiringTimeline,
        additional_requirements: '',
        property_type: 'residential',
        source: 'website',
        client_name: contactName.trim(),
        client_email: contactEmail.trim(),
        client_phone: contactPhone.trim(),
      }

      const res = await fetch('/api/leads/create-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          typeof data?.details === 'string'
            ? data.details
            : data?.message || data?.error || `Failed to submit (${res.status})`
        throw new Error(msg)
      }
      onComplete?.(data)
    } catch (e: any) {
      setError(e?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Step {step} of 3</div>
          <h1 className="text-2xl font-bold text-gray-900">Get your free quotes</h1>
          <p className="text-gray-600">Tell us what you need — we’ll connect you with verified professionals.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="rounded-xl border border-gray-200 p-5 shadow-sm">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Service</label>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={serviceSlug}
                  onChange={(e) => setServiceSlug(e.target.value)}
                  disabled={loadingCategories}
                >
                  <option value="">{loadingCategories ? 'Loading services…' : 'Select a service'}</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-900">Address / Area</label>
                  <input
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. 12 Main Rd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Suburb</label>
                  <input
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={locationSuburb}
                    onChange={(e) => setLocationSuburb(e.target.value)}
                    placeholder="e.g. Sandton"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">City</label>
                  <input
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder="e.g. Johannesburg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Project title (optional)</label>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rewire 2-bedroom apartment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Describe what you need</label>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give a few details so professionals can quote accurately…"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Budget</label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value as any)}
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Urgency</label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                  >
                    {URGENCY_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Your intention</label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={hiringIntent}
                    onChange={(e) => setHiringIntent(e.target.value as any)}
                  >
                    {HIRING_INTENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">When do you want to start?</label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={hiringTimeline}
                    onChange={(e) => setHiringTimeline(e.target.value as any)}
                  >
                    {HIRING_TIMELINE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Full name</label>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Randy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Phone number</label>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 0679518165"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Email</label>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. jane@gmail.com"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              if (step === 1) onCancel?.()
              else setStep((s) => (s === 2 ? 1 : 2))
            }}
            disabled={submitting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
              disabled={!canGoNext || submitting}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              onClick={submit}
              disabled={!canGoNext || submitting}
            >
              {submitting ? 'Submitting…' : 'Get my quotes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

