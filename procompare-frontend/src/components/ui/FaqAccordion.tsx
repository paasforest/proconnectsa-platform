'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  items: FaqItem[]
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-lg border border-mist overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-cream transition-colors"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span>{item.question}</span>
            <ChevronDown
              className={`h-4 w-4 text-slate flex-shrink-0 ml-3 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
            />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-slate leading-relaxed border-t border-mist pt-3">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
