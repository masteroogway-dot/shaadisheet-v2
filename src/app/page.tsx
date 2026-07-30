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
   WEDDING CATEGORIES DATA
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
      { name: "Maharashtrian", ceremony: "Sakhar Puda, Antpat", events: "Lagna → Mehendi → Haldi → Wedding → Reception" },
      { name: "Rajput", ceremony: "Pithi, Baraat", events: "Roka → Pithi → Sangeet → Wedding → Reception" },
      { name: "Punjabi", ceremony: "Chunni, Jaggo", events: "Roka → Chunni → Mehendi → Sangeet → Jaggo → Wedding → Reception" },
      { name: "Kashmiri", ceremony: "Lagan Ceremony", events: "Lagan → Wedding → Reception" },
      { name: "Assamese", ceremony: "Jur Phool", events: "Pattra → Jur Phool → Wedding → Reception" },
      { name: "Odia", ceremony: "Chhurakan", events: "Baai Vaata → Chhurakan → Wedding → Reception" },
      { name: "Bihari", ceremony: "Sakora", events: "Sakora → Haldi → Wedding → Reception" },
      { name: "Malayali", ceremony: "Thaali Tying", events: "Nischayam → Kanyadaanam → Thaali → Reception" },
      { name: "Sindhi", ceremony: "Lada Ceremony", events: "Lada → Mehendi → Wedding → Reception" },
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
      { name: "Indian Muslim", ceremony: "Nikah, Walima", events: "Mangni → Mehendi → Nikah → Walima" },
      { name: "Sindhi", ceremony: "Dholki, Nikah", events: "Dholki → Mehendi → Nikah → Walima" },
      { name: "Kashmiri", ceremony: "Wazwan, Nikah", events: "Dil Mangle → Nikah → Walima" },
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
    id: "sri_lankan", bg: "bg-pink-50", title: "Sri Lankan", desc: "Poruwa Ceremony",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-pink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <path d="M10 6l2-3 2 3" /><circle cx="12" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    regions: [
      { name: "Sinhalese Buddhist", ceremony: "Poruwa, Kiribath", events: "Poruwa Ceremony → Kiribath → Reception" },
      { name: "Tamil Hindu", ceremony: "Thaali, Saptapadi", events: "Kanyadaanam → Thaali Ceremony → Agni Pradakshina → Saptapadi → Reception" },
      { name: "Hill Country Tamil", ceremony: "Thaali Ceremony", events: "Kanyadaanam → Thaali → Reception" },
      { name: "Muslim", ceremony: "Nikah, Walima", events: "Mangni → Nikah → Walima" },
      { name: "Christian", ceremony: "Church Wedding", events: "Engagement → Church Wedding → Reception" },
    ],
  },
  {
    id: "nepal", bg: "bg-teal-50", title: "Nepali", desc: "Kanya Daan to Bidai",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <circle cx="12" cy="10" r="3" /><circle cx="12" cy="10" r="1" fill="currentColor" opacity="0.3" />
        <path d="M9 7c-1-2 0-4 0-4" /><path d="M15 7c1-2 0-4 0-4" />
      </svg>
    ),
    regions: [
      { name: "Nepali Hindu", ceremony: "Swayamvar, Sindoor", events: "Tika-Tala → Mehendi → Janti → Wedding → Mukh Herne → Reception" },
      { name: "Newari", ceremony: "Ihi, Swayamvar", events: "Ihi → Supari → Swayamvar → Sindoor → Departure → Reception" },
      { name: "Tamang", ceremony: "Wedding Ceremony", events: "Tika → Janti → Wedding → Reception" },
      { name: "Sherpa", ceremony: "Buddhist Ceremony", events: "Buddhist Ceremony → Reception" },
      { name: "Muslim", ceremony: "Nikah, Walima", events: "Mangni → Nikah → Walima" },
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
      { name: "Indian Christian", ceremony: "Church Wedding", events: "Engagement → Roce → Church Wedding → Reception" },
      { name: "Goan Christian", ceremony: "Church Wedding, Soro-potel", events: "Engagement → Roce → Church Wedding → Reception" },
      { name: "Kerala Christian", ceremony: "Minnukettu", events: "Engagement → Roce → Church Wedding → Minnukettu → Reception" },
      { name: "Northeast Christian", ceremony: "Church Wedding", events: "Engagement → Church Wedding → Traditional Feast" },
    ],
  },
  {
    id: "jain", bg: "bg-purple-50", title: "Jain", desc: "Panch Kalyanak",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
        <line x1="12" y1="6" x2="12" y2="4" /><circle cx="12" cy="3.5" r="0.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    regions: [
      { name: "Indian Jain", ceremony: "Mada Mandap, Granthi Bandhan", events: "Vagdana → Engagement → Mehendi → Sangeet → Wedding → Reception" },
    ],
  },
  {
    id: "pakistani", bg: "bg-cyan-50", title: "Pakistani", desc: "Mehndi to Walima",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <path d="M11 4.5a1.5 1.5 0 1 0 2 0 1.5 1.5 0 0 0-2 0" fill="currentColor" opacity="0.4" />
        <circle cx="12" cy="10" r="2" /><circle cx="12" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    regions: [
      { name: "Sunni", ceremony: "Nikah, Walima", events: "Dholki → Mayun → Mehndi → Baraat → Nikah → Walima" },
      { name: "Sindhi", ceremony: "Dholki, Nikah", events: "Dholki → Mehndi → Nikah → Walima" },
      { name: "Baloch", ceremony: "Nikah, Attan", events: "Khwara → Nikah → Walima (with Attan dance)" },
      { name: "Kashmiri", ceremony: "Wazwan, Nikah", events: "Dil Mangle → Nikah → Walima" },
      { name: "Hindu", ceremony: "Kanyadaan, Pheras", events: "Roka → Mehendi → Wedding → Reception" },
      { name: "Christian", ceremony: "Church Wedding", events: "Engagement → Church Wedding → Reception" },
    ],
  },
  {
    id: "afghanistan", bg: "bg-red-50", title: "Afghan", desc: "Khwara to Walima",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <circle cx="12" cy="10" r="2" /><circle cx="12" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
        <path d="M11 4.5a1.5 1.5 0 1 0 2 0 1.5 1.5 0 0 0-2 0" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    regions: [
      { name: "Pashtun", ceremony: "Khwara, Nikah, Attan", events: "Khwara → Shirni Khori → Henna Night → Nikah → Walima (with Attan dance)" },
      { name: "Tajik", ceremony: "Nikah, Walima", events: "Mangni → Henna Night → Nikah → Walima" },
      { name: "Hazara", ceremony: "Nikah, Walima", events: "Mangni → Nikah → Walima" },
      { name: "Uzbek", ceremony: "Nikah, Malkeh", events: "Mangni → Nikah → Malkeh (reception)" },
    ],
  },
  {
    id: "maldives", bg: "bg-sky-50", title: "Maldivian", desc: "Nikah to Valimah",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-sky-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <path d="M10 6l2-3 2 3" /><circle cx="12" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
        <line x1="4" y1="10" x2="20" y2="10" />
      </svg>
    ),
    regions: [
      { name: "Maldivian Muslim", ceremony: "Nikah, Boduberu", events: "Henna Night → Nikah → Boduberu (drumming/dance) → Valimah" },
    ],
  },
  {
    id: "bangladesh", bg: "bg-emerald-50", title: "Bangladeshi", desc: "Gaye Holud to Bou Bhat",
    svg: (
      <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18h16v2H4z" fill="currentColor" opacity="0.15" />
        <path d="M4 18h16" /><path d="M6 18v-5h12v5" />
        <path d="M8 13c0-4 2-7 4-7s4 3 4 7" />
        <circle cx="12" cy="10" r="2" /><circle cx="12" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
        <path d="M9 7c-1-2 0-4 0-4" /><path d="M15 7c1-2 0-4 0-4" />
      </svg>
    ),
    regions: [
      { name: "Bengali Muslim", ceremony: "Gaye Holud, Nikah", events: "Gaye Holud → Mehendi → Nikah → Walima → Bou Bhat" },
      { name: "Bengali Hindu", ceremony: "Shubho Drishti, Sindoor", events: "Gaye Holud → Dodhi Mangal → Shubho Drishti → Wedding → Bou Bhat" },
      { name: "Chakma Buddhist", ceremony: "Buddhist Ceremony", events: "Buddhist Ceremony → Reception" },
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
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-[60px] md:h-[70px]">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShaadiSheet" className="h-[45px] md:h-[65px] w-auto" style={{ filter: scrolled ? "none" : "invert(1) brightness(2)" }} />
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Features</a>
            <a href="#how-it-works" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>How It Works</a>
            <a href="#religions" className={`${scrolled ? "text-gray-600 hover:text-maroon" : "text-white/80 hover:text-white"} transition-colors`}>Weddings</a>
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <Link href="/auth" className={`px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-colors ${scrolled ? "text-gray-700 hover:text-maroon" : "text-white/90 hover:text-white"}`}>Log In</Link>
            <Link href="/auth" className="px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO - FULL BACKGROUND */}
      <section className="relative w-full min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden">
        {/* Static background image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 767px)" srcSet="/hero-mobile.png" />
            <img
              src="/hero.png"
              alt="South Asian Wedding"
              className="w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.15) 100%)"
          }} />
        </div>

        {/* Marigold Garlands - hidden on mobile */}
        <div className="relative z-[4] opacity-50 hidden md:block">
          <MarigoldGarland side="left" />
          <MarigoldGarland side="right" />
        </div>

        {/* Content over background */}
        <div className="relative z-[5] w-full pt-[70px] md:pt-[100px] pb-16 md:pb-28 px-4 md:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs md:text-sm font-medium text-white/90 mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Built for South Asian Weddings
            </div>
            <h1 className="text-[2rem] md:text-4xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-4 md:mb-6 tracking-tight text-white drop-shadow-lg">
              Plan Your{" "}
              <span className="text-[#FFD54F]">South Asian</span>{" "}
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
            <LiveCount />
          </div>
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
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">One app to plan the perfect South Asian wedding. No spreadsheets, no chaos.</p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" staggerDelay={0.1}>
            {[
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5c0-1 1.5-2 3-2s3 1 3 2-1.5 1.5-3 2-3 1-3 2 1.5 2 3 2 3-1 3-2" /></svg>, title: "Budget Tracker", desc: "Track every rupee, taka, or dollar with pre-filled categories for South Asian weddings." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21V11h6v10" /><path d="M3 11h18" /><circle cx="12" cy="7" r="1" fill="currentColor" opacity="0.4" /></svg>, title: "Vendor Manager", desc: "Track every vendor — from priest or officiant to caterer to DJ." },
              { icon: <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /><path d="M7 7l1.5 1.5L11 6" fill="currentColor" opacity="0.5" /><path d="M7 11l1.5 1.5L11 10" fill="currentColor" opacity="0.5" /></svg>, title: "Ritual Checklists", desc: "Every ritual in order — Roka to Vidaai, Nikah to Walima, Baraat to Bouquet." },
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
              { n: "2", t: "Get Your Template!", d: "Pre-filled rituals, budget categories, checklists." },
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
              <h2 className="text-2xl md:text-[2.5rem] font-bold mb-3 md:mb-4 text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Built for Every South Asian Wedding</h2>
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
                                {cat?.id === "sikh" && <i className="fas fa-wheat-awn text-maroon text-sm" />}
                                {cat?.id === "christian" && <i className="fas fa-cross text-maroon text-sm" />}
                                {cat?.id === "jain" && <i className="fas fa-hand-holding-heart text-maroon text-sm" />}
                                {cat?.id === "sri_lankan" && <i className="fas fa-torii-gate text-maroon text-sm" />}
                                {cat?.id === "nepal" && <i className="fas fa-mountain-sun text-maroon text-sm" />}
                                {cat?.id === "pakistani" && <i className="fas fa-mosque text-maroon text-sm" />}
                                {cat?.id === "afghanistan" && <i className="fas fa-mountain text-maroon text-sm" />}
                                {cat?.id === "maldives" && <i className="fas fa-umbrella-beach text-maroon text-sm" />}
                                {cat?.id === "bangladesh" && <i className="fas fa-water text-maroon text-sm" />}
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
                                  {expandedCategory === "hindu" && "Found across India — each region brings unique rituals and traditions"}
                                  {expandedCategory === "muslim" && "Found across South Asia — traditions vary by region and community"}
                                  {expandedCategory === "sikh" && "Primarily Punjab region — centered around Gurdwara ceremonies"}
                                  {expandedCategory === "sri_lankan" && "Found across Sri Lanka — Sinhalese, Tamil, Muslim, and Christian traditions"}
                                  {expandedCategory === "nepal" && "Found across Nepal — Hindu, Buddhist, and Muslim communities"}
                                  {expandedCategory === "christian" && "Found across South Asia — from Goa to Kerala to Northeast India"}
                                  {expandedCategory === "jain" && "Found across India — strict vegetarian traditions with unique rituals"}
                                  {expandedCategory === "pakistani" && "Found across Pakistan — Punjab, Sindh, Balochistan, and Kashmir"}
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
              <p className="text-gray-400 text-sm">Har Shaadi Ka Plan.</p>
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
