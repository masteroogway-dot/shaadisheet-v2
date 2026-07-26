import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import PageTransition from "@/components/PageTransition";
import JsonLd from "@/components/JsonLd";

const siteUrl = "https://www.shaadisheet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShaadiSheet - Plan Your Indian Wedding Without the Chaos",
    template: "%s | ShaadiSheet",
  },
  description:
    "Budget tracking. Vendor management. Ritual checklists. AI assistance. Everything you need for Hindu, Muslim, Sikh, Christian, and Jain weddings.",
  keywords: [
    "Indian wedding planner",
    "wedding budget tracker",
    "wedding vendor management",
    "Hindu wedding checklist",
    "Muslim wedding planner",
    "Sikh wedding planning",
    "Christian wedding India",
    "Jain wedding checklist",
    "wedding seating chart",
    "AI wedding assistant",
    "desi wedding app",
    "shaadi planning",
    "wedding guest list",
    "wedding task manager",
  ],
  authors: [{ name: "ShaadiSheet" }],
  creator: "ShaadiSheet",
  publisher: "ShaadiSheet",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "ShaadiSheet",
    title: "ShaadiSheet - Plan Your Indian Wedding Without the Chaos",
    description:
      "Budget tracking. Vendor management. Ritual checklists. AI assistance. Everything you need for Hindu, Muslim, Sikh, Christian, and Jain weddings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShaadiSheet - Indian Wedding Planning App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShaadiSheet - Plan Your Indian Wedding Without the Chaos",
    description:
      "Budget tracking. Vendor management. Ritual checklists. AI assistance. Everything you need for Hindu, Muslim, Sikh, Christian, and Jain weddings.",
    images: ["/og-image.png"],
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
    canonical: siteUrl,
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#722F37" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="bg-cream text-gray-900">
        <JsonLd />
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
