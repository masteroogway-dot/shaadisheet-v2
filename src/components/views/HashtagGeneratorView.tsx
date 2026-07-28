"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { createHashtag, updateHashtag, deleteHashtag, bulkDeleteHashtags, batchCreateHashtags, bulkAddHashtags } from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

const STYLES = ["All", "Romantic", "Funny", "Pun", "Traditional", "Modern"];

const STYLE_CONFIG: Record<string, { gradient: string; emoji: string; bg: string; text: string; border: string }> = {
  Romantic: { gradient: "from-rose-400 to-pink-500", emoji: "💕", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  Funny: { gradient: "from-amber-400 to-orange-500", emoji: "😂", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Pun: { gradient: "from-violet-400 to-purple-500", emoji: "😜", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  Traditional: { gradient: "from-red-500 to-rose-600", emoji: "🪷", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Modern: { gradient: "from-cyan-400 to-blue-500", emoji: "✨", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
};

function getShortNames(name: string): string[] {
  const n = name.trim();
  if (!n) return [];
  const cap = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  const lower = n.toLowerCase();
  const len = n.length;
  const shorts: string[] = [cap];
  if (len >= 4) shorts.push(cap.slice(0, 3));
  if (len >= 5) shorts.push(cap.slice(0, 4));
  if (len >= 3) shorts.push(cap.slice(0, 2));
  // Vowel-ending short: drop last char if vowel-heavy
  if (len >= 4) {
    const trimmed = cap.slice(0, -1);
    if (trimmed.length >= 3) shorts.push(trimmed);
  }
  // "ie/y" ending nickname
  if (len >= 4) {
    const nickname = cap.slice(0, -1) + "ie";
    if (nickname !== cap) shorts.push(nickname);
  }
  // Unique only
  return [...new Set(shorts)];
}

function generateHashtags(name1: string, name2: string): { text: string; language: string; style: string }[] {
  const n1 = name1.trim();
  const n2 = name2.trim();
  if (!n1 || !n2) return [];

  const n1Cap = n1.charAt(0).toUpperCase() + n1.slice(1).toLowerCase();
  const n2Cap = n2.charAt(0).toUpperCase() + n2.slice(1).toLowerCase();
  const n1Shorts = getShortNames(n1);
  const n2Shorts = getShortNames(n2);

  const results: { text: string; language: string; style: string }[] = [];
  const seen = new Set<string>();

  const add = (text: string, language: string, style: string) => {
    const t = `#${text.replace(/^#/, "")}`;
    if (!seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      results.push({ text: t, language, style });
    }
  };

  // ── Romantic: short+full combos ──
  for (const s1 of n1Shorts.slice(0, 3)) {
    for (const s2 of n2Shorts.slice(0, 3)) {
      if (s1 !== n1Cap || s2 !== n2Cap) {
        add(`${s1}Loves${s2}`, "English", "Romantic");
        add(`${s2}Loves${s1}`, "English", "Romantic");
      }
    }
  }
  add(`${n1Cap}Loves${n2Cap}`, "English", "Romantic");
  add(`${n2Cap}Loves${n1Cap}`, "English", "Romantic");
  add(`${n1Cap}And${n2Cap}`, "English", "Romantic");
  add(`${n1Cap}Weds${n2Cap}`, "English", "Romantic");
  add(`${n2Cap}Weds${n1Cap}`, "English", "Romantic");
  add(`${n1Cap}${n2Cap}Forever`, "English", "Romantic");
  add(`${n1Cap}Meets${n2Cap}`, "English", "Romantic");
  add(`TogetherForever${n1Cap}${n2Cap}`, "English", "Romantic");
  // Short+full romantic
  for (const s1 of n1Shorts.slice(0, 2)) {
    add(`${s1}For${n2Cap}`, "English", "Romantic");
    add(`${s1}Meets${n2Cap}`, "English", "Romantic");
  }
  for (const s2 of n2Shorts.slice(0, 2)) {
    add(`${s2}For${n1Cap}`, "English", "Romantic");
    add(`${s2}Meets${n1Cap}`, "English", "Romantic");
  }
  add(`PyaarKaBandhan${n1Cap}${n2Cap}`, "Hindi", "Romantic");
  add(`DilKiDhadkan${n1Cap}${n2Cap}`, "Hindi", "Romantic");
  add(`IshqKaIzhaar${n1Cap}${n2Cap}`, "Hindi", "Romantic");
  add(`DilKaRishta${n1Cap}${n2Cap}`, "Hindi", "Romantic");

  // ── Funny: short name humor ──
  for (const s1 of n1Shorts.slice(0, 2)) {
    add(`${s1}KaSaudagar`, "English", "Funny");
    add(`${s1}Boss`, "English", "Funny");
    add(`${s1}KiBoss`, "Hindi", "Funny");
  }
  for (const s2 of n2Shorts.slice(0, 2)) {
    add(`${s2}KaSaudagar`, "English", "Funny");
    add(`${s2}Boss`, "English", "Funny");
    add(`${s2}KiBoss`, "Hindi", "Funny");
  }
  add(`CoupleGoals${n1Cap}${n2Cap}`, "English", "Funny");
  add(`${n1Cap}Ki${n2Cap}`, "English", "Funny");
  add(`${n2Cap}Ki${n1Cap}`, "English", "Funny");
  add(`ShaadiKaLadoo${n1Cap}${n2Cap}`, "Hindi", "Funny");
  add(`PatiParmeshwar${n1Cap}`, "Hindi", "Funny");
  add(`BiwiNo1${n2Cap}`, "Hindi", "Funny");
  // Short+short funny
  for (const s1 of n1Shorts.slice(0, 2)) {
    for (const s2 of n2Shorts.slice(0, 2)) {
      if (s1.length + s2.length < n1Cap.length + n2Cap.length) {
        add(`${s1}Ki${s2}`, "Hindi", "Funny");
      }
    }
  }

  // ── Pun: creative short combos ──
  add(`${n1Cap}Weds${n2Cap}`, "English", "Pun");
  add(`ShaadiMubarak${n1Cap}${n2Cap}`, "English", "Pun");
  add(`JodiPakki${n1Cap}${n2Cap}`, "English", "Pun");
  add(`DulhaDulhan${n1Cap}${n2Cap}`, "English", "Pun");
  add(`MehendiLagaDungi`, "Hindi", "Pun");
  add(`SangeetNights`, "Hindi", "Pun");
  add(`DholAndSangeet`, "Hindi", "Pun");
  add(`BandBaaja${n1Cap}${n2Cap}`, "Hindi", "Pun");
  // Short puns
  for (const s1 of n1Shorts.slice(0, 2)) {
    for (const s2 of n2Shorts.slice(0, 2)) {
      add(`${s1}Weds${s2}`, "English", "Pun");
      add(`${s2}Weds${s1}`, "English", "Pun");
    }
  }
  add(`JodiNo1${n1Cap}${n2Cap}`, "Hindi", "Pun");

  // ── Traditional ──
  add(`VivahaUtsav${n1Cap}${n2Cap}`, "English", "Traditional");
  add(`ShubhVivaha${n1Cap}${n2Cap}`, "English", "Traditional");
  add(`Grihastha${n1Cap}${n2Cap}`, "English", "Traditional");
  add(`SaatPhere${n1Cap}${n2Cap}`, "English", "Traditional");
  add(`MangalPheras`, "English", "Traditional");
  add(`SindoorKiLaaj`, "Hindi", "Traditional");
  add(`Mangalsutra`, "Hindi", "Traditional");
  add(`Saptapadi`, "Hindi", "Traditional");
  add(`VivahSanskar`, "Hindi", "Traditional");

  // ── Modern: short x short, vibes ──
  add(`${n1Cap}X${n2Cap}`, "Bilingual", "Modern");
  add(`${n2Cap}X${n1Cap}`, "Bilingual", "Modern");
  add(`${n1Cap}${n2Cap}Wedding`, "Bilingual", "Modern");
  add(`${n1Cap}${n2Cap}Shaadi`, "Bilingual", "Modern");
  add(`JustMarried${n1Cap}${n2Cap}`, "Bilingual", "Modern");
  add(`MrAndMrs${n1Cap}`, "Bilingual", "Modern");
  add(`NewlyWed${n1Cap}${n2Cap}`, "Bilingual", "Modern");
  add(`${n1Cap}${n2Cap}Vibes`, "Bilingual", "Modern");
  // Short modern combos
  for (const s1 of n1Shorts.slice(0, 3)) {
    for (const s2 of n2Shorts.slice(0, 3)) {
      if (s1 !== n1Cap || s2 !== n2Cap) {
        add(`${s1}X${s2}`, "Bilingual", "Modern");
        add(`${s2}X${s1}`, "Bilingual", "Modern");
      }
    }
  }
  add(`${n1Cap}${n2Cap}SZN`, "Bilingual", "Modern");
  add(`${n1Cap}Meets${n2Cap}`, "Bilingual", "Modern");

  return results;
}

/* ── Heart Particle Burst ── */
function HeartBurst({ x, y }: { x: number; y: number }) {
  const hearts = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 60,
    dy: -30 - Math.random() * 40,
    size: 8 + Math.random() * 8,
    delay: i * 0.05,
  }));
  return (
    <div className="pointer-events-none fixed z-[200]" style={{ left: x, top: y }}>
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute text-rose-500"
          style={{ fontSize: h.size }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: 0, x: h.dx, y: h.dy, scale: 1.2 }}
          transition={{ duration: 0.6, delay: h.delay, ease: "easeOut" }}
        >
          ❤
        </motion.span>
      ))}
    </div>
  );
}

/* ── Shareable Image Card (ref) ── */
function ShareableCard({ name1, name2, hashtags }: { name1: string; name2: string; hashtags: string[] }) {
  return (
    <div
      id="hashtag-share-card"
      className="w-full max-w-[600px] p-6 sm:p-10 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #722F37 0%, #5C0000 50%, #722F37 100%)",
        fontFamily: "Playfair Display, serif",
      }}
    >
      {/* Mandala pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="relative z-10">
        <p className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-2">Wedding Hashtags</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z" /></svg>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
        <h1 className="text-white text-4xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
          {name1} <span className="text-[#D4AF37]">&</span> {name2}
        </h1>
        <p className="text-white/50 text-sm mb-8">ShaadiSheet</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {hashtags.slice(0, 12).map((h, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "#F4D03F",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        <p className="text-white/30 text-xs">Create yours free at shadisheet.com</p>
      </div>
    </div>
  );
}

export default function HashtagGeneratorView({ wedding, weddingId, onUpdate, onToast, canEdit }: any) {
  const hashtags: any[] = wedding.hashtags || [];
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number } | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [copyAllFeedback, setCopyAllFeedback] = useState(false);

  const filteredHashtags = useMemo(() => {
    let list = [...hashtags];
    if (activeStyle !== "All") list = list.filter((h) => h.style === activeStyle);
    return list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  }, [hashtags, activeStyle]);

  const favorites = useMemo(() => hashtags.filter((h) => h.favorite), [hashtags]);

  const styleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of hashtags) counts[h.style] = (counts[h.style] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [hashtags]);

  const maxStyleCount = useMemo(() => Math.max(...styleBreakdown.map(([, c]) => c), 1), [styleBreakdown]);

  const handleGenerate = async () => {
    if (!name1.trim() || !name2.trim()) {
      onToast("Please enter both names", "error");
      return;
    }
    setGenerating(true);
    const generated = generateHashtags(name1.trim(), name2.trim());
    const existingTexts = new Set(hashtags.map((h) => h.text.toLowerCase()));
    const newHashtags = generated.filter((h) => !existingTexts.has(h.text.toLowerCase()));
    if (newHashtags.length === 0) {
      onToast("All hashtags already generated");
      setGenerating(false);
      return;
    }
    try {
      await batchCreateHashtags(weddingId, newHashtags);
      onUpdate();
      onToast(`Generated ${newHashtags.length} hashtags`);
      // Fire confetti on generate
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#D4AF37", "#8B0000", "#C62828", "#FF6B6B", "#A855F7"] });
    } catch {
      onToast("Failed to generate", "error");
    }
    setGenerating(false);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const allText = filteredHashtags.map((h) => h.text).join("\n");
    await navigator.clipboard.writeText(allText);
    setCopyAllFeedback(true);
    onToast("All hashtags copied!");
    setTimeout(() => setCopyAllFeedback(false), 2000);
  };

  const handleCopyFavorites = async () => {
    if (!favorites.length) { onToast("No favorites yet", "error"); return; }
    await navigator.clipboard.writeText(favorites.map((h) => h.text).join("\n"));
    onToast("Favorites copied!");
  };

  const handleToggleFavorite = async (id: string, current: boolean, e: React.MouseEvent) => {
    try {
      await updateHashtag(weddingId, id, { favorite: !current });
      onUpdate();
      if (!current) {
        setHeartBurst({ x: e.clientX, y: e.clientY });
        setTimeout(() => setHeartBurst(null), 800);
      }
    } catch {
      onToast("Failed to update", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteHashtag(weddingId, id);
    setSelected((p) => { const n = new Set(p); n.delete(id); return n; });
    onUpdate();
  };

  const handleBulkDelete = async () => {
    await bulkDeleteHashtags(weddingId, Array.from(selected));
    setSelected(new Set());
    onUpdate();
  };

  const handleBulkFavorite = async (fav: boolean) => {
    for (const id of Array.from(selected)) await updateHashtag(weddingId, id, { favorite: fav });
    setSelected(new Set());
    onUpdate();
  };

  const handleBulkAdd = async () => {
    await bulkAddHashtags(weddingId, bulkAddCount);
    setShowBulkAdd(false);
    setBulkAddCount(5);
    onUpdate();
  };

  const handleExportImage = async () => {
    const el = document.getElementById("hashtag-share-card");
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `${name1}-${name2}-hashtags.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      onToast("Image downloaded!");
    } catch {
      onToast("Failed to generate image", "error");
    }
  };

  return (
    <div className="space-y-5">
      {heartBurst && <HeartBurst x={heartBurst.x} y={heartBurst.y} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>Hashtag Generator</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create the perfect wedding hashtags for your shaadi</p>
        </div>
        <div className="flex gap-2">
          {canEdit && hashtags.length > 0 && (
            <button onClick={() => setSelected(selected.size === filteredHashtags.length ? new Set() : new Set(filteredHashtags.map((h) => h.id)))} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              {selected.size === filteredHashtags.length ? "Deselect" : "Select All"}
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <i className="fas fa-file-import mr-1" /> Import
            </button>
          )}
        </div>
      </div>

      {/* Name Input — Hero Section */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #722F37 0%, #5C0000 50%, #8B0000 100%)" }}>
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 p-6 md:p-8">
          <p className="text-[#D4AF37] text-xs tracking-[0.25em] uppercase mb-4 text-center">Enter the couple&apos;s names</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center max-w-xl mx-auto">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Partner 1"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name2.trim() && handleGenerate()}
                className="w-full px-5 py-3.5 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center"
              />
            </div>
            <span className="text-[#D4AF37] text-2xl font-light hidden sm:block">&</span>
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Partner 2"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name1.trim() && handleGenerate()}
                className="w-full px-5 py-3.5 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#D4AF37] focus:outline-none transition-all text-center"
              />
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={!name1.trim() || !name2.trim() || generating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-[#722F37] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #D4AF37, #F4D03F)" }}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="inline-block">✨</motion.span>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>✨</span> Generate
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {hashtags.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-rose-300 transition-colors">
            <div className="text-3xl font-extrabold text-gray-900">{hashtags.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Hashtags</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl border border-rose-200 p-4 text-center hover:border-rose-400 transition-colors">
            <div className="text-3xl font-extrabold text-rose-500">{favorites.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Favorites</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-purple-300 transition-colors">
            <div className="text-3xl font-extrabold text-purple-600">{styleBreakdown.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Styles</div>
          </motion.div>
        </div>
      )}

      {/* Style Breakdown Bars */}
      {styleBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Style Breakdown</p>
          <div className="space-y-2">
            {styleBreakdown.map(([style, count]) => {
              const cfg = STYLE_CONFIG[style] || { gradient: "from-gray-400 to-gray-500", emoji: "#", bg: "bg-gray-50", text: "text-gray-700" };
              return (
                <div key={style} className="flex items-center gap-3">
                  <span className="text-sm w-24 shrink-0">{cfg.emoji} {style}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxStyleCount) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Style Filters */}
      <div className="flex flex-wrap gap-2">
        {STYLES.map((style) => (
          <motion.button
            key={style}
            onClick={() => setActiveStyle(style)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeStyle === style
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"
            }`}
          >
            {style !== "All" && STYLE_CONFIG[style]?.emoji} {style}
          </motion.button>
        ))}
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
            <div className="flex gap-2">
              <button onClick={() => handleBulkFavorite(true)} className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium">❤ Favorite</button>
              <button onClick={() => handleBulkFavorite(false)} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Unfavorite</button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">Delete</button>
              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Clear</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {hashtags.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-6xl mb-4">💍</motion.div>
          <p className="text-gray-700 font-semibold text-lg mb-1">No hashtags yet</p>
          <p className="text-gray-400 text-sm">Enter both names above and hit Generate to create your wedding hashtags</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredHashtags.map((h, i) => {
              const cfg = STYLE_CONFIG[h.style] || { gradient: "from-gray-400 to-gray-500", emoji: "#", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
              return (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className={`bg-white rounded-xl border p-3.5 hover:shadow-md transition-all flex items-center gap-3 group ${h.favorite ? "border-rose-300 shadow-sm" : "border-gray-200"}`}
                >
                  {canEdit && (
                    <input type="checkbox" checked={selected.has(h.id)} onChange={() => setSelected((p) => { const n = new Set(p); n.has(h.id) ? n.delete(h.id) : n.add(h.id); return n; })} className="w-4 h-4 rounded border-gray-300 accent-rose-500" />
                  )}
                  <motion.button
                    onClick={(e) => canEdit && handleToggleFavorite(h.id, h.favorite, e)}
                    whileTap={{ scale: 1.4 }}
                    className="text-lg shrink-0 cursor-pointer"
                  >
                    {h.favorite ? "❤️" : "🤍"}
                  </motion.button>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text} shrink-0`}>
                    {cfg.emoji} {h.style}
                  </div>
                  <span className="flex-1 font-mono text-sm font-semibold text-gray-800 truncate">{h.text}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${h.language === "Hindi" ? "bg-orange-50 text-orange-600 border-orange-200" : h.language === "Bilingual" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                    {h.language}
                  </span>
                  <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <motion.button
                      onClick={() => handleCopy(h.text, h.id)}
                      whileTap={{ scale: 0.9 }}
                      className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {copiedId === h.id ? "✓" : "Copy"}
                    </motion.button>
                    {canEdit && (
                      <button onClick={() => handleDelete(h.id)} className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-md font-medium min-h-[44px] min-w-[44px] flex items-center justify-center">Delete</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <motion.button onClick={handleCopyAll} whileTap={{ scale: 0.95 }} className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            {copyAllFeedback ? <span className="text-green">✓</span> : <i className="fas fa-copy" />}
            {copyAllFeedback ? "Copied!" : "Copy All"}
          </motion.button>
          <button onClick={handleCopyFavorites} className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
            <i className="fas fa-heart mr-1.5 text-rose-400" /> Copy Favorites
          </button>
          <button
            onClick={() => {
              const csv = filteredHashtags.map((h) => `${h.text},${h.language},${h.style},${h.favorite ? "Yes" : "No"}`).join("\n");
              const blob = new Blob(["Hashtag,Language,Style,Favorite\n" + csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "hashtags.csv"; a.click();
              URL.revokeObjectURL(url);
              onToast("Exported!");
            }}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <i className="fas fa-download mr-1.5" /> Export CSV
          </button>
          <button
            onClick={() => setShowShareCard(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-200"
          >
            <i className="fas fa-image mr-1.5" /> Create Shareable Image
          </button>
        </div>
      )}

      {/* Shareable Card Modal */}
      <AnimatePresence>
        {showShareCard && name1 && name2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowShareCard(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-[650px] w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Your Shareable Card</h3>
                <div className="flex gap-2">
                  <button onClick={handleExportImage} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-rose-600 hover:to-pink-600">
                    <i className="fas fa-download mr-1" /> Download PNG
                  </button>
                  <button onClick={() => setShowShareCard(false)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Close</button>
                </div>
              </div>
              <div className="flex justify-center overflow-auto">
                <ShareableCard
                  name1={name1}
                  name2={name2}
                  hashtags={favorites.length > 0 ? favorites.map((h: any) => h.text) : filteredHashtags.map((h) => h.text)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add More */}
      {canEdit && (
        <button onClick={() => setShowBulkAdd(true)} className="w-full py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 text-sm font-medium transition-colors">
          <i className="fas fa-plus mr-1.5" /> Add Blank Hashtags
        </button>
      )}

      {showBulkAdd && canEdit && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
          <span className="text-sm font-medium">How many?</span>
          <input type="number" min={1} max={500} value={bulkAddCount} onChange={(e) => setBulkAddCount(parseInt(e.target.value) || 1)} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center" />
          <button onClick={handleBulkAdd} className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">Add</button>
          <button onClick={() => { setShowBulkAdd(false); setBulkAddCount(5); }} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
        </motion.div>
      )}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} type="hashtags" onImport={async (items: any[]) => { await batchCreateHashtags(weddingId, items); onUpdate(); }} />
    </div>
  );
}
