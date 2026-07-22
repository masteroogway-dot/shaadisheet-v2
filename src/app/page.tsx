"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   ROSE PETAL ANIMATION
   ───────────────────────────────────────────── */
function RosePetals() {
  const [petals, setPetals] = useState<{ id: number; left: number; size: number; delay: number; duration: number; rotation: number; type: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 18,
      delay: Math.random() * 2.5,
      duration: 3 + Math.random() * 3.5,
      rotation: Math.random() * 360,
      type: Math.floor(Math.random() * 3),
    }));
    setPetals(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {petals.map((p) => (
        <svg
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `petalFall ${p.duration}s ease-in ${p.delay}s forwards`,
            opacity: 0,
          }}
          viewBox="0 0 20 20"
        >
          {p.type === 0 ? (
            <>
              <ellipse cx="10" cy="10" rx="5" ry="8" fill="#E53935" opacity="0.85" transform={`rotate(${p.rotation} 10 10)`} />
              <ellipse cx="10" cy="10" rx="3" ry="6" fill="#C62828" opacity="0.5" transform={`rotate(${p.rotation + 20} 10 10)`} />
            </>
          ) : p.type === 1 ? (
            <>
              <ellipse cx="10" cy="10" rx="6" ry="7" fill="#EF5350" opacity="0.8" transform={`rotate(${p.rotation} 10 10)`} />
              <ellipse cx="10" cy="10" rx="4" ry="5" fill="#D32F2F" opacity="0.4" transform={`rotate(${p.rotation + 30} 10 10)`} />
            </>
          ) : (
            <>
              <circle cx="10" cy="10" r="6" fill="#FFCDD2" opacity="0.7" />
              <circle cx="10" cy="10" r="3.5" fill="#EF9A9A" opacity="0.5" />
            </>
          )}
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MARIGOLD GARLAND SVG
   ───────────────────────────────────────────── */
function MarigoldGarland({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  const cx = isLeft ? 45 : 55;

  // Dense pom-pom marigold flowers stacked tightly
  const flowers = Array.from({ length: 14 }, (_, i) => ({
    cy: 20 + i * 22,
    r: 14 + (i % 2) * 2,
    orange: i % 2 === 0,
  }));

  return (
    <div
      className={`absolute top-0 ${isLeft ? "left-0" : "right-0"} h-full pointer-events-none`}
      style={{
        width: 120,
        animation: `garlandSway${isLeft ? "Left" : "Right"} 5s ease-in-out infinite`,
        transformOrigin: "top center",
      }}
    >
      <svg viewBox="0 0 100 340" className="w-full h-full" fill="none">
        {/* Main string */}
        <line x1={cx} y1="0" x2={cx} y2="340" stroke="#8B6914" strokeWidth="2" opacity="0.4" />

        {flowers.map((f, i) => (
          <g key={i}>
            {/* Pom-pom petals — dense radial pattern */}
            {Array.from({ length: 16 }, (_, j) => {
              const angle = (j * 22.5 * Math.PI) / 180;
              const petalR = f.r * 0.55;
              const dist = f.r * 0.45;
              return (
                <ellipse
                  key={j}
                  cx={cx + Math.cos(angle) * dist}
                  cy={f.cy + Math.sin(angle) * dist}
                  rx={petalR}
                  ry={petalR * 0.6}
                  fill={f.orange ? "#FF8F00" : "#FFD54F"}
                  transform={`rotate(${j * 22.5} ${cx + Math.cos(angle) * dist} ${f.cy + Math.sin(angle) * dist})`}
                  opacity={0.85 + (j % 3) * 0.05}
                />
              );
            })}
            {/* Inner petals layer */}
            {Array.from({ length: 8 }, (_, j) => {
              const angle = ((j * 45 + 22.5) * Math.PI) / 180;
              const dist = f.r * 0.22;
              return (
                <ellipse
                  key={`inner-${j}`}
                  cx={cx + Math.cos(angle) * dist}
                  cy={f.cy + Math.sin(angle) * dist}
                  rx={f.r * 0.3}
                  ry={f.r * 0.2}
                  fill={f.orange ? "#E65100" : "#FFB300"}
                  transform={`rotate(${j * 45 + 22.5} ${cx + Math.cos(angle) * dist} ${f.cy + Math.sin(angle) * dist})`}
                  opacity="0.9"
                />
              );
            })}
            {/* Center pom-pom */}
            <circle cx={cx} cy={f.cy} r={f.r * 0.3} fill={f.orange ? "#BF360C" : "#F57F17"} />
            <circle cx={cx} cy={f.cy} r={f.r * 0.18} fill={f.orange ? "#E65100" : "#FFC107"} opacity="0.8" />

            {/* Fluffy outer edges — extra petal bumps */}
            {Array.from({ length: 12 }, (_, j) => {
              const angle = (j * 30 * Math.PI) / 180;
              return (
                <circle
                  key={`edge-${j}`}
                  cx={cx + Math.cos(angle) * f.r * 0.85}
                  cy={f.cy + Math.sin(angle) * f.r * 0.85}
                  r={f.r * 0.22}
                  fill={f.orange ? (j % 2 === 0 ? "#FF8F00" : "#FFB300") : (j % 2 === 0 ? "#FFD54F" : "#FFCA28")}
                  opacity="0.75"
                />
              );
            })}
          </g>
        ))}

        {/* Green leaf tassels between flowers */}
        {[1, 3, 5, 7, 9, 11].map((idx) => {
          const f = flowers[idx];
          const leafX = isLeft ? cx - 14 : cx + 14;
          return (
            <g key={`leaf-${idx}`}>
              <ellipse cx={leafX} cy={f.cy + 8} rx="5" ry="9" fill="#558B2F" opacity="0.5" transform={`rotate(${isLeft ? -20 : 20} ${leafX} ${f.cy + 8})`} />
              <ellipse cx={leafX + (isLeft ? -4 : 4)} cy={f.cy + 4} rx="4" ry="7" fill="#689F38" opacity="0.4" transform={`rotate(${isLeft ? -35 : 35} ${leafX + (isLeft ? -4 : 4)} ${f.cy + 4})`} />
            </g>
          );
        })}

        {/* Bottom tassel */}
        {(() => {
          const lastF = flowers[flowers.length - 1];
          return (
            <g>
              <line x1={cx} y1={lastF.cy + lastF.r} x2={cx} y2={lastF.cy + lastF.r + 20} stroke="#8B6914" strokeWidth="1.5" opacity="0.4" />
              <circle cx={cx} cy={lastF.cy + lastF.r + 22} r="4" fill="#FF8F00" opacity="0.5" />
              <circle cx={cx} cy={lastF.cy + lastF.r + 22} r="2" fill="#E65100" opacity="0.6" />
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WEDDING SCENE CAROUSEL — IMAGE BASED
   ───────────────────────────────────────────── */

const SCENES = [
  {
    key: "hindu",
    label: "Hindu Wedding",
    gradient: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 30%, #FFCC80 60%, #FFB74D 100%)",
    accent: "#D4AF37",
    image: "/weddings/hindu.jpg",
  },
  {
    key: "muslim",
    label: "Muslim Wedding",
    gradient: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 30%, #A5D6A7 60%, #81C784 100%)",
    accent: "#2E7D32",
    image: "/weddings/muslim.jpg",
  },
  {
    key: "sikh",
    label: "Sikh Wedding",
    gradient: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 30%, #FFD54F 60%, #FFCA28 100%)",
    accent: "#E65100",
    image: "/weddings/sikh.jpg",
  },
  {
    key: "christian",
    label: "Christian Wedding",
    gradient: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 30%, #90CAF9 60%, #64B5F6 100%)",
    accent: "#1565C0",
    image: "/weddings/christian.jpg",
  },
  {
    key: "jain",
    label: "Jain Wedding",
    gradient: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 30%, #CE93D8 60%, #BA68C8 100%)",
    accent: "#6A1B9A",
    image: "/weddings/jain.jpg",
  },
];

function WeddingSceneCarousel() {
  const [active, setActive] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SCENES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full max-w-[540px] mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-200/40" style={{ aspectRatio: "4/3" }}>
        {SCENES.map((scene, i) => {
          const showImage = scene.image && !imgErrors[scene.key];
          return (
            <div
              key={scene.key}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
            >
              {/* Gradient fallback (always rendered behind) */}
              <div className="absolute inset-0" style={{ background: scene.gradient }} />

              {/* Image (if available) */}
              {showImage && (
                <img
                  src={scene.image}
                  alt={scene.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [scene.key]: true }))}
                />
              )}

              {/* Soft overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          );
        })}

        {/* Label */}
        <div className="absolute bottom-5 left-0 right-0 text-center z-10">
          <span
            className="inline-block px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold tracking-wide shadow-lg"
            style={{ color: SCENES[active].accent }}
          >
            {SCENES[active].label}
          </span>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2.5 mt-6">
        {SCENES.map((scene, i) => (
          <button
            key={scene.key}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "w-8 bg-maroon" : "w-2.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
   ───────────────────────────────────────────── */
export default function Home() {
  const [petalKey, setPetalKey] = useState(0);

  useEffect(() => {
    setPetalKey(1);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Rose Petals */}
      {petalKey > 0 && <RosePetals key={petalKey} />}

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
            <a href="#religions" className="hover:text-maroon transition-colors">Weddings</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-maroon transition-colors">Log In</Link>
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-[100px] pb-16 px-6 overflow-hidden">
        {/* Marigold Garlands */}
        <MarigoldGarland side="left" />
        <MarigoldGarland side="right" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-6">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                Built for Indian Weddings
              </div>
              <h1 className="text-4xl md:text-[3.25rem] font-extrabold leading-[1.1] mb-6 tracking-tight text-gray-900">
                Plan Your Indian Wedding<br />
                <span className="text-maroon">Without the Chaos</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-[480px] mb-10 leading-relaxed mx-auto lg:mx-0">
                Budget tracking. Vendor management. Ritual checklists. AI assistance. Built for Hindu, Muslim, Sikh, Christian, and Jain weddings.
              </p>
              <div className="flex gap-4 justify-center lg:justify-start flex-wrap mb-10">
                <Link href="/auth" className="px-8 py-3.5 text-base font-bold text-white bg-maroon rounded-xl hover:bg-maroon-dark transition-colors inline-flex items-center gap-2 shadow-lg shadow-maroon/20">
                  Start Planning Free →
                </Link>
                <a href="#how-it-works" className="px-8 py-3.5 text-base font-bold border-2 border-gray-300 rounded-xl hover:border-maroon hover:text-maroon transition-all">
                  See How It Works
                </a>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
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

            {/* Right: Wedding Scene */}
            <div className="relative">
              <WeddingSceneCarousel />
            </div>
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
              { icon: "💰", title: "Budget Tracker", desc: "Track every rupee with pre-filled categories for Indian weddings." },
              { icon: "🏪", title: "Vendor Manager", desc: "Track every vendor — from pandit to caterer to DJ." },
              { icon: "📋", title: "Ritual Checklists", desc: "Every ritual in order — from Roka to Vidaai, Nikah to Walima." },
              { icon: "👥", title: "Guest Management", desc: "RSVP tracking, dietary preferences, seating arrangements." },
              { icon: "🤖", title: "AI Assistant", desc: "Get instant, intelligent recommendations for your wedding." },
              { icon: "🤝", title: "Real-time Collaboration", desc: "Share with family, planners, and vendors." },
            ].map((f, i) => (
              <div key={i} className="bg-white p-7 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
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

      {/* RELIGIONS */}
      <section id="religions" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-maroon/5 rounded-full text-xs font-semibold text-maroon mb-4">Weddings</span>
            <h2 className="text-[2.25rem] font-bold mb-4 text-gray-900">Built for Every Indian Wedding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: "🛕", bg: "bg-amber-50", border: "border-amber-200", title: "Hindu", desc: "Roka to Vidaai" },
              { icon: "🕌", bg: "bg-green-50", border: "border-green-200", title: "Muslim", desc: "Nikah to Walima" },
              { icon: "🏛️", bg: "bg-orange-50", border: "border-orange-200", title: "Sikh", desc: "Anand Karaj" },
              { icon: "⛪", bg: "bg-blue-50", border: "border-blue-200", title: "Christian", desc: "Church Ceremony" },
              { icon: "🙏", bg: "bg-purple-50", border: "border-purple-200", title: "Jain", desc: "Panch Kalyanak" },
            ].map((t, i) => (
              <div key={i} className={`${t.bg} ${t.border} border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow`}>
                <div className="text-4xl mb-3">{t.icon}</div>
                <h3 className="font-bold text-gray-900">{t.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
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
          <Link href="/auth" className="px-8 py-3.5 text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
            Start Planning Free →
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
          </div>
        </div>
      </footer>
    </div>
  );
}
