import Link from "next/link"

/**
 * Server-rendered semantic content for /immigration — visible to crawlers without relying on client-only UI.
 */
export function ImmigrationSeoArticle() {
  return (
    <article className="border-b border-gray-200 bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">South Africa</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Immigration Services South Africa: Visa Pathways, Planning & Applications
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Whether you are leaving South Africa for work or study abroad, or you need structured help with documents and
            preparation, this hub connects you to tools and guidance. Below is an overview of common visa types, how
            applications usually work, and how to think about costs—before you use the interactive tools on this page.
          </p>
        </header>

        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-bold text-gray-900">Types of visas and pathways</h2>
          <p>
            Most destinations offer a mix of <strong>economic</strong> (skilled work, business), <strong>family</strong>{" "}
            (spouse, dependent), <strong>study</strong>, and <strong>humanitarian or special</strong> categories. Popular
            destinations for South Africans include Canada (Express Entry, provincial programmes, study permits), the UK
            (Skilled Worker, health and care, student), Australia and New Zealand (skilled lists and points systems), and the
            United States (employment-based, study, family). Each country publishes eligible occupations, language tests,
            and financial proof—requirements change, so always verify the official government site for your target
            country.
          </p>

          <h2 className="mt-8 text-xl font-bold text-gray-900">Typical process</h2>
          <p>
            A typical pathway starts with <strong>eligibility</strong> (age, skills, funds, health, and police clearance),
            then <strong>documentation</strong> (IDs, qualifications, employment letters, bank statements),{" "}
            <strong>submission</strong> (online or visa centre), and sometimes <strong>interview or biometrics</strong>.
            Timelines range from a few weeks to more than a year depending on route and backlog. Using a checklist and
            keeping one source of truth for dates and document versions reduces errors that cause refusals or delays.
          </p>
          <p>
            If you are still living in South Africa while preparing, keep digital copies of every document in a secure
            folder and note expiry dates for police clearances and medicals—many outcomes fail simply because a certificate
            expired before lodgement. For families, align school terms, notice periods, and lease ends with realistic visa
            decision timelines so you are not caught paying overlap costs in two countries.
          </p>
          <p>
            After approval, plan your arrival logistics: short-term accommodation, banking, mobile connectivity, and—if
            you are leaving a property behind—budget for{" "}
            <Link href="/resources/cleaning-services-cost-south-africa" className="text-emerald-700 underline hover:text-emerald-800">
              cleaning and handover
            </Link>{" "}
            or small repairs so your deposit and references stay intact.
          </p>

          <h2 className="mt-8 text-xl font-bold text-gray-900">Pricing and professional help</h2>
          <p>
            Government fees are published on official immigration sites. Many applicants add{" "}
            <strong>language tests</strong>, <strong>medical exams</strong>, <strong>translations</strong>, and optional{" "}
            <strong>registered migration consultants or attorneys</strong>. Consultants typically charge for strategy
            sessions, document review, or full representation—not a guarantee of approval. Budget for both official fees and
            third-party costs before you commit to a timeline.
          </p>

          <h2 className="mt-8 text-xl font-bold text-gray-900">FAQ</h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-gray-900">Do I need a consultant?</dt>
              <dd className="text-gray-700">
                Not always. Straightforward study or tourism routes are often self-service. Complex work, business, or
                refusals benefit from regulated advice where that country allows it.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">How long does a visa take?</dt>
              <dd className="text-gray-700">
                It varies by route and season. Check current processing times on the official immigration authority for your
                destination.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Can ProConnectSA help with home services while I plan?</dt>
              <dd className="text-gray-700">
                Yes. For local home needs in South Africa—such as{" "}
                <Link href="/services/plumbing" className="text-emerald-700 underline hover:text-emerald-800">
                  plumbing
                </Link>
                ,{" "}
                <Link href="/services/electrical" className="text-emerald-700 underline hover:text-emerald-800">
                  electrical
                </Link>
                , or{" "}
                <Link href="/services/cleaning" className="text-emerald-700 underline hover:text-emerald-800">
                  cleaning
                </Link>
                —you can compare quotes on ProConnectSA while you prepare your move.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Where can I read cost guides?</dt>
              <dd className="text-gray-700">
                Browse{" "}
                <Link href="/resources" className="text-emerald-700 underline hover:text-emerald-800">
                  resources &amp; cost guides
                </Link>{" "}
                for topics like{" "}
                <Link
                  href="/resources/solar-installation-cost-south-africa"
                  className="text-emerald-700 underline hover:text-emerald-800"
                >
                  solar installation cost
                </Link>{" "}
                or city-specific trades—useful for budgeting your home before or after a relocation.
              </dd>
            </div>
          </dl>

          <p className="mt-10 text-sm text-gray-500">
            The tools below help you explore plans and AI-assisted document prep. Always confirm requirements with official
            government sources before lodging an application.
          </p>
        </div>
      </div>
    </article>
  )
}
