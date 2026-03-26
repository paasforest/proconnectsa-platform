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
    metaTitle: "Solar Installation Cost in South Africa | 2026 Pricing Guide | ProConnectSA",
    metaDescription:
      "Solar installation in South Africa costs about R45k–R180k+ in 2026. Compare quotes from verified installers — free, no obligation. See real prices.",
    intro:
      "Solar prices in South Africa depend mainly on system size, battery capacity, and inverter brand. This 2026 guide outlines realistic installed price ranges so you can compare quotes and plan your budget before you commit.",
    lastUpdated: "March 2026",
    pricing: [
      { label: "Small backup (3–5kW inverter, limited battery)", range: "R45,000 – R85,000" },
      { label: "Mid-range hybrid (5kW + battery + panels)", range: "R85,000 – R140,000" },
      { label: "Larger home system (8–12kW + batteries)", range: "R140,000 – R260,000+" },
      { label: "Solar panels (installed per panel)", range: "R2,200 – R4,500" },
      { label: "Battery (installed per kWh)", range: "R6,500 – R12,500/kWh" },
    ],
    priceFactors: [
      "System size (kW) and your household’s daily usage",
      "Battery capacity (kWh) and desired runtime during load-shedding",
      "Inverter brand/type (hybrid vs off-grid) and warranty",
      "Roof type/angle and installation complexity (mounting + cabling runs)",
      "Compliance, COC, and any DB board upgrades required",
      "Monitoring, surge protection, and optional add-ons (EV charger, geyser control)",
    ],
    tips: [
      "Compare 2–3 quotes with the same target spec (kW, kWh, panel count, warranties).",
      "Ask for performance assumptions (estimated kWh/day) and payback expectations.",
      "Prioritise reputable brands and clear warranty/support terms over the cheapest package.",
      "Confirm compliance paperwork and whether any electrical upgrades are included.",
    ],
    faqs: [
      {
        question: "How much does it cost to install solar in South Africa in 2026?",
        answer:
          "Most homeowners spend roughly R45,000–R180,000+ depending on inverter size, battery capacity, and panel count. Larger systems can exceed R200,000.",
      },
      {
        question: "Do I need a battery for solar to work during load-shedding?",
        answer:
          "Yes. Panels alone won’t keep your power on during outages. A hybrid inverter with batteries (and correct wiring) is typically needed for backup power.",
      },
      {
        question: "What size solar system do I need for my home?",
        answer:
          "It depends on your daily usage and which appliances you want powered during outages. Installers usually assess your bills and usage patterns to recommend a size.",
      },
      {
        question: "How long does solar installation take?",
        answer:
          "A typical residential installation often takes 1–3 days, depending on roof complexity, wiring runs, and whether DB board upgrades are required.",
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
]

