import { Check, Sparkles, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 'R299',
    period: 'per month',
    description: 'Perfect for getting started',
    features: [
      '5 SOP generations per month',
      'Basic IELTS practice tests',
      '10 mock interview sessions',
      'Visa guidance for 3 countries',
      'Document checklist',
      'Email support (48hr response)',
      'Application tracking'
    ],
    cta: 'Get Started',
    popular: false,
    variant: 'outline'
  },
  {
    name: 'Standard',
    price: 'R499',
    period: 'per month',
    description: 'Everything you need to succeed',
    features: [
      'Unlimited SOP generations',
      'Full IELTS/TOEFL/CELPIP access',
      'Unlimited mock interview sessions',
      'All major destinations',
      'Advanced document checklist',
      'Priority email support (24hr response)',
      'Application tracking',
      'Progress analytics',
      'CV/Resume builder'
    ],
    cta: 'Most Popular',
    popular: true,
    variant: 'primary'
  },
  {
    name: 'Premium',
    price: 'R699',
    period: 'per month',
    description: 'For those who want expert review',
    features: [
      'Everything in Standard',
      'Expert lawyer SOP review',
      'Real coach interview review',
      'AI + Expert consultation combo',
      'Personalized visa strategy',
      '24/7 priority support',
      'Success guarantee program',
      'Direct consultant access'
    ],
    cta: 'Go Premium',
    popular: false,
    variant: 'premium'
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Affordable pricing to match your immigration journey. Plans start at just R299/month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105 border-4 border-blue-400'
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {plan.variant === 'premium' && (
                <div className="absolute -top-3 -right-3">
                  <Crown className="w-10 h-10 text-yellow-500" />
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 mb-8 ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg'
                    : plan.variant === 'premium'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-blue-50' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All plans include secure payment processing and can be canceled anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
