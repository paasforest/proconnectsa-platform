import { UserPlus, Sparkles, FileCheck, Plane } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Tell us about your background, education, and immigration goals in just 5 minutes.',
    step: '01'
  },
  {
    icon: Sparkles,
    title: 'AI Analyzes Your Case',
    description: 'Our intelligent system evaluates your profile and recommends the best visa pathways.',
    step: '02'
  },
  {
    icon: FileCheck,
    title: 'Generate Documents',
    description: 'Use AI to create SOPs, cover letters, and prepare for tests and interviews.',
    step: '03'
  },
  {
    icon: Plane,
    title: 'Submit & Succeed',
    description: 'Follow our guided checklist to submit a complete, professional application.',
    step: '04'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get from application to approval in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -z-10"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-5xl font-bold text-gray-100">{step.step}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to start your immigration journey?
              </h3>
              <p className="text-gray-600">
                Join thousands who have successfully used our platform to achieve their dreams
              </p>
            </div>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
