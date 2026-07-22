import Link from "next/link";

export default function SecurityPage() {
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">Security</h1>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How We Protect Your Data</h2>
            <p>Your wedding data is important and personal. We take security seriously and implement multiple layers of protection.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Encryption</h2>
            <div className="space-y-3">
              {[
                { title: "In Transit", desc: "All data is encrypted using TLS/SSL (HTTPS) during transmission between your browser and our servers." },
                { title: "At Rest", desc: "Your database is hosted on Neon PostgreSQL with encrypted storage." },
                { title: "Passwords", desc: "Passwords are hashed using bcryptjs with salt rounds, making them impossible to reverse-engineer." },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Authentication</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Google OAuth 2.0 for secure sign-in</li>
              <li>JWT (JSON Web Tokens) for session management</li>
              <li>Secure HTTP-only cookies for session storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Infrastructure</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Hosted on Vercel with enterprise-grade security</li>
              <li>Database hosted on Neon with automatic backups</li>
              <li>Environment variables encrypted at rest</li>
              <li>Regular security audits and dependency updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Reporting a Vulnerability</h2>
            <p>If you discover a security vulnerability, please report it responsibly by emailing <a href="mailto:theshaadisheet@gmail.com" className="text-maroon hover:underline">theshaadisheet@gmail.com</a>.
              We will respond within 48 hours and work with you to resolve the issue.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
