import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How does the AI SOP writer work?',
    answer: 'Our AI analyzes successful visa applications and uses your personal background, education, and goals to generate a compelling Statement of Purpose. You can edit and refine it until it perfectly represents your story.'
  },
  {
    question: 'Can I use this for multiple countries?',
    answer: 'Yes! Our Standard and Premium plans cover all major immigration destinations including Canada, UK, USA, Australia, New Zealand, Germany, and more. Each country has specific requirements which our AI handles automatically.'
  },
  {
    question: 'Is the IELTS practice as good as official tests?',
    answer: 'Our practice tests are designed by IELTS-certified instructors and use the same format as official tests. While they can\'t replace official testing, they provide excellent preparation and identify areas for improvement.'
  },
  {
    question: 'Do I need the Premium plan or is Basic enough?',
    answer: 'Basic (R299) is great for getting started with limited usage. Standard (R499) is perfect for most users with unlimited access. Upgrade to Premium (R699) if you want expert human review of your documents, personalized consultation, or if your case is complex and requires professional guidance.'
  },
  {
    question: 'How long does it take to prepare an application?',
    answer: 'Most users complete their initial application documents within 2-4 weeks. Our platform guides you step-by-step, and the AI tools significantly reduce the time compared to doing everything manually.'
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a 7-day money-back guarantee. If you\'re not happy with the service within the first week, contact us for a full refund, no questions asked.'
  },
  {
    question: 'Can this guarantee my visa approval?',
    answer: 'No service can guarantee visa approval as the final decision rests with immigration authorities. However, we help you present the strongest possible application by ensuring all documents are professional, complete, and meet official requirements.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Absolutely. We use bank-level encryption for all data. Your information is stored securely and never shared with third parties. You can delete your account and all associated data at any time.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our Immigration AI platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
