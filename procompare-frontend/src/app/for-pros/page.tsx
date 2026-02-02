import Link from "next/link"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Target, Clock, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "For Professionals | ProConnectSA",
  description: "Get customers in your area — buy verified leads. Only see leads for the services and areas you select.",
}

export default function ForProsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                Get customers in your area — buy verified leads
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Only see leads for the services and areas you select. Unlock a lead when you’re ready to contact the client.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl">
                  <Link href="/register">
                    Join as a pro <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-6 text-lg rounded-xl">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" /> Intent + timeline shown
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified marketplace
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Pay only when you unlock
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="font-bold text-gray-900 mb-2">1) Create your profile</div>
                  <p className="text-gray-600 text-sm">Add your services and areas so we match you correctly.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="font-bold text-gray-900 mb-2">2) See leads that fit</div>
                  <p className="text-gray-600 text-sm">No more irrelevant leads — plumbers see plumbing leads only.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="font-bold text-gray-900 mb-2">3) Unlock when ready</div>
                  <p className="text-gray-600 text-sm">Credits are deducted automatically on unlock and the lead is allocated to you.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why pros convert better here</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Client intent is visible (Ready to hire / Comparing quotes)",
                  "Timeline is visible (ASAP / This month / Flexible)",
                  "Lead value is clear (badges + credit pricing)",
                  "Only matched leads show in your feed",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3 bg-white border rounded-xl p-4">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div className="text-gray-700">{t}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 text-lg rounded-xl">
                  <Link href="/register">Join as a pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

