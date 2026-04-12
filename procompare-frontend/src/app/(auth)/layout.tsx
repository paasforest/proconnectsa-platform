import type { Metadata } from "next"
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1 w-full bg-gradient-to-br from-emerald-50 to-blue-50 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}
