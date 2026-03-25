import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import TrackingScripts from "@/components/TrackingScripts";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mouse — AI Employees for Small Business | $4.98/hr",
  description: "Hire an AI employee that answers calls, follows up on leads, manages reviews, and runs your operations — for $4.98/hr instead of $35. 150+ industries. Start free.",
  metadataBase: new URL("https://mouse.is"),
  openGraph: {
    title: "Mouse — AI Employees for Small Business",
    description: "AI employees that work on real computers — browsing, clicking, typing — 24/7. Automate lead gen, customer follow-ups, reviews, and operations for $4.98/hr.",
    url: "https://mouse.is",
    siteName: "Mouse",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouse — AI Employees for Small Business",
    description: "AI employees that work on real computers — 24/7. Automate your business for $4.98/hr.",
    creator: "@grindblueprint",
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
  alternates: {
    canonical: "https://mouse.is",
  },
  keywords: ["AI employee", "AI assistant", "small business automation", "AI for business", "virtual employee", "AI agent", "business automation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Mouse",
              url: "https://mouse.is",
              description: "AI employees that work on real computers to automate business tasks 24/7 for small businesses.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "4.98",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "4.98",
                  priceCurrency: "USD",
                  unitText: "HOUR",
                },
              },
              provider: {
                "@type": "Organization",
                name: "Mouse",
                url: "https://mouse.is",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Wilmington",
                  addressRegion: "NC",
                  addressCountry: "US",
                },
                telephone: "+19105158927",
              },
            }),
          }}
        />
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}
