import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing | ProConnectSA - Simple Pay-As-You-Go Lead Pricing",
  description: "Simple, transparent pricing for service professionals. Pay-as-you-go credits to unlock verified leads. No subscriptions required.",
}

const CREDIT_PRICE_RANDS = 50

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Simple, pay‑as‑you‑go pricing</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              No subscriptions required. Top up credits and unlock leads when you want to contact a client.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
              <Card className="border-emerald-200">
                <CardContent className="p-6">
                  <div className="text-sm font-semibold text-emerald-700">Credits</div>
                  <div className="text-4xl font-bold text-gray-900 mt-2">R{CREDIT_PRICE_RANDS}</div>
                  <div className="text-gray-600 mt-1">per credit</div>
                  <div className="mt-6 space-y-3 text-sm">
                    {[
                      "Unlock a lead to see contact details",
                      "Higher intent/timeline = higher lead value",
                      "Only matched leads appear in your feed",
                    ].map((t) => (
                      <div key={t} className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6">
                      <Link href="/register">Join as a pro</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-gray-900 mb-2">What affects lead price?</div>
                  <p className="text-gray-600 mb-6">
                    Lead credit cost can change based on intent, urgency, budget range, and verification quality.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Ready to hire", desc: "Higher conversion potential" },
                      { title: "Urgent timeline", desc: "ASAP jobs tend to convert faster" },
                      { title: "Higher budget", desc: "Higher job value opportunities" },
                      { title: "Verified quality", desc: "Cleaner contact details and less spam" },
                    ].map((x) => (
                      <div key={x.title} className="border rounded-xl p-4 bg-white">
                        <div className="font-semibold text-gray-900">{x.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{x.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="rounded-xl py-6">
                      <Link href="/for-pros">How it works for pros</Link>
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6">
                      <Link href="/register">Create pro account</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

