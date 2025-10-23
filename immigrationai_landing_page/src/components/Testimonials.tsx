import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Nkosi',
    location: 'Cape Town → Canada',
    avatar: 'SN',
    rating: 5,
    text: 'The AI SOP writer helped me craft a statement that got me accepted into my dream university in Toronto. The interview prep was incredibly realistic and boosted my confidence.',
    result: 'Study visa approved in 6 weeks'
  },
  {
    name: 'Michael van der Merwe',
    location: 'Johannesburg → UK',
    avatar: 'MV',
    rating: 5,
    text: 'I was struggling with my IELTS scores until I found this platform. The AI practice sessions identified my weak areas and helped me improve from 6.0 to 7.5 in just 3 months.',
    result: 'Skilled worker visa granted'
  },
  {
    name: 'Thandiwe Mthembu',
    location: 'Durban → USA',
    avatar: 'TM',
    rating: 5,
    text: 'The expert review on the premium plan was worth every rand. They caught mistakes I never would have noticed and my application was flawless. Highly recommend!',
    result: 'H1B visa approved first try'
  },
  {
    name: 'David Botha',
    location: 'Pretoria → Australia',
    avatar: 'DB',
    rating: 5,
    text: 'As someone with no immigration experience, I felt lost. This platform guided me step-by-step through the entire process. The document checklist alone saved me weeks of stress.',
    result: 'PR visa in progress'
  },
  {
    name: 'Lerato Dlamini',
    location: 'Port Elizabeth → Germany',
    avatar: 'LD',
    rating: 5,
    text: 'The AI suggested visa pathways I never knew existed. I ended up applying for a different visa category that was perfect for my profile. Game changer!',
    result: 'EU Blue Card received'
  },
  {
    name: 'Johan Pietersen',
    location: 'Bloemfontein → New Zealand',
    avatar: 'JP',
    rating: 5,
    text: 'Best investment I made for my immigration journey. The mock interviews prepared me so well that the actual visa interview felt easy. The officer even complimented my preparation.',
    result: 'Work visa approved'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join over 1,000 South Africans who have successfully immigrated with our help
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              <div className="pt-6 border-t border-gray-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900">{testimonial.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Your success story could be next
          </p>
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </section>
  );
}
