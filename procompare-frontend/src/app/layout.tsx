import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

// Use system fonts instead of Google Fonts to avoid network issues
const inter = {
  variable: "--font-inter",
  className: "font-sans"
};

export const metadata: Metadata = {
  title: "Local Service Providers in South Africa | Get Free Quotes | ProConnectSA",
  description: "Find trusted local service providers in Johannesburg, Cape Town, Durban, Pretoria, and across South Africa. Compare free quotes from verified plumbers, electricians, cleaners, and more. No obligation to hire.",
  keywords: "local service providers South Africa, get quotes, trusted professionals, compare services, plumbers, electricians, service providers near me",
  authors: [{ name: "ProConnectSA Team" }],
  creator: "ProConnectSA",
  publisher: "ProConnectSA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.proconnectsa.co.za"),
  openGraph: {
    title: "Local Service Providers in South Africa | Get Free Quotes | ProConnectSA",
    description: "Find trusted local service providers in South Africa. Compare free quotes from verified professionals. No obligation to hire.",
    url: "https://www.proconnectsa.co.za",
    siteName: "ProConnectSA",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Service Providers in South Africa | ProConnectSA",
    description: "Find trusted local service providers. Compare free quotes from verified professionals across South Africa.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
