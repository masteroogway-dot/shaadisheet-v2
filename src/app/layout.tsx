import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "ShaadiSheet - Plan Your Indian Wedding Without the Chaos",
  description:
    "Budget tracking. Vendor management. Ritual checklists. AI assistance. Everything you need for Hindu, Muslim, Sikh, and Christian weddings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
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
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
