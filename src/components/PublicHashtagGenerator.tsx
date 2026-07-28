"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const STYLE_CONFIG: Record<string, { gradient: string; emoji: string; bg: string; text: string }> = {
  Romantic: { gradient: "from-rose-400 to-pink-500", emoji: "💕", bg: "bg-rose-50", text: "text-rose-700" },
  Funny: { gradient: "from-amber-400 to-orange-500", emoji: "😂", bg: "bg-amber-50", text: "text-amber-700" },
  Pun: { gradient: "from-violet-400 to-purple-500", emoji: "😜", bg: "bg-violet-50", text: "text-violet-700" },
  Traditional: { gradient: "from-red-500 to-rose-600", emoji: "🪷", bg: "bg-red-50", text: "text-red-700" },
  Modern: { gradient: "from-cyan-400 to-blue-500", emoji: "✨", bg: "bg-cyan-50", text: "text-cyan-700" },
};

function generateHashtags(name1: string, name2: string) {
  const n1 = name1.trim(), n2 = name2.trim();
  if (!n1 || !n2) return [];
  const n1C = n1.charAt(0).toUpperCase() + n1.slice(1).toLowerCase();
  const n2C = n2.charAt(0).toUpperCase() + n2.slice(1).toLowerCase();
  return [
    { text: `#${n1C}Loves${n2C}`, style: "Romantic" },
    { text: `#${n2C}Loves${n1C}`, style: "Romantic" },
    { text: `#${n1C}And${n2C}`, style: "Romantic" },
    { text: `#${n1C}Weds${n2C}`, style: "Romantic" },
    { text: `#${n2C}Weds${n1C}`, style: "Romantic" },
    { text: `#${n1C}${n2C}Forever`, style: "Romantic" },
    { text: `#${n1C}Meets${n2C}`, style: "Romantic" },
    { text: `#PyaarKaBandhan${n1C}${n2C}`, style: "Romantic" },
    { text: `#DilKiDhadkan${n1C}${n2C}`, style: "Romantic" },
    { text: `#${n1C}KaSaudagar`, style: "Funny" },
    { text: `#${n2C}KaSaudagar`, style: "Funny" },
    { text: `#${n1C}Boss`, style: "Funny" },
    { text: `#${n2C}Boss`, style: "Funny" },
    { text: `#CoupleGoals${n1C}${n2C}`, style: "Funny" },
    { text: `#ShaadiKaLadoo${n1C}${n2C}`, style: "Funny" },
    { text: `#PatiParmeshwar${n1C}`, style: "Funny" },
    { text: `#JodiPakki${n1C}${n2C}`, style: "Pun" },
    { text: `#DulhaDulhan${n1C}${n2C}`, style: "Pun" },
    { text: `#BandBaaja${n1C}${n2C}`, style: "Pun" },
    { text: `#SangeetNights`, style: "Pun" },
    { text: `#VivahaUtsav${n1C}${n2C}`, style: "Traditional" },
    { text: `#ShubhVivaha${n1C}${n2C}`, style: "Traditional" },
    { text: `#SaatPhere${n1C}${n2C}`, style: "Traditional" },
    { text: `#Mangalsutra`, style: "Traditional" },
    { text: `#Saptapadi`, style: "Traditional" },
    { text: `#${n1C}X${n2C}`, style: "Modern" },
    { text: `#${n2C}X${n1C}`, style: "Modern" },
    { text: `#${n1C}${n2C}Wedding`, style: "Modern" },
    { text: `#${n1C}${n2C}Shaadi`, style: "Modern" },
    { text: `#JustMarried${n1C}${n2C}`, style: "Modern" },
    { text: `#MrAndMrs${n1C}`, style: "Modern" },
    { text: `#${n1C}${n2C}Vibes`, style: "Modern" },
  ];
}

export default function PublicHashtagGenerator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [hashtags, setHashtags] = useState<{ text: string; style: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeStyle, setActiveStyle] = useState("All");
  const [animating, setAnimating] = useState(false);
  const [showCount, setShowCount] = useState(0);

  const filtered = activeStyle === "All" ? hashtags : hashtags.filter((h) => h.style === activeStyle);

  useEffect(() => {
    if (hashtags.length === 0) return;
    if (showCount >= hashtags.length) return;
    const timer = setTimeout(() => setShowCount((c) => c + 1), 40);
    return () => clearTimeout(timer);
  }, [showCount, hashtags.length]);

  const handleGenerate = () => {
    if (!name1.trim() || !name2.trim()) return;
    setAnimating(true);
    setShowCount(0);
    setTimeout(() => {
      const result = generateHashtags(name1.trim(), name2.trim());
      setHashtags(result);
      setAnimating(false);
      setActiveStyle("All");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 }, colors: ["#D4AF37", "#8B0000", "#C62828", "#FF6B6B", "#A855F7", "#3B82F6"] });
    }, 300);
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(filtered.map((h) => h.text).join("\n"));
  };

  const styles = ["All", "Romantic", "Funny", "Pun", "Traditional", "Modern"];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFF0E0 50%, #FFF8F0 100%)" }}>
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle, #8B0000 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: "linear-gradient(135deg, #722F37, #8B0000)", color: "#D4AF37" }}>
              Try It Free
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Create Your Wedding Hashtags
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto">
              Enter the couple&apos;s names and get 30+ beautiful hashtags instantly — romantic, funny, traditional, and more.
            </p>
          </motion.div>
        </div>

        {/* Input Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-2xl overflow-hidden shadow-xl mb-8" style={{ background: "linear-gradient(135deg, #722F37 0%, #5C0000 50%, #8B0000 100%)" }}>
          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col sm:flex-row gap-3 items-center max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Partner 1"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name2.trim() && handleGenerate()}
                className="flex-1 w-full px-5 py-4 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center"
              />
              <span className="text-[#D4AF37] text-2xl font-light hidden sm:block">&</span>
              <input
                type="text"
                placeholder="Partner 2"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name1.trim() && handleGenerate()}
                className="flex-1 w-full px-5 py-4 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center"
              />
              <motion.button
                onClick={handleGenerate}
                disabled={!name1.trim() || !name2.trim() || animating}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-xl text-sm font-bold text-[#722F37] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #D4AF37, #F4D03F)" }}
              >
                {animating ? "✨ Generating..." : "✨ Generate Hashtags"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {hashtags.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Style Filters */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveStyle(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeStyle === s
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"
                    }`}
                  >
                    {s !== "All" && STYLE_CONFIG[s]?.emoji} {s}
                  </button>
                ))}
              </div>

              {/* Hashtag Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {filtered.slice(0, showCount).map((h, i) => {
                  const cfg = STYLE_CONFIG[h.style] || { gradient: "from-gray-400 to-gray-500", emoji: "#", bg: "bg-gray-50", text: "text-gray-700" };
                  return (
                    <motion.div
                      key={h.text}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => handleCopy(h.text, i)}
                      className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${cfg.bg} ${activeStyle === h.style || activeStyle === "All" ? "border-transparent" : "border-gray-200"}`}
                      style={{ borderLeftWidth: "4px", borderLeftColor: h.style === "Romantic" ? "#E53935" : h.style === "Funny" ? "#F59E0B" : h.style === "Pun" ? "#7C3AED" : h.style === "Traditional" ? "#DC2626" : "#0EA5E9" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-sm font-bold ${cfg.text}`}>{h.text}</span>
                        <span className="text-xs">{copiedIdx === i ? "✓" : cfg.emoji}</span>
                      </div>
                      {copiedIdx === i && (
                        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-2 -right-2 px-2 py-0.5 bg-green text-white text-[10px] font-bold rounded-full">
                          Copied!
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-3">
                <button onClick={handleCopyAll} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  <i className="fas fa-copy mr-1.5" /> Copy All ({filtered.length})
                </button>
                <button onClick={() => { setName1(""); setName2(""); setHashtags([]); setShowCount(0); }} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  <i className="fas fa-redo mr-1.5" /> Try Another Couple
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA below */}
        {hashtags.length === 0 && (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-gray-400 text-sm mt-6">
            No sign-up required. Just type names and generate.
          </motion.p>
        )}
      </div>
    </section>
  );
}
