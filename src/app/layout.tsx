import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import JsonLd from "@/components/JsonLd";

const siteUrl = "https://www.shaadisheet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShaadiSheet - Every Culture. One Wedding Planner.",
    template: "%s | ShaadiSheet",
  },
  description:
    "Budget tracking. Vendor management. Tradition checklists. AI assistance. Everything you need for Hindu, Muslim, Christian, Jewish, Sikh, Buddhist, and weddings from 193 countries.",
  keywords: [
    "wedding planner",
    "wedding budget tracker",
    "wedding vendor management",
    "Hindu wedding checklist",
    "Muslim wedding planner",
    "Sikh wedding planning",
    "Christian wedding",
    "Jewish wedding",
    "Buddhist wedding",
    "multicultural wedding planner",
    "wedding seating chart",
    "AI wedding assistant",
    "wedding app",
    "wedding guest list",
    "wedding task manager",
    "global wedding planner",
  ],
  authors: [{ name: "ShaadiSheet" }],
  creator: "ShaadiSheet",
  publisher: "ShaadiSheet",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ShaadiSheet",
    title: "ShaadiSheet - Every Culture. One Wedding Planner.",
    description:
      "Budget tracking. Vendor management. Tradition checklists. AI assistance. Weddings from 193 countries — Hindu, Muslim, Christian, Jewish, Sikh, Buddhist, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShaadiSheet - Global Wedding Planning App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShaadiSheet - Every Culture. One Wedding Planner.",
    description: "Budget tracking. Vendor management. Tradition checklists. Weddings from 193 countries.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme');
            var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (dark) {
              document.documentElement.classList.add('dark');
              document.documentElement.style.background = '#111111';
              document.body.style.background = '#111111';
              document.body.style.color = '#e5e5e5';
            } else {
              document.documentElement.style.background = '#FFF8F0';
              document.body.style.background = '#FFF8F0';
              document.body.style.color = '#1f2937';
            }
          })();
        `}} />
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
      <body>
        <ThemeProvider>
          <JsonLd />
          <Providers>
            <PageTransition>{children}</PageTransition>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
