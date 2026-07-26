export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShaadiSheet",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "Plan your Indian wedding without the chaos. Budget tracking, vendor management, ritual checklists, AI assistance for Hindu, Muslim, Sikh, Christian, and Jain weddings.",
    url: "https://www.shaadisheet.com",
    screenshot: "https://www.shaadisheet.com/og-image.png",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    author: {
      "@type": "Organization",
      name: "ShaadiSheet",
      url: "https://www.shaadisheet.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
