import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: July 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use ShaadiSheet, we collect information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account information (name, email address, password)</li>
              <li>Wedding details (date, budget, guest count, events)</li>
              <li>Guest information you add (names, contact details, RSVP status)</li>
              <li>Vendor information you add</li>
              <li>Messages sent through our contact form or AI assistant</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide and maintain the ShaadiSheet service</li>
              <li>To personalize your wedding planning experience</li>
              <li>To send you important updates about your account or service</li>
              <li>To respond to your inquiries and support requests</li>
              <li>To improve our product and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We use Neon PostgreSQL for database hosting
              with SSL encryption. We do not sell, trade, or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We may share your information only in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>When you explicitly share your wedding plan with others (family, planners, vendors)</li>
              <li>When required by law or to protect our rights</li>
              <li>With service providers who assist in operating our platform (hosting, email)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access, update, or delete your personal information</li>
              <li>Export your data at any time</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a complete copy of all data we hold about you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:theshaadisheet@gmail.com" className="text-maroon hover:underline">theshaadisheet@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
