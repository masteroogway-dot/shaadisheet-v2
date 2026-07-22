import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <Link href="/" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">About ShaadiSheet</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            ShaadiSheet was born from a simple frustration: planning an Indian wedding shouldn&apos;t feel like a second job.
            Between managing hundreds of guests, coordinating dozens of vendors, tracking a massive budget, and keeping
            up with every ritual and ceremony, families deserve better than scattered spreadsheets and endless WhatsApp threads.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Our Mission</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            We&apos;re building the most comprehensive wedding planning tool designed specifically for Indian weddings.
            Every feature, every template, every ritual checklist is crafted with deep understanding of Indian wedding
            traditions - whether it&apos;s a Hindu, Muslim, Sikh, Christian, or Jain celebration.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why ShaadiSheet?</h2>
          <div className="space-y-4 mb-6">
            {[
              { title: "Built for Indian Weddings", desc: "Pre-filled ritual checklists, region-specific traditions, and budget categories that actually make sense for Indian weddings." },
              { title: "Real-time Collaboration", desc: "Share your wedding plan with family members, wedding planners, and vendors. Everyone stays on the same page." },
              { title: "AI-Powered Assistant", desc: "Get intelligent suggestions for budget allocation, vendor recommendations, and timeline planning." },
              { title: "Complete Wedding Management", desc: "From guest RSVPs and seating arrangements to room allocations and day-of timelines - everything in one place." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Our Story</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Built with love from Nashik, India. ShaadiSheet is a project by a solo founder who experienced the chaos
            of Indian wedding planning firsthand and decided to build a better way. Every feature is designed with real
            families in mind.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Founder</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-maroon to-maroon-light flex items-center justify-center text-white text-xl font-bold shrink-0">
              MC
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Manan Chandak</h3>
              <p className="text-maroon text-sm font-medium mb-2">Founder & Developer</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Built ShaadiSheet from Nashik, India. Experienced the chaos of Indian wedding planning
                firsthand and decided to build a better way. Everything in this product is crafted with
                real families and real weddings in mind.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <a href="mailto:theshaadisheet@gmail.com" className="text-xs text-gray-400 hover:text-maroon transition-colors">
                  <i className="fas fa-envelope mr-1" /> theshaadisheet@gmail.com
                </a>
                <a href="https://github.com/masteroogway-dot" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-maroon transition-colors">
                  <i className="fab fa-github mr-1" /> GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="bg-maroon/5 border border-maroon/10 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-gray-900 mb-2">Get in Touch</h3>
            <p className="text-gray-600 text-sm mb-4">Have questions or want to collaborate? We&apos;d love to hear from you.</p>
            <Link href="/contact" className="inline-flex px-5 py-2.5 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
