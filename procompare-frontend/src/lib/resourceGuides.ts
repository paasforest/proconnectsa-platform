export interface ResourceGuide {
  slug: string
  service: string // e.g. "Cleaning Services"
  city: string // e.g. "Cape Town"
  province: string // e.g. "Western Cape"
  ctaLink: string // e.g. "/cape-town/cleaning"
  metaTitle: string // e.g. "Cleaning Service Cost in Cape Town | 2026 Pricing Guide | ProConnectSA"
  metaDescription: string // max 155 chars
  intro: string // 2–3 sentence intro paragraph
  lastUpdated: string // e.g. "March 2026"
  pricing: {
    label: string // e.g. "Small / 1-bedroom"
    range: string // e.g. "R400 – R800"
  }[]
  priceFactors: string[] // 5–6 bullet points on what affects price
  tips: string[] // 4 tips on how to get the best price
  faqs: {
    question: string
    answer: string
  }[] // minimum 5 FAQs per page
  relatedSlugs: string[] // 3–4 slugs of related resource pages
  /** Overrides default H1 "{service} Cost in {city} — 2026 Pricing Guide" */
  displayTitle?: string
  /** Shown directly after the intro paragraph (conversion block) */
  introConversion?: {
    beforeLink: string
    linkText: string
    linkHref: string
    afterLink: string
  }
  /** Custom H2 + lead paragraph placed immediately before the pricing table (featured snippet) */
  featuredCostSnippet?: {
    heading: string
    leadParagraph: string
  }
  /** Primary hero CTA label (default: "Get Free {service} Quotes in {city} →") */
  heroCtaLabel?: string
  /** Footer CTA label (default: "Get Free Quotes Now →") */
  footerCtaLabel?: string
  /** First-occurrence inline internal links in guide body copy (document order) */
  enableGuideInlineLinks?: boolean
  /** Phrase order = match priority; first occurrence of each phrase only (when enabled) */
  inlineLinkTargets?: { phrase: string; href: string }[]
  /** Override pricing table column titles (default: Job Type / Estimated Cost) */
  pricingTableHeaders?: { labelColumn: string; valueColumn: string }
  /** Optional block after the pricing table (e.g. monthly savings example) */
  monthlySavingsSection?: { heading: string; body: string }
  /** Optional ROI / payback block */
  roiSection?: { heading: string; body: string }
  /** Override footer CTA dark section heading */
  footerCtaHeading?: string
  /** Override footer CTA supporting paragraph */
  footerCtaSupportingText?: string
  /** Link text under the pricing table (default: Compare real quotes →) */
  quickPriceCtaLabel?: string
  /** Short trust lines under hero chips (e.g. verified installers) */
  heroTrustSignals?: string[]
  /** Comparison-advantage promo (headline, bullets, CTA) */
  quoteComparisonBlock?: {
    heading: string
    bullets: string[]
    buttonLabel: string
    buttonHref?: string
  }
  /** Local / city hub links for national guides */
  localCostQuickLinks?: {
    heading: string
    links: { label: string; href: string }[]
  }
}

export const resourceGuides: ResourceGuide[] = [
  {
    slug: "cleaning-cost-cape-town",
    service: "Cleaning Services",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/cleaning",
    metaTitle: "Cleaning Service Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Cleaning services in Cape Town cost R80–R200/hr or R600–R2,800 per job. Compare verified cleaners’ quotes — free, no obligation.",
    intro:
      "Cleaning services in Cape Town are typically priced per hour or per job, depending on your home size and whether it’s a regular or deep clean. Use this 2026 cost guide to budget realistically, then compare quotes from verified local cleaners.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly rate (1 cleaner)", range: "R80 – R200/hr" },
      { label: "Apartment (1–2 bed) standard clean", range: "R600 – R1,200" },
      { label: "House (3–4 bed) standard clean", range: "R1,200 – R2,200" },
      { label: "Deep clean (kitchen + bathrooms focus)", range: "R1,200 – R2,800" },
      { label: "Move-in / move-out cleaning", range: "R1,500 – R3,500" },
    ],
    priceFactors: [
      "Property size (sqm) and number of rooms/bathrooms",
      "Type of clean: standard vs deep clean vs move-in/move-out",
      "Frequency (weekly/fortnightly) vs one-off bookings",
      "Extra tasks: oven, windows, fridge, balcony/patio",
      "Access, parking, and travel time within Cape Town suburbs",
      "Number of cleaners and expected turnaround time",
    ],
    tips: [
      "Get 2–3 quotes and compare what’s included (products, linen change, ironing, windows).",
      "Book regular cleans (weekly/fortnightly) for lower per-visit rates.",
      "Share photos and a task list upfront to avoid surprises on the day.",
      "Choose off-peak weekdays if you want better availability and pricing.",
    ],
    faqs: [
      {
        question: "How much do cleaning services cost in Cape Town?",
        answer:
          "Most Cape Town cleaners charge around R80–R200 per hour. For a once-off clean, expect roughly R600–R2,200 depending on home size, with deep cleans often higher.",
      },
      {
        question: "Is it cheaper to hire a cleaner hourly or per job?",
        answer:
          "Hourly can be cheaper for small homes or quick touch-ups, while per-job pricing is common for deep cleans and move-out cleans. Ask what’s included and how long they estimate.",
      },
      {
        question: "What’s usually included in a standard house clean?",
        answer:
          "A standard clean typically covers dusting, vacuuming/mopping, kitchens and bathrooms, and general tidying. Extras like ovens, windows, and inside cupboards are often priced separately.",
      },
      {
        question: "Do cleaners bring their own cleaning products in Cape Town?",
        answer:
          "Some do, some don’t. Many domestic cleaners expect products to be provided, while cleaning companies often supply them. Confirm upfront because it affects the quote.",
      },
      {
        question: "How do I find a reliable cleaner in Cape Town?",
        answer:
          "Compare multiple quotes, read reviews, confirm availability, and ask about insurance or background checks if you’re hiring a company. Using a verified marketplace helps reduce risk.",
      },
    ],
    relatedSlugs: [
      "cleaning-cost-johannesburg",
      "handyman-cost-cape-town",
      "painting-cost-cape-town",
      "plumber-cost-cape-town",
    ],
  },
  {
    slug: "cleaning-cost-johannesburg",
    service: "Cleaning Services",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/cleaning",
    metaTitle: "Cleaning Service Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Cleaning services in Johannesburg cost R80–R220/hr or R650–R3,200 per job. Compare verified cleaners’ quotes — free, no obligation.",
    intro:
      "Cleaning prices in Johannesburg vary based on your home size, the suburb, and whether you need a routine clean or a deep clean. This 2026 pricing guide shows realistic ranges so you can compare quotes confidently.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly rate (1 cleaner)", range: "R80 – R220/hr" },
      { label: "Apartment (1–2 bed) standard clean", range: "R650 – R1,300" },
      { label: "House (3–4 bed) standard clean", range: "R1,300 – R2,500" },
      { label: "Deep clean (detail work)", range: "R1,500 – R3,200" },
      { label: "Move-in / move-out cleaning", range: "R1,800 – R4,000" },
    ],
    priceFactors: [
      "Home size and number of bathrooms (bathrooms add time)",
      "One-off vs recurring cleaning (recurring is usually cheaper)",
      "Deep cleaning level (tiles, grout, skirting, blinds)",
      "Add-ons like windows, ovens, fridges, and carpets",
      "Travel distance and access/parking in Johannesburg suburbs",
      "Speed requirements and number of cleaners assigned",
    ],
    tips: [
      "Ask for a fixed scope (rooms + tasks) so quotes are comparable.",
      "Bundle add-ons (like oven + windows) for a better overall rate.",
      "Book weekday morning slots for better availability.",
      "Confirm whether products/equipment are included before you accept.",
    ],
    faqs: [
      {
        question: "How much does a cleaner cost per hour in Johannesburg?",
        answer:
          "Most Johannesburg cleaners charge around R80–R220 per hour. Rates depend on whether you’re hiring a domestic cleaner or a cleaning company with supplies and supervision.",
      },
      {
        question: "What’s the difference between a standard clean and a deep clean?",
        answer:
          "A standard clean focuses on surfaces, floors, kitchens, and bathrooms. A deep clean includes detail work such as inside appliances, grout/tiles, skirting boards, and hard-to-reach areas.",
      },
      {
        question: "How long does it take to clean a 3-bedroom house?",
        answer:
          "A standard clean for a 3-bedroom home often takes 3–6 hours depending on the condition of the house and the number of cleaners. Deep cleans can take longer.",
      },
      {
        question: "Do I need to be home during the cleaning?",
        answer:
          "Not always. Some people prefer to be present for the first visit and then arrange access for future cleans. If you won’t be home, confirm access, alarm instructions, and what to do with valuables.",
      },
      {
        question: "How do I choose a trustworthy cleaning service in Johannesburg?",
        answer:
          "Check reviews, confirm what’s included, and compare multiple quotes. If hiring a company, ask about insurance and staff vetting; if hiring directly, consider references.",
      },
    ],
    relatedSlugs: [
      "cleaning-cost-cape-town",
      "handyman-cost-johannesburg",
      "electrician-cost-johannesburg",
      "plumber-cost-johannesburg",
    ],
  },
  {
    slug: "plumber-cost-cape-town",
    service: "Plumbing",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/plumbing",
    metaTitle: "Plumber Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Plumbers in Cape Town cost R450–R950/hr plus callout fees of R350–R850. Compare verified plumbers’ quotes — free, no obligation.",
    intro:
      "Plumbing costs in Cape Town depend on the type of job, parts required, and whether it’s an emergency call-out. This 2026 guide covers typical hourly rates and common repair prices so you can compare like-for-like quotes.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Call-out fee (weekday)", range: "R350 – R850" },
      { label: "Hourly rate (standard)", range: "R450 – R950/hr" },
      { label: "Leaking tap / mixer repair", range: "R450 – R1,200" },
      { label: "Blocked drain (sink/shower) clearing", range: "R650 – R1,800" },
      { label: "Geyser repair (minor) / service", range: "R900 – R2,500" },
    ],
    priceFactors: [
      "Emergency vs scheduled work (after-hours costs more)",
      "Job complexity and time on site (diagnostics + labour)",
      "Parts and materials (valves, mixers, pipes, fittings)",
      "Access (tight roof spaces, buried pipes, apartment buildings)",
      "Location and travel time across Cape Town",
      "Compliance requirements (COC and workmanship guarantees)",
    ],
    tips: [
      "Request an itemised quote (call-out, labour rate, parts, and VAT) before approving work.",
      "Bundle small fixes into one visit to reduce call-out costs.",
      "Ask about warranties and whether a COC is required for the job.",
      "For non-emergencies, book weekdays to avoid after-hours rates.",
    ],
    faqs: [
      {
        question: "How much do plumbers charge per hour in Cape Town?",
        answer:
          "Typical plumbing labour in Cape Town is around R450–R950 per hour, depending on experience, tools required, and whether it’s standard or emergency work.",
      },
      {
        question: "What is a plumbing call-out fee?",
        answer:
          "A call-out fee covers travel and the first assessment/diagnosis. In Cape Town it’s commonly around R350–R850, and may be waived if you proceed with the repair.",
      },
      {
        question: "How much does it cost to fix a leaking tap?",
        answer:
          "A basic leaking tap repair often costs roughly R450–R1,200 depending on the tap type, replacement parts, and how long the job takes.",
      },
      {
        question: "Do plumbers in Cape Town charge extra for emergencies?",
        answer:
          "Yes. After-hours, weekends, and public holidays usually attract higher call-out fees and/or higher hourly rates. Ask for the emergency rate upfront.",
      },
      {
        question: "How do I choose a reliable plumber in Cape Town?",
        answer:
          "Compare a few quotes, read reviews, and confirm the plumber is experienced with your specific issue (e.g., geysers, drains). Ask about guarantees and compliance where relevant.",
      },
    ],
    relatedSlugs: [
      "plumber-cost-johannesburg",
      "electrician-cost-cape-town",
      "handyman-cost-cape-town",
      "renovation-cost-cape-town",
    ],
  },
  {
    slug: "plumber-cost-johannesburg",
    service: "Plumbing",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/plumbing",
    metaTitle: "Plumber Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Plumbers in Johannesburg cost R450–R1,050/hr plus callout fees of R350–R900. Compare verified plumbers’ quotes — free, no obligation.",
    intro:
      "Plumbing prices in Johannesburg vary with job type, parts, and urgency. This 2026 guide shows realistic hourly rates and common plumbing repair ranges so you can budget and avoid overpaying.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Call-out fee (weekday)", range: "R350 – R900" },
      { label: "Hourly rate (standard)", range: "R450 – R1,050/hr" },
      { label: "Leaking toilet / cistern repair", range: "R600 – R1,600" },
      { label: "Blocked drain clearing", range: "R700 – R2,000" },
      { label: "Geyser repair (minor) / service", range: "R950 – R2,800" },
    ],
    priceFactors: [
      "After-hours/emergency rates vs standard weekday rates",
      "Diagnostic time vs repair time (especially for hidden leaks)",
      "Parts quality and availability (budget vs premium fittings)",
      "Access and site conditions (apartments, ceilings, outdoor trenches)",
      "Distance and travel time in Johannesburg",
      "Any required compliance certificates or guarantees",
    ],
    tips: [
      "Describe the problem clearly and share photos to get a more accurate quote.",
      "Ask if the call-out fee is included in the final invoice when you proceed.",
      "Get a clear parts list before buying/approving replacements.",
      "Schedule preventative maintenance for geysers and drains to avoid emergencies.",
    ],
    faqs: [
      {
        question: "How much does a plumber cost in Johannesburg?",
        answer:
          "Most plumbers in Johannesburg charge roughly R450–R1,050 per hour, with call-out fees commonly around R350–R900. Emergencies cost more.",
      },
      {
        question: "Why do plumbing quotes differ so much?",
        answer:
          "Quotes vary based on labour rate, the plumber’s experience, travel distance, parts quality, and how long the job is expected to take. Emergency call-outs also raise prices.",
      },
      {
        question: "How much does it cost to unblock a drain?",
        answer:
          "Basic drain clearing often ranges from about R700–R2,000 depending on the blockage location and whether specialised tools (like drain snakes or jetting) are needed.",
      },
      {
        question: "Should I use a handyman or a plumber for small jobs?",
        answer:
          "For very minor tasks a handyman may be fine, but for leaks, drains, geysers, or anything that could cause damage, a qualified plumber is usually the safer choice.",
      },
      {
        question: "How can I avoid plumbing emergencies?",
        answer:
          "Fix small leaks early, don’t pour grease down drains, and service geysers periodically. Regular maintenance is almost always cheaper than after-hours emergency repairs.",
      },
    ],
    relatedSlugs: [
      "plumber-cost-cape-town",
      "electrician-cost-johannesburg",
      "handyman-cost-johannesburg",
      "renovation-cost-johannesburg",
    ],
  },
  {
    slug: "electrician-cost-cape-town",
    service: "Electrical Installation",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/electrical",
    metaTitle: "Electrician Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Electricians in Cape Town cost R450–R1,100/hr plus callout fees of R350–R900. Common jobs: plugs, lights, DB work. Compare quotes free.",
    intro:
      "Electrician pricing in Cape Town depends on the job complexity, parts, and whether you need compliance testing or a COC. This 2026 guide covers typical hourly rates and common electrical job ranges to help you compare quotes safely.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Call-out fee (weekday)", range: "R350 – R900" },
      { label: "Hourly rate (standard)", range: "R450 – R1,100/hr" },
      { label: "Install/replace plug socket", range: "R450 – R1,200" },
      { label: "Install/replace light fitting", range: "R450 – R1,500" },
      { label: "DB board inspection / minor repairs", range: "R950 – R3,500" },
    ],
    priceFactors: [
      "Type of work: fault-finding vs installation vs DB board work",
      "Compliance requirements (testing, COC, and safety standards)",
      "Parts and materials (breakers, wiring, fittings, conduits)",
      "Access and complexity (ceiling work, wall chasing, height)",
      "After-hours call-outs and urgency",
      "Property type (apartment vs freestanding home vs commercial)",
    ],
    tips: [
      "Choose a qualified electrician and ask about compliance testing for safety.",
      "Get a written quote that separates labour from parts and call-out fees.",
      "If you’re renovating, bundle multiple electrical jobs into one visit.",
      "Avoid the cheapest quote if it cuts corners on safety or compliance.",
    ],
    faqs: [
      {
        question: "How much do electricians charge per hour in Cape Town?",
        answer:
          "Electricians in Cape Town commonly charge around R450–R1,100 per hour depending on experience and the type of work (fault-finding and DB work can cost more).",
      },
      {
        question: "What is a COC and when do I need one?",
        answer:
          "A Certificate of Compliance (COC) confirms an electrical installation meets legal safety standards. It’s often required for property sales and for certain electrical alterations—ask your electrician.",
      },
      {
        question: "Why does fault-finding cost more than simple installations?",
        answer:
          "Fault-finding can take longer and may require specialised testing tools. The electrician may need time to isolate circuits and identify the cause before repairs can begin.",
      },
      {
        question: "How much does it cost to install a new plug point?",
        answer:
          "Installing or replacing a plug socket often costs about R450–R1,200 depending on wiring access, whether wall chasing is needed, and the parts used.",
      },
      {
        question: "How do I choose a reliable electrician in Cape Town?",
        answer:
          "Compare quotes, check reviews, and confirm qualifications. Ask what’s included (testing, parts, warranties) and avoid anyone who won’t provide a clear written scope.",
      },
    ],
    relatedSlugs: [
      "electrician-cost-johannesburg",
      "plumber-cost-cape-town",
      "painting-cost-cape-town",
      "hvac-cost-cape-town",
    ],
  },
  {
    slug: "electrician-cost-johannesburg",
    service: "Electrical Installation",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/electrical",
    metaTitle: "Electrician Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Electricians in Johannesburg cost R450–R1,150/hr plus callout fees of R350–R950. Common jobs: plugs, lights, DB work. Compare quotes free.",
    intro:
      "Electrician costs in Johannesburg depend on whether you need fault-finding, new installations, or DB board work. This 2026 guide shows realistic price ranges so you can compare quotes while prioritising safety and compliance.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Call-out fee (weekday)", range: "R350 – R950" },
      { label: "Hourly rate (standard)", range: "R450 – R1,150/hr" },
      { label: "Install/replace plug socket", range: "R500 – R1,250" },
      { label: "Install/replace light fitting", range: "R500 – R1,600" },
      { label: "DB board inspection / minor repairs", range: "R1,000 – R3,800" },
    ],
    priceFactors: [
      "Fault-finding time (intermittent trips can take longer)",
      "DB board and breaker work vs basic plug/light replacements",
      "Parts quality (breakers, wiring, fittings) and availability",
      "Access (roof/ceiling height, wall chasing, multi-storey buildings)",
      "Urgency and after-hours work",
      "Testing and compliance documentation needs",
    ],
    tips: [
      "Ask for an itemised quote with labour, call-out, and parts separated.",
      "Book non-urgent work during weekdays to avoid premium rates.",
      "Combine multiple small electrical tasks into one booking.",
      "Confirm testing and compliance steps before approving DB board work.",
    ],
    faqs: [
      {
        question: "How much does an electrician cost in Johannesburg?",
        answer:
          "Johannesburg electricians commonly charge around R450–R1,150 per hour plus a call-out fee. Complex work like DB board repairs and fault-finding can cost more.",
      },
      {
        question: "Do electricians charge a call-out fee in Johannesburg?",
        answer:
          "Yes. Call-out fees often cover travel and initial diagnostics and commonly range from about R350–R950. Some electricians deduct it if you proceed with the job.",
      },
      {
        question: "How much does it cost to fix a tripping circuit breaker?",
        answer:
          "Costs vary based on the cause. Minor fixes may be under R1,500, but fault-finding and DB work can run higher if parts need replacement or wiring issues are found.",
      },
      {
        question: "Is it safe to hire the cheapest electrician?",
        answer:
          "Not always. Electrical work affects safety. Prioritise clear scope, qualifications, and proper testing over the lowest price—poor workmanship can be dangerous and costly later.",
      },
      {
        question: "What should I ask for when getting an electrical quote?",
        answer:
          "Ask what’s included (testing, parts, guarantees), the hourly rate, call-out fee, and whether a compliance certificate is needed for the work being done.",
      },
    ],
    relatedSlugs: [
      "electrician-cost-cape-town",
      "plumber-cost-johannesburg",
      "hvac-cost-johannesburg",
      "renovation-cost-johannesburg",
    ],
  },
  {
    slug: "solar-installation-cost-south-africa",
    service: "Solar Installation",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/solar-installation",
    metaTitle: "Solar Installation Cost South Africa (2026) – Prices + Save R20,000+ | ProConnectSA",
    displayTitle: "Solar Installation Cost South Africa (2026) – Prices + Save R20,000+",
    metaDescription:
      "See the real cost to install solar panels in South Africa. Prices, system sizes, savings, and how to get quotes fast.",
    intro:
      "Solar prices in South Africa depend mainly on system size, battery capacity, and inverter brand. This 2026 guide shows typical installed costs for small, medium, and large systems—plus monthly savings examples and payback so you can decide with confidence.",
    heroTrustSignals: [
      "Trusted by homeowners across South Africa",
      "Compare verified installers — free, no obligation",
    ],
    quoteComparisonBlock: {
      heading: "Compare 3 solar quotes in your area",
      bullets: [
        "See real installer prices for your roof",
        "Compare system sizes, batteries, and warranties side by side",
        "Choose the best deal — no obligation to hire",
      ],
      buttonLabel: "Get 3 free quotes",
      buttonHref: "/services/solar-installation",
    },
    localCostQuickLinks: {
      heading: "Solar installation cost by city",
      links: [
        { label: "Solar quotes — South Africa (all areas)", href: "/services/solar-installation" },
        { label: "Solar cost in Cape Town", href: "/cape-town/solar-installation" },
        { label: "Solar cost in Johannesburg", href: "/johannesburg/solar-installation" },
        { label: "Solar cost in Durban", href: "/durban/solar-installation" },
      ],
    },
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get 3 free solar quotes in your area",
      linkHref:
        "https://www.proconnectsa.co.za/services/solar-installation?utm_source=guide&utm_medium=inline_cta&utm_campaign=solar_cost_guide",
      afterLink: " — fast, free, and no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much does solar installation cost in South Africa?",
      leadParagraph:
        "The cost of solar installation in South Africa ranges from R45,000 to R260,000+ depending on system size, battery capacity, and components.",
    },
    heroCtaLabel: "Get 3 free solar quotes in your area",
    footerCtaLabel: "Get 3 free solar quotes in your area",
    footerCtaHeading: "Ready to lock in pricing from verified installers?",
    footerCtaSupportingText:
      "Compare up to 3 quotes for your roof and usage—no obligation. See who offers the best value on panels, inverter, and batteries.",
    quickPriceCtaLabel: "Get 3 free solar quotes in your area",
    pricingTableHeaders: {
      labelColumn: "System size",
      valueColumn: "Typical installed price (2026)",
    },
    monthlySavingsSection: {
      heading: "Monthly savings example (illustrative)",
      body:
        "A mid-size hybrid system that offsets a large share of grid use can reduce your municipal bill by roughly R1,500–R4,000+ per month depending on tariffs, self-consumption, and how much you rely on batteries during load-shedding. Savings are not guaranteed—ask installers to model kWh offset using your actual usage.",
    },
    roiSection: {
      heading: "ROI and payback",
      body:
        "Many homeowners see simple payback in the range of about 4–7 years when electricity tariffs rise and the system is sized to match real usage—not just the cheapest sticker price. ROI improves when you factor in fewer spoils from outages, predictable energy costs, and possible property appeal. Get itemised quotes that show estimated annual kWh production and projected savings so you can compare apples to apples.",
    },
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "solar installers", href: "/services/solar-installation" },
      { phrase: "electricians", href: "/services/electrical" },
      { phrase: "Cape Town", href: "/cape-town/solar-installation" },
      { phrase: "Johannesburg", href: "/johannesburg/solar-installation" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "Small system — 3–5kW inverter, starter battery / limited backup", range: "R45,000 – R85,000" },
      { label: "Medium system — 5–8kW hybrid, battery + panels for most homes", range: "R85,000 – R140,000" },
      { label: "Large system — 8–12kW+ with larger battery bank", range: "R140,000 – R260,000+" },
      { label: "Add-on: panels (supply + install, per panel, indicative)", range: "R2,200 – R4,500" },
      { label: "Add-on: battery storage (per kWh installed, indicative)", range: "R6,500 – R12,500/kWh" },
    ],
    priceFactors: [
      "System size (kW) and your household’s daily usage",
      "Battery capacity (kWh) and desired runtime during load-shedding",
      "Inverter brand/type (hybrid vs off-grid) and warranty",
      "Roof type/angle and installation complexity (mounting + cabling runs); regional labour and installer rates vary between metros such as Cape Town and Johannesburg.",
      "Compliance, COC, and any DB board upgrades required",
      "Monitoring, surge protection, and optional add-ons (EV charger, geyser control)",
    ],
    tips: [
      "Compare 2–3 quotes with the same target spec (kW, kWh, panel count, warranties).",
      "Ask for performance assumptions (estimated kWh/day) and payback expectations.",
      "Prioritise reputable brands and clear warranty/support terms over the cheapest package.",
      "Confirm compliance paperwork and whether licensed electricians are needed for DB board upgrades tied to solar.",
    ],
    faqs: [
      {
        question: "How much does solar cost in South Africa?",
        answer:
          "Installed systems commonly fall between about R45,000 and R260,000+ depending on whether you need a small backup setup, a mid-size hybrid, or a large home system with more battery storage. Exact pricing needs a site assessment.",
      },
      {
        question: "Is solar worth it?",
        answer:
          "For many households, yes—especially with rising tariffs and load-shedding. Value depends on your usage, tariff structure, system size, and how long you plan to stay in the home. Compare projected savings and payback on written quotes.",
      },
      {
        question: "How long does solar installation take?",
        answer:
          "Most residential jobs take about 1–3 days on site once equipment is on hand. Complex roofs, long cable runs, or DB upgrades can add time. Your installer should give a written schedule.",
      },
      {
        question: "Do I need a battery for solar to work during load-shedding?",
        answer:
          "Yes. Panels alone won’t keep your power on during outages. A hybrid inverter with batteries (and correct wiring) is typically needed for backup power.",
      },
      {
        question: "How do I choose a good solar installer?",
        answer:
          "Compare quotes, check reviews, confirm experience with your inverter/battery brand, and ensure compliance paperwork is included. Ask about warranties and after-sales support.",
      },
    ],
    relatedSlugs: [
      "electrician-cost-cape-town",
      "electrician-cost-johannesburg",
      "roofing-cost-south-africa",
      "renovation-cost-cape-town",
    ],
  },
  {
    slug: "plumbing-cost-south-africa",
    service: "Plumbing",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/plumbing",
    metaTitle: "Plumber Cost South Africa (2026 Prices + Quotes) | ProConnectSA",
    displayTitle: "Plumber Cost South Africa (2026 Prices + Quotes)",
    metaDescription:
      "Plumber costs in South Africa range from R500 to R5,000+ for typical jobs in 2026. Compare quotes from verified plumbers — free, no obligation.",
    intro:
      "Plumbing costs in South Africa vary with job type, parts, and urgency—from small repairs to burst pipes and geyser work. This 2026 guide outlines realistic price ranges so you can budget and compare plumbers across major metros. If you are also planning solar or backup water, see the cost of solar panels in South Africa in our dedicated guide.",
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get up to 3 free quotes from verified plumbers",
      linkHref:
        "https://www.proconnectsa.co.za/services/plumbing?utm_source=guide&utm_medium=inline_cta&utm_campaign=plumbing_cost_guide",
      afterLink: " in your area — free and with no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much does a plumber cost in South Africa?",
      leadParagraph:
        "The cost of hiring a plumber in South Africa ranges from R500 to R5,000+ depending on the job complexity, parts required, and your location.",
    },
    heroTrustSignals: [
      "Trusted by homeowners across South Africa",
      "Compare verified plumbers — free, no obligation",
    ],
    quoteComparisonBlock: {
      heading: "Compare 3 plumbing quotes in your area",
      bullets: [
        "See real call-out and labour rates for your job",
        "Compare itemised scopes, parts, and warranties",
        "Choose the best deal — no obligation to hire",
      ],
      buttonLabel: "Get 3 free quotes",
      buttonHref: "/services/plumbing",
    },
    localCostQuickLinks: {
      heading: "Plumber cost by city",
      links: [
        { label: "Plumbing quotes — South Africa (all areas)", href: "/services/plumbing" },
        { label: "Plumber cost in Cape Town", href: "/cape-town/plumbing" },
        { label: "Plumber cost in Johannesburg", href: "/johannesburg/plumbing" },
        { label: "Plumber cost in Durban", href: "/durban/plumbing" },
      ],
    },
    footerCtaHeading: "Ready to compare quotes from verified plumbers?",
    footerCtaSupportingText:
      "Compare up to 3 quotes for your job—no obligation. See who offers the best value on labour, parts, and call-outs.",
    quickPriceCtaLabel: "Get 3 free quotes in your area",
    monthlySavingsSection: {
      heading: "How fixing leaks early saves money",
      body:
        "Small leaks and worn washers can escalate into ceiling damage, mould, and emergency call-outs that cost far more than a routine repair. Fixing issues early often keeps total spend in the hundreds instead of thousands—and cuts wasted water on your municipal bill.",
    },
    roiSection: {
      heading: "Value of comparing quotes",
      body:
        "The same repair can be quoted differently depending on scope, parts, and whether the job is fixed-price or time-and-materials. Comparing 2–3 written quotes helps you spot hidden extras and choose fair pricing—not just the lowest number on a phone call.",
    },
    heroCtaLabel: "Get 3 Free Plumbing Quotes in 24 Hours",
    footerCtaLabel: "Get 3 Free Plumbing Quotes in 24 Hours",
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "cost of solar panels in South Africa", href: "/resources/solar-installation-cost-south-africa" },
      { phrase: "plumbers", href: "/services/plumbing" },
      { phrase: "electricians", href: "/services/electrical" },
      { phrase: "Johannesburg", href: "/johannesburg/plumbing" },
      { phrase: "Cape Town", href: "/cape-town/plumbing" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "Standard call-out fee", range: "R350 – R950" },
      { label: "Hourly labour (typical)", range: "R450 – R1,050/hr" },
      { label: "Minor repairs (leaks, taps, toilets)", range: "R500 – R2,500" },
      { label: "Drain/blockage and jetting", range: "R850 – R2,800" },
      { label: "Geyser repair/replace (labour + parts)", range: "R2,500 – R8,000+" },
    ],
    priceFactors: [
      "Job complexity and whether parts are supplied or you buy them separately",
      "Urgency (after-hours and weekend rates are higher)",
      "Pipe accessibility and whether tiling or wall work is needed",
      "Water damage and whether multiple visits are required",
      "Compliance with local regulations and certificates required",
      "Regional labour differences—compare quotes from plumbers in Cape Town versus Johannesburg",
    ],
    tips: [
      "Get 2–3 itemised quotes with the same scope before you approve work.",
      "Ask whether the call-out fee is offset if you proceed with the job.",
      "Confirm guarantees on labour and parts, and what happens if the issue returns.",
      "For electrical work tied to geysers, use licensed electricians where required.",
    ],
    faqs: [
      {
        question: "How much does a plumber charge per hour in South Africa?",
        answer:
          "Most plumbers charge roughly R450–R1,050 per hour in 2026, plus call-out and parts. Emergency or after-hours rates are often higher.",
      },
      {
        question: "What is a typical plumbing call-out fee?",
        answer:
          "Call-out fees commonly range from R350–R950 depending on travel distance and time of day. Some plumbers deduct part of the call-out if you agree to the quoted work.",
      },
      {
        question: "Why do plumbing quotes differ so much?",
        answer:
          "Quotes differ because of scope, part brands, warranty terms, and whether the job is fixed-price or time-and-materials. Always compare what is included line by line.",
      },
      {
        question: "Should I fix a small leak immediately?",
        answer:
          "Yes. Small leaks can escalate into mould, ceiling damage, and higher bills. Early fixes are usually cheaper than emergency call-outs.",
      },
      {
        question: "How do I choose a reliable plumber?",
        answer:
          "Compare quotes, check reviews for similar jobs, confirm availability, and ask for proof of compliance or guarantees where relevant.",
      },
    ],
    relatedSlugs: [
      "plumber-cost-cape-town",
      "plumber-cost-johannesburg",
      "solar-installation-cost-south-africa",
      "electrician-cost-johannesburg",
    ],
  },
  {
    slug: "electrician-cost-south-africa",
    service: "Electrical Installation",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/electrical",
    metaTitle: "Electrician Cost South Africa (2026 Prices + Quotes) | ProConnectSA",
    displayTitle: "Electrician Cost South Africa (2026 Prices + Quotes)",
    metaDescription:
      "Electrician costs in South Africa range from R600 to R8,000+ for typical jobs in 2026. Compare quotes from verified electricians — free, no obligation.",
    intro:
      "Electrician costs in South Africa depend on scope, materials, and whether a Certificate of Compliance (COC) is required. This 2026 guide compares electricians across common jobs and helps you budget for compliant work in major metros. For solar and backup power, read our solar installation cost guide with national pricing benchmarks.",
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get up to 3 free quotes from verified electricians",
      linkHref:
        "https://www.proconnectsa.co.za/services/electrical?utm_source=guide&utm_medium=inline_cta&utm_campaign=electrician_cost_guide",
      afterLink: " in your area — free and with no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much does an electrician cost in South Africa?",
      leadParagraph:
        "The cost of hiring an electrician in South Africa ranges from R600 to R8,000+ depending on the work required, materials, and whether a Certificate of Compliance is needed.",
    },
    heroTrustSignals: [
      "Trusted by homeowners across South Africa",
      "Compare verified electricians — free, no obligation",
    ],
    quoteComparisonBlock: {
      heading: "Compare 3 electrical quotes in your area",
      bullets: [
        "See real hourly rates, call-outs, and COC-related pricing",
        "Compare itemised scopes for DB work, circuits, and compliance",
        "Choose the best deal — no obligation to hire",
      ],
      buttonLabel: "Get 3 free quotes",
      buttonHref: "/services/electrical",
    },
    localCostQuickLinks: {
      heading: "Electrician cost by city",
      links: [
        { label: "Electrical quotes — South Africa (all areas)", href: "/services/electrical" },
        { label: "Electrician cost in Cape Town", href: "/cape-town/electrical" },
        { label: "Electrician cost in Johannesburg", href: "/johannesburg/electrical" },
        { label: "Electrician cost in Durban", href: "/durban/electrical" },
      ],
    },
    footerCtaHeading: "Ready to compare quotes from verified electricians?",
    footerCtaSupportingText:
      "Compare up to 3 quotes for compliant work—no obligation. See clear scope on labour, materials, testing, and COCs.",
    quickPriceCtaLabel: "Get 3 free quotes in your area",
    monthlySavingsSection: {
      heading: "How compliant work avoids costly rework",
      body:
        "Faulty circuits and skipped testing can lead to insurance issues, failed inspections, and expensive call-backs. Paying for proper diagnostics and compliance up front often costs less than fixing damage or repeating work later.",
    },
    roiSection: {
      heading: "ROI of comparing electrical quotes",
      body:
        "Electrical quotes differ when scope, materials, and warranty differ. Comparing itemised quotes helps you see where money goes—labour vs parts vs compliance—and pick the best long-term value, not only the cheapest headline.",
    },
    heroCtaLabel: "Get 3 Free Electrician Quotes in 24 Hours",
    footerCtaLabel: "Get 3 Free Electrician Quotes in 24 Hours",
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "solar installation cost", href: "/resources/solar-installation-cost-south-africa" },
      { phrase: "electricians", href: "/services/electrical" },
      { phrase: "solar installers", href: "/services/solar-installation" },
      { phrase: "Johannesburg", href: "/johannesburg/electrical" },
      { phrase: "Cape Town", href: "/cape-town/electrical" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "Call-out fee (weekday)", range: "R350 – R1,000" },
      { label: "Hourly rate (standard)", range: "R450 – R1,050/hr" },
      { label: "Minor repairs (plugs, lights, circuits)", range: "R600 – R3,500" },
      { label: "DB board work / COC-related jobs", range: "R2,500 – R8,000+" },
      { label: "Larger installations (scope-dependent)", range: "R8,000 – R45,000+" },
    ],
    priceFactors: [
      "Type of work: fault-finding vs new circuits vs DB board upgrades",
      "Compliance, testing, and whether a COC is required",
      "Materials (breakers, cabling, fittings) and brand choices",
      "Access and complexity (ceiling work, chasing, height)",
      "After-hours or emergency call-outs",
      "Regional labour rates—compare electricians in Cape Town versus Johannesburg",
    ],
    tips: [
      "Ask for an itemised quote that separates labour, materials, and call-out fees.",
      "When adding backup power, coordinate solar installers and your electrician on inverter and DB compatibility.",
      "Confirm warranty on workmanship and parts before you approve the job.",
      "Avoid cutting corners on safety—cheap quotes that skip testing can cost more later.",
    ],
    faqs: [
      {
        question: "How much do electricians charge per hour in South Africa?",
        answer:
          "Typical hourly rates are around R450–R1,050 in 2026, depending on experience and job type. Fault-finding and DB work can take longer than simple installations.",
      },
      {
        question: "What is a COC and when do I need one?",
        answer:
          "A Certificate of Compliance confirms electrical work meets safety standards. It is often required for property sales and certain alterations—ask your electrician whether your job needs one.",
      },
      {
        question: "Why does fault-finding cost more than installing a plug?",
        answer:
          "Fault-finding can require time to test circuits and isolate the issue before repairs begin, so labour hours may be higher even if the fix looks small.",
      },
      {
        question: "Should I hire the cheapest electrician?",
        answer:
          "Not always. Prioritise clear scope, qualifications, and proper testing—electrical mistakes can be dangerous and expensive to fix.",
      },
      {
        question: "How do I compare electrician quotes fairly?",
        answer:
          "Compare the same scope, materials, warranties, and whether compliance testing is included—not only the headline total.",
      },
    ],
    relatedSlugs: [
      "electrician-cost-cape-town",
      "electrician-cost-johannesburg",
      "solar-installation-cost-south-africa",
      "plumbing-cost-south-africa",
    ],
  },
  {
    slug: "house-painting-cost-south-africa",
    service: "House Painting",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/painting",
    metaTitle: "House Painting Cost South Africa (2026 Prices + Quotes) | ProConnectSA",
    displayTitle: "House Painting Cost South Africa (2026 Prices + Quotes)",
    metaDescription:
      "House painting in South Africa costs R15–R45/m² or more in 2026. Compare quotes from verified painters — free, no obligation.",
    intro:
      "House painting prices depend on preparation, paint quality, and access. This 2026 guide compares painters in major metros and helps you align timelines with builders when painting is part of a renovation. Planning broader home upgrades? Check current solar prices in our national solar installation guide.",
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get up to 3 free quotes from verified painters",
      linkHref:
        "https://www.proconnectsa.co.za/services/painting?utm_source=guide&utm_medium=inline_cta&utm_campaign=painting_cost_guide",
      afterLink: " in your area — free and with no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much does house painting cost in South Africa?",
      leadParagraph:
        "House painting in South Africa costs between R15 per square metre and R45 per square metre depending on paint quality, surface preparation, and the size of the job.",
    },
    heroTrustSignals: [
      "Trusted by homeowners across South Africa",
      "Compare verified painters — free, no obligation",
    ],
    quoteComparisonBlock: {
      heading: "Compare 3 painting quotes in your area",
      bullets: [
        "See real per-m² rates and what prep is included",
        "Compare paint systems, coats, and timelines side by side",
        "Choose the best deal — no obligation to hire",
      ],
      buttonLabel: "Get 3 free quotes",
      buttonHref: "/services/painting",
    },
    localCostQuickLinks: {
      heading: "House painting cost by city",
      links: [
        { label: "Painting quotes — South Africa (all areas)", href: "/services/painting" },
        { label: "Painter cost in Cape Town", href: "/cape-town/painting" },
        { label: "Painter cost in Johannesburg", href: "/johannesburg/painting" },
        { label: "Painter cost in Durban", href: "/durban/painting" },
      ],
    },
    footerCtaHeading: "Ready to compare quotes from verified painters?",
    footerCtaSupportingText:
      "Compare up to 3 quotes with the same m² and spec—no obligation. See who delivers the best prep and finish for your budget.",
    quickPriceCtaLabel: "Get 3 free quotes in your area",
    monthlySavingsSection: {
      heading: "How good prep saves money on paint jobs",
      body:
        "Skipping filling, sanding, or damp treatment often means paint fails early—then you pay twice. Quotes that include proper preparation usually last longer and look better, lowering lifetime cost per year.",
    },
    roiSection: {
      heading: "ROI of comparing painter quotes",
      body:
        "Two quotes can look similar until you compare coats, product grades, and preparation. Itemised comparisons help you avoid cheap quotes that cut corners on prep or use thin paint coverage.",
    },
    heroCtaLabel: "Get 3 Free Painting Quotes in 24 Hours",
    footerCtaLabel: "Get 3 Free Painting Quotes in 24 Hours",
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "solar prices", href: "/resources/solar-installation-cost-south-africa" },
      { phrase: "painters", href: "/services/painting" },
      { phrase: "builders", href: "/services/renovations" },
      { phrase: "Johannesburg", href: "/johannesburg/painting" },
      { phrase: "Cape Town", href: "/cape-town/painting" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "Interior painting (per m²)", range: "R15 – R45/m²" },
      { label: "Exterior painting (per m²)", range: "R25 – R65/m²" },
      { label: "Single room (standard prep)", range: "R2,500 – R9,000" },
      { label: "Ceilings (per m²)", range: "R35 – R90/m²" },
      { label: "Full home interior (scope-dependent)", range: "R25,000 – R120,000+" },
    ],
    priceFactors: [
      "Surface preparation (filling, sanding, damp treatment)",
      "Paint system quality (premium vs contractor grade)",
      "Height access, scaffolding, and safety requirements",
      "Number of coats and colour changes",
      "Weather windows for exterior work",
      "Regional labour rates—compare painters in Cape Town versus Johannesburg",
    ],
    tips: [
      "Get 2–3 quotes with the same m² count and paint specification.",
      "Ask what preparation is included before the first coat goes on.",
      "Confirm who supplies paint and how touch-ups are handled after completion.",
      "If walls are being moved or plastered, sequence the work with builders before final coats.",
    ],
    faqs: [
      {
        question: "How much does interior painting cost per square metre?",
        answer:
          "In 2026, many interior jobs fall between about R15–R45/m² depending on prep, paint quality, and access. Complex surfaces or high ceilings can cost more.",
      },
      {
        question: "Is labour or paint the bigger cost?",
        answer:
          "It depends on the specification. Premium paint and heavy preparation can rival labour on some jobs—compare quotes with a clear materials list.",
      },
      {
        question: "How long does house painting take?",
        answer:
          "A few rooms may take a couple of days; full interiors can take a week or more depending on drying time, prep, and occupancy.",
      },
      {
        question: "Do painters charge extra for high walls?",
        answer:
          "Often yes. Scaffolding, ladders, and slower production on high areas usually add cost compared with standard room heights.",
      },
      {
        question: "How do I choose a reliable painter?",
        answer:
          "Compare references, review photos of similar work, and confirm warranty terms and payment milestones in writing.",
      },
    ],
    relatedSlugs: [
      "solar-installation-cost-south-africa",
      "painting-cost-cape-town",
      "painting-cost-durban",
      "painting-cost-pretoria",
    ],
  },
  {
    slug: "pest-control-cost-south-africa",
    service: "Pest Control",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/pest-control",
    metaTitle: "Pest Control Cost South Africa (2026 Prices + Quotes) | ProConnectSA",
    displayTitle: "Pest Control Cost South Africa (2026 Prices + Quotes)",
    metaDescription:
      "Pest control in South Africa costs R500–R3,500+ per treatment in 2026. Compare quotes from verified specialists — free, no obligation.",
    intro:
      "Pest control pricing depends on pest type, property size, and whether follow-up visits are needed. This 2026 guide outlines typical treatment ranges and how to compare pest control with cleaning services when you want a full home refresh. For energy upgrades alongside home maintenance, see solar installation cost ranges in our national solar guide.",
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get up to 3 free quotes from verified pest control specialists",
      linkHref:
        "https://www.proconnectsa.co.za/services/pest-control?utm_source=guide&utm_medium=inline_cta&utm_campaign=pest_control_cost_guide",
      afterLink: " in your area — free and with no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much does pest control cost in South Africa?",
      leadParagraph:
        "Pest control in South Africa costs between R500 and R3,500+ depending on the type of pest, property size, and number of treatments required.",
    },
    heroTrustSignals: [
      "Trusted by homeowners across South Africa",
      "Compare verified pest specialists — free, no obligation",
    ],
    quoteComparisonBlock: {
      heading: "Compare 3 pest control quotes in your area",
      bullets: [
        "See real per-visit and programme pricing for your pest type",
        "Compare follow-ups, guarantees, and treatment plans",
        "Choose the best deal — no obligation to hire",
      ],
      buttonLabel: "Get 3 free quotes",
      buttonHref: "/services/pest-control",
    },
    localCostQuickLinks: {
      heading: "Pest control cost by city",
      links: [
        { label: "Pest control quotes — South Africa (all areas)", href: "/services/pest-control" },
        { label: "Pest control cost in Cape Town", href: "/cape-town/pest-control" },
        { label: "Pest control cost in Johannesburg", href: "/johannesburg/pest-control" },
        { label: "Pest control cost in Durban", href: "/durban/pest-control" },
      ],
    },
    footerCtaHeading: "Ready to compare quotes from verified pest specialists?",
    footerCtaSupportingText:
      "Compare up to 3 quotes for your property—no obligation. See clear scope on treatments, follow-ups, and guarantees.",
    quickPriceCtaLabel: "Get 3 free quotes in your area",
    monthlySavingsSection: {
      heading: "How early treatment saves money",
      body:
        "Letting rodents or termites spread usually increases repair bills and repeat treatments. Acting when signs are mild often keeps costs lower than full-blown infestations or structural damage.",
    },
    roiSection: {
      heading: "ROI of comparing pest control plans",
      body:
        "Programme pricing can look higher until you compare follow-ups and guarantees. A plan that covers return visits if pests reappear can be cheaper than cheap single visits that don’t solve the root cause.",
    },
    heroCtaLabel: "Get 3 Free Pest Control Quotes in 24 Hours",
    footerCtaLabel: "Get 3 Free Pest Control Quotes in 24 Hours",
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "solar installation cost", href: "/resources/solar-installation-cost-south-africa" },
      { phrase: "pest control", href: "/services/pest-control" },
      { phrase: "cleaning services", href: "/services/cleaning" },
      { phrase: "Johannesburg", href: "/johannesburg/pest-control" },
      { phrase: "Cape Town", href: "/cape-town/pest-control" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "General insect treatment (per visit)", range: "R500 – R2,000" },
      { label: "Rodent treatment (baiting + follow-up)", range: "R1,200 – R3,500" },
      { label: "Termite inspection", range: "R450 – R1,500" },
      { label: "Termite treatment (scope-dependent)", range: "R3,000 – R18,000+" },
      { label: "Commercial / large premises (estimate)", range: "R2,500 – R12,000+" },
    ],
    priceFactors: [
      "Pest type and severity (ants vs termites vs rodents)",
      "Property size and number of treatment zones",
      "Number of follow-up visits included in the plan",
      "Whether proofing or exclusion work is required",
      "Indoor vs outdoor treatment areas",
      "Regional pricing—compare providers in Cape Town versus Johannesburg",
    ],
    tips: [
      "Describe signs clearly (droppings, damage, entry points) when requesting quotes.",
      "Ask what follow-up visits cover and whether guarantees apply if pests return.",
      "Combine pest control with cleaning services after treatment if you need a deep reset.",
      "Confirm whether products are safe for pets and children where relevant.",
    ],
    faqs: [
      {
        question: "How much does a pest control visit cost?",
        answer:
          "Many residential visits fall between R500–R3,500+ in 2026 depending on pest type, property size, and whether follow-ups are included.",
      },
      {
        question: "Do I need more than one treatment?",
        answer:
          "Often yes for rodents and some insects. Ask your provider what the plan covers and what happens if activity continues.",
      },
      {
        question: "Are termite treatments more expensive?",
        answer:
          "Termite work can be higher because it may require inspections, targeted treatment, and sometimes ongoing monitoring depending on risk.",
      },
      {
        question: "Is pest control safe for pets?",
        answer:
          "Many treatments can be pet-safe when applied correctly. Tell your provider about pets and follow any preparation advice they give.",
      },
      {
        question: "How do I choose a pest control provider?",
        answer:
          "Compare scope, guarantees, follow-ups, and reviews for similar pest issues—not only the lowest headline price.",
      },
    ],
    relatedSlugs: [
      "solar-installation-cost-south-africa",
      "cleaning-cost-cape-town",
      "cleaning-cost-johannesburg",
      "house-painting-cost-south-africa",
    ],
  },
  {
    slug: "cleaning-services-cost-south-africa",
    service: "Cleaning Services",
    city: "South Africa",
    province: "National",
    ctaLink: "/services/cleaning",
    metaTitle: "Cleaning Services Cost South Africa (2026 Prices + Quotes) | ProConnectSA",
    displayTitle: "Cleaning Services Cost South Africa (2026 Prices + Quotes)",
    metaDescription:
      "Cleaning services in South Africa cost R200–R2,500+ per session in 2026. Compare quotes from verified cleaners — free, no obligation.",
    intro:
      "Cleaning service rates in South Africa vary with home size, frequency, and deep-clean vs standard scope. This guide compares cleaning services across typical 2026 pricing and explains when to add pest control for a full hygiene reset. Compare quotes in Cape Town, Johannesburg, and beyond.",
    introConversion: {
      beforeLink: "💡 Want exact pricing for your home? ",
      linkText: "Get up to 3 free quotes from verified cleaning services",
      linkHref:
        "https://www.proconnectsa.co.za/services/cleaning?utm_source=guide&utm_medium=inline_cta&utm_campaign=cleaning_cost_guide",
      afterLink: " in your area — free and with no obligation.",
    },
    featuredCostSnippet: {
      heading: "How much do cleaning services cost in South Africa?",
      leadParagraph:
        "Cleaning services in South Africa cost between R200 and R2,500+ per session depending on property size, type of clean, and frequency of service.",
    },
    heroCtaLabel: "Get 3 Free Cleaning Quotes in 24 Hours",
    footerCtaLabel: "Get 3 Free Cleaning Quotes in 24 Hours",
    enableGuideInlineLinks: true,
    inlineLinkTargets: [
      { phrase: "cleaning services", href: "/services/cleaning" },
      { phrase: "pest control", href: "/services/pest-control" },
      { phrase: "Johannesburg", href: "/johannesburg/cleaning" },
      { phrase: "Cape Town", href: "/cape-town/cleaning" },
    ],
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly rate (1 cleaner)", range: "R80 – R220/hr" },
      { label: "Apartment (1–2 bed) standard clean", range: "R600 – R1,500" },
      { label: "House (3–4 bed) standard clean", range: "R1,200 – R2,500" },
      { label: "Deep clean (detail work)", range: "R1,500 – R4,000" },
      { label: "Move-in / move-out cleaning", range: "R1,800 – R6,000+" },
    ],
    priceFactors: [
      "Property size and number of bathrooms",
      "Standard vs deep clean vs move-in/move-out scope",
      "Frequency (weekly cleans often cost less per visit)",
      "Extras (ovens, windows, fridges, balconies)",
      "Travel and parking in dense metros",
      "Regional rates—compare cleaning services in Cape Town versus Johannesburg",
    ],
    tips: [
      "Share photos and a task list so quotes reflect the same scope.",
      "Book recurring cleans if you want lower per-visit pricing.",
      "Add pest control first if you are dealing with insects or rodents—then schedule a deep clean if needed.",
      "Confirm whether supplies are included or supplied by you.",
    ],
    faqs: [
      {
        question: "How much do cleaning services cost per hour?",
        answer:
          "Hourly rates often fall between R80–R220 per cleaner in 2026 depending on city, frequency, and whether it is a company or independent cleaner.",
      },
      {
        question: "Is a deep clean worth the extra cost?",
        answer:
          "Deep cleans can be worthwhile for move-ins, post-renovation dust, or seasonal resets—compare what is included versus a standard clean.",
      },
      {
        question: "Do cleaners bring their own supplies?",
        answer:
          "Some do and some do not. Confirm upfront because it affects the quote and the results you can expect.",
      },
      {
        question: "How do I compare cleaning quotes fairly?",
        answer:
          "Compare the same room list, hours estimate, products, and guarantees—not only the cheapest total.",
      },
      {
        question: "How often should I schedule cleaning?",
        answer:
          "Weekly or fortnightly is common for busy households; monthly or ad hoc works for smaller homes or tight budgets.",
      },
    ],
    relatedSlugs: [
      "cleaning-cost-cape-town",
      "cleaning-cost-johannesburg",
      "pest-control-cost-south-africa",
      "plumbing-cost-south-africa",
    ],
  },
  {
    slug: "painting-cost-cape-town",
    service: "House Painting",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/painting",
    metaTitle: "Painting Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Painting in Cape Town costs about R50–R120/m² or R2,500–R9,000 per room in 2026. Compare verified painters’ quotes — free, no obligation.",
    intro:
      "Painting prices in Cape Town are usually based on surface area, preparation required, and the quality of paint. This 2026 guide breaks down typical per‑m² and per‑room costs so you can compare painter quotes with confidence.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Interior painting (per m²)", range: "R50 – R120/m²" },
      { label: "Exterior painting (per m²)", range: "R70 – R160/m²" },
      { label: "Single room (standard prep)", range: "R2,500 – R6,500" },
      { label: "Large room / open-plan area", range: "R5,000 – R12,000" },
      { label: "Ceilings (per m²)", range: "R35 – R90/m²" },
    ],
    priceFactors: [
      "Surface prep (cracks, peeling paint, sanding, primer)",
      "Number of coats and paint quality/brand",
      "Heights and access (double-storey, scaffolding, high ceilings)",
      "Interior vs exterior conditions (sun, salt air, weather exposure)",
      "Trim work (doors, skirtings, window frames) vs walls only",
      "Timeline urgency and crew size required",
    ],
    tips: [
      "Ask painters to quote with the same paint spec (brand + number of coats) so you can compare fairly.",
      "Do proper prep—skipping it can cause peeling and repaint costs later.",
      "Bundle multiple rooms for a better rate per room.",
      "Schedule exterior painting outside the rainy season for fewer delays.",
    ],
    faqs: [
      {
        question: "How much does it cost to paint a house in Cape Town?",
        answer:
          "Costs depend on size and prep, but many jobs price at roughly R50–R120 per m² for interiors. Per-room pricing often ranges from about R2,500–R6,500 for standard rooms.",
      },
      {
        question: "Is it cheaper to paint per room or per square metre?",
        answer:
          "Per m² is common for larger jobs and gives a clearer comparison. Per-room pricing can be convenient but varies based on ceilings, trim, and prep—ask what’s included.",
      },
      {
        question: "What’s included in a painter’s quote?",
        answer:
          "Quotes often include labour and basic prep, but paint, primer, crack filling, and scaffolding may be separate. Always confirm number of coats and the paint brand.",
      },
      {
        question: "How long does interior painting take?",
        answer:
          "A single room can take 1–2 days including drying time, while a full house may take a week or more depending on size, prep, and crew size.",
      },
      {
        question: "How do I choose a good painter in Cape Town?",
        answer:
          "Compare quotes, look at previous work, read reviews, and confirm the paint specification and warranty on workmanship. A clear scope helps avoid disputes.",
      },
    ],
    relatedSlugs: [
      "painting-costs",
      "painting-cost-durban",
      "plumber-cost-cape-town",
      "renovation-cost-cape-town",
    ],
  },
  {
    slug: "handyman-cost-cape-town",
    service: "Handyman Services",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/handyman",
    metaTitle: "Handyman Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Handyman services in Cape Town cost R250–R650/hr or R500–R2,500 per job in 2026. Compare verified handymen’s quotes — free, no obligation.",
    intro:
      "Handyman rates in Cape Town vary based on the task, tools required, and whether materials are included. This 2026 guide shows typical hourly and per‑job pricing for common handyman work so you can compare quotes quickly.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly rate", range: "R250 – R650/hr" },
      { label: "Small job call-out / minimum charge", range: "R350 – R900" },
      { label: "TV mounting (wall bracket install)", range: "R500 – R1,500" },
      { label: "Hanging shelves / curtain rails", range: "R450 – R1,200" },
      { label: "Minor repairs (doors, handles, hinges)", range: "R400 – R1,500" },
    ],
    priceFactors: [
      "Job type and time required (simple install vs repairs)",
      "Materials and hardware included (brackets, anchors, screws)",
      "Wall type (brick, drywall, concrete) and drilling complexity",
      "Access (stairs, high ceilings, awkward spaces)",
      "Multiple tasks in one visit vs single small job",
      "Travel time and parking in Cape Town suburbs",
    ],
    tips: [
      "Group multiple small tasks into one booking to lower your effective hourly cost.",
      "Send photos and measurements upfront (wall type, bracket model, item weight).",
      "Confirm whether materials are included or if you must supply them.",
      "Choose a handyman with reviews for your specific job type (mounting, repairs, carpentry).",
    ],
    faqs: [
      {
        question: "How much does a handyman charge per hour in Cape Town?",
        answer:
          "Many Cape Town handymen charge roughly R250–R650 per hour. Some also have a minimum call-out fee for small jobs.",
      },
      {
        question: "What jobs should I use a handyman for?",
        answer:
          "Handymen are ideal for small repairs and installations like mounting TVs, hanging shelves, fixing doors, minor carpentry, and general maintenance. For electrical or plumbing issues, use qualified specialists.",
      },
      {
        question: "Do handymen supply materials?",
        answer:
          "It varies. Some include basic hardware while others expect you to provide brackets, screws, and anchors. Confirm before the booking to avoid delays.",
      },
      {
        question: "Is there a minimum charge for handyman work?",
        answer:
          "Often yes. Many handymen charge a call-out or minimum fee (e.g., for the first hour) to cover travel and setup time, especially for quick jobs.",
      },
      {
        question: "How do I get an accurate handyman quote?",
        answer:
          "Share photos, measurements, wall type, and a list of tasks. The clearer the scope, the more accurate the pricing—especially for installations like TV mounts and shelving.",
      },
    ],
    relatedSlugs: [
      "handyman-costs",
      "painting-cost-cape-town",
      "plumber-cost-cape-town",
      "cleaning-cost-cape-town",
    ],
  },
  {
    slug: "landscaping-cost-cape-town",
    service: "Landscaping",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/landscaping",
    metaTitle: "Landscaping Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Landscaping in Cape Town costs about R350–R750/hr or R250–R650/m² for new lawns in 2026. Compare verified landscapers’ quotes — free.",
    intro:
      "Landscaping costs in Cape Town range from basic garden clean-ups to full garden redesigns and new lawn installation. This 2026 guide shows typical pricing for common landscaping jobs so you can budget and compare quotes from local landscapers.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Landscaper hourly rate", range: "R350 – R750/hr" },
      { label: "Garden cleanup + removal (small yard)", range: "R900 – R2,500" },
      { label: "Lawn installation (per m²)", range: "R250 – R650/m²" },
      { label: "Irrigation installation (small garden)", range: "R3,500 – R12,000" },
      { label: "Garden design (concept + plan)", range: "R2,500 – R15,000" },
    ],
    priceFactors: [
      "Garden size, slope, and current condition (overgrowth adds labour)",
      "Scope: cleanup vs redesign vs installation (lawn, paving, beds)",
      "Plant selection and materials (soil, compost, edging, mulch, stone)",
      "Watering needs (irrigation, drip lines, timers) and plumbing/electrical access",
      "Removal/disposal costs (green waste, rubble, skip hire)",
      "Season and availability (peak spring/summer demand)",
    ],
    tips: [
      "Get a site visit or share photos so quotes reflect real conditions and access.",
      "Ask for a breakdown between labour, plants/materials, and removal costs.",
      "Phase the project (cleanup first, then lawn/irrigation) to spread budget.",
      "Choose water-wise plants and irrigation to reduce long-term maintenance costs.",
    ],
    faqs: [
      {
        question: "How much does landscaping cost in Cape Town?",
        answer:
          "Basic landscaping and maintenance can start from a few hundred rand per hour, while projects like lawn installation and irrigation can run from a few thousand to tens of thousands depending on size and materials.",
      },
      {
        question: "How much does it cost to install a lawn in Cape Town?",
        answer:
          "New lawn installation often ranges from about R250–R650 per m² depending on turf type, ground prep, and whether irrigation or soil improvement is included.",
      },
      {
        question: "What’s included in a garden cleanup quote?",
        answer:
          "Typically trimming, weeding, removal of debris, and sometimes green-waste disposal. Confirm whether removal is included or billed separately (skip hire or trips).",
      },
      {
        question: "Is irrigation worth it in Cape Town’s climate?",
        answer:
          "Many homeowners find drip irrigation or timed systems help conserve water while keeping plants healthy. The right system can reduce manual watering and improve garden results.",
      },
      {
        question: "How do I choose a landscaper in Cape Town?",
        answer:
          "Compare quotes with clear scope, ask for photos of previous work, and check reviews. For larger projects, ensure timelines, materials, and payment milestones are agreed in writing.",
      },
    ],
    relatedSlugs: [
      "landscaping-cost-south-africa",
      "roofing-cost-cape-town",
      "renovation-cost-cape-town",
      "painting-cost-cape-town",
    ],
  },

  {
    slug: "cleaning-service-costs",
    service: "Cleaning Services",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/cleaning",
    metaTitle: "Cleaning Services Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "cleaning services in South Africa cost R80\u2013R220. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide explains what cleaning services cost across South Africa in 2026, from hourly cleaning to deep cleans and move-out work. Use it to compare realistic price ranges before requesting verified quotes.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly rate (1 cleaner)", range: "R80 \u2013 R220/hr" },
      { label: "Standard home clean", range: "R600 \u2013 R2,400" },
      { label: "Deep clean", range: "R1,300 \u2013 R3,800" },
      { label: "Move-in / move-out clean", range: "R1,600 \u2013 R4,500" },
      { label: "Office cleaning (small office)", range: "R1,200 \u2013 R4,000" },
    ],
    priceFactors: [
      "Property size and number of bathrooms",
      "One-off deep clean vs recurring schedule",
      "City, suburb, and travel time",
      "Add-ons like windows, ovens, and carpets",
      "Whether products/equipment are included",
      "Weekend or urgent booking windows",
    ],
    tips: [
      "Get at least three itemized quotes with scope matched.",
      "Book recurring cleans for better per-visit rates.",
      "Share photos and room count before quoting.",
      "Confirm whether products and transport are included.",
    ],
    faqs: [
      {
        question: "How much do cleaning services cost in South Africa?",
        answer: "Most services range from about R80\u2013R220 per hour, with full-job pricing based on home size and cleaning depth." ,
      },
      {
        question: "Is it cheaper to hire hourly or per job?",
        answer: "Hourly can be cheaper for small jobs; fixed-job rates are often better for deep cleans where scope is clear." ,
      },
      {
        question: "What is included in a standard clean?",
        answer: "Usually dusting, mopping, vacuuming, and kitchen/bathroom surface cleaning; extras are charged separately." ,
      },
      {
        question: "Do cleaning companies bring supplies?",
        answer: "Many companies do, but independent cleaners may ask clients to provide products\u2014confirm this before booking." ,
      },
      {
        question: "How can I choose a reliable cleaner?",
        answer: "Check reviews, request references, compare quote details, and verify availability before confirming a booking." ,
      },
    ],
    relatedSlugs: [
      "cleaning-cost-cape-town",
      "cleaning-cost-johannesburg",
      "handyman-costs",
    ],
  },

  {
    slug: "painting-costs",
    service: "House Painting",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/painting",
    metaTitle: "House Painting Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "house painting in South Africa cost R50\u2013R130. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide explains realistic South Africa painting costs for 2026, from standard room repaints to full interior and exterior projects. It helps you compare quotes and understand what is included before you hire.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Interior painting (per m\u00b2)", range: "R50 \u2013 R130/m\u00b2" },
      { label: "Exterior painting (per m\u00b2)", range: "R70 \u2013 R170/m\u00b2" },
      { label: "Standard room repaint", range: "R2,800 \u2013 R7,500" },
      { label: "Open-plan / large area", range: "R5,500 \u2013 R14,000" },
      { label: "Ceiling and trim work", range: "R45 \u2013 R110/m\u00b2" },
    ],
    priceFactors: [
      "Surface prep (cracks, sanding, primer)",
      "Paint brand and number of coats",
      "Accessibility and working height",
      "Interior vs exterior weather exposure",
      "Complex trim/detail requirements",
      "Timeline urgency and crew size",
    ],
    tips: [
      "Compare quotes using the same paint specification.",
      "Ask exactly what prep work is included.",
      "Bundle multiple rooms for better rates.",
      "Request workmanship and paint warranty terms.",
    ],
    faqs: [
      {
        question: "How much does painting cost in South Africa?",
        answer: "Painting in South Africa is usually priced by square meter and prep effort, with interiors generally cheaper than exteriors." ,
      },
      {
        question: "Is paint included in most painting quotes?",
        answer: "Some contractors include paint while others quote labour only, so always confirm the exact paint system included." ,
      },
      {
        question: "What affects the final painting price most?",
        answer: "Surface prep, number of coats, paint quality, and access difficulty usually drive the largest price differences." ,
      },
      {
        question: "How long does a typical painting job take?",
        answer: "A single room can take 1\u20132 days while full-home projects often take several days to a couple of weeks." ,
      },
      {
        question: "How do I choose a reliable painter in South Africa?",
        answer: "Compare like-for-like quotes, verify previous work, and choose painters who provide clear scope and guarantees." ,
      },
    ],
    relatedSlugs: [
      "painting-cost-cape-town",
      "handyman-costs",
      "renovation-cost-cape-town",
    ],
  },

  {
    slug: "painting-cost-durban",
    service: "House Painting",
    city: "Durban",
    province: "KwaZulu-Natal",
    ctaLink: "/durban/painting",
    metaTitle: "House Painting Cost in Durban | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "house painting in Durban cost R50\u2013R130. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide explains realistic Durban painting costs for 2026, from standard room repaints to full interior and exterior projects. It helps you compare quotes and understand what is included before you hire.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Interior painting (per m\u00b2)", range: "R50 \u2013 R130/m\u00b2" },
      { label: "Exterior painting (per m\u00b2)", range: "R70 \u2013 R170/m\u00b2" },
      { label: "Standard room repaint", range: "R2,800 \u2013 R7,500" },
      { label: "Open-plan / large area", range: "R5,500 \u2013 R14,000" },
      { label: "Ceiling and trim work", range: "R45 \u2013 R110/m\u00b2" },
    ],
    priceFactors: [
      "Surface prep (cracks, sanding, primer)",
      "Paint brand and number of coats",
      "Accessibility and working height",
      "Interior vs exterior weather exposure",
      "Complex trim/detail requirements",
      "Timeline urgency and crew size",
    ],
    tips: [
      "Compare quotes using the same paint specification.",
      "Ask exactly what prep work is included.",
      "Bundle multiple rooms for better rates.",
      "Request workmanship and paint warranty terms.",
    ],
    faqs: [
      {
        question: "How much does painting cost in Durban?",
        answer: "Painting in Durban is usually priced by square meter and prep effort, with interiors generally cheaper than exteriors." ,
      },
      {
        question: "Is paint included in most painting quotes?",
        answer: "Some contractors include paint while others quote labour only, so always confirm the exact paint system included." ,
      },
      {
        question: "What affects the final painting price most?",
        answer: "Surface prep, number of coats, paint quality, and access difficulty usually drive the largest price differences." ,
      },
      {
        question: "How long does a typical painting job take?",
        answer: "A single room can take 1\u20132 days while full-home projects often take several days to a couple of weeks." ,
      },
      {
        question: "How do I choose a reliable painter in Durban?",
        answer: "Compare like-for-like quotes, verify previous work, and choose painters who provide clear scope and guarantees." ,
      },
    ],
    relatedSlugs: [
      "painting-cost-cape-town",
      "handyman-costs",
      "renovation-cost-cape-town",
    ],
  },

  {
    slug: "painting-cost-pretoria",
    service: "House Painting",
    city: "Pretoria",
    province: "Gauteng",
    ctaLink: "/pretoria/painting",
    metaTitle: "House Painting Cost in Pretoria | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "house painting in Pretoria cost R50\u2013R130. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide explains realistic Pretoria painting costs for 2026, from standard room repaints to full interior and exterior projects. It helps you compare quotes and understand what is included before you hire.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Interior painting (per m\u00b2)", range: "R50 \u2013 R130/m\u00b2" },
      { label: "Exterior painting (per m\u00b2)", range: "R70 \u2013 R170/m\u00b2" },
      { label: "Standard room repaint", range: "R2,800 \u2013 R7,500" },
      { label: "Open-plan / large area", range: "R5,500 \u2013 R14,000" },
      { label: "Ceiling and trim work", range: "R45 \u2013 R110/m\u00b2" },
    ],
    priceFactors: [
      "Surface prep (cracks, sanding, primer)",
      "Paint brand and number of coats",
      "Accessibility and working height",
      "Interior vs exterior weather exposure",
      "Complex trim/detail requirements",
      "Timeline urgency and crew size",
    ],
    tips: [
      "Compare quotes using the same paint specification.",
      "Ask exactly what prep work is included.",
      "Bundle multiple rooms for better rates.",
      "Request workmanship and paint warranty terms.",
    ],
    faqs: [
      {
        question: "How much does painting cost in Pretoria?",
        answer: "Painting in Pretoria is usually priced by square meter and prep effort, with interiors generally cheaper than exteriors." ,
      },
      {
        question: "Is paint included in most painting quotes?",
        answer: "Some contractors include paint while others quote labour only, so always confirm the exact paint system included." ,
      },
      {
        question: "What affects the final painting price most?",
        answer: "Surface prep, number of coats, paint quality, and access difficulty usually drive the largest price differences." ,
      },
      {
        question: "How long does a typical painting job take?",
        answer: "A single room can take 1\u20132 days while full-home projects often take several days to a couple of weeks." ,
      },
      {
        question: "How do I choose a reliable painter in Pretoria?",
        answer: "Compare like-for-like quotes, verify previous work, and choose painters who provide clear scope and guarantees." ,
      },
    ],
    relatedSlugs: [
      "painting-cost-cape-town",
      "handyman-costs",
      "renovation-cost-cape-town",
    ],
  },

  {
    slug: "handyman-costs",
    service: "Handyman Services",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/handyman",
    metaTitle: "Handyman Services Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "handyman services in South Africa cost R250\u2013R700. Compare verified local quotes \u2014 free, no obligation.",
    intro: "Use this guide to estimate handyman pricing in South Africa for 2026, including hourly labour, call-out fees, and common repair jobs. It helps you compare practical quote ranges before booking.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly labour rate", range: "R250 \u2013 R700/hr" },
      { label: "Minimum call-out fee", range: "R350 \u2013 R950" },
      { label: "Mounting and installation jobs", range: "R450 \u2013 R1,800" },
      { label: "Minor repair jobs", range: "R400 \u2013 R1,600" },
      { label: "Half-day maintenance visit", range: "R1,200 \u2013 R3,200" },
    ],
    priceFactors: [
      "Number of tasks and total on-site time",
      "Wall type and installation complexity",
      "Whether tools or special anchors are needed",
      "Materials supplied by client vs handyman",
      "Travel distance and parking/access",
      "Urgent or after-hours appointments",
    ],
    tips: [
      "Group small jobs into one booking to reduce minimum fees.",
      "Provide photos and measurements before quoting.",
      "Confirm whether materials are included.",
      "Pick specialists with reviews in your exact job type.",
    ],
    faqs: [
      {
        question: "How much does a handyman cost in South Africa?",
        answer: "Handyman rates in South Africa usually include an hourly fee and often a minimum call-out for small jobs." ,
      },
      {
        question: "What jobs are best for a handyman?",
        answer: "Handymen are ideal for minor repairs, installations, mounting, and general maintenance tasks." ,
      },
      {
        question: "Do handymen include materials in the quote?",
        answer: "Quotes vary: some include basic consumables while major materials are usually billed separately." ,
      },
      {
        question: "Is there a minimum booking fee?",
        answer: "Yes, many providers apply a minimum charge to cover travel and setup time." ,
      },
      {
        question: "How can I get an accurate handyman quote in South Africa?",
        answer: "Share photos, measurements, and a full task list so the provider can quote realistically." ,
      },
    ],
    relatedSlugs: [
      "handyman-cost-cape-town",
      "painting-cost-cape-town",
      "plumber-cost-johannesburg",
    ],
  },

  {
    slug: "handyman-cost-johannesburg",
    service: "Handyman Services",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/handyman",
    metaTitle: "Handyman Services Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "handyman services in Johannesburg cost R250\u2013R700. Compare verified local quotes \u2014 free, no obligation.",
    intro: "Use this guide to estimate handyman pricing in Johannesburg for 2026, including hourly labour, call-out fees, and common repair jobs. It helps you compare practical quote ranges before booking.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Hourly labour rate", range: "R250 \u2013 R700/hr" },
      { label: "Minimum call-out fee", range: "R350 \u2013 R950" },
      { label: "Mounting and installation jobs", range: "R450 \u2013 R1,800" },
      { label: "Minor repair jobs", range: "R400 \u2013 R1,600" },
      { label: "Half-day maintenance visit", range: "R1,200 \u2013 R3,200" },
    ],
    priceFactors: [
      "Number of tasks and total on-site time",
      "Wall type and installation complexity",
      "Whether tools or special anchors are needed",
      "Materials supplied by client vs handyman",
      "Travel distance and parking/access",
      "Urgent or after-hours appointments",
    ],
    tips: [
      "Group small jobs into one booking to reduce minimum fees.",
      "Provide photos and measurements before quoting.",
      "Confirm whether materials are included.",
      "Pick specialists with reviews in your exact job type.",
    ],
    faqs: [
      {
        question: "How much does a handyman cost in Johannesburg?",
        answer: "Handyman rates in Johannesburg usually include an hourly fee and often a minimum call-out for small jobs." ,
      },
      {
        question: "What jobs are best for a handyman?",
        answer: "Handymen are ideal for minor repairs, installations, mounting, and general maintenance tasks." ,
      },
      {
        question: "Do handymen include materials in the quote?",
        answer: "Quotes vary: some include basic consumables while major materials are usually billed separately." ,
      },
      {
        question: "Is there a minimum booking fee?",
        answer: "Yes, many providers apply a minimum charge to cover travel and setup time." ,
      },
      {
        question: "How can I get an accurate handyman quote in Johannesburg?",
        answer: "Share photos, measurements, and a full task list so the provider can quote realistically." ,
      },
    ],
    relatedSlugs: [
      "handyman-cost-cape-town",
      "painting-cost-cape-town",
      "plumber-cost-johannesburg",
    ],
  },

  {
    slug: "renovation-cost-johannesburg",
    service: "Home Renovation",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/handyman",
    metaTitle: "Home Renovation Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "home renovation in Johannesburg cost R35,000\u2013R120,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 guide outlines typical renovation costs in Johannesburg across bathrooms, kitchens, flooring, and full-home upgrades. It gives realistic budgets so you can compare contractor quotes with confidence.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Bathroom refresh", range: "R35,000 \u2013 R120,000" },
      { label: "Kitchen renovation", range: "R60,000 \u2013 R220,000" },
      { label: "Flooring replacement (full home)", range: "R25,000 \u2013 R140,000" },
      { label: "Interior repaint + minor repairs", range: "R15,000 \u2013 R65,000" },
      { label: "Major structural renovation", range: "R180,000 \u2013 R650,000+" },
    ],
    priceFactors: [
      "Scope of demolition and structural changes",
      "Material quality and fixture brands",
      "Plumbing/electrical relocation needs",
      "Council approvals and compliance work",
      "Contractor team size and project duration",
      "Unexpected defects uncovered during work",
    ],
    tips: [
      "Set a written scope with exclusions before work starts.",
      "Get staged quotes and payment milestones.",
      "Prioritize must-have upgrades first.",
      "Keep a 10\u201315% contingency for surprises.",
    ],
    faqs: [
      {
        question: "How much does home renovation cost in Johannesburg?",
        answer: "Renovation pricing in Johannesburg depends heavily on scope, materials, and whether structural work is required." ,
      },
      {
        question: "What rooms are most expensive to renovate?",
        answer: "Kitchens and bathrooms are usually the costliest because of plumbing, electrical, and fixture requirements." ,
      },
      {
        question: "Should I renovate in phases?",
        answer: "Phasing helps cashflow control and lets you complete high-impact areas first while reducing project risk." ,
      },
      {
        question: "How much contingency should I budget?",
        answer: "A 10\u201315% contingency is common for hidden defects, compliance updates, and material price changes." ,
      },
      {
        question: "How do I compare renovation quotes in Johannesburg?",
        answer: "Compare scope, material specs, timelines, payment terms, and warranty commitments\u2014not just total price." ,
      },
    ],
    relatedSlugs: [
      "renovation-cost-cape-town",
      "renovation-cost-johannesburg",
      "painting-cost-cape-town",
    ],
  },

  {
    slug: "renovation-cost-cape-town",
    service: "Home Renovation",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/handyman",
    metaTitle: "Home Renovation Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "home renovation in Cape Town cost R35,000\u2013R120,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 guide outlines typical renovation costs in Cape Town across bathrooms, kitchens, flooring, and full-home upgrades. It gives realistic budgets so you can compare contractor quotes with confidence.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Bathroom refresh", range: "R35,000 \u2013 R120,000" },
      { label: "Kitchen renovation", range: "R60,000 \u2013 R220,000" },
      { label: "Flooring replacement (full home)", range: "R25,000 \u2013 R140,000" },
      { label: "Interior repaint + minor repairs", range: "R15,000 \u2013 R65,000" },
      { label: "Major structural renovation", range: "R180,000 \u2013 R650,000+" },
    ],
    priceFactors: [
      "Scope of demolition and structural changes",
      "Material quality and fixture brands",
      "Plumbing/electrical relocation needs",
      "Council approvals and compliance work",
      "Contractor team size and project duration",
      "Unexpected defects uncovered during work",
    ],
    tips: [
      "Set a written scope with exclusions before work starts.",
      "Get staged quotes and payment milestones.",
      "Prioritize must-have upgrades first.",
      "Keep a 10\u201315% contingency for surprises.",
    ],
    faqs: [
      {
        question: "How much does home renovation cost in Cape Town?",
        answer: "Renovation pricing in Cape Town depends heavily on scope, materials, and whether structural work is required." ,
      },
      {
        question: "What rooms are most expensive to renovate?",
        answer: "Kitchens and bathrooms are usually the costliest because of plumbing, electrical, and fixture requirements." ,
      },
      {
        question: "Should I renovate in phases?",
        answer: "Phasing helps cashflow control and lets you complete high-impact areas first while reducing project risk." ,
      },
      {
        question: "How much contingency should I budget?",
        answer: "A 10\u201315% contingency is common for hidden defects, compliance updates, and material price changes." ,
      },
      {
        question: "How do I compare renovation quotes in Cape Town?",
        answer: "Compare scope, material specs, timelines, payment terms, and warranty commitments\u2014not just total price." ,
      },
    ],
    relatedSlugs: [
      "solar-installation-cost-south-africa",
      "renovation-cost-johannesburg",
      "painting-cost-cape-town",
    ],
  },

  {
    slug: "renovation-cost-durban",
    service: "Home Renovation",
    city: "Durban",
    province: "KwaZulu-Natal",
    ctaLink: "/durban/handyman",
    metaTitle: "Home Renovation Cost in Durban | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "home renovation in Durban cost R35,000\u2013R120,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 guide outlines typical renovation costs in Durban across bathrooms, kitchens, flooring, and full-home upgrades. It gives realistic budgets so you can compare contractor quotes with confidence.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Bathroom refresh", range: "R35,000 \u2013 R120,000" },
      { label: "Kitchen renovation", range: "R60,000 \u2013 R220,000" },
      { label: "Flooring replacement (full home)", range: "R25,000 \u2013 R140,000" },
      { label: "Interior repaint + minor repairs", range: "R15,000 \u2013 R65,000" },
      { label: "Major structural renovation", range: "R180,000 \u2013 R650,000+" },
    ],
    priceFactors: [
      "Scope of demolition and structural changes",
      "Material quality and fixture brands",
      "Plumbing/electrical relocation needs",
      "Council approvals and compliance work",
      "Contractor team size and project duration",
      "Unexpected defects uncovered during work",
    ],
    tips: [
      "Set a written scope with exclusions before work starts.",
      "Get staged quotes and payment milestones.",
      "Prioritize must-have upgrades first.",
      "Keep a 10\u201315% contingency for surprises.",
    ],
    faqs: [
      {
        question: "How much does home renovation cost in Durban?",
        answer: "Renovation pricing in Durban depends heavily on scope, materials, and whether structural work is required." ,
      },
      {
        question: "What rooms are most expensive to renovate?",
        answer: "Kitchens and bathrooms are usually the costliest because of plumbing, electrical, and fixture requirements." ,
      },
      {
        question: "Should I renovate in phases?",
        answer: "Phasing helps cashflow control and lets you complete high-impact areas first while reducing project risk." ,
      },
      {
        question: "How much contingency should I budget?",
        answer: "A 10\u201315% contingency is common for hidden defects, compliance updates, and material price changes." ,
      },
      {
        question: "How do I compare renovation quotes in Durban?",
        answer: "Compare scope, material specs, timelines, payment terms, and warranty commitments\u2014not just total price." ,
      },
    ],
    relatedSlugs: [
      "renovation-cost-cape-town",
      "renovation-cost-johannesburg",
      "painting-cost-cape-town",
    ],
  },

  {
    slug: "hvac-cost-south-africa",
    service: "HVAC Installation",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/hvac",
    metaTitle: "HVAC Installation Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "hvac installation in South Africa cost R8,500\u2013R19,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide covers 2026 HVAC installation and servicing costs in South Africa, from split units to larger ducted systems. Use it to compare quotes and avoid hidden installation charges.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Split AC supply + install (9k\u201312k BTU)", range: "R8,500 \u2013 R19,000" },
      { label: "Mid-size inverter AC (18k BTU)", range: "R14,000 \u2013 R30,000" },
      { label: "Multi-room or ducted setup", range: "R45,000 \u2013 R180,000" },
      { label: "Annual service and regas", range: "R1,000 \u2013 R3,500" },
      { label: "Ventilation/extraction upgrades", range: "R3,500 \u2013 R25,000" },
    ],
    priceFactors: [
      "Unit capacity and energy-efficiency rating",
      "Ducting length and installation complexity",
      "Brand, warranty, and parts availability",
      "Electrical upgrades or DB board changes",
      "Building type and outdoor unit access",
      "Seasonal demand during peak summer periods",
    ],
    tips: [
      "Match unit size to room load, not only floor area.",
      "Compare installer warranties and after-sales support.",
      "Ask for full installed price including brackets/cabling.",
      "Book pre-summer to avoid peak-season markups.",
    ],
    faqs: [
      {
        question: "How much does HVAC installation cost in South Africa?",
        answer: "Costs vary by unit size, brand, and installation complexity, with larger systems priced significantly higher." ,
      },
      {
        question: "Does HVAC price include installation materials?",
        answer: "Good quotes should include mounting, piping, cabling, and commissioning\u2014always confirm inclusions." ,
      },
      {
        question: "How often should HVAC systems be serviced?",
        answer: "Most residential systems should be serviced annually, with more frequent checks in heavy-use environments." ,
      },
      {
        question: "Are inverter units worth the extra cost?",
        answer: "Inverter units usually cost more upfront but can reduce running costs and improve comfort over time." ,
      },
      {
        question: "How do I choose an HVAC installer in South Africa?",
        answer: "Look for verified installers with clear warranty terms and service support after installation." ,
      },
    ],
    relatedSlugs: [
      "solar-installation-cost-south-africa",
      "hvac-cost-cape-town",
      "hvac-cost-johannesburg",
      "electrician-cost-cape-town",
    ],
  },

  {
    slug: "hvac-cost-cape-town",
    service: "HVAC Installation",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/hvac",
    metaTitle: "HVAC Installation Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "hvac installation in Cape Town cost R8,500\u2013R19,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide covers 2026 HVAC installation and servicing costs in Cape Town, from split units to larger ducted systems. Use it to compare quotes and avoid hidden installation charges.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Split AC supply + install (9k\u201312k BTU)", range: "R8,500 \u2013 R19,000" },
      { label: "Mid-size inverter AC (18k BTU)", range: "R14,000 \u2013 R30,000" },
      { label: "Multi-room or ducted setup", range: "R45,000 \u2013 R180,000" },
      { label: "Annual service and regas", range: "R1,000 \u2013 R3,500" },
      { label: "Ventilation/extraction upgrades", range: "R3,500 \u2013 R25,000" },
    ],
    priceFactors: [
      "Unit capacity and energy-efficiency rating",
      "Ducting length and installation complexity",
      "Brand, warranty, and parts availability",
      "Electrical upgrades or DB board changes",
      "Building type and outdoor unit access",
      "Seasonal demand during peak summer periods",
    ],
    tips: [
      "Match unit size to room load, not only floor area.",
      "Compare installer warranties and after-sales support.",
      "Ask for full installed price including brackets/cabling.",
      "Book pre-summer to avoid peak-season markups.",
    ],
    faqs: [
      {
        question: "How much does HVAC installation cost in Cape Town?",
        answer: "Costs vary by unit size, brand, and installation complexity, with larger systems priced significantly higher." ,
      },
      {
        question: "Does HVAC price include installation materials?",
        answer: "Good quotes should include mounting, piping, cabling, and commissioning\u2014always confirm inclusions." ,
      },
      {
        question: "How often should HVAC systems be serviced?",
        answer: "Most residential systems should be serviced annually, with more frequent checks in heavy-use environments." ,
      },
      {
        question: "Are inverter units worth the extra cost?",
        answer: "Inverter units usually cost more upfront but can reduce running costs and improve comfort over time." ,
      },
      {
        question: "How do I choose an HVAC installer in Cape Town?",
        answer: "Look for verified installers with clear warranty terms and service support after installation." ,
      },
    ],
    relatedSlugs: [
      "hvac-cost-cape-town",
      "hvac-cost-johannesburg",
      "electrician-cost-cape-town",
    ],
  },

  {
    slug: "hvac-cost-johannesburg",
    service: "HVAC Installation",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/hvac",
    metaTitle: "HVAC Installation Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "hvac installation in Johannesburg cost R8,500\u2013R19,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide covers 2026 HVAC installation and servicing costs in Johannesburg, from split units to larger ducted systems. Use it to compare quotes and avoid hidden installation charges.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Split AC supply + install (9k\u201312k BTU)", range: "R8,500 \u2013 R19,000" },
      { label: "Mid-size inverter AC (18k BTU)", range: "R14,000 \u2013 R30,000" },
      { label: "Multi-room or ducted setup", range: "R45,000 \u2013 R180,000" },
      { label: "Annual service and regas", range: "R1,000 \u2013 R3,500" },
      { label: "Ventilation/extraction upgrades", range: "R3,500 \u2013 R25,000" },
    ],
    priceFactors: [
      "Unit capacity and energy-efficiency rating",
      "Ducting length and installation complexity",
      "Brand, warranty, and parts availability",
      "Electrical upgrades or DB board changes",
      "Building type and outdoor unit access",
      "Seasonal demand during peak summer periods",
    ],
    tips: [
      "Match unit size to room load, not only floor area.",
      "Compare installer warranties and after-sales support.",
      "Ask for full installed price including brackets/cabling.",
      "Book pre-summer to avoid peak-season markups.",
    ],
    faqs: [
      {
        question: "How much does HVAC installation cost in Johannesburg?",
        answer: "Costs vary by unit size, brand, and installation complexity, with larger systems priced significantly higher." ,
      },
      {
        question: "Does HVAC price include installation materials?",
        answer: "Good quotes should include mounting, piping, cabling, and commissioning\u2014always confirm inclusions." ,
      },
      {
        question: "How often should HVAC systems be serviced?",
        answer: "Most residential systems should be serviced annually, with more frequent checks in heavy-use environments." ,
      },
      {
        question: "Are inverter units worth the extra cost?",
        answer: "Inverter units usually cost more upfront but can reduce running costs and improve comfort over time." ,
      },
      {
        question: "How do I choose an HVAC installer in Johannesburg?",
        answer: "Look for verified installers with clear warranty terms and service support after installation." ,
      },
    ],
    relatedSlugs: [
      "hvac-cost-cape-town",
      "hvac-cost-johannesburg",
      "electrician-cost-cape-town",
    ],
  },

  {
    slug: "landscaping-cost-south-africa",
    service: "Landscaping",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/landscaping",
    metaTitle: "Landscaping Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "landscaping in South Africa cost R350\u2013R800. Compare verified local quotes \u2014 free, no obligation.",
    intro: "Use this guide to benchmark 2026 landscaping costs in South Africa, from clean-ups and lawn installs to design and irrigation projects. It helps you compare local quotes based on real scope drivers.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Landscaper hourly rate", range: "R350 \u2013 R800/hr" },
      { label: "Garden clean-up and waste removal", range: "R900 \u2013 R3,200" },
      { label: "New lawn installation (per m\u00b2)", range: "R250 \u2013 R700/m\u00b2" },
      { label: "Irrigation setup (small garden)", range: "R4,000 \u2013 R15,000" },
      { label: "Garden design and planting project", range: "R8,000 \u2013 R80,000+" },
    ],
    priceFactors: [
      "Yard size, slope, and existing condition",
      "Plant choices, soil prep, and materials",
      "Irrigation, drainage, and water access",
      "Waste removal and skip requirements",
      "Hardscaping elements like paving/edging",
      "Seasonality and project turnaround expectations",
    ],
    tips: [
      "Get site-based quotes, not phone-only estimates.",
      "Separate labour and materials in the quote.",
      "Phase bigger projects to control budget.",
      "Choose water-wise plants for lower maintenance costs.",
    ],
    faqs: [
      {
        question: "How much does landscaping cost in South Africa?",
        answer: "Landscaping in South Africa ranges from basic cleanups to full redesigns, with costs tied to size and materials." ,
      },
      {
        question: "How much does new lawn installation cost?",
        answer: "Pricing is usually per square meter and depends on prep work, turf choice, and irrigation requirements." ,
      },
      {
        question: "Is irrigation included in landscaping quotes?",
        answer: "Sometimes; many providers quote irrigation separately, so request a breakdown to compare accurately." ,
      },
      {
        question: "Can landscaping be done in phases?",
        answer: "Yes, phased execution is common and helps manage budgets for larger outdoor projects." ,
      },
      {
        question: "How do I compare landscaper quotes in South Africa?",
        answer: "Compare plant lists, material specs, waste removal, and maintenance plans, not just headline price." ,
      },
    ],
    relatedSlugs: [
      "landscaping-cost-cape-town",
      "landscaping-cost-johannesburg",
      "roofing-cost-south-africa",
    ],
  },

  {
    slug: "landscaping-cost-johannesburg",
    service: "Landscaping",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/landscaping",
    metaTitle: "Landscaping Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "landscaping in Johannesburg cost R350\u2013R800. Compare verified local quotes \u2014 free, no obligation.",
    intro: "Use this guide to benchmark 2026 landscaping costs in Johannesburg, from clean-ups and lawn installs to design and irrigation projects. It helps you compare local quotes based on real scope drivers.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Landscaper hourly rate", range: "R350 \u2013 R800/hr" },
      { label: "Garden clean-up and waste removal", range: "R900 \u2013 R3,200" },
      { label: "New lawn installation (per m\u00b2)", range: "R250 \u2013 R700/m\u00b2" },
      { label: "Irrigation setup (small garden)", range: "R4,000 \u2013 R15,000" },
      { label: "Garden design and planting project", range: "R8,000 \u2013 R80,000+" },
    ],
    priceFactors: [
      "Yard size, slope, and existing condition",
      "Plant choices, soil prep, and materials",
      "Irrigation, drainage, and water access",
      "Waste removal and skip requirements",
      "Hardscaping elements like paving/edging",
      "Seasonality and project turnaround expectations",
    ],
    tips: [
      "Get site-based quotes, not phone-only estimates.",
      "Separate labour and materials in the quote.",
      "Phase bigger projects to control budget.",
      "Choose water-wise plants for lower maintenance costs.",
    ],
    faqs: [
      {
        question: "How much does landscaping cost in Johannesburg?",
        answer: "Landscaping in Johannesburg ranges from basic cleanups to full redesigns, with costs tied to size and materials." ,
      },
      {
        question: "How much does new lawn installation cost?",
        answer: "Pricing is usually per square meter and depends on prep work, turf choice, and irrigation requirements." ,
      },
      {
        question: "Is irrigation included in landscaping quotes?",
        answer: "Sometimes; many providers quote irrigation separately, so request a breakdown to compare accurately." ,
      },
      {
        question: "Can landscaping be done in phases?",
        answer: "Yes, phased execution is common and helps manage budgets for larger outdoor projects." ,
      },
      {
        question: "How do I compare landscaper quotes in Johannesburg?",
        answer: "Compare plant lists, material specs, waste removal, and maintenance plans, not just headline price." ,
      },
    ],
    relatedSlugs: [
      "landscaping-cost-cape-town",
      "landscaping-cost-johannesburg",
      "roofing-cost-south-africa",
    ],
  },

  {
    slug: "roofing-cost-south-africa",
    service: "Roofing",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/roofing",
    metaTitle: "Roofing Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "roofing in South Africa cost R1,500\u2013R8,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide breaks down 2026 roofing costs in South Africa, including repairs, waterproofing, and full replacement scenarios. Use these benchmarks to compare quotes from verified roofing professionals.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Roof inspection and minor repairs", range: "R1,500 \u2013 R8,000" },
      { label: "Leak detection and waterproofing", range: "R2,000 \u2013 R15,000" },
      { label: "Partial roof replacement", range: "R25,000 \u2013 R120,000" },
      { label: "Full roof replacement (standard home)", range: "R90,000 \u2013 R320,000" },
      { label: "Repainting and maintenance coating", range: "R12,000 \u2013 R60,000" },
    ],
    priceFactors: [
      "Roof size, pitch, and height accessibility",
      "Material type (tile, metal, concrete, slate)",
      "Extent of structural timber damage",
      "Waterproofing and flashing requirements",
      "Scaffolding and safety compliance needs",
      "Weather delays and emergency call-out timing",
    ],
    tips: [
      "Get photos/videos with the quote scope documented.",
      "Compare material specs, not just total price.",
      "Schedule preventive maintenance before rainy season.",
      "Confirm workmanship guarantee duration in writing.",
    ],
    faqs: [
      {
        question: "How much do roofing jobs cost in South Africa?",
        answer: "Roofing costs in South Africa vary by roof size, material type, and whether repairs or full replacement are needed." ,
      },
      {
        question: "How much does leak repair usually cost?",
        answer: "Leak repair pricing depends on source complexity and access; waterproofing and flashing often affect cost." ,
      },
      {
        question: "When should I replace instead of repair a roof?",
        answer: "Replacement is often better when recurring leaks or widespread material failure make repairs uneconomical." ,
      },
      {
        question: "Do roof quotes include scaffolding and disposal?",
        answer: "Not always; confirm safety access, rubble disposal, and material transport in writing." ,
      },
      {
        question: "How do I choose a roofing contractor in South Africa?",
        answer: "Use verified contractors, check warranty terms, and compare detailed scope with material specifications." ,
      },
    ],
    relatedSlugs: [
      "solar-installation-cost-south-africa",
      "roofing-cost-cape-town",
      "roofing-cost-johannesburg",
      "renovation-cost-cape-town",
    ],
  },

  {
    slug: "roofing-cost-cape-town",
    service: "Roofing",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/handyman",
    metaTitle: "Roofing Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "roofing in Cape Town cost R1,500\u2013R8,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide breaks down 2026 roofing costs in Cape Town, including repairs, waterproofing, and full replacement scenarios. Use these benchmarks to compare quotes from verified roofing professionals.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Roof inspection and minor repairs", range: "R1,500 \u2013 R8,000" },
      { label: "Leak detection and waterproofing", range: "R2,000 \u2013 R15,000" },
      { label: "Partial roof replacement", range: "R25,000 \u2013 R120,000" },
      { label: "Full roof replacement (standard home)", range: "R90,000 \u2013 R320,000" },
      { label: "Repainting and maintenance coating", range: "R12,000 \u2013 R60,000" },
    ],
    priceFactors: [
      "Roof size, pitch, and height accessibility",
      "Material type (tile, metal, concrete, slate)",
      "Extent of structural timber damage",
      "Waterproofing and flashing requirements",
      "Scaffolding and safety compliance needs",
      "Weather delays and emergency call-out timing",
    ],
    tips: [
      "Get photos/videos with the quote scope documented.",
      "Compare material specs, not just total price.",
      "Schedule preventive maintenance before rainy season.",
      "Confirm workmanship guarantee duration in writing.",
    ],
    faqs: [
      {
        question: "How much do roofing jobs cost in Cape Town?",
        answer: "Roofing costs in Cape Town vary by roof size, material type, and whether repairs or full replacement are needed." ,
      },
      {
        question: "How much does leak repair usually cost?",
        answer: "Leak repair pricing depends on source complexity and access; waterproofing and flashing often affect cost." ,
      },
      {
        question: "When should I replace instead of repair a roof?",
        answer: "Replacement is often better when recurring leaks or widespread material failure make repairs uneconomical." ,
      },
      {
        question: "Do roof quotes include scaffolding and disposal?",
        answer: "Not always; confirm safety access, rubble disposal, and material transport in writing." ,
      },
      {
        question: "How do I choose a roofing contractor in Cape Town?",
        answer: "Use verified contractors, check warranty terms, and compare detailed scope with material specifications." ,
      },
    ],
    relatedSlugs: [
      "roofing-cost-cape-town",
      "roofing-cost-johannesburg",
      "renovation-cost-cape-town",
    ],
  },

  {
    slug: "flooring-cost-south-africa",
    service: "Flooring Installation",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/flooring",
    metaTitle: "Flooring Installation Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "flooring installation in South Africa cost R220\u2013R650. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 flooring guide shows realistic installed pricing in South Africa for laminate, tile, vinyl, and engineered wood. It helps you understand total project costs before accepting quotes.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Laminate/vinyl install (per m\u00b2)", range: "R220 \u2013 R650/m\u00b2" },
      { label: "Porcelain/ceramic tiling (per m\u00b2)", range: "R280 \u2013 R900/m\u00b2" },
      { label: "Engineered wood (per m\u00b2)", range: "R550 \u2013 R1,500/m\u00b2" },
      { label: "Screed and subfloor prep (per m\u00b2)", range: "R120 \u2013 R450/m\u00b2" },
      { label: "Full-home flooring project", range: "R25,000 \u2013 R220,000+" },
    ],
    priceFactors: [
      "Flooring material type and brand tier",
      "Condition of existing subfloor",
      "Room layout, cuts, and transitions",
      "Adhesives, underlay, and skirting needs",
      "Removal/disposal of old flooring",
      "Moisture barriers and leveling requirements",
    ],
    tips: [
      "Choose material based on traffic and moisture exposure.",
      "Request a subfloor assessment before final pricing.",
      "Compare installed cost per m\u00b2 including prep.",
      "Buy a little extra material for future repairs.",
    ],
    faqs: [
      {
        question: "How much does flooring installation cost in South Africa?",
        answer: "Flooring in South Africa is typically priced per square meter and varies by material and subfloor prep requirements." ,
      },
      {
        question: "Which flooring type is cheapest to install?",
        answer: "Vinyl and laminate are usually more affordable than engineered wood or premium tile systems." ,
      },
      {
        question: "Is old flooring removal included in quotes?",
        answer: "Some contractors include removal; others quote it separately, so always confirm this line item." ,
      },
      {
        question: "Why does subfloor prep add so much?",
        answer: "Levelling, moisture barriers, and repairs are labour-intensive but essential for durability and finish quality." ,
      },
      {
        question: "How do I compare flooring quotes in South Africa?",
        answer: "Compare installed rates, prep inclusions, trim/skirting, and material warranties for a true like-for-like view." ,
      },
    ],
    relatedSlugs: [
      "flooring-cost-cape-town",
      "flooring-cost-johannesburg",
      "renovation-cost-johannesburg",
    ],
  },

  {
    slug: "flooring-cost-cape-town",
    service: "Flooring Installation",
    city: "Cape Town",
    province: "Western Cape",
    ctaLink: "/cape-town/handyman",
    metaTitle: "Flooring Installation Cost in Cape Town | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "flooring installation in Cape Town cost R220\u2013R650. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 flooring guide shows realistic installed pricing in Cape Town for laminate, tile, vinyl, and engineered wood. It helps you understand total project costs before accepting quotes.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Laminate/vinyl install (per m\u00b2)", range: "R220 \u2013 R650/m\u00b2" },
      { label: "Porcelain/ceramic tiling (per m\u00b2)", range: "R280 \u2013 R900/m\u00b2" },
      { label: "Engineered wood (per m\u00b2)", range: "R550 \u2013 R1,500/m\u00b2" },
      { label: "Screed and subfloor prep (per m\u00b2)", range: "R120 \u2013 R450/m\u00b2" },
      { label: "Full-home flooring project", range: "R25,000 \u2013 R220,000+" },
    ],
    priceFactors: [
      "Flooring material type and brand tier",
      "Condition of existing subfloor",
      "Room layout, cuts, and transitions",
      "Adhesives, underlay, and skirting needs",
      "Removal/disposal of old flooring",
      "Moisture barriers and leveling requirements",
    ],
    tips: [
      "Choose material based on traffic and moisture exposure.",
      "Request a subfloor assessment before final pricing.",
      "Compare installed cost per m\u00b2 including prep.",
      "Buy a little extra material for future repairs.",
    ],
    faqs: [
      {
        question: "How much does flooring installation cost in Cape Town?",
        answer: "Flooring in Cape Town is typically priced per square meter and varies by material and subfloor prep requirements." ,
      },
      {
        question: "Which flooring type is cheapest to install?",
        answer: "Vinyl and laminate are usually more affordable than engineered wood or premium tile systems." ,
      },
      {
        question: "Is old flooring removal included in quotes?",
        answer: "Some contractors include removal; others quote it separately, so always confirm this line item." ,
      },
      {
        question: "Why does subfloor prep add so much?",
        answer: "Levelling, moisture barriers, and repairs are labour-intensive but essential for durability and finish quality." ,
      },
      {
        question: "How do I compare flooring quotes in Cape Town?",
        answer: "Compare installed rates, prep inclusions, trim/skirting, and material warranties for a true like-for-like view." ,
      },
    ],
    relatedSlugs: [
      "flooring-cost-cape-town",
      "flooring-cost-johannesburg",
      "renovation-cost-johannesburg",
    ],
  },

  {
    slug: "flooring-cost-johannesburg",
    service: "Flooring Installation",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/handyman",
    metaTitle: "Flooring Installation Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "flooring installation in Johannesburg cost R220\u2013R650. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This 2026 flooring guide shows realistic installed pricing in Johannesburg for laminate, tile, vinyl, and engineered wood. It helps you understand total project costs before accepting quotes.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Laminate/vinyl install (per m\u00b2)", range: "R220 \u2013 R650/m\u00b2" },
      { label: "Porcelain/ceramic tiling (per m\u00b2)", range: "R280 \u2013 R900/m\u00b2" },
      { label: "Engineered wood (per m\u00b2)", range: "R550 \u2013 R1,500/m\u00b2" },
      { label: "Screed and subfloor prep (per m\u00b2)", range: "R120 \u2013 R450/m\u00b2" },
      { label: "Full-home flooring project", range: "R25,000 \u2013 R220,000+" },
    ],
    priceFactors: [
      "Flooring material type and brand tier",
      "Condition of existing subfloor",
      "Room layout, cuts, and transitions",
      "Adhesives, underlay, and skirting needs",
      "Removal/disposal of old flooring",
      "Moisture barriers and leveling requirements",
    ],
    tips: [
      "Choose material based on traffic and moisture exposure.",
      "Request a subfloor assessment before final pricing.",
      "Compare installed cost per m\u00b2 including prep.",
      "Buy a little extra material for future repairs.",
    ],
    faqs: [
      {
        question: "How much does flooring installation cost in Johannesburg?",
        answer: "Flooring in Johannesburg is typically priced per square meter and varies by material and subfloor prep requirements." ,
      },
      {
        question: "Which flooring type is cheapest to install?",
        answer: "Vinyl and laminate are usually more affordable than engineered wood or premium tile systems." ,
      },
      {
        question: "Is old flooring removal included in quotes?",
        answer: "Some contractors include removal; others quote it separately, so always confirm this line item." ,
      },
      {
        question: "Why does subfloor prep add so much?",
        answer: "Levelling, moisture barriers, and repairs are labour-intensive but essential for durability and finish quality." ,
      },
      {
        question: "How do I compare flooring quotes in Johannesburg?",
        answer: "Compare installed rates, prep inclusions, trim/skirting, and material warranties for a true like-for-like view." ,
      },
    ],
    relatedSlugs: [
      "flooring-cost-cape-town",
      "flooring-cost-johannesburg",
      "renovation-cost-johannesburg",
    ],
  },

  {
    slug: "roofing-cost-johannesburg",
    service: "Roofing",
    city: "Johannesburg",
    province: "Gauteng",
    ctaLink: "/johannesburg/handyman",
    metaTitle: "Roofing Cost in Johannesburg | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "roofing in Johannesburg cost R1,500\u2013R8,000. Compare verified local quotes \u2014 free, no obligation.",
    intro: "This guide explains typical 2026 roofing costs in Johannesburg for inspections, repairs, waterproofing, and full replacements. Use it to benchmark quotes before hiring a roofer.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Roof inspection and minor repairs", range: "R1,500 \u2013 R8,000" },
      { label: "Leak detection and waterproofing", range: "R2,000 \u2013 R15,000" },
      { label: "Partial roof replacement", range: "R25,000 \u2013 R120,000" },
      { label: "Full roof replacement (standard home)", range: "R90,000 \u2013 R320,000" },
      { label: "Repainting and maintenance coating", range: "R12,000 \u2013 R60,000" },
    ],
    priceFactors: [
      "Roof size, pitch, and height accessibility",
      "Material type (tile, metal, concrete, slate)",
      "Extent of structural timber damage",
      "Waterproofing and flashing requirements",
      "Scaffolding and safety compliance needs",
      "Weather delays and emergency call-out timing",
    ],
    tips: [
      "Get photos/videos with the quote scope documented.",
      "Compare material specs, not just total price.",
      "Schedule preventive maintenance before rainy season.",
      "Confirm workmanship guarantee duration in writing.",
    ],
    faqs: [
      {
        question: "How much does roof replacement cost in Johannesburg?",
        answer: "Replacement pricing depends on roof size, structure condition, and chosen material system." ,
      },
      {
        question: "What is the cost of fixing a leaking roof?",
        answer: "Minor leak fixes are cheaper, but recurring leaks may indicate broader waterproofing or structural issues." ,
      },
      {
        question: "Are roofing quotes fixed or estimate-based?",
        answer: "Many start as estimates and become fixed after site inspection and detailed scope confirmation." ,
      },
      {
        question: "How long does a typical roofing project take?",
        answer: "Small repairs may take hours or days; larger replacements can run for one to several weeks." ,
      },
      {
        question: "How do I avoid roofing overcharges?",
        answer: "Request itemized scope, compare materials, and choose verified contractors with written warranties." ,
      },
    ],
    relatedSlugs: [
      "roofing-cost-cape-town",
      "roofing-cost-south-africa",
      "renovation-cost-johannesburg",
    ],
  },

  {
    slug: "how-to-choose-a-plumber",
    service: "Plumber Hiring Guide",
    city: "South Africa",
    province: "Nationwide",
    ctaLink: "/services/plumbing",
    metaTitle: "Plumber Hiring Guide Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription: "plumber hiring guide in South Africa cost R350\u2013R900. Compare verified local quotes \u2014 free, no obligation.",
    intro: "Choosing a plumber can save or cost you thousands depending on the quality of work and pricing transparency. This guide explains how to vet plumbers, compare quotes, and avoid common hiring mistakes in 2026.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Standard call-out fee", range: "R350 \u2013 R900" },
      { label: "Hourly labour range", range: "R450 \u2013 R1,050/hr" },
      { label: "Leak/tap/toilet minor repairs", range: "R450 \u2013 R1,800" },
      { label: "Drain and blockage jobs", range: "R700 \u2013 R2,500" },
      { label: "Geyser service/repair", range: "R900 \u2013 R3,500" },
    ],
    priceFactors: [
      "Type of issue and urgency level",
      "Parts quality and supplier availability",
      "Property age and pipe accessibility",
      "After-hours/weekend availability",
      "Compliance/certificate requirements",
      "Travel distance and call-out structure",
    ],
    tips: [
      "Always request itemized quotes before approval.",
      "Check reviews specific to your plumbing issue.",
      "Ask whether call-out is waived if work proceeds.",
      "Confirm guarantees on both labour and parts.",
    ],
    faqs: [
      {
        question: "How do I choose a reliable plumber in South Africa?",
        answer: "Check verification, reviews, and experience with your exact issue, then compare at least three itemized quotes." ,
      },
      {
        question: "What should be included in a plumbing quote?",
        answer: "A proper quote should show call-out, labour rate, parts, VAT, and any guarantees or compliance requirements." ,
      },
      {
        question: "When should I call an emergency plumber?",
        answer: "Burst pipes, major leaks, blocked sewage lines, and no-water issues usually require urgent professional help." ,
      },
      {
        question: "How do I compare plumbing quotes fairly?",
        answer: "Compare scope, parts quality, response time, and warranties\u2014not just the cheapest headline total." ,
      },
      {
        question: "Can I reduce plumbing costs without compromising quality?",
        answer: "Yes: fix issues early, bundle small jobs, and schedule non-urgent work during normal business hours." ,
      },
    ],
    relatedSlugs: [
      "plumber-cost-cape-town",
      "plumber-cost-johannesburg",
      "cleaning-service-costs",
    ],
  },

]

