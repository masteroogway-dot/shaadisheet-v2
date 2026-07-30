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
  "Pop Culture": { gradient: "from-fuchsia-400 to-pink-500", emoji: "🎬", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  Seasonal: { gradient: "from-emerald-400 to-teal-500", emoji: "🌿", bg: "bg-emerald-50", text: "text-emerald-700" },
  Location: { gradient: "from-sky-400 to-indigo-500", emoji: "📍", bg: "bg-sky-50", text: "text-sky-700" },
};

function getShortNames(name: string): string[] {
  const n = name.trim();
  if (!n) return [];
  const cap = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  const len = n.length;
  const shorts: string[] = [cap];
  if (len >= 4) shorts.push(cap.slice(0, 3));
  if (len >= 5) shorts.push(cap.slice(0, 4));
  if (len >= 3) shorts.push(cap.slice(0, 2));
  if (len >= 4) {
    const trimmed = cap.slice(0, -1);
    if (trimmed.length >= 3) shorts.push(trimmed);
  }
  if (len >= 4) {
    const nickname = cap.slice(0, -1) + "ie";
    if (nickname !== cap) shorts.push(nickname);
  }
  return [...new Set(shorts)];
}

function generateHashtags(name1: string, name2: string, nickname1: string, nickname2: string, year: string, city: string) {
  const n1 = name1.trim(), n2 = name2.trim();
  if (!n1 || !n2) return [];
  const n1C = n1.charAt(0).toUpperCase() + n1.slice(1).toLowerCase();
  const n2C = n2.charAt(0).toUpperCase() + n2.slice(1).toLowerCase();
  const nick1 = nickname1.trim() || n1C;
  const nick2 = nickname2.trim() || n2C;
  const nick1C = nick1.charAt(0).toUpperCase() + nick1.slice(1).toLowerCase();
  const nick2C = nick2.charAt(0).toUpperCase() + nick2.slice(1).toLowerCase();
  const n1Shorts = getShortNames(n1);
  const n2Shorts = getShortNames(n2);
  const yr = year || new Date().getFullYear().toString();
  const cityCap = city.trim() ? city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase() : "";

  const results: { text: string; style: string }[] = [];
  const seen = new Set<string>();
  const add = (text: string, style: string) => {
    const t = `#${text.replace(/^#/, "")}`;
    if (!seen.has(t.toLowerCase()) && t.length > 2) { seen.add(t.toLowerCase()); results.push({ text: t, style }); }
  };

  // Romantic
  for (const s1 of n1Shorts.slice(0, 3)) for (const s2 of n2Shorts.slice(0, 3)) { if (s1 !== n1C || s2 !== n2C) { add(`${s1}Loves${s2}`, "Romantic"); add(`${s2}Loves${s1}`, "Romantic"); } }
  add(`${n1C}Loves${n2C}`, "Romantic"); add(`${n2C}Loves${n1C}`, "Romantic");
  add(`${n1C}And${n2C}`, "Romantic"); add(`${n1C}Weds${n2C}`, "Romantic"); add(`${n2C}Weds${n1C}`, "Romantic");
  add(`${n1C}${n2C}Forever`, "Romantic"); add(`${n1C}Meets${n2C}`, "Romantic");
  add(`PyaarKaBandhan${n1C}${n2C}`, "Romantic"); add(`DilKiDhadkan${n1C}${n2C}`, "Romantic");
  add(`${n1C}Loves${n2C}${yr}`, "Romantic"); add(`${n1C}And${n2C}${yr}`, "Romantic");

  // Funny
  for (const s1 of n1Shorts.slice(0, 2)) { add(`${s1}KaSaudagar`, "Funny"); add(`${s1}Boss`, "Funny"); }
  for (const s2 of n2Shorts.slice(0, 2)) { add(`${s2}KaSaudagar`, "Funny"); add(`${s2}Boss`, "Funny"); }
  add(`CoupleGoals${n1C}${n2C}`, "Funny"); add(`${n1C}Ki${n2C}`, "Funny"); add(`${n2C}Ki${n1C}`, "Funny");
  add(`ShaadiKaLadoo${n1C}${n2C}`, "Funny"); add(`PatiParmeshwar${n1C}`, "Funny"); add(`BiwiNo1${n2C}`, "Funny");
  add(`${nick1C}SaidYes`, "Funny"); add(`${nick2C}StoleMyHeart`, "Funny");

  // Pun
  add(`ShaadiMubarak${n1C}${n2C}`, "Pun"); add(`JodiPakki${n1C}${n2C}`, "Pun");
  add(`DulhaDulhan${n1C}${n2C}`, "Pun"); add(`BandBaaja${n1C}${n2C}`, "Pun");
  add(`SangeetNights`, "Pun"); add(`DholAndSangeet`, "Pun");
  for (const s1 of n1Shorts.slice(0, 2)) for (const s2 of n2Shorts.slice(0, 2)) { add(`${s1}Weds${s2}`, "Pun"); add(`${s2}Weds${s1}`, "Pun"); }

  // Traditional
  add(`VivahaUtsav${n1C}${n2C}`, "Traditional"); add(`ShubhVivaha${n1C}${n2C}`, "Traditional");
  add(`SaatPhere${n1C}${n2C}`, "Traditional"); add(`MangalPheras`, "Traditional");
  add(`SindoorKiLaaj`, "Traditional"); add(`Mangalsutra`, "Traditional"); add(`Saptapadi`, "Traditional");

  // Modern
  add(`${n1C}X${n2C}`, "Modern"); add(`${n2C}X${n1C}`, "Modern");
  add(`${n1C}${n2C}Wedding`, "Modern"); add(`${n1C}${n2C}Shaadi`, "Modern");
  add(`JustMarried${n1C}${n2C}`, "Modern"); add(`MrAndMrs${n1C}`, "Modern");
  add(`${n1C}${n2C}Vibes`, "Modern"); add(`${n1C}${n2C}SZN`, "Modern");
  add(`FromFianceToForever${n1C}${n2C}`, "Modern");
  for (const s1 of n1Shorts.slice(0, 3)) for (const s2 of n2Shorts.slice(0, 3)) { if (s1 !== n1C || s2 !== n2C) { add(`${s1}X${s2}`, "Modern"); add(`${s2}X${s1}`, "Modern"); } }

  // Pop Culture
  add(`YeJodi${n1C}${n2C}`, "Pop Culture"); add(`KabirSingh${n1C}${n2C}`, "Pop Culture");
  add(`DeepVeer${n1C}${n2C}`, "Pop Culture"); add(`VirushkaVibes`, "Pop Culture");
  add(`DDLJ${n1C}${n2C}`, "Pop Culture"); add(`SwipedRight${n1C}${n2C}`, "Pop Culture");
  add(`InstagramOfficial${n1C}${n2C}`, "Pop Culture");

  // Seasonal
  const month = new Date().getMonth();
  const season = month >= 2 && month <= 4 ? "Spring" : month >= 5 && month <= 7 ? "Summer" : month >= 8 && month <= 10 ? "Autumn" : "Winter";
  add(`${season}Wedding${n1C}${n2C}`, "Seasonal"); add(`${n1C}${n2C}${season}`, "Seasonal");
  add(`${n1C}${n2C}${yr}`, "Seasonal"); add(`${n1C}Weds${n2C}${yr}`, "Seasonal");
  if (season === "Winter") { add(`SnowInLove`, "Seasonal"); add(`CozyAndCommitted`, "Seasonal"); }
  else if (season === "Summer") { add(`SummerLovin${n1C}${n2C}`, "Seasonal"); add(`SunKissedIDo`, "Seasonal"); }
  else if (season === "Spring") { add(`BloomingLove${n1C}${n2C}`, "Seasonal"); add(`SpringIntoLove`, "Seasonal"); }
  else { add(`FallingInLove${n1C}${n2C}`, "Seasonal"); add(`HarvestHeart`, "Seasonal"); }

  // Location
  if (cityCap) {
    add(`LoveIn${cityCap}`, "Location"); add(`HitchedIn${cityCap}`, "Location");
    add(`${n1C}Loves${n2C}In${cityCap}`, "Location"); add(`${cityCap}Wedding${n1C}${n2C}`, "Location");
  }

  return results;
}

export default function PublicHashtagGenerator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [nickname1, setNickname1] = useState("");
  const [nickname2, setNickname2] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [city, setCity] = useState("");
  const [hashtags, setHashtags] = useState<{ text: string; style: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeStyle, setActiveStyle] = useState("All");
  const [animating, setAnimating] = useState(false);
  const [showCount, setShowCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

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
    setFavorites(new Set());
    setTimeout(() => {
      const result = generateHashtags(name1.trim(), name2.trim(), nickname1, nickname2, year, city);
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

  const toggleFavorite = (idx: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const styles = ["All", "Romantic", "Funny", "Pun", "Traditional", "Modern", "Pop Culture", "Seasonal", "Location"];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFF0E0 50%, #FFF8F0 100%)" }}>
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
              Enter the couple&apos;s names and get 50+ beautiful hashtags instantly — romantic, funny, traditional, pop culture, and more.
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
            </div>

            {/* Advanced toggle */}
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="mx-auto mt-3 text-[#D4AF37]/70 text-xs hover:text-[#D4AF37] transition-colors block">
              {showAdvanced ? "▲ Hide" : "▼ Show"} nicknames, year & city
            </button>

            {/* Advanced fields */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mt-3">
                    <input type="text" placeholder="Nickname 1" value={nickname1} onChange={(e) => setNickname1(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg text-xs bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center" />
                    <input type="text" placeholder="Nickname 2" value={nickname2} onChange={(e) => setNickname2(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg text-xs bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mt-3">
                    <input type="text" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="w-full sm:w-1/4 px-4 py-2.5 rounded-lg text-xs bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center" />
                    <input type="text" placeholder="Wedding city (optional)" value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg text-xs bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center mt-4">
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
                  const isFav = favorites.has(i);
                  return (
                    <motion.div
                      key={h.text}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`relative rounded-xl p-4 border-2 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${cfg.bg} ${activeStyle === h.style || activeStyle === "All" ? "border-transparent" : "border-gray-200"}`}
                      style={{ borderLeftWidth: "4px", borderLeftColor: h.style === "Romantic" ? "#E53935" : h.style === "Funny" ? "#F59E0B" : h.style === "Pun" ? "#7C3AED" : h.style === "Traditional" ? "#DC2626" : h.style === "Pop Culture" ? "#D946EF" : h.style === "Seasonal" ? "#10B981" : h.style === "Location" ? "#3B82F6" : "#0EA5E9" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-sm font-bold ${cfg.text} cursor-pointer flex-1`} onClick={() => handleCopy(h.text, i)}>{h.text}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button onClick={() => toggleFavorite(i)} className="text-sm hover:scale-125 transition-transform">
                            {isFav ? "❤️" : "🤍"}
                          </button>
                          <span className="text-xs cursor-pointer" onClick={() => handleCopy(h.text, i)}>{copiedIdx === i ? "✓" : cfg.emoji}</span>
                        </div>
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
                <button onClick={() => { setName1(""); setName2(""); setNickname1(""); setNickname2(""); setCity(""); setHashtags([]); setShowCount(0); setFavorites(new Set()); }} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  <i className="fas fa-redo mr-1.5" /> Try Another Couple
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hashtags.length === 0 && (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-gray-400 text-sm mt-6">
            No sign-up required. Just type names and generate.
          </motion.p>
        )}
      </div>
    </section>
  );
}
