"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import BlurText from "@/components/animations/BlurText";
import ShinyText from "@/components/animations/ShinyText";
import RotatingText from "@/components/animations/RotatingText";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SpotlightCard from "@/components/animations/SpotlightCard";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerChildren";

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
            {/* Pom-pom petals - dense radial pattern */}
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

            {/* Fluffy outer edges - extra petal bumps */}
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
    WEDDING SCENE CAROUSEL - FULL BACKGROUND
   ───────────────────────────────────────────── */

const SCENES = [
  {
    key: "hindu",
    label: "Hindu Wedding",
    gradient: "linear-gradient(135deg, #3B1A08 0%, #5C2E0E 50%, #8B4513 100%)",
    image: "/weddings/hindu.jpg",
  },
  {
    key: "muslim",
    label: "Muslim Wedding",
    gradient: "linear-gradient(135deg, #0A2E12 0%, #1B5E20 50%, #2E7D32 100%)",
    image: "/weddings/muslim.jpg",
  },
  {
    key: "sikh",
    label: "Sikh Wedding",
    gradient: "linear-gradient(135deg, #3E1A00 0%, #7A3B00 50%, #E65100 100%)",
    image: "/weddings/sikh.jpg",
  },
  {
    key: "christian",
    label: "Christian Wedding",
    gradient: "linear-gradient(135deg, #0D1B3E 0%, #1A3A6B 50%, #1565C0 100%)",
    image: "/weddings/christian.jpg",
  },
  {
    key: "jain",
    label: "Jain Wedding",
    gradient: "linear-gradient(135deg, #1A0A2E 0%, #4A148C 50%, #6A1B9A 100%)",
    image: "/weddings/jain.jpg",
  },
];

function HeroBackground() {
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
    <div className="absolute inset-0 z-0">
      {SCENES.map((scene, i) => {
        const showImage = scene.image && !imgErrors[scene.key];
        return (
          <div
            key={scene.key}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
          >
            <div className="absolute inset-0" style={{ background: scene.gradient }} />
            {showImage && (
              <img
                src={scene.image}
                alt={scene.label}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgErrors((prev) => ({ ...prev, [scene.key]: true }))}
              />
            )}
          </div>
        );
      })}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 z-[2]" style={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.15) 100%)"
      }} />

      {/* Bottom label */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-[3]">
        <span className="inline-block px-6 py-2.5 bg-white/15 backdrop-blur-md rounded-full text-sm font-bold tracking-wide text-white border border-white/20 shadow-2xl">
          {SCENES[active].label}
        </span>
      </div>

      {/* Dots */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-3 z-[3]">
        {SCENES.map((scene, i) => (
          <button
            key={scene.key}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setPetalKey(1);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen wedding-bg">
      {/* Rose Petals */}
      {petalKey > 0 && <RosePetals key={petalKey} />}

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/95 backdrop-blur-xl border-b border-gray-200/60" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[70px]">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShaadiSheet" style={{ height: "65px", width: "auto", filter: "invert(1) brightness(2)" }} />
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Features</a>
            <a href="#how-it-works" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>How It Works</a>
            <a href="#religions" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Weddings</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/auth" className={`px-5 py-2.5 text-sm font-semibold transition-colors ${scrolled ? "text-gray-700 hover:text-maroon" : "text-white/90 hover:text-white"}`}>Log In</Link>
            <Link href="/auth" className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO - FULL BACKGROUND */}
      <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden">
        {/* Full-background image carousel */}
        <HeroBackground />

        {/* Marigold Garlands - hidden on mobile */}
        <div className="relative z-[4] opacity-50 hidden md:block">
          <MarigoldGarland side="left" />
          <MarigoldGarland side="right" />
        </div>

        {/* Content over background */}
        <div className="relative z-[5] w-full pt-[90px] md:pt-[100px] pb-16 md:pb-28 px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs md:text-sm font-medium text-white/90 mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Built for Indian Weddings
            </div>
            <h1 className="text-[2rem] md:text-4xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-4 md:mb-6 tracking-tight text-white drop-shadow-lg">
              Plan Your{" "}
              <RotatingText
                texts={["Hindu", "Muslim", "Sikh", "Christian", "Jain"]}
                rotationInterval={2500}
                className="text-[#FFD54F]"
              />{" "}
              Wedding
              <br />
              <ShinyText
                text="Without the Chaos"
                className="text-[#FFD54F]"
                speed={3}
                shineColor="#FFFFFF"
                color="rgba(255,213,79,0.6)"
              />
            </h1>
            <BlurText
              text="Track every guest, every vendor, every ritual - all in one place. From engagement to reception, plan every moment flawlessly."
              className="text-sm md:text-lg text-white/80 max-w-[560px] mb-6 md:mb-10 leading-relaxed mx-auto drop-shadow"
              delay={150}
              animateBy="words"
              direction="bottom"
            />
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap mb-8 md:mb-10">
              <Link href="/auth" className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-2xl">
                Start Planning Free →
              </Link>
              <a href="#how-it-works" className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold border-2 border-white/30 rounded-xl text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                See How It Works
              </a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {["#E8B4B8", "#B4D4E8", "#D4E8B4", "#E8D4B4", "#D4B4E8"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white -ml-2 border-2 border-white/30 first:ml-0" style={{ background: c }}>
                    {["RK", "AP", "SM", "PJ", "NM"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/70">500+ families already planning</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-28 relative">
        <div className="paisley-overlay" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <div className="gold-divider mb-4 md:mb-6">
                <span className="wedding-badge">Features</span>
              </div>
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Everything You Need</h2>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">One app to plan the perfect Indian wedding. No spreadsheets, no chaos.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" staggerDelay={0.1}>
            {[
              { icon: "💰", title: "Budget Tracker", desc: "Track every rupee with pre-filled categories for Indian weddings." },
              { icon: "🏪", title: "Vendor Manager", desc: "Track every vendor - from pandit to caterer to DJ." },
              { icon: "📋", title: "Ritual Checklists", desc: "Every ritual in order - from Roka to Vidaai, Nikah to Walima." },
              { icon: "👥", title: "Guest Management", desc: "RSVP tracking, dietary preferences, seating arrangements." },
              { icon: "🤖", title: "AI Assistant", desc: "Get instant, intelligent recommendations for your wedding." },
              { icon: "🤝", title: "Real-time Collaboration", desc: "Share with family, planners, and vendors." },
            ].map((f, i) => (
              <StaggerItem key={i}>
                <SpotlightCard className="wedding-card h-full" spotlightColor="rgba(212, 175, 55, 0.12)">
                  <div className="text-2xl md:text-3xl mb-3 md:mb-4">{f.icon}</div>
                  <h3 className="font-bold mb-1.5 text-gray-900 text-sm md:text-base">{f.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-28 bg-white relative">
        <div className="paisley-overlay" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <div className="gold-divider mb-4 md:mb-6">
                <span className="wedding-badge">How It Works</span>
              </div>
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>From Signup to Wedding Day</h2>
              <p className="text-gray-500 text-sm md:text-base">In 4 simple steps</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 hidden md:block" style={{ background: "linear-gradient(to right, transparent, #D4AF37, transparent)" }} />
            {[
              { n: "1", t: "Tell Us", d: "Religion, region, budget, guest count, events." },
              { n: "2", t: "Get Your Template", d: "Pre-filled rituals, budget categories, checklists." },
              { n: "3", t: "Plan & Collaborate", d: "Track budget, manage vendors, organize guests." },
              { n: "4", t: "Celebrate", d: "Zero chaos, pure joy." },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction="up" distance={50} blur={false}>
                <div className="text-center relative z-10">
                  <div className="wedding-step">{s.n}</div>
                  <h3 className="font-bold mb-1 text-gray-900 text-sm md:text-base">{s.t}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{s.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* RELIGIONS */}
      <section id="religions" className="py-16 md:py-28 relative">
        <div className="paisley-overlay" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <div className="gold-divider mb-4 md:mb-6">
                <span className="wedding-badge">Weddings</span>
              </div>
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Built for Every Indian Wedding</h2>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5" staggerDelay={0.08}>
            {[
              {
                bg: "bg-amber-50", border: "border-amber-200", title: "Hindu", desc: "Roka to Vidaai",
                svg: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
                    <path d="M4 18h16" /><path d="M5 18v-4h14v4" /><path d="M7 14v-3h10v3" /><path d="M8 11V8h8v3" />
                    <path d="M9 8c0-3 1.5-5 3-5s3 2 3 5" />
                    <circle cx="12" cy="2.5" r="1" fill="currentColor" opacity="0.3" /><path d="M11.5 3.5v1" />
                    <line x1="7" y1="14" x2="7" y2="18" /><line x1="17" y1="14" x2="17" y2="18" />
                  </svg>
                ),
              },
              {
                bg: "bg-green-50", border: "border-green-200", title: "Muslim", desc: "Nikah to Walima",
                svg: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
                    <path d="M3 18h18" /><path d="M5 18v-5h14v5" /><path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
                    <line x1="4" y1="8" x2="4" y2="18" /><line x1="20" y1="8" x2="20" y2="18" />
                    <circle cx="4" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
                    <circle cx="20" cy="7.5" r="0.8" fill="currentColor" opacity="0.3" />
                    <path d="M11 4.5a1.5 1.5 0 1 0 2 0 1.5 1.5 0 0 0-2 0" fill="currentColor" opacity="0.4" />
                  </svg>
                ),
              },
              {
                bg: "bg-orange-50", border: "border-orange-200", title: "Sikh", desc: "Anand Karaj",
                svg: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
                    <path d="M3 18h18" /><path d="M6 18v-4h12v4" />
                    <path d="M8 14c0-4 2-7 4-7s4 3 4 7" />
                    <path d="M10.5 7c0-1.5.7-3 1.5-3s1.5 1.5 1.5 3" />
                    <line x1="12" y1="5" x2="12" y2="3" /><circle cx="12" cy="2.5" r="0.6" fill="currentColor" />
                  </svg>
                ),
              },
              {
                bg: "bg-blue-50", border: "border-blue-200", title: "Christian", desc: "Church Ceremony",
                svg: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
                    <path d="M4 18h16" /><path d="M6 18v-6h12v6" />
                    <path d="M10 12V7l2-4 2 4v5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="11" y1="2" x2="13" y2="2" />
                    <path d="M10.5 18v-3h3v3" /><circle cx="12" cy="14.5" r="1" />
                  </svg>
                ),
              },
              {
                bg: "bg-purple-50", border: "border-purple-200", title: "Jain", desc: "Panch Kalyanak",
                svg: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
                    <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
                    <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
                    <circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
                    <line x1="12" y1="6" x2="12" y2="4" /><circle cx="12" cy="3.5" r="0.5" fill="currentColor" opacity="0.4" />
                  </svg>
                ),
              },
            ].map((t, i) => (
              <StaggerItem key={i}>
                <div className={`religion-card ${t.bg}`} style={{ borderColor: "rgba(212, 175, 55, 0.15)" }}>
                  <div className="flex justify-center mb-2 md:mb-3">{t.svg}</div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{t.title}</h3>
                  <p className="text-gray-500 text-[0.65rem] md:text-xs mt-1">{t.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-28 text-center wedding-cta text-white relative">
        <div className="paisley-overlay" style={{ opacity: 0.03 }} />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal direction="up" distance={60}>
            <div className="gold-divider mb-5 md:mb-8" style={{ filter: "brightness(2)" }}>
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
            </div>
            <h2 className="text-2xl md:text-[2.5rem] font-bold text-white mb-3 md:mb-4" style={{ fontFamily: "var(--font-display)" }}>Ready to Plan Your Wedding?</h2>
            <p className="text-sm md:text-lg text-white/80 mb-6 md:mb-10">Free to start. No credit card required.</p>
            <Link href="/auth" className="px-7 md:px-10 py-3 md:py-4 text-sm md:text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-all inline-flex items-center gap-2 shadow-2xl hover:shadow-white/20 hover:scale-105">
              Start Planning Free →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 md:py-16 pb-6 md:pb-8 relative" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #1a0a0a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-6 md:mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto", filter: "invert(1) brightness(2)" }} />
              </div>
              <p className="text-gray-400 text-sm">Har Shaadi Ka Plan. Built with love from Nashik, India.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Templates", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider font-semibold text-[#D4AF37]">{col.title}</h4>
                {col.links.map((l, j) => (
                  <a key={j} href="#" className="block py-0.5 md:py-1 text-gray-400 text-xs md:text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-6 md:pt-8" style={{ borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
            <p className="text-gray-500 text-xs md:text-sm">&copy; 2026 ShaadiSheet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
