import { FileText, MessageSquare, Globe, BookOpen, CheckCircle, Users } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Generate SOPs & Cover Letters',
    description: 'AI-powered tools create personalized statements of purpose and cover letters that stand out to immigration officers.',
    color: 'blue'
  },
  {
    icon: BookOpen,
    title: 'Practice English Tests',
    description: 'Comprehensive prep for IELTS, TOEFL, and CELPIP with real-time feedback and adaptive learning.',
    color: 'green'
  },
  {
    icon: MessageSquare,
    title: 'Get Interview Coaching',
    description: 'AI-powered mock interviews simulate real visa interviews, helping you build confidence and perfect your answers.',
    color: 'purple'
  },
  {
    icon: Globe,
    title: 'Explore Visa Options',
    description: 'Discover the best visa pathways for Canada, UK, USA, and 20+ other countries based on your profile.',
    color: 'orange'
  },
  {
    icon: CheckCircle,
    title: 'Document Checklist',
    description: 'Never miss a document again. Get customized checklists for your specific visa application type.',
    color: 'teal'
  },
  {
    icon: Users,
    title: 'Expert Review',
    description: 'Premium plans include review by licensed immigration consultants to ensure your application is perfect.',
    color: 'red'
  }
];

const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'group-hover:bg-green-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'group-hover:bg-purple-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'group-hover:bg-orange-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', hover: 'group-hover:bg-teal-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', hover: 'group-hover:bg-red-100' }
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides comprehensive support for every step of your immigration journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];

            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 ${colors.bg} ${colors.hover} rounded-xl flex items-center justify-center mb-5 transition-colors duration-300`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            Start Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
