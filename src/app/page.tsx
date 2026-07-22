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
   WEDDING SCENES — SVG SILHOUETTES
   ───────────────────────────────────────────── */

function HinduScene({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ opacity, transition: "opacity 1s ease" }}>
      {/* Mandap pillars */}
      <rect x="80" y="100" width="8" height="180" fill="#D4AF37" opacity="0.6" rx="2" />
      <rect x="312" y="100" width="8" height="180" fill="#D4AF37" opacity="0.6" rx="2" />
      {/* Mandap top */}
      <path d="M70 100 L200 40 L330 100" fill="none" stroke="#D4AF37" strokeWidth="3" opacity="0.7" />
      <path d="M80 100 L200 50 L320 100" fill="#8B0000" opacity="0.15" />
      {/* Toran decoration */}
      <path d="M80 100 Q140 120 200 100 Q260 120 320 100" fill="none" stroke="#FF8F00" strokeWidth="2" opacity="0.5" />
      {[120, 160, 200, 240, 280].map((x) => (
        <circle key={x} cx={x} cy={105 + Math.sin((x - 120) * 0.04) * 8} r="3" fill="#FF8F00" opacity="0.6" />
      ))}
      {/* Sacred fire */}
      <ellipse cx="200" cy="250" rx="20" ry="6" fill="#FF6F00" opacity="0.3" />
      <path d="M195 250 Q200 230 205 250" fill="#FF8F00" opacity="0.7">
        <animate attributeName="d" values="M195 250 Q200 230 205 250;M193 250 Q200 225 207 250;M195 250 Q200 230 205 250" dur="1.5s" repeatCount="indefinite" />
      </path>
      <path d="M197 250 Q200 235 203 250" fill="#FFD54F" opacity="0.8">
        <animate attributeName="d" values="M197 250 Q200 235 203 250;M196 250 Q200 232 204 250;M197 250 Q200 235 203 250" dur="1s" repeatCount="indefinite" />
      </path>
      {/* Groom silhouette */}
      <g transform="translate(160, 130)">
        <circle cx="15" cy="15" r="12" fill="#8B0000" opacity="0.7" />
        <path d="M5 27 Q15 60 25 27" fill="#8B0000" opacity="0.6" />
        <rect x="8" y="27" width="14" height="50" rx="3" fill="#8B0000" opacity="0.5" />
        {/* Sehra */}
        <path d="M3 10 Q15 0 27 10" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
        {[8, 12, 16, 20, 24].map((x) => (
          <line key={x} x1={x} y1={10} x2={x} y2={18} stroke="#D4AF37" strokeWidth="0.8" opacity="0.4" />
        ))}
      </g>
      {/* Bride silhouette */}
      <g transform="translate(220, 130)">
        <circle cx="15" cy="15" r="12" fill="#C62828" opacity="0.7" />
        <path d="M5 27 Q15 60 25 27" fill="#C62828" opacity="0.6" />
        {/* Lehenga */}
        <path d="M3 27 L0 80 L30 80 L27 27" fill="#C62828" opacity="0.5" />
        {/* Dupatta */}
        <path d="M27 15 Q35 30 30 50" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
      </g>
      {/* Flower petals falling */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={150 + i * 25} cy={90} r="2" fill="#FF8F00" opacity="0.5">
          <animate attributeName="cy" from="90" to="200" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="cx" from={150 + i * 25} to={155 + i * 25} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function MuslimScene({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ opacity, transition: "opacity 1s ease" }}>
      {/* Mosque arch */}
      <path d="M100 280 L100 120 Q200 20 300 120 L300 280" fill="none" stroke="#2E7D32" strokeWidth="2.5" opacity="0.5" />
      <path d="M110 280 L110 130 Q200 40 290 130 L290 280" fill="#2E7D32" opacity="0.08" />
      {/* Dome */}
      <path d="M140 130 Q200 50 260 130" fill="#2E7D32" opacity="0.12" />
      {/* Minarets */}
      <rect x="85" y="100" width="6" height="180" fill="#2E7D32" opacity="0.3" rx="2" />
      <rect x="309" y="100" width="6" height="180" fill="#2E7D32" opacity="0.3" rx="2" />
      <circle cx="88" cy="97" r="5" fill="#2E7D32" opacity="0.3" />
      <circle cx="312" cy="97" r="5" fill="#2E7D32" opacity="0.3" />
      {/* Crescent on dome */}
      <path d="M195 55 Q200 48 205 55 Q200 52 195 55" fill="#D4AF37" opacity="0.6" />
      {/* Groom */}
      <g transform="translate(165, 140)">
        <circle cx="15" cy="15" r="12" fill="#1B5E20" opacity="0.6" />
        <path d="M5 27 Q15 55 25 27" fill="#1B5E20" opacity="0.5" />
        <rect x="7" y="27" width="16" height="50" rx="3" fill="#1B5E20" opacity="0.45" />
        {/* Sherwani collar */}
        <path d="M10 27 L15 22 L20 27" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
      </g>
      {/* Bride */}
      <g transform="translate(220, 140)">
        <circle cx="15" cy="15" r="12" fill="#C62828" opacity="0.6" />
        <path d="M5 27 Q15 55 25 27" fill="#C62828" opacity="0.5" />
        <path d="M2 27 L-2 80 L32 80 L28 27" fill="#C62828" opacity="0.45" />
        {/* Dupatta */}
        <path d="M27 12 Q35 25 32 45" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
      </g>
      {/* Decorative stars */}
      {[160, 200, 240].map((x) => (
        <text key={x} x={x} y={80} fontSize="8" fill="#D4AF37" opacity="0.3">✦</text>
      ))}
    </svg>
  );
}

function SikhScene({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ opacity, transition: "opacity 1s ease" }}>
      {/* Gurdwara dome */}
      <path d="M120 140 Q200 50 280 140" fill="#FF8F00" opacity="0.1" />
      <path d="M130 140 Q200 60 270 140" fill="none" stroke="#FF8F00" strokeWidth="2" opacity="0.5" />
      {/* Small dome on top */}
      <path d="M180 65 Q200 40 220 65" fill="#FF8F00" opacity="0.15" />
      <path d="M185 65 Q200 45 215 65" fill="none" stroke="#FF8F00" strokeWidth="1.5" opacity="0.4" />
      {/* Building */}
      <rect x="110" y="140" width="180" height="140" fill="#FF8F00" opacity="0.06" />
      <rect x="110" y="140" width="180" height="140" fill="none" stroke="#FF8F00" strokeWidth="1.5" opacity="0.3" />
      {/* Door arch */}
      <path d="M175 280 L175 200 Q200 175 225 200 L225 280" fill="#FF8F00" opacity="0.1" />
      <path d="M175 280 L175 200 Q200 175 225 200 L225 280" fill="none" stroke="#FF8F00" strokeWidth="1.5" opacity="0.35" />
      {/* Nishan Sahib flag */}
      <line x1="305" y1="80" x2="305" y2="280" stroke="#FF8F00" strokeWidth="2" opacity="0.4" />
      <rect x="308" y="80" width="20" height="30" fill="#FF8F00" opacity="0.25" rx="1" />
      {/* Groom with turban */}
      <g transform="translate(160, 150)">
        <circle cx="15" cy="15" r="12" fill="#E65100" opacity="0.6" />
        {/* Turban */}
        <path d="M5 10 Q15 -2 25 10" fill="#E65100" opacity="0.5" />
        <path d="M7 8 Q15 2 23 8" fill="#FF8F00" opacity="0.4" />
        <rect x="8" y="27" width="14" height="50" rx="3" fill="#E65100" opacity="0.45" />
      </g>
      {/* Bride */}
      <g transform="translate(220, 150)">
        <circle cx="15" cy="15" r="12" fill="#C62828" opacity="0.6" />
        <path d="M5 27 Q15 55 25 27" fill="#C62828" opacity="0.5" />
        <path d="M3 27 L0 80 L30 80 L27 27" fill="#C62828" opacity="0.45" />
        {/* Chuni */}
        <path d="M27 10 Q38 20 35 50" fill="none" stroke="#FF8F00" strokeWidth="1.5" opacity="0.4" />
      </g>
    </svg>
  );
}

function ChristianScene({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ opacity, transition: "opacity 1s ease" }}>
      {/* Church building */}
      <rect x="100" y="120" width="200" height="160" fill="#1565C0" opacity="0.06" />
      <rect x="100" y="120" width="200" height="160" fill="none" stroke="#1565C0" strokeWidth="1.5" opacity="0.3" />
      {/* Steeple */}
      <path d="M175 120 L200 50 L225 120" fill="#1565C0" opacity="0.1" />
      <path d="M175 120 L200 50 L225 120" fill="none" stroke="#1565C0" strokeWidth="1.5" opacity="0.4" />
      {/* Cross on top */}
      <line x1="200" y1="30" x2="200" y2="50" stroke="#1565C0" strokeWidth="2" opacity="0.5" />
      <line x1="194" y1="38" x2="206" y2="38" stroke="#1565C0" strokeWidth="2" opacity="0.5" />
      {/* Arched windows */}
      {[140, 200, 260].map((x) => (
        <g key={x}>
          <path d={`M${x - 10} 200 L${x - 10} 170 Q${x} 155 ${x + 10} 170 L${x + 10} 200`} fill="#1565C0" opacity="0.08" />
          <path d={`M${x - 10} 200 L${x - 10} 170 Q${x} 155 ${x + 10} 170 L${x + 10} 200`} fill="none" stroke="#1565C0" strokeWidth="1" opacity="0.25" />
        </g>
      ))}
      {/* Door */}
      <path d="M185 280 L185 230 Q200 215 215 230 L215 280" fill="#1565C0" opacity="0.08" />
      <path d="M185 280 L185 230 Q200 215 215 230 L215 280" fill="none" stroke="#1565C0" strokeWidth="1.5" opacity="0.3" />
      {/* Groom in suit */}
      <g transform="translate(160, 155)">
        <circle cx="15" cy="12" r="11" fill="#1565C0" opacity="0.55" />
        <path d="M6 23 L4 75 L26 75 L24 23" fill="#1565C0" opacity="0.4" />
        {/* Tie */}
        <path d="M15 23 L13 35 L15 38 L17 35 Z" fill="#C62828" opacity="0.4" />
      </g>
      {/* Bride in gown */}
      <g transform="translate(220, 150)">
        <circle cx="15" cy="12" r="11" fill="#E0E0E0" opacity="0.6" />
        {/* Veil */}
        <path d="M27 8 Q35 20 30 45" fill="#E0E0E0" opacity="0.2" />
        {/* Gown */}
        <path d="M5 23 L-5 80 L35 80 L25 23" fill="#E0E0E0" opacity="0.35" />
      </g>
      {/* Floral decorations */}
      {[130, 270].map((x) => (
        <g key={x}>
          <circle cx={x} cy="130" r="3" fill="#C62828" opacity="0.3" />
          <circle cx={x + 5} cy="128" r="2" fill="#E57373" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

function JainScene({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ opacity, transition: "opacity 1s ease" }}>
      {/* Jain temple - multi-tiered */}
      <rect x="120" y="160" width="160" height="120" fill="#6A1B9A" opacity="0.06" />
      <rect x="120" y="160" width="160" height="120" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.25" />
      {/* Tier 1 */}
      <path d="M110 160 L200 130 L290 160" fill="#6A1B9A" opacity="0.08" />
      <path d="M110 160 L200 130 L290 160" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.3" />
      {/* Tier 2 (shikhara) */}
      <path d="M150 130 L200 80 L250 130" fill="#6A1B9A" opacity="0.1" />
      <path d="M150 130 L200 80 L250 130" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.35" />
      {/* Top spire */}
      <path d="M180 80 L200 45 L220 80" fill="#6A1B9A" opacity="0.12" />
      <path d="M180 80 L200 45 L220 80" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.4" />
      {/* Kalash on top */}
      <circle cx="200" cy="42" r="4" fill="#D4AF37" opacity="0.5" />
      {/* Pillars */}
      {[140, 170, 230, 260].map((x) => (
        <rect key={x} x={x} y="160" width="4" height="80" fill="#6A1B9A" opacity="0.2" rx="1" />
      ))}
      {/* Ahimsa symbol (hand with wheel) */}
      <circle cx="200" cy="200" r="12" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.3" />
      <circle cx="200" cy="200" r="5" fill="#6A1B9A" opacity="0.15" />
      {/* Groom */}
      <g transform="translate(160, 165)">
        <circle cx="15" cy="12" r="11" fill="#6A1B9A" opacity="0.55" />
        <path d="M5 23 Q15 50 25 23" fill="#6A1B9A" opacity="0.45" />
        <rect x="7" y="23" width="16" height="48" rx="3" fill="#6A1B9A" opacity="0.4" />
      </g>
      {/* Bride */}
      <g transform="translate(220, 165)">
        <circle cx="15" cy="12" r="11" fill="#C62828" opacity="0.55" />
        <path d="M5 23 Q15 50 25 23" fill="#C62828" opacity="0.45" />
        <path d="M3 23 L0 75 L30 75 L27 23" fill="#C62828" opacity="0.4" />
        {/* Pancharangi */}
        <path d="M27 10 Q35 22 32 42" fill="none" stroke="#6A1B9A" strokeWidth="1.5" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   WEDDING SCENE CAROUSEL
   ───────────────────────────────────────────── */
const SCENES = [
  { key: "hindu", label: "Hindu Wedding", Component: HinduScene, bg: "from-amber-50 to-orange-50", accent: "#D4AF37" },
  { key: "muslim", label: "Muslim Wedding", Component: MuslimScene, bg: "from-green-50 to-emerald-50", accent: "#2E7D32" },
  { key: "sikh", label: "Sikh Wedding", Component: SikhScene, bg: "from-orange-50 to-amber-50", accent: "#FF8F00" },
  { key: "christian", label: "Christian Wedding", Component: ChristianScene, bg: "from-blue-50 to-sky-50", accent: "#1565C0" },
  { key: "jain", label: "Jain Wedding", Component: JainScene, bg: "from-purple-50 to-violet-50", accent: "#6A1B9A" },
];

function WeddingSceneCarousel() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SCENES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      {/* Scene container */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${SCENES[active].bg} border border-gray-200/60 shadow-lg`} style={{ aspectRatio: "4/3" }}>
        {SCENES.map((scene, i) => (
          <div key={scene.key} className="absolute inset-0">
            <scene.Component opacity={i === active ? 1 : 0} />
          </div>
        ))}

        {/* Label */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide" style={{ color: SCENES[active].accent }}>
            {SCENES[active].label}
          </span>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {SCENES.map((scene, i) => (
          <button
            key={scene.key}
            onClick={() => setActive(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "w-8 bg-maroon" : "bg-gray-300 hover:bg-gray-400"
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
