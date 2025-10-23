import { MapPin, TrendingUp, Clock, DollarSign } from 'lucide-react';

const countries = [
  {
    name: 'Canada',
    flag: '🇨🇦',
    visaTypes: ['Express Entry', 'Study Permit', 'Work Permit', 'Family Sponsorship'],
    difficulty: 'Medium',
    avgTime: '6-12 months',
    popularityScore: 95,
    description: 'Welcoming immigration system with multiple pathways'
  },
  {
    name: 'United Kingdom',
    flag: '🇬🇧',
    visaTypes: ['Skilled Worker', 'Student Visa', 'Global Talent', 'Family Visa'],
    difficulty: 'Medium-Hard',
    avgTime: '3-8 months',
    popularityScore: 88,
    description: 'Strong job market and excellent education system'
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    visaTypes: ['H1B', 'F1 Student', 'EB-5 Investor', 'Family-Based'],
    difficulty: 'Hard',
    avgTime: '12-24 months',
    popularityScore: 92,
    description: 'Competitive but offers great opportunities'
  },
  {
    name: 'Australia',
    flag: '🇦🇺',
    visaTypes: ['Skilled Independent', 'Student Visa', 'Work & Holiday', 'Partner Visa'],
    difficulty: 'Medium',
    avgTime: '6-18 months',
    popularityScore: 85,
    description: 'Points-based system favoring skilled workers'
  },
  {
    name: 'Germany',
    flag: '🇩🇪',
    visaTypes: ['EU Blue Card', 'Job Seeker', 'Student Visa', 'Freelance Visa'],
    difficulty: 'Medium',
    avgTime: '3-6 months',
    popularityScore: 78,
    description: 'Strong economy with growing demand for skilled workers'
  },
  {
    name: 'New Zealand',
    flag: '🇳🇿',
    visaTypes: ['Skilled Migrant', 'Work Visa', 'Student Visa', 'Partner Visa'],
    difficulty: 'Medium',
    avgTime: '6-12 months',
    popularityScore: 80,
    description: 'High quality of life and straightforward immigration process'
  }
];

const difficultyColors: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Medium-Hard': 'bg-orange-100 text-orange-700',
  'Hard': 'bg-red-100 text-red-700'
};

export default function CountrySelector() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Explore Your Destination
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare top immigration destinations and find the perfect pathway for your profile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {countries.map((country, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{country.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${difficultyColors[country.difficulty]}`}>
                      {country.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{country.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Processing: <span className="font-semibold text-gray-900">{country.avgTime}</span></span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Popularity: <span className="font-semibold text-gray-900">{country.popularityScore}/100</span></span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">POPULAR VISA TYPES:</p>
                <div className="flex flex-wrap gap-2">
                  {country.visaTypes.map((visa, vIndex) => (
                    <span
                      key={vIndex}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                    >
                      {visa}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Explore {country.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Not sure which country is right for you?</p>
          <button className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
            Take Our Country Match Quiz
          </button>
        </div>
      </div>
    </section>
  );
}
