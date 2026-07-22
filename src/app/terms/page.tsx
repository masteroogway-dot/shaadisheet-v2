import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: July 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ShaadiSheet, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p>ShaadiSheet is a wedding planning platform that provides budget tracking, vendor management, guest management,
              task management, seating arrangements, room allocation, and AI-powered assistance for Indian weddings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Account Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must be at least 13 years old to use ShaadiSheet</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must provide accurate and complete information when creating an account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Resell or redistribute the service without written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of ShaadiSheet are owned by us and are protected by copyright,
              trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>ShaadiSheet is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages
              arising from your use of the service, including but not limited to wedding planning decisions made based on our recommendations.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Termination</h2>
            <p>We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time from the settings page.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:theshaadisheet@gmail.com" className="text-maroon hover:underline">theshaadisheet@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
