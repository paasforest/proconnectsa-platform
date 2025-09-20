import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Use system fonts instead of Google Fonts to avoid network issues
const inter = {
  variable: "--font-inter",
  className: "font-sans"
};

export const metadata: Metadata = {
  title: "ProConnectSA - Connect with Verified Service Providers",
  description: "Find and connect with verified service providers across South Africa. Get quotes, read reviews, and hire the best professionals for your home and business needs.",
  keywords: "service providers, South Africa, home services, business services, verified professionals, quotes, reviews, ProConnectSA",
  authors: [{ name: "ProConnectSA Team" }],
  creator: "ProConnectSA",
  publisher: "ProConnectSA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://proconnectsa.co.za"),
  openGraph: {
    title: "ProConnectSA - Connect with Verified Service Providers",
    description: "Find and connect with verified service providers across South Africa. Get quotes, read reviews, and hire the best professionals.",
    url: "https://proconnectsa.co.za",
    siteName: "ProConnectSA",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProConnectSA - Connect with Verified Service Providers",
    description: "Find and connect with verified service providers across South Africa. Get quotes, read reviews, and hire the best professionals.",
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
