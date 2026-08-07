"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlurText from "@/components/animations/BlurText";
import ShinyText from "@/components/animations/ShinyText";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SpotlightCard from "@/components/animations/SpotlightCard";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerChildren";
import LiveCount from "@/components/LiveCount";
import PublicHashtagGenerator from "@/components/PublicHashtagGenerator";
import InteractiveDemo from "@/components/InteractiveDemo";

/* ─────────────────────────────────────────────
   FLOWER PETAL ANIMATION (Universal)
   ───────────────────────────────────────────── */
function FlowerPetals() {
  const [petals, setPetals] = useState<{ id: number; left: number; size: number; delay: number; duration: number; rotation: number; type: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 18,
      delay: Math.random() * 2.5,
      duration: 3 + Math.random() * 3.5,
      rotation: Math.random() * 360,
      type: Math.floor(Math.random() * 4),
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
              <ellipse cx="10" cy="10" rx="6" ry="7" fill="#EC407A" opacity="0.8" transform={`rotate(${p.rotation} 10 10)`} />
              <ellipse cx="10" cy="10" rx="4" ry="5" fill="#D81B60" opacity="0.4" transform={`rotate(${p.rotation + 30} 10 10)`} />
            </>
          ) : p.type === 2 ? (
            <>
              <ellipse cx="10" cy="10" rx="5" ry="7" fill="#AB47BC" opacity="0.75" transform={`rotate(${p.rotation} 10 10)`} />
              <ellipse cx="10" cy="10" rx="3" ry="5" fill="#8E24AA" opacity="0.4" transform={`rotate(${p.rotation + 25} 10 10)`} />
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
   MAIN LANDING PAGE
   ───────────────────────────────────────────── */
type Region = { name: string; ceremony: string; events: string };
type WeddingCategory = { id: string; bg: string; title: string; desc: string; svg: React.ReactNode; regions: Region[] };

const WEDDING_CATEGORIES: WeddingCategory[] = [
  {
    id: "hindu", bg: "bg-amber-50", title: "Hindu", desc: "Roka to Vidaai",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M5 18v-4h14v4" /><path d="M7 14v-3h10v3" /><path d="M8 11V8h8v3" />
        <path d="M9 8c0-3 1.5-5 3-5s3 2 3 5" />
        <circle cx="12" cy="2.5" r="1" fill="currentColor" opacity="0.3" /><path d="M11.5 3.5v1" />
        <line x1="7" y1="14" x2="7" y2="18" /><line x1="17" y1="14" x2="17" y2="18" />
      </svg>
    ),
    regions: [
      { name: "North Indian", ceremony: "Baraat, Jaimala, Pheras", events: "Roka → Engagement → Mehendi → Sangeet → Haldi → Wedding → Reception" },
      { name: "South Indian", ceremony: "Kanyadaanam, Thaali Tying", events: "Nischayam → Mehendi → Wedding → Reception" },
      { name: "Bengali", ceremony: "Shubho Drishti, Sindoor Daan", events: "Gaye Holud → Dodhi Mangal → Shubho Drishti → Wedding → Bou Bhat" },
      { name: "Gujarati", ceremony: "Jaimala, Pheras", events: "Gol Dhana → Mehendi → Sangeet → Wedding → Reception" },
      { name: "Punjabi", ceremony: "Chunni, Jaggo", events: "Roka → Chunni → Mehendi → Sangeet → Jaggo → Wedding → Reception" },
    ],
  },
  {
    id: "muslim", bg: "bg-green-50", title: "Muslim", desc: "Nikah to Walima",
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
    regions: [
      { name: "Arab", ceremony: "Katb el-Kitab, Mahr", events: "Engagement → Henna Night → Katb el-Kitab → Wedding → Walima" },
      { name: "South Asian", ceremony: "Nikah, Walima", events: "Mangni → Mehendi → Nikah → Walima" },
      { name: "Turkish", ceremony: "Nikah, Kına Gecesi", events: "Tevilil → Henna Night → Nikah → Düğün (Wedding)" },
    ],
  },
  {
    id: "christian", bg: "bg-blue-50", title: "Christian", desc: "Church Ceremony",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-6h12v6" />
        <path d="M10 12V7l2-4 2 4v5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="11" y1="2" x2="13" y2="2" />
        <path d="M10.5 18v-3h3v3" /><circle cx="12" cy="14.5" r="1" />
      </svg>
    ),
    regions: [
      { name: "Western", ceremony: "Church Wedding", events: "Engagement → Rehearsal Dinner → Church Wedding → Reception" },
      { name: "Filipino", ceremony: "Church Wedding, Cord & Veil", events: "Sponsor Selection → Church Wedding → Reception" },
      { name: "Latin American", ceremony: "Catholic Ceremony", events: "Pedida → Church Wedding → Fiesta" },
    ],
  },
  {
    id: "jewish", bg: "bg-indigo-50", title: "Jewish", desc: "Chuppah Ceremony",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-4h12v4" />
        <path d="M10 14V6h4v8" /><path d="M8 8h8" /><path d="M8 11h8" />
      </svg>
    ),
    regions: [
      { name: "Ashkenazi", ceremony: "Chuppah, Ketubah", events: "Aufruf → Mikveh → Ketubah Signing → Chuppah → Reception" },
      { name: "Sephardic", ceremony: "Chuppah, Ketubah", events: "Hachnassat → Ketubah Signing → Chuppah → Reception" },
    ],
  },
  {
    id: "sikh", bg: "bg-orange-50", title: "Sikh", desc: "Anand Karaj",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18v2H3z" fill="currentColor" opacity="0.15" />
        <path d="M3 18h18" /><path d="M6 18v-4h12v4" />
        <path d="M8 14c0-4 2-7 4-7s4 3 4 7" />
        <path d="M10.5 7c0-1.5.7-3 1.5-3s1.5 1.5 1.5 3" />
        <line x1="12" y1="5" x2="12" y2="3" /><circle cx="12" cy="2.5" r="0.6" fill="currentColor" />
      </svg>
    ),
    regions: [
      { name: "Punjabi Sikh", ceremony: "Anand Karaj, Langar", events: "Kurmai → Mehendi → Sangeet → Jaggo → Anand Karaj → Langar → Reception" },
    ],
  },
  {
    id: "east_asian", bg: "bg-red-50", title: "East Asian", desc: "Tea Ceremony to Banquet",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <circle cx="12" cy="10" r="2" /><circle cx="12" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    regions: [
      { name: "Chinese", ceremony: "Tea Ceremony, Gate Crashing", events: "Gate Crashing → Tea Ceremony → Wedding Banquet → Tea at Groom's" },
      { name: "Japanese", ceremony: "San-san-kudo, Hina-matsuri", events: "Nijikai → Tea Ceremony → Wedding Ceremony → Reception" },
      { name: "Korean", ceremony: "Pyebaek, Jeonanrye", events: "Pyebaek → Wedding Ceremony → Reception → Hapgeunrye" },
    ],
  },
  {
    id: "latin_american", bg: "bg-yellow-50", title: "Latin American", desc: "La Pedida to Fiesta",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <path d="M9 7c-1-2 0-4 0-4" /><path d="M15 7c1-2 0-4 0-4" />
      </svg>
    ),
    regions: [
      { name: "Mexican", ceremony: "Las Arras, Lazo", events: "La Pedida → Las Arras → Church Wedding → Fiesta" },
      { name: "Brazilian", ceremony: "Cordas, Alliance", events: "Festa de Debutante → Wedding Ceremony → Festas" },
      { name: "Colombian", ceremony: "Ceremonia Religiosa", events: "Pedida → Church Wedding → Fiesta" },
    ],
  },
  {
    id: "african", bg: "bg-emerald-50", title: "African", desc: "Traditional Ceremonies",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <circle cx="12" cy="10" r="3" /><circle cx="12" cy="10" r="1" fill="currentColor" opacity="0.3" />
        <path d="M9 7c-1-2 0-4 0-4" /><path d="M15 7c1-2 0-4 0-4" />
      </svg>
    ),
    regions: [
      { name: "Nigerian (Yoruba)", ceremony: "Engagement, Church Wedding", events: "Introduction → Bride Price → Engagement → Church Wedding → Reception" },
      { name: "Kenyan", ceremony: "Ruracio, Church Wedding", events: "Ruracio → Traditional Wedding → Church Wedding → Reception" },
      { name: "South African", ceremony: "Lobola, Umabo", events: "Lobola Negotiation → Umabo → Church Wedding → Reception" },
    ],
  },
  {
    id: "middle_eastern", bg: "bg-purple-50", title: "Middle Eastern", desc: "Zaffa to Farah",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <circle cx="12" cy="10" r="2" /><circle cx="12" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
        <path d="M11 4.5a1.5 1.5 0 1 0 2 0 1.5 1.5 0 0 0-2 0" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    regions: [
      { name: "Egyptian", ceremony: "Katb el-Kitab, Zaffa", events: "Engagement → Henna Night → Katb el-Kitab → Zaffa → Wedding → Farah" },
      { name: "Lebanese", ceremony: "Katb el-Kitab", events: "Engagement → Henna Night → Katb el-Kitab → Wedding → Dabke" },
      { name: "Persian", ceremony: "Aghd, Sofreh Aghd", events: "Baleh Boran → Henna Night → Aghd → Wedding → Farah" },
    ],
  },
];

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
   ───────────────────────────────────────────── */
export default function Home() {
  const [petalKey, setPetalKey] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    setPetalKey(1);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen wedding-bg">
      {/* Rose Petals */}
      {petalKey > 0 && <FlowerPetals key={petalKey} />}

      {/* NAVBAR */}
      {!demoOpen && (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/95 backdrop-blur-xl border-b border-gray-200/60" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-[60px] md:h-[70px]">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShaadiSheet" className="h-[45px] md:h-[65px] w-auto" style={{ filter: scrolled ? "none" : "invert(1) brightness(2)" }} />
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/features" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Features</Link>
            <a href="#how-it-works" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>How It Works</a>
            <a href="#religions" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Weddings</a>
          </div>
          <div className="flex gap-1.5 md:gap-3 items-center">
            <Link href="/auth" className={`px-2 md:px-5 py-1.5 md:py-2.5 text-[11px] md:text-sm font-semibold transition-colors ${scrolled ? "text-gray-700 hover:text-maroon" : "text-white/90 hover:text-white"}`}>Log In</Link>
            <Link href="/auth" className="px-2.5 md:px-5 py-1.5 md:py-2.5 text-[11px] md:text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>
      )}

      {/* HERO - FULL BACKGROUND */}
      <section className="relative w-full min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden">
        {/* Static background image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 767px)" srcSet="/hero-mobile.png" />
            <img
              src="/hero.png"
              alt="Wedding Celebration"
              className="w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.15) 100%)"
          }} />
        </div>

        {/* Content over background */}
        <div className="relative z-[5] w-full pt-[70px] md:pt-[100px] pb-16 md:pb-28 px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs md:text-sm font-medium text-white/90 mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Built for 193 Countries
            </div>
            <h1 className="text-[2rem] md:text-4xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-4 md:mb-6 tracking-tight text-white drop-shadow-lg">
              Every Culture.<br />
              <span className="text-[#FFD54F]">One Wedding Planner.</span>
            </h1>
            <BlurText
              text="Hindu pheras, Muslim nikah, Christian vows, Jewish chuppah — pre-filled traditions, budgets, and checklists for weddings worldwide. No spreadsheets, no chaos."
              className="text-sm md:text-lg text-white/80 max-w-[560px] mb-6 md:mb-10 leading-relaxed mx-auto drop-shadow"
              delay={150}
              animateBy="words"
              direction="bottom"
            />
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap mb-8 md:mb-10">
              <Link href="/auth" className="px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-bold text-maroon bg-white rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-2xl">
                Start Planning Free →
              </Link>
              <InteractiveDemo onOpenChange={setDemoOpen} />
            </div>
            <LiveCount />
          </div>
        </div>
      </section>

      {/* PROMOTIONAL VIDEO */}
      <section className="py-12 md:py-20 bg-white relative">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>See ShaadiSheet in Action</h2>
              <p className="text-gray-500 text-sm md:text-base">Watch how we help families plan the perfect wedding</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <video
                className="w-full aspect-video object-cover"
                controls
                preload="metadata"
                poster="/hero.png"
              >
                <source src="/promo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-28 relative">
        <div className="paisley-overlay" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <div className="gold-divider mb-4 md:mb-6">
                <span className="wedding-badge">Features</span>
              </div>
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Everything You Need</h2>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">One app to plan the perfect wedding. No spreadsheets, no chaos.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" staggerDelay={0.1}>
            {[
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5c0-1 1.5-2 3-2s3 1 3 2-1.5 1.5-3 2-3 1-3 2 1.5 2 3 2 3-1 3-2" /></svg>, title: "Budget Tracker", desc: "Track every dollar with pre-filled categories for any wedding style." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21V11h6v10" /><path d="M3 11h18" /><circle cx="12" cy="7" r="1" fill="currentColor" opacity="0.4" /></svg>, title: "Vendor Manager", desc: "Track every vendor — from officiant to caterer to DJ." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /><path d="M7 7l1.5 1.5L11 6" fill="currentColor" opacity="0.5" /><path d="M7 11l1.5 1.5L11 10" fill="currentColor" opacity="0.5" /></svg>, title: "Tradition Checklists", desc: "Every tradition in order — engagement to reception, ceremony to celebration." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><path d="M17 14c2.5 0 5 1.5 5 4" /></svg>, title: "Guest Management", desc: "RSVP tracking, dietary preferences, seating arrangements." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5z" /><path d="M19 15l-1.5 4-3.5-3 4-1z" opacity="0.5" /><path d="M5 15l1.5 4 3.5-3-4-1z" opacity="0.5" /></svg>, title: "AI Assistant", desc: "Get instant, intelligent recommendations for your wedding." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="10" r="4" /><circle cx="16" cy="10" r="4" /><path d="M4 18c0-2.5 2-4.5 4-5M20 18c0-2.5-2-4.5-4-5" /><path d="M10 10h4" strokeWidth="2" /></svg>, title: "Real-time Collaboration", desc: "Share with family, planners, and vendors." },
            ].map((f, i) => (
              <StaggerItem key={i}>
                <SpotlightCard className="wedding-card h-full" spotlightColor="rgba(212, 175, 55, 0.12)">
                  <div className="text-maroon mb-3 md:mb-4">{f.icon}</div>
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
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>From Sign Up to Wedding Day</h2>
              <p className="text-gray-500 text-sm md:text-base">In 4 simple steps</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 hidden md:block" style={{ background: "linear-gradient(to right, transparent, #D4AF37, transparent)" }} />
            {[
              { n: "1", t: "Tell Us!", d: "Country, religion, region, budget, guest count, events." },
              { n: "2", t: "Get Your Template!", d: "Pre-filled traditions, budget categories, checklists." },
              { n: "3", t: "Plan & Collaborate!", d: "Track budget, manage vendors, organize guests." },
              { n: "4", t: "Celebrate!", d: "Zero chaos, pure joy." },
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
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Built for Every Wedding Tradition</h2>
              <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">Click a tradition below to explore all regional styles</p>
            </div>
          </ScrollReveal>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mb-2">
            {WEDDING_CATEGORIES.map((cat) => {
              const isExpanded = expandedCategory === cat.id;
              return (
                <div key={cat.id} className="contents">
                  <motion.button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className={`religion-card ${cat.bg} cursor-pointer text-left ${isExpanded ? "ring-2 ring-maroon ring-offset-2" : ""}`}
                    style={{ borderColor: isExpanded ? "rgba(139, 0, 0, 0.3)" : "rgba(212, 175, 55, 0.15)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div className="flex justify-center mb-2 md:mb-3">{cat.svg}</div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{cat.title}</h3>
                    <p className="text-gray-500 text-xs md:text-xs mt-1">{cat.desc}</p>
                    <div className="mt-2 text-xs text-maroon font-semibold">
                      {cat.regions.length} region{cat.regions.length > 1 ? "s" : ""} <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} ml-1 text-[10px]`} />
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Accordion: Expanded Regions */}
          <AnimatePresence>
            {expandedCategory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-6 mt-2">
                  {/* Region grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {WEDDING_CATEGORIES.find((c) => c.id === expandedCategory)?.regions.map((region, i) => (
                      <motion.button
                        key={region.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                        className={`text-left p-3 md:p-4 rounded-xl border transition-all ${selectedRegion === region.name ? "border-maroon bg-maroon/5 shadow-md" : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"}`}
                      >
                        <h4 className="font-bold text-gray-900 text-xs md:text-sm">{region.name}</h4>
                        <p className="text-gray-500 text-[10px] md:text-xs mt-1 leading-snug">{region.ceremony}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* Region Info Panel */}
                  <AnimatePresence>
                    {selectedRegion && (() => {
                      const cat = WEDDING_CATEGORIES.find((c) => c.id === expandedCategory);
                      const region = cat?.regions.find((r) => r.name === selectedRegion);
                      if (!region) return null;
                      return (
                        <motion.div
                          key={selectedRegion}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-4 md:p-6 bg-gradient-to-br from-maroon/5 to-amber-50 rounded-xl border border-maroon/10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-maroon/10 flex items-center justify-center">
                                {cat?.id === "hindu" && <i className="fas fa-om text-maroon text-sm" />}
                                {cat?.id === "muslim" && <i className="fas fa-star-and-crescent text-maroon text-sm" />}
                                {cat?.id === "christian" && <i className="fas fa-cross text-maroon text-sm" />}
                                {cat?.id === "jewish" && <i className="fas fa-star-of-david text-maroon text-sm" />}
                                {cat?.id === "sikh" && <i className="fas fa-wheat-awn text-maroon text-sm" />}
                                {cat?.id === "east_asian" && <i className="fas fa-yin-yang text-maroon text-sm" />}
                                {cat?.id === "latin_american" && <i className="fas fa-sun text-maroon text-sm" />}
                                {cat?.id === "african" && <i className="fas fa-drum text-maroon text-sm" />}
                                {cat?.id === "middle_eastern" && <i className="fas fa-mosque text-maroon text-sm" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-base">{cat?.title} — {region.name}</h4>
                                <p className="text-gray-500 text-xs">{region.ceremony}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <i className="fas fa-calendar-alt text-maroon text-xs mt-0.5 w-4" />
                                <p className="text-gray-700 text-xs md:text-sm">{region.events}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <i className="fas fa-map-marker-alt text-maroon text-xs mt-0.5 w-4" />
                                <p className="text-gray-700 text-xs md:text-sm">
                                  {expandedCategory === "hindu" && "Found across India and the diaspora — each region brings unique traditions"}
                                  {expandedCategory === "muslim" && "Found worldwide — traditions vary by region and community"}
                                  {expandedCategory === "christian" && "Found worldwide — from Western ceremonies to cultural variations"}
                                  {expandedCategory === "jewish" && "Ashkenazi and Sephardic traditions with rich cultural heritage"}
                                  {expandedCategory === "sikh" && "Centered around Gurdwara ceremonies with the Anand Karaj"}
                                  {expandedCategory === "east_asian" && "Chinese, Japanese, and Korean traditions with tea ceremonies and banquets"}
                                  {expandedCategory === "latin_american" && "From Mexico to Brazil — vibrant celebrations with family at the center"}
                                  {expandedCategory === "african" && "Rich traditions from Nigeria to South Africa with cultural ceremonies"}
                                  {expandedCategory === "middle_eastern" && "Egyptian, Lebanese, and Persian celebrations with Zaffa and Dabke"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-maroon/10">
                              <p className="text-xs text-gray-500">
                                <i className="fas fa-info-circle mr-1" />
                                Select this style during onboarding to auto-configure your wedding events, checklists, and budget ranges.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* HASHTAG GENERATOR TRY-IT */}
      <PublicHashtagGenerator />

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
                <img src="/logo.png" alt="ShaadiSheet" className="h-[40px] md:h-[55px] w-auto" style={{ filter: "invert(1) brightness(2)" }} />
              </div>
              <p className="text-gray-400 text-sm">Every love story deserves a perfect plan.</p>
            </div>
            {[
              { title: "Product", links: [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "/subscriptions" },
                { label: "Blog", href: "/blog" },
              ]},
              { title: "Company", links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ]},
              { title: "Legal", links: [
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Security", href: "/security" },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <h4 className="mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider font-semibold text-[#D4AF37]">{col.title}</h4>
                {col.links.map((l, j) => (
                  <Link key={j} href={l.href} className="block py-0.5 md:py-1 text-gray-400 text-xs md:text-sm hover:text-white transition-colors">{l.label}</Link>
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
