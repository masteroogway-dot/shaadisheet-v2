"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-transparent transition-all">
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
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-[140px] pb-16 px-6 text-center relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,0,0,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="max-w-[800px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-6 shadow-sm">
            <i className="fas fa-sparkles text-gold" /> Built for Indian Weddings
          </div>
          <h1 className="text-[4rem] font-extrabold leading-[1.1] mb-6 tracking-tight">
            Plan Your Indian Wedding<br />
            <span className="bg-gradient-to-br from-maroon to-gold bg-clip-text text-transparent">Without the Chaos</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-[600px] mx-auto mb-10 leading-relaxed">
            Budget tracking. Vendor management. Ritual checklists. AI assistance. Built for Hindu, Muslim, Sikh, and Christian weddings.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link href="/auth" className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all inline-flex items-center gap-3">
              Start Planning Free <i className="fas fa-arrow-right" />
            </Link>
            <a href="#how-it-works" className="px-8 py-4 text-lg font-bold border-2 border-gray-300 rounded-lg hover:border-maroon hover:text-maroon transition-all">
              See How It Works
            </a>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex">
              {["#E8B4B8", "#B4D4E8", "#D4E8B4", "#E8D4B4", "#D4B4E8"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-white -ml-2 border-2 border-white first:ml-0" style={{ background: c }}>
                  {["RK", "AP", "SM", "PJ", "NM"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">500+ families already planning</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-br from-maroon/10 to-gold/10 rounded-full text-xs font-semibold text-maroon mb-4">Features</span>
            <h2 className="text-[2.5rem] font-bold mb-4">Everything You Need<br /><span className="bg-gradient-to-br from-maroon to-gold bg-clip-text text-transparent">The Perfect Indian Wedding</span></h2>
            <p className="text-lg text-gray-500 max-w-[550px] mx-auto">Not a generic Western wedding planner. Built from the ground up for Indian traditions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "fa-rupee-sign", color: "from-maroon to-maroon-light", title: "Budget Tracker", desc: "Track every rupee with pre-filled categories for Indian weddings." },
              { icon: "fa-store", color: "from-gold to-gold-dark", title: "Vendor Manager", desc: "Track every vendor — from pandit to caterer to DJ." },
              { icon: "fa-list-check", color: "from-green to-green/80", title: "Ritual Checklists", desc: "Every ritual in order — from Roka to Vidaai, Nikah to Walima." },
              { icon: "fa-users", color: "from-blue to-blue/80", title: "Guest Management", desc: "RSVP tracking, dietary preferences, seating arrangements." },
              { icon: "fa-robot", color: "from-purple-600 to-purple-800", title: "AI Assistant", desc: "Get instant, intelligent recommendations for your wedding." },
              { icon: "fa-user-group", color: "from-orange-600 to-red-700", title: "Real-time Collaboration", desc: "Share with family, planners, and vendors." },
            ].map((f, i) => (
              <div key={i} className="bg-white p-9 rounded-2xl border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-xl mb-5`}>
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-br from-maroon/10 to-gold/10 rounded-full text-xs font-semibold text-maroon mb-4">How It Works</span>
            <h2 className="text-[2.5rem] font-bold mb-4">From Signup to Wedding Day<br /><span className="bg-gradient-to-br from-maroon to-gold bg-clip-text text-transparent">In 4 Simple Steps</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-maroon to-gold hidden md:block" />
            {[
              { n: "1", t: "Tell Us About Your Wedding", d: "Religion, region, budget, guest count, events." },
              { n: "2", t: "Get Your Custom Template", d: "Pre-filled rituals, budget categories, checklists." },
              { n: "3", t: "Plan & Collaborate", d: "Track budget, manage vendors, organize guests." },
              { n: "4", t: "Celebrate Your Wedding", d: "Zero chaos, pure joy." },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-maroon to-maroon-light text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_rgba(139,0,0,0.3)]">{s.n}</div>
                <h3 className="font-bold mb-2">{s.t}</h3>
                <p className="text-gray-500 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-br from-maroon/10 to-gold/10 rounded-full text-xs font-semibold text-maroon mb-4">Templates</span>
            <h2 className="text-[2.5rem] font-bold mb-4">Built for Every<br /><span className="bg-gradient-to-br from-maroon to-gold bg-clip-text text-transparent">Indian Wedding</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-om", bg: "from-maroon to-gold", title: "Hindu Wedding", desc: "North Indian, South Indian, Bengali, Gujarati — all regional rituals.", tag: "Most Popular" },
              { icon: "fa-mosque", bg: "from-green-800 to-gold", title: "Muslim Wedding", desc: "Nikah to Walima. Mahr tracking, halal compliance." },
              { icon: "fa-place-of-worship", bg: "from-orange-600 to-amber-500", title: "Sikh Wedding", desc: "Anand Karaj. Akhand Paath, Langar, Milni." },
              { icon: "fa-cross", bg: "from-blue-800 to-blue-400", title: "Christian Wedding", desc: "Kerala, Goa, Northeast — Minnu, Roce, church ceremony." },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all relative">
                <div className={`h-28 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center text-white text-4xl mb-5`}>
                  <i className={`fas ${t.icon}`} />
                </div>
                <h3 className="font-bold mb-2">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
                {t.tag && <span className="absolute top-4 right-4 bg-gold text-white text-[0.7rem] font-bold px-2.5 py-1 rounded-full">{t.tag}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center bg-gradient-to-br from-maroon to-maroon-dark text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-bold text-white mb-4">Ready to Plan Your Wedding<br /><span className="bg-gradient-to-br from-gold-light to-gold bg-clip-text text-transparent">Without the Stress?</span></h2>
          <p className="text-lg opacity-90 mb-8">Join 500+ families already using ShaadiSheet. Free to start.</p>
          <Link href="/auth" className="px-8 py-4 text-lg font-bold text-maroon bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.3)] transition-all inline-flex items-center gap-3">
            Start Planning Free <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 text-xl font-extrabold mb-4">
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
                <h4 className="mb-5 text-sm uppercase tracking-wider font-semibold">{col.title}</h4>
                {col.links.map((l, j) => (
                  <a key={j} href="#" className="block py-1.5 text-gray-400 text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">&copy; 2026 ShaadiSheet. All rights reserved.</p>
            <div className="flex gap-4">
              {["fa-instagram", "fa-twitter", "fa-linkedin", "fa-youtube"].map((ic, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-maroon transition-colors">
                  <i className={`fab ${ic}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
