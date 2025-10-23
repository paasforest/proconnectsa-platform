import { ArrowRight, CheckCircle } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to Make Your Immigration Dream a Reality?
        </h2>

        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
          Join thousands of successful applicants who trusted our AI-powered platform to guide their journey
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button className="group px-8 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl flex items-center gap-3 text-lg">
            Get Started at R299/month
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-8 py-5 bg-blue-800 text-white font-bold rounded-xl border-2 border-blue-400 hover:bg-blue-900 transition-all duration-200 text-lg">
            View All Plans
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            'Money-back guarantee',
            'Cancel anytime',
            'Affordable monthly plans'
          ].map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
