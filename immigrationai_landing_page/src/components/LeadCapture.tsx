import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function LeadCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would integrate with Supabase to store the email
    console.log('Email submitted:', email);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-6 h-6" />
                <h3 className="text-2xl font-bold">Get Your Free Visa Eligibility Report</h3>
              </div>
              <p className="text-blue-100">
                Enter your email to receive a personalized assessment of your immigration options
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 w-full md:w-auto">
              {!submitted ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="flex-1 px-6 py-4 rounded-xl border-2 border-white/30 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    className="group px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Get Report
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="bg-green-500 text-white px-6 py-4 rounded-xl font-semibold text-center">
                  Check your email! Your report is on its way.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
