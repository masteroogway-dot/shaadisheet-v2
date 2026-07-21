"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[70px]">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold">
            <span className="text-maroon text-2xl tracking-tight">|||</span>
            <span>ShaadiSheet</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-maroon transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-maroon transition-colors">How It Works</a>
            <a href="#templates" className="hover:text-maroon transition-colors">Templates</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-maroon transition-colors">Log In</Link>
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-[120px] pb-20 px-6 text-center">
        <div className="max-w-[720px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-6">
            <i className="fas fa-sparkles text-gold" /> Built for Indian Weddings
          </div>
          <h1 className="text-5xl md:text-[3.5rem] font-extrabold leading-[1.1] mb-6 tracking-tight text-gray-900">
            Plan Your Indian Wedding<br />
            <span className="text-maroon">Without the Chaos</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-[540px] mx-auto mb-10 leading-relaxed">
            Budget tracking. Vendor management. Ritual checklists. AI assistance. Built for Hindu, Muslim, Sikh, and Christian weddings.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link href="/auth" className="px-8 py-3.5 text-base font-bold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors inline-flex items-center gap-2">
              Start Planning Free <i className="fas fa-arrow-right" />
            </Link>
            <a href="#how-it-works" className="px-8 py-3.5 text-base font-bold border-2 border-gray-300 rounded-lg hover:border-maroon hover:text-maroon transition-all">
              See How It Works
            </a>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {["#E8B4B8", "#B4D4E8", "#D4E8B4", "#E8D4B4", "#D4B4E8"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white -ml-2 border-2 border-white first:ml-0" style={{ background: c }}>
                  {["RK", "AP", "SM", "PJ", "NM"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">500+ families already planning</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-maroon/5 rounded-full text-xs font-semibold text-maroon mb-4">Features</span>
            <h2 className="text-[2.25rem] font-bold mb-4 text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 max-w-[480px] mx-auto">Not a generic Western wedding planner. Built from the ground up for Indian traditions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "fa-rupee-sign", color: "bg-maroon", title: "Budget Tracker", desc: "Track every rupee with pre-filled categories for Indian weddings." },
              { icon: "fa-store", color: "bg-gold", title: "Vendor Manager", desc: "Track every vendor — from pandit to caterer to DJ." },
              { icon: "fa-list-check", color: "bg-green", title: "Ritual Checklists", desc: "Every ritual in order — from Roka to Vidaai, Nikah to Walima." },
              { icon: "fa-users", color: "bg-blue", title: "Guest Management", desc: "RSVP tracking, dietary preferences, seating arrangements." },
              { icon: "fa-robot", color: "bg-purple-600", title: "AI Assistant", desc: "Get instant, intelligent recommendations for your wedding." },
              { icon: "fa-user-group", color: "bg-orange-600", title: "Real-time Collaboration", desc: "Share with family, planners, and vendors." },
            ].map((f, i) => (
              <div key={i} className="bg-white p-7 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`w-11 h-11 rounded-lg ${f.color} flex items-center justify-center text-white text-base mb-4`}>
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3 className="font-bold mb-1.5 text-gray-900">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-maroon/5 rounded-full text-xs font-semibold text-maroon mb-4">How It Works</span>
            <h2 className="text-[2.25rem] font-bold mb-4 text-gray-900">From Signup to Wedding Day</h2>
            <p className="text-gray-500">In 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 bg-gray-200 hidden md:block" />
            {[
              { n: "1", t: "Tell Us", d: "Religion, region, budget, guest count, events." },
              { n: "2", t: "Get Your Template", d: "Pre-filled rituals, budget categories, checklists." },
              { n: "3", t: "Plan & Collaborate", d: "Track budget, manage vendors, organize guests." },
              { n: "4", t: "Celebrate", d: "Zero chaos, pure joy." },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-maroon text-white text-lg font-extrabold flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <h3 className="font-bold mb-1 text-gray-900">{s.t}</h3>
                <p className="text-gray-500 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-maroon/5 rounded-full text-xs font-semibold text-maroon mb-4">Templates</span>
            <h2 className="text-[2.25rem] font-bold mb-4 text-gray-900">Built for Every Indian Wedding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "fa-om", bg: "bg-maroon", title: "Hindu Wedding", desc: "North Indian, South Indian, Bengali, Gujarati — all regional rituals." },
              { icon: "fa-mosque", bg: "bg-green-800", title: "Muslim Wedding", desc: "Nikah to Walima. Mahr tracking, halal compliance." },
              { icon: "fa-place-of-worship", bg: "bg-orange-600", title: "Sikh Wedding", desc: "Anand Karaj. Akhand Paath, Langar, Milni." },
              { icon: "fa-cross", bg: "bg-blue-800", title: "Christian Wedding", desc: "Kerala, Goa, Northeast — Minnu, Roce, church ceremony." },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`h-24 rounded-lg ${t.bg} flex items-center justify-center text-white text-3xl mb-4`}>
                  <i className={`fas ${t.icon}`} />
                </div>
                <h3 className="font-bold mb-1 text-gray-900">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-maroon text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.25rem] font-bold text-white mb-4">Ready to Plan Your Wedding?</h2>
          <p className="text-lg opacity-90 mb-8">Free to start. No credit card required.</p>
          <Link href="/auth" className="px-8 py-3.5 text-base font-bold text-maroon bg-white rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
            Start Planning Free <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 text-xl font-extrabold mb-3">
                <span className="text-maroon text-2xl">|||</span>
                <span className="text-white">ShaadiSheet</span>
              </div>
              <p className="text-gray-400 text-sm">Har Shaadi Ka Plan. Built with love from Nashik, India.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Templates", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="mb-4 text-sm uppercase tracking-wider font-semibold text-gray-300">{col.title}</h4>
                {col.links.map((l, j) => (
                  <a key={j} href="#" className="block py-1 text-gray-400 text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">&copy; 2026 ShaadiSheet. All rights reserved.</p>
            <div className="flex gap-4">
              {["fa-instagram", "fa-twitter", "fa-linkedin", "fa-youtube"].map((ic, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className={`fab ${ic} text-sm`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
